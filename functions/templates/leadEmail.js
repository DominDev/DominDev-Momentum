// functions/templates/leadEmail.js
// Lead notification email template (sent to contact@domindev.com)
// DominDev brand colors: #ff1f1f, #cc0000, #050505, #0f0f0f

import { escapeHtml } from "./helpers.js";

/**
 * Generate HTML for lead notification email
 * @param {Object} params - Email parameters
 * @param {string} params.name - Sender's name
 * @param {string} params.email - Sender's email
 * @param {string} params.message - Message content
 * @param {string} params.budgetDisplay - Formatted budget string
 * @param {string} params.serviceDisplay - Service type
 * @param {string} params.timestamp - Formatted timestamp
 * @returns {string} - Complete HTML email
 */
export function generateLeadEmailHTML({
  name,
  email,
  message,
  budgetDisplay,
  serviceDisplay,
  timestamp,
}) {
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
            <td style="padding: 30px 40px; border-bottom: 1px solid #262626;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span class="font-body" style="color: #ff1f1f; font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">● System Online</span>
                  </td>
                  <td align="right">
                    <span class="font-body" style="color: #666666; font-family: 'Courier New', monospace; font-size: 11px;">${escapeHtml(timestamp)}</span>
                  </td>
                </tr>
              </table>
              <h1 class="font-display" style="margin: 15px 0 0 0; color: #ffffff; font-family: Arial, sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                Nowy Sygnał Przychodzący
              </h1>
            </td>
          </tr>

          <!-- Sender Info -->
          <tr>
            <td style="padding: 30px 40px; border-bottom: 1px solid #262626;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <span class="font-body" style="color: #666666; font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 1px; text-transform: uppercase;">Nadawca</span><br>
                    <span class="font-display" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 20px; font-weight: 700;">${escapeHtml(name)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px;">
                    <span class="font-body" style="color: #666666; font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 1px; text-transform: uppercase;">Kanał zwrotny</span><br>
                    <a href="mailto:${escapeHtml(email)}" class="font-body" style="color: #ff1f1f; font-family: 'Courier New', monospace; font-size: 16px; text-decoration: none;">${escapeHtml(email)}</a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" cellspacing="0" cellpadding="0" width="100%">
                      <tr>
                        <td width="50%" valign="top" style="padding-right: 10px;">
                          <span class="font-body" style="color: #666666; font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 1px; text-transform: uppercase;">Typ Misji</span><br>
                          <span class="font-display" style="color: #cccccc; font-family: Arial, sans-serif; font-size: 15px; font-weight: 700;">${escapeHtml(serviceDisplay)}</span>
                        </td>
                        <td width="50%" valign="top">
                          <span class="font-body" style="color: #666666; font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 1px; text-transform: uppercase;">Budżet Operacji</span><br>
                          <span class="font-display" style="color: #ff1f1f; font-family: Arial, sans-serif; font-size: 15px; font-weight: 700;">${escapeHtml(budgetDisplay)}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 30px 40px;">
              <span class="font-body" style="color: #666666; font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 1px; text-transform: uppercase;">Treść Transmisji</span>
              <div style="margin-top: 15px; padding: 25px; background-color: #0a0a0a; border-left: 3px solid #ff1f1f;">
                <p class="font-body" style="margin: 0; color: #cccccc; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(message)}</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #0a0a0a; border-top: 1px solid #262626;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="bottom">
                    <span class="font-body" style="color: #444444; font-family: 'Courier New', monospace; font-size: 10px; text-transform: uppercase;">DominDev System v2.0</span>
                    <div class="font-display" style="font-family: Arial, sans-serif; font-weight: 900; font-size: 14px; color: #ffffff; letter-spacing: -0.5px; margin-top: 5px; opacity: 0.5;">
                      Domin<span style="color: #ff1f1f;">Dev</span>.
                    </div>
                  </td>
                  <td align="right" valign="bottom">
                    <a href="mailto:${escapeHtml(email)}" class="font-display" style="display: inline-block; padding: 12px 25px; background-color: #ff1f1f; color: #000000; text-decoration: none; font-family: Arial, sans-serif; font-size: 11px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">Odpowiedz</a>
                  </td>
                </tr>
              </table>
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
