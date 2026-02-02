// functions/api/brief-submit.js
// POST /api/brief-submit
// Receives brief answers, sends emails, marks token as used

import { hmacVerify, sha256, buildHmacMessage } from "../_lib/crypto.js";
import { verifyTurnstile } from "../_lib/turnstile.js";
import { checkRateLimit } from "../_lib/rate-limit.js";
import { sendEmail } from "../_lib/resend.js";
import { getBriefRecord, updateBriefRecord } from "../_lib/kv.js";
import { buildPrompt, buildAnswersSummary } from "../_lib/brief-args.js";
import { jsonOk, jsonError } from "../_lib/response.js";
import { generateBriefResultEmailHTML } from "../templates/briefResultEmail.js";
import { generateBriefConfirmationEmailHTML } from "../templates/briefConfirmationEmail.js";

// --- Validation ---
const REQUIRED_FIELDS = ["businessGoal", "audience"];
const ALL_FIELDS = [
  "businessGoal", "audience", "projectType", "sections", "content",
  "media", "uiux", "palette", "fonts", "inspirations", "cta", "seo", "constraints",
];
const MAX_FIELD_LENGTH = 2000;
const MAX_PAYLOAD_BYTES = 20 * 1024; // 20 KB

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // 1. CSRF guard: check Origin
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = (env.ALLOWED_ORIGINS || "https://domindev.com").split(",");
    if (!allowedOrigins.includes(origin)) {
      const referer = request.headers.get("Referer") || "";
      const refererOk = allowedOrigins.some((o) => referer.startsWith(o + "/brief/"));
      if (!refererOk) {
        console.error(`CSRF blocked: Origin="${origin}", Referer="${referer}"`);
        return jsonError("CSRF_BLOCKED", "Brak dostępu.", 403);
      }
    }

    // 2. Parse body
    const rawBody = await request.text();
    if (rawBody.length > MAX_PAYLOAD_BYTES) {
      return jsonError("PAYLOAD_TOO_LARGE", "Za długie odpowiedzi. Maksimum 20 KB.", 413);
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return jsonError("BAD_REQUEST", "Nieprawidłowy format danych.", 400);
    }

    const { t, sig, turnstileToken, answers } = body;

    if (!t || !sig || !turnstileToken || !answers) {
      return jsonError("BAD_REQUEST", "Brak wymaganych pól.", 400);
    }

    // 3. Rate limit per IP (before KV read — cheap check)
    const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
    const ipHash = await sha256(clientIp);
    if (env.BRIEF_KV) {
      const ipRL = await checkRateLimit(env.BRIEF_KV, `rl:brief:submit:ip:${ipHash}`, 10, 600);
      if (!ipRL.allowed) {
        return jsonError("RATE_LIMITED", "Zbyt wiele prób. Spróbuj za kilka minut.", 429);
      }
    }

    // 4. Turnstile verification
    const turnstileResult = await verifyTurnstile(
      env.TURNSTILE_SECRET_KEY,
      turnstileToken,
      clientIp
    );
    if (!turnstileResult.success) {
      return jsonError("TURNSTILE_FAILED", "Weryfikacja anty-spam nieudana. Spróbuj ponownie.", 403);
    }

    // 5. Read KV record + verify signature
    const record = await getBriefRecord(env.BRIEF_KV, t);
    if (!record) {
      return jsonError("TOKEN_NOT_FOUND", "Link wygasł lub jest nieprawidłowy.", 404);
    }

    const emailHash = await sha256(record.email.toLowerCase());
    const hmacMessage = buildHmacMessage(t, emailHash);
    const sigValid = await hmacVerify(env.BRIEF_HMAC_SECRET, hmacMessage, sig);
    if (!sigValid) {
      return jsonError("SIGNATURE_INVALID", "Nieprawidłowy link.", 403);
    }

    if (Date.now() > record.expiresAt) {
      return jsonError("TOKEN_NOT_FOUND", "Link wygasł.", 404);
    }

    if (record.usedAt) {
      return jsonError("TOKEN_USED", "Brief został już wysłany z tego linku.", 409);
    }

    // 6. Rate limit per email (after KV read — now we know email)
    if (env.BRIEF_KV) {
      const emailRL = await checkRateLimit(
        env.BRIEF_KV,
        `rl:brief:submit:email:${emailHash}`,
        3,
        86400
      );
      if (!emailRL.allowed) {
        return jsonError("RATE_LIMITED", "Zbyt wiele prób wysyłki. Spróbuj jutro.", 429);
      }
    }

    // 7. Server-side validation of answers
    for (const field of REQUIRED_FIELDS) {
      const val = (answers[field] || "").trim();
      if (!val || val.length < 10) {
        return jsonError(
          "VALIDATION_FAILED",
          `Pole "${field}" jest wymagane (min. 10 znaków).`,
          400
        );
      }
    }

    for (const field of ALL_FIELDS) {
      if (answers[field] && answers[field].length > MAX_FIELD_LENGTH) {
        return jsonError(
          "VALIDATION_FAILED",
          `Pole "${field}" jest za długie (max ${MAX_FIELD_LENGTH} znaków).`,
          400
        );
      }
    }

    // 8. Sanitize answers (trim whitespace, no HTML rendering)
    const sanitized = {};
    for (const field of ALL_FIELDS) {
      sanitized[field] = (answers[field] || "").trim();
    }

    // 9. Build prompt
    const version = env.PROMPT_VERSION || "1";
    const prompt = buildPrompt({
      email: record.email,
      name: record.name || "—",
      serviceId: record.serviceId,
      answers: sanitized,
      version,
    });

    const answersSummary = buildAnswersSummary(sanitized);

    // 10. Send email to you (brief result)
    const fromEmail = env.BRIEF_FROM_EMAIL || "Contact DominDev <contact@domindev.com>";
    const ownerEmail = env.BRIEF_OWNER_EMAIL || "contact@domindev.com";

    if (env.BRIEF_EMAIL_MODE === "log") {
      console.log("[BRIEF-DEV] Submit received for:", record.email);
      console.log("[BRIEF-DEV] Prompt:\n", prompt);
    } else {
      const resultEmailSent = await sendEmail(env.RESEND_API_KEY, {
        from: "DominDev Brief <contact@domindev.com>",
        to: ownerEmail,
        replyTo: record.email,
        subject: `Brief (WebDev) — ${record.serviceId} — ${record.email}`,
        html: generateBriefResultEmailHTML({
          email: record.email,
          name: record.name || "—",
          serviceId: record.serviceId,
          answersSummary,
          prompt,
          createdAt: record.createdAt,
        }),
      });

      if (!resultEmailSent.ok) {
        console.error("Failed to send brief result email:", resultEmailSent.error);
        return jsonError("SERVER_ERROR", "Błąd wysyłki. Spróbuj ponownie.", 500);
      }

      // 11. Send confirmation to client
      await sendEmail(env.RESEND_API_KEY, {
        from: fromEmail,
        to: record.email,
        subject: "Brief przyjęty — dziękuję",
        html: generateBriefConfirmationEmailHTML({ name: record.name || "" }),
      });
    }

    // 12. Mark token as used (preserve original TTL)
    record.usedAt = Date.now();
    record.meta = record.meta || {};
    record.meta.usedIpHash = ipHash;
    await updateBriefRecord(env.BRIEF_KV, t, record);

    return jsonOk({});

  } catch (error) {
    console.error("brief-submit error:", error);
    return jsonError("SERVER_ERROR", "Błąd serwera. Spróbuj ponownie.", 500);
  }
}
