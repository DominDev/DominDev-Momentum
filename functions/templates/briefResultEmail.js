// functions/templates/briefResultEmail.js
// Brief result email template (sent to project owner)
// Contains formatted prompt and answers summary
// DominDev brand colors: #ff1f1f, #cc0000, #050505, #0f0f0f

import { escapeHtml } from "./helpers.js";

/**
 * Generate HTML for brief result email (internal — sent to owner)
 * @param {Object} params
 * @param {string} params.email - Client email
 * @param {string} params.name - Client name
 * @param {string} params.serviceId - Selected service
 * @param {string} params.answersSummary - Formatted answers text
 * @param {string} params.prompt - Complete /stage-brief prompt
 * @param {number} params.createdAt - Token creation timestamp
 * @returns {string} - Complete HTML email
 */
export function generateBriefResultEmailHTML({ email, name, serviceId, answersSummary, prompt, createdAt }) {
  const date = new Date(createdAt).toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });

  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;900&family=Space+Grotesk:wght@300;400;700&display=swap" rel="stylesheet">
  <style>
    @media screen {
      .font-display { font-family: 'Outfit', Arial, sans-serif !important; }
      .font-body { font-family: 'Space Grotesk', 'Courier New', monospace !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Courier New', Courier, monospace; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #050505;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #0f0f0f; border: 1px solid #262626; max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; border-bottom: 1px solid #262626; text-align: center;">
              <div class="font-display" style="font-family: Arial, sans-serif; font-weight: 900; font-size: 32px; color: #ffffff; letter-spacing: -1px; margin-bottom: 25px;">
                Domin<span style="color: #ff1f1f;">Dev</span>.
              </div>

              <p class="font-body" style="margin: 0; color: #ff1f1f; font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">● Nowy Brief Projektowy</p>
              <h1 class="font-display" style="margin: 15px 0 0 0; color: #ffffff; font-family: Arial, sans-serif; font-size: 24px; font-weight: 700; line-height: 1.3;">
                Brief od <span style="color: #ff1f1f;">${escapeHtml(name)}</span>
              </h1>
            </td>
          </tr>

          <!-- Meta -->
          <tr>
            <td style="padding: 30px 40px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #1a1a1a;">
                    <span class="font-body" style="color: #666666; font-family: 'Courier New', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Email</span><br>
                    <span class="font-body" style="color: #ffffff; font-family: 'Courier New', monospace; font-size: 14px;">${escapeHtml(email)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #1a1a1a;">
                    <span class="font-body" style="color: #666666; font-family: 'Courier New', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Usługa</span><br>
                    <span class="font-body" style="color: #ffffff; font-family: 'Courier New', monospace; font-size: 14px;">${escapeHtml(serviceId)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #1a1a1a;">
                    <span class="font-body" style="color: #666666; font-family: 'Courier New', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Data kontaktu</span><br>
                    <span class="font-body" style="color: #ffffff; font-family: 'Courier New', monospace; font-size: 14px;">${escapeHtml(date)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Answers Summary -->
          <tr>
            <td style="padding: 30px 40px;">
              <p class="font-body" style="margin: 0 0 15px 0; color: #ff1f1f; font-family: 'Courier New', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Odpowiedzi klienta</p>
              <div style="padding: 20px; background-color: #0a0a0a; border: 1px solid #1a1a1a;">
                <pre class="font-body" style="margin: 0; color: #c0c0c0; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.8; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(answersSummary)}</pre>
              </div>
            </td>
          </tr>

          <!-- Prompt (copy-paste ready) -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <p class="font-body" style="margin: 0 0 15px 0; color: #ff1f1f; font-family: 'Courier New', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Gotowy prompt /stage-brief</p>
              <div style="padding: 20px; background-color: #0a0a0a; border-left: 3px solid #ff1f1f;">
                <pre class="font-body" style="margin: 0; color: #ffffff; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.7; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(prompt)}</pre>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #0a0a0a; border-top: 1px solid #262626;">
              <p class="font-body" style="margin: 0; color: #666666; font-family: 'Courier New', monospace; font-size: 11px;">
                Skopiuj prompt powyżej i wklej do Claude Code.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
