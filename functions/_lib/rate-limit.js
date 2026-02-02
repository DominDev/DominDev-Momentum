// functions/_lib/rate-limit.js
// KV-based rate limiter for Cloudflare Pages Functions

/**
 * Check and increment rate limit counter
 * @param {KVNamespace} kv - Cloudflare KV binding
 * @param {string} key - Rate limit key (e.g. "rl:contact:ip:abc123")
 * @param {number} maxAttempts - Max allowed attempts in window
 * @param {number} windowSeconds - Time window in seconds (also KV TTL)
 * @returns {Promise<{allowed: boolean, remaining: number, current: number}>}
 */
export async function checkRateLimit(kv, key, maxAttempts, windowSeconds) {
  const raw = await kv.get(key);
  const current = raw ? parseInt(raw, 10) : 0;

  if (current >= maxAttempts) {
    return { allowed: false, remaining: 0, current };
  }

  // Note: KV put is not atomic — at extreme concurrency this could
  // allow slightly more than maxAttempts. Acceptable at this scale.
  await kv.put(key, String(current + 1), { expirationTtl: windowSeconds });

  return { allowed: true, remaining: maxAttempts - current - 1, current: current + 1 };
}
