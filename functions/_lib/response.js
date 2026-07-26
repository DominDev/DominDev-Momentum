// functions/_lib/response.js
// Standardized JSON response helpers

/**
 * Success response
 * @param {Object} data - Response data
 * @param {number} [status=200]
 * @returns {Response}
 */
export function jsonOk(data, status = 200) {
  return new Response(JSON.stringify({ ok: true, ...data }), {
    status,
    headers: responseHeaders(),
  });
}

/**
 * Error response
 * @param {string} errorCode - Machine-readable error code
 * @param {string} message - Human-readable message (PL)
 * @param {number} status - HTTP status code
 * @param {Object} [details] - Optional safe, machine-readable response details
 * @returns {Response}
 */
export function jsonError(errorCode, message, status, details = {}) {
  return new Response(
    JSON.stringify({ ok: false, errorCode, message, ...details }),
    { status, headers: responseHeaders() }
  );
}

function responseHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
  };
}
