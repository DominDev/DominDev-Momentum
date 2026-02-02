// functions/_lib/crypto.js
// Cryptographic utilities for Brief Generator
// Uses Web Crypto API (available in Cloudflare Workers)

/**
 * Generate cryptographically random token (256-bit, base64url)
 * @returns {string} URL-safe random token
 */
export function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return uint8ToBase64url(bytes);
}

/**
 * Create HMAC-SHA256 signature
 * @param {string} secret - HMAC secret key
 * @param {string} message - Message to sign
 * @returns {Promise<string>} base64url signature
 */
export async function hmacSign(secret, message) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return uint8ToBase64url(new Uint8Array(signature));
}

/**
 * Verify HMAC-SHA256 signature (constant-time comparison)
 * @param {string} secret - HMAC secret key
 * @param {string} message - Original message
 * @param {string} providedSig - Signature to verify
 * @returns {Promise<boolean>}
 */
export async function hmacVerify(secret, message, providedSig) {
  const expectedSig = await hmacSign(secret, message);
  if (expectedSig.length !== providedSig.length) return false;

  let mismatch = 0;
  for (let i = 0; i < expectedSig.length; i++) {
    mismatch |= expectedSig.charCodeAt(i) ^ providedSig.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * SHA-256 hash (for IP/email hashing)
 * @param {string} input - String to hash
 * @returns {Promise<string>} hex-encoded hash
 */
export async function sha256(input) {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Build HMAC message for brief token
 * Format: "token.emailHash" — binds signature to specific email
 * @param {string} token
 * @param {string} emailHash
 * @returns {string}
 */
export function buildHmacMessage(token, emailHash) {
  return `${token}.${emailHash}`;
}

// --- Internal helpers ---

function uint8ToBase64url(bytes) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
