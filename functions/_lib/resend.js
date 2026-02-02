// functions/_lib/resend.js
// Resend email sending wrapper

const RESEND_URL = "https://api.resend.com/emails";

/**
 * Send email via Resend
 * @param {string} apiKey - Resend API key
 * @param {Object} params
 * @param {string} params.from - Sender address
 * @param {string|string[]} params.to - Recipient(s)
 * @param {string} params.subject - Email subject
 * @param {string} params.html - HTML body
 * @param {string} [params.replyTo] - Optional reply-to address
 * @returns {Promise<{ok: boolean, id?: string, error?: string}>}
 */
export async function sendEmail(apiKey, { from, to, subject, html, replyTo }) {
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY");
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const payload = {
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };
  if (replyTo) payload.reply_to = replyTo;

  const response = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Resend error (${response.status}):`, errorText);
    return { ok: false, error: `Resend ${response.status}: ${errorText}` };
  }

  const data = await response.json();
  return { ok: true, id: data.id };
}
