// functions/api/brief-meta.js
// GET /api/brief-meta?t=TOKEN&sig=SIGNATURE
// Returns email + service for valid brief tokens

import { hmacVerify, sha256, buildHmacMessage } from "../_lib/crypto.js";
import { checkRateLimit } from "../_lib/rate-limit.js";
import { getBriefRecord } from "../_lib/kv.js";
import { jsonOk, jsonError } from "../_lib/response.js";

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);

    // 1. Parse params
    const t = url.searchParams.get("t");
    const sig = url.searchParams.get("sig");

    if (!t || !sig) {
      return jsonError("BAD_REQUEST", "Brak wymaganych parametrów.", 400);
    }

    // 2. Rate limit per IP
    if (env.BRIEF_KV) {
      const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
      const ipHash = await sha256(clientIp);
      const rl = await checkRateLimit(env.BRIEF_KV, `rl:brief:meta:ip:${ipHash}`, 60, 600);
      if (!rl.allowed) {
        return jsonError("RATE_LIMITED", "Zbyt wiele zapytań. Spróbuj za kilka minut.", 429);
      }
    }

    // 3. Read KV record
    const record = await getBriefRecord(env.BRIEF_KV, t);
    if (!record) {
      return jsonError("TOKEN_NOT_FOUND", "Link wygasł lub jest nieprawidłowy.", 404);
    }

    // 4. Verify HMAC signature
    const emailHash = await sha256(record.email.toLowerCase());
    const message = buildHmacMessage(t, emailHash);
    const isValid = await hmacVerify(env.BRIEF_HMAC_SECRET, message, sig);
    if (!isValid) {
      return jsonError("SIGNATURE_INVALID", "Nieprawidłowy link.", 403);
    }

    // 5. Check expiry (defense in depth — KV TTL handles this too)
    if (Date.now() > record.expiresAt) {
      return jsonError("TOKEN_NOT_FOUND", "Link wygasł.", 404);
    }

    // 6. Check if already used
    if (record.usedAt) {
      return jsonError("TOKEN_USED", "Brief został już wysłany z tego linku.", 409);
    }

    // 7. Return metadata
    return jsonOk({
      email: record.email,
      name: record.name || null,
      serviceId: record.serviceId,
      createdAt: record.createdAt,
    });

  } catch (error) {
    console.error("brief-meta error:", error);
    return jsonError("SERVER_ERROR", "Błąd serwera.", 500);
  }
}
