// functions/_lib/turnstile.js
// Cloudflare Turnstile server-side verification

const TURNSTILE_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verify Turnstile token server-side
 * @param {string} secretKey - Turnstile secret key (env.TURNSTILE_SECRET_KEY)
 * @param {string} token - Turnstile token from client
 * @param {string} remoteIp - Client IP (from CF-Connecting-IP header)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function verifyTurnstile(secretKey, token, remoteIp) {
  if (!secretKey) {
    console.error("Missing TURNSTILE_SECRET_KEY");
    return { success: false, error: "Server configuration error" };
  }

  if (!token) {
    return { success: false, error: "Missing turnstile token" };
  }

  const formData = new URLSearchParams();
  formData.append("secret", secretKey);
  formData.append("response", token);
  if (remoteIp) {
    formData.append("remoteip", remoteIp);
  }

  const response = await fetch(TURNSTILE_URL, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!result.success) {
    console.error("Turnstile verification failed:", result["error-codes"]);
    return { success: false, error: "Turnstile verification failed" };
  }

  return { success: true };
}
