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

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // 1. Parse request body
    const body = await request.json().catch(() => null);
    if (!body) {
      return jsonError("BAD_REQUEST", "Invalid JSON", 400);
    }

    const { name, email, message, budget, service, rodoAccepted, honey, turnstileToken } = body;
    const normalizedService = typeof service === "string" ? service.trim().toLowerCase() : "";

    // 2. Honeypot check (silent acceptance for bots)
    if (honey) {
      return jsonOk({});
    }

    // 3. Basic validation
    if (!name || !email || !message) {
      return jsonError("VALIDATION_FAILED", "Wypełnij wymagane pola.", 400);
    }
    if (!rodoAccepted) {
      return jsonError("VALIDATION_FAILED", "Wymagana zgoda RODO.", 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonError("VALIDATION_FAILED", "Nieprawidłowy format e-mail.", 400);
    }

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
        return jsonError("SERVER_ERROR", "Tymczasowy problem z wysyłką. Twoja wiadomość została zapisana.", 502);
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
