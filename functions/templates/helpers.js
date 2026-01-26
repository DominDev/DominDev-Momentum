// functions/templates/helpers.js
// Shared utilities for email templates

/**
 * Escape HTML to prevent XSS in email templates
 * @param {string} text - Raw text to escape
 * @returns {string} - HTML-safe string
 */
export function escapeHtml(text) {
  if (!text) return "";
  const str = String(text);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
