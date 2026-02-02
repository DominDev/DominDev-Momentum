// functions/_lib/kv.js
// KV helpers for brief records

/**
 * Read brief record from KV
 * @param {KVNamespace} kv
 * @param {string} token
 * @returns {Promise<Object|null>} Parsed record or null if not found/expired
 */
export async function getBriefRecord(kv, token) {
  const raw = await kv.get(`brief:${token}`, "json");
  return raw || null;
}

/**
 * Write brief record to KV with TTL
 * @param {KVNamespace} kv
 * @param {string} token
 * @param {Object} record
 * @param {number} ttlSeconds - Expiration TTL in seconds
 */
export async function putBriefRecord(kv, token, record, ttlSeconds) {
  await kv.put(`brief:${token}`, JSON.stringify(record), {
    expirationTtl: ttlSeconds,
  });
}

/**
 * Update brief record preserving original expiration
 * Used after submit to set usedAt without resetting TTL
 * @param {KVNamespace} kv
 * @param {string} token
 * @param {Object} record - Updated record with usedAt set
 */
export async function updateBriefRecord(kv, token, record) {
  const expirationTimestamp = Math.floor(record.expiresAt / 1000);
  await kv.put(`brief:${token}`, JSON.stringify(record), {
    expiration: expirationTimestamp,
  });
}
