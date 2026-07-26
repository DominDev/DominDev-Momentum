// functions/api/contact.js
// Cloudflare Pages Function - Contact Form Handler
// Extended with Brief Generator link for WebDev services

import { generateLeadEmailHTML } from "../templates/leadEmail.js";
import { generateAutoresponderHTML } from "../templates/autoresponderEmail.js";
import { generateBriefLinkEmailHTML } from "../templates/briefLinkEmail.js";
import { randomToken, hmacSign, sha256, buildHmacMessage } from "../_lib/crypto.js";
import { verifyTurnstile } from "../_lib/turnstile.js";
import { sendEmail } from "../_lib/resend.js";
import { checkRateLimit } from "../_lib/rate-limit.js";
import { putBriefRecord } from "../_lib/kv.js";
import { jsonOk, jsonError } from "../_lib/response.js";

// --- Constants ---
const FALLBACK_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const MAX_BODY_BYTES = 16 * 1024;
const ALLOWED_SERVICES = new Set([
  "landing",
  "business",
  "ecommerce",
  "webapp",
  "audit",
  "speed",
  "integration",
  "other",
]);

async function readBodyWithLimit(request) {
  const declaredLength = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return { ok: false, tooLarge: true };
  }

  if (!request.body) return { ok: false, invalidJson: true };

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > MAX_BODY_BYTES) {
      await reader.cancel();
      return { ok: false, tooLarge: true };
    }
    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, invalidJson: true };
  }
}

export function validateContactPayload(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, message: "Nieprawidłowe dane formularza." };
  }

  const honey = typeof body.honey === "string" ? body.honey.trim() : "";
  if (honey) return { ok: true, bot: true };

  if (
    typeof body.name !== "string" ||
    typeof body.email !== "string" ||
    typeof body.message !== "string" ||
    typeof body.service !== "string" ||
    typeof body.turnstileToken !== "string"
  ) {
    return { ok: false, message: "Nieprawidłowe dane formularza." };
  }

  const name = body.name.trim();
  const email = body.email.trim().toLowerCase();
  const message = body.message.trim();
  const service = body.service.trim().toLowerCase();
  const turnstileToken = body.turnstileToken.trim();
  const budget = body.budget === "" ? 0 : Number(body.budget);

  if (name.length < 2 || name.length > 100) {
    return { ok: false, message: "Imię lub nazwa powinny mieć od 2 do 100 znaków." };
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Nieprawidłowy format e-mail." };
  }
  if (message.length < 10 || message.length > 5000) {
    return { ok: false, message: "Wiadomość powinna mieć od 10 do 5000 znaków." };
  }
  if (!ALLOWED_SERVICES.has(service)) {
    return { ok: false, message: "Wybierz usługę z listy." };
  }
  if (!Number.isInteger(budget) || budget < 0 || budget > 15000 || budget % 500 !== 0) {
    return { ok: false, message: "Wybierz prawidłowy budżet." };
  }
  if (body.rodoAccepted !== true) {
    return { ok: false, message: "Wymagana zgoda na przetwarzanie danych." };
  }
  if (!turnstileToken || turnstileToken.length > 2048) {
    return { ok: false, message: "Dokończ weryfikację antyspamową." };
  }

  return {
    ok: true,
    value: { name, email, message, budget, service, rodoAccepted: true, honey: "", turnstileToken },
  };
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // 1. Parse a bounded JSON request body
    const contentType = request.headers.get("Content-Type") || "";
    if (!contentType.toLowerCase().startsWith("application/json")) {
      return jsonError("UNSUPPORTED_MEDIA_TYPE", "Formularz wymaga danych JSON.", 415);
    }

    const parsedBody = await readBodyWithLimit(request);
    if (parsedBody.tooLarge) {
      return jsonError("PAYLOAD_TOO_LARGE", "Wiadomość jest zbyt duża.", 413);
    }
    if (!parsedBody.ok) {
      return jsonError("BAD_REQUEST", "Nieprawidłowy format danych.", 400);
    }

    const validation = validateContactPayload(parsedBody.value);

    // 2. Honeypot check (silent acceptance for bots)
    if (validation.bot) {
      return jsonOk({});
    }

    // 3. Strict server-side validation and normalization
    if (!validation.ok) {
      return jsonError("VALIDATION_FAILED", validation.message, 400);
    }
    const { name, email, message, budget, service, turnstileToken } = validation.value;
    const normalizedService = service;

    // 4. Turnstile verification
    const turnstileResult = await verifyTurnstile(
      env.TURNSTILE_SECRET_KEY,
      turnstileToken,
      request.headers.get("CF-Connecting-IP") || ""
    );
    if (!turnstileResult.success) {
      return jsonError("TURNSTILE_FAILED", "Weryfikacja anty-spam nieudana.", 403);
    }

    // 5. Rate limiting
    if (env.BRIEF_KV) {
      const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
      const ipHash = await sha256(clientIp);
      const emailHash = await sha256(email.toLowerCase());

      const ipRL = await checkRateLimit(env.BRIEF_KV, `rl:contact:ip:${ipHash}`, 5, 3600);
      if (!ipRL.allowed) {
        return jsonError("RATE_LIMITED", "Zbyt wiele prób. Spróbuj za godzinę.", 429);
      }

      const emailRL = await checkRateLimit(env.BRIEF_KV, `rl:contact:email:${emailHash}`, 3, 86400);
      if (!emailRL.allowed) {
        return jsonError("RATE_LIMITED", "Zbyt wiele zgłoszeń z tego adresu. Spróbuj jutro.", 429);
      }
    }

    // 6. Prepare display values
    const budgetDisplay = formatBudget(budget);
    const serviceDisplay = normalizedService || "Nie określono";
    const timestamp = new Date().toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });

    // 7. Send lead notification email (to you)
    const leadResult = await sendEmail(env.RESEND_API_KEY, {
      from: "DominDev System <contact@domindev.com>",
      to: env.BRIEF_OWNER_EMAIL || "contact@domindev.com",
      replyTo: email,
      subject: `[LEAD] Nowy sygnał: ${name}`,
      html: generateLeadEmailHTML({ name, email, message, budgetDisplay, serviceDisplay, timestamp }),
    });

    if (!leadResult.ok) {
      // Fallback to KV if available
      if (env.LEADS_KV) {
        const fallbackId = await saveLeadToKV(env, { name, email, message, budget, service }, new Error(leadResult.error));
        console.log("Lead saved to KV fallback:", fallbackId);
        return jsonError(
          "DELIVERY_QUEUED",
          "Wiadomość została bezpiecznie zapisana. Odpowiem po ręcznej weryfikacji.",
          502,
          { leadSaved: true }
        );
      }
      return jsonError("SERVER_ERROR", "Błąd wysyłki powiadomienia.", 502);
    }

    // 8. Determine autoresponder type
    const webdevServices = (env.WEBDEV_SERVICES || "landing,business,ecommerce,webapp")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    const briefEnabled = env.BRIEF_ENABLED === "true";
    const isWebDev = webdevServices.includes(normalizedService);

    console.log("[CONTACT] autoresponder decision", JSON.stringify({
      serviceRaw: service ?? null,
      serviceNormalized: normalizedService || null,
      briefEnabled,
      isWebDev,
      briefKvBound: Boolean(env.BRIEF_KV),
      briefEmailMode: env.BRIEF_EMAIL_MODE || "send",
    }));

    if (briefEnabled && isWebDev && env.BRIEF_KV) {
      // 8a. WebDev service - generate brief link
      const token = randomToken();
      const emailHash = await sha256(email.toLowerCase());
      const now = Date.now();
      const ttlSeconds = parseInt(env.BRIEF_TTL_SECONDS, 10) || 604800;
      const expiresAt = now + ttlSeconds * 1000;

      // Save to KV
      const record = {
        version: 1,
        email,
        name,
        emailHash,
        serviceId: normalizedService,
        createdAt: now,
        expiresAt,
        usedAt: null,
        meta: {
          ipHash: await sha256(request.headers.get("CF-Connecting-IP") || "unknown"),
        },
      };
      await putBriefRecord(env.BRIEF_KV, token, record, ttlSeconds);

      // Generate signed URL
      const sig = await hmacSign(env.BRIEF_HMAC_SECRET, buildHmacMessage(token, emailHash));
      const baseUrl = env.BRIEF_BASE_URL || "https://domindev.com";
      const briefLink = `${baseUrl}/brief/?t=${encodeURIComponent(token)}&sig=${encodeURIComponent(sig)}`;

      // Send brief link email (or log in dev mode)
      if (env.BRIEF_EMAIL_MODE === "log") {
        const masked = token.slice(0, 6) + "..." + token.slice(-6);
        console.log(`[BRIEF-DEV] Link generated for ${email}: token=${masked}`);
        console.log(`[BRIEF-DEV] Full link: ${briefLink}`);

        return jsonOk({
          mailType: "brief-link",
          service: normalizedService,
          briefEmailDelivery: "log",
        });
      }

      const briefEmailResult = await sendEmail(env.RESEND_API_KEY, {
        from: env.BRIEF_FROM_EMAIL || "Contact DominDev <contact@domindev.com>",
        to: email,
        subject: "Link do briefu projektowego (ważny 7 dni)",
        html: generateBriefLinkEmailHTML({ name, briefLink }),
      });

      if (!briefEmailResult.ok) {
        console.error("[CONTACT] brief link email failed", JSON.stringify({
          serviceRaw: service ?? null,
          serviceNormalized: normalizedService || null,
          error: briefEmailResult.error,
        }));
      } else {
        console.log("[CONTACT] brief link email sent", JSON.stringify({
          serviceNormalized: normalizedService,
          emailId: briefEmailResult.id,
        }));
      }

      return jsonOk({
        mailType: "brief-link",
        service: normalizedService,
        briefEmailDelivery: briefEmailResult.ok ? "sent" : "failed",
      });
    }

    // 8b. Non-WebDev or brief disabled - standard autoresponder
    const autoResult = await sendEmail(env.RESEND_API_KEY, {
      from: "Contact DominDev <contact@domindev.com>",
      to: email,
      subject: "Sygnał odebrany - potwierdzenie kontaktu",
      html: generateAutoresponderHTML({ name }),
    });
    if (!autoResult.ok) {
      console.error("Autoresponder failed:", autoResult.error);
    }

    console.log("[CONTACT] standard autoresponder branch", JSON.stringify({
      serviceRaw: service ?? null,
      serviceNormalized: normalizedService || null,
      briefEnabled,
      isWebDev,
      autoEmailDelivery: autoResult.ok ? "sent" : "failed",
    }));

    return jsonOk({
      mailType: "standard-autoresponder",
      service: normalizedService,
      autoEmailDelivery: autoResult.ok ? "sent" : "failed",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return jsonError("SERVER_ERROR", "Internal Server Error", 500);
  }
}

// --- KV Fallback ---

function buildFallbackKey() {
  const stamp = new Date().toISOString();
  const rand = Math.random().toString(16).slice(2, 8);
  return `lead_${stamp}_${rand}`;
}

async function saveLeadToKV(env, payload, error) {
  const key = buildFallbackKey();
  const record = {
    payload,
    error: { message: error?.message ?? String(error), stack: error?.stack ?? null },
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  await env.LEADS_KV.put(key, JSON.stringify(record), { expirationTtl: FALLBACK_TTL_SECONDS });
  return key;
}

function formatBudget(budget) {
  if (!budget || budget === "0" || budget === 0) return "Partnerstwo / Win-Win";
  const val = parseInt(budget, 10);
  if (val >= 15000) return "15 000+ PLN";
  return val.toLocaleString("pl-PL") + " PLN";
}
