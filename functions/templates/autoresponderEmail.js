// functions/templates/autoresponderEmail.js
// Autoresponder email template (sent to client)
// DominDev brand colors: #ff1f1f, #cc0000, #050505, #0f0f0f

import { escapeHtml } from "./helpers.js";

/**
 * Generate HTML for autoresponder email
 * @param {Object} params - Email parameters
 * @param {string} params.name - Recipient's name
 * @returns {string} - Complete HTML email
 */
export function generateAutoresponderHTML({ name }) {
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

          <!-- Header with Text Logo -->
          <tr>
            <td style="padding: 40px 40px 30px; border-bottom: 1px solid #262626; text-align: center;">
              <!-- Logo Replacement -->
              <div class="font-display" style="font-family: Arial, sans-serif; font-weight: 900; font-size: 32px; color: #ffffff; letter-spacing: -1px; margin-bottom: 25px;">
                Domin<span style="color: #ff1f1f;">Dev</span>.
              </div>
              
              <p class="font-body" style="margin: 0; color: #ff1f1f; font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">● Transmisja Potwierdzona</p>
              <h1 class="font-display" style="margin: 15px 0 0 0; color: #ffffff; font-family: Arial, sans-serif; font-size: 24px; font-weight: 700; line-height: 1.3;">
                Sygnał odebrany, <span style="color: #ff1f1f;">${escapeHtml(name)}</span>
              </h1>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 40px;">
              <p class="font-body" style="margin: 0 0 25px 0; color: #c0c0c0; font-family: 'Courier New', monospace; font-size: 15px; line-height: 1.7;">
                Twoja wiadomość bezpiecznie dotarła do mojego systemu. Analizuję parametry misji i wkrótce nawiążę kontakt.
              </p>

              <div style="margin: 30px 0; padding: 25px; background-color: #0a0a0a; border-left: 3px solid #ff1f1f;">
                <p class="font-body" style="margin: 0; color: #ffffff; font-family: 'Courier New', monospace; font-size: 13px;">
                  <strong style="color: #ff1f1f; text-transform: uppercase; letter-spacing: 1px;">Czas odpowiedzi:</strong><br>
                  Zazwyczaj w ciągu 24h
                </p>
              </div>

              <p class="font-body" style="margin: 0 0 30px 0; color: #c0c0c0; font-family: 'Courier New', monospace; font-size: 15px; line-height: 1.7;">
                W międzyczasie możesz sprawdzić moje realizacje lub połączyć się ze mną w social mediach.
              </p>

              <!-- CTA Buttons -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 5px;">
                          <a href="https://domindev.com/#portfolio" class="font-display" style="display: block; padding: 12px 20px; background-color: #ff1f1f; color: #000000; text-decoration: none; font-family: Arial, sans-serif; font-size: 11px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; border: none;">Portfolio</a>
                        </td>
                        <td style="padding: 5px;">
                          <a href="https://www.instagram.com/domindev_com/" class="font-display" style="display: block; padding: 12px 20px; background-color: #0f0f0f; color: #ffffff; text-decoration: none; font-family: Arial, sans-serif; font-size: 11px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; border: 1px solid #333333;">Instagram</a>
                        </td>
                        <td style="padding: 5px;">
                          <a href="https://github.com/DominDev" class="font-display" style="display: block; padding: 12px 20px; background-color: #0f0f0f; color: #ffffff; text-decoration: none; font-family: Arial, sans-serif; font-size: 11px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; border: 1px solid #333333;">GitHub</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding: 30px 40px; background-color: #0a0a0a; border-top: 1px solid #262626;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <p class="font-body" style="margin: 0 0 15px 0; color: #888888; font-family: 'Courier New', monospace; font-size: 14px;">Z wyrazami szacunku,</p>
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="border-left: 2px solid #ff1f1f; padding-left: 15px;">
                          <p class="font-display" style="margin: 0; color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Paweł Dominiak</p>
                          <p class="font-body" style="margin: 2px 0 0 0; color: #ff1f1f; font-family: 'Courier New', monospace; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Fullstack Developer & UI/UX Designer</p>
                          <p class="font-body" style="margin: 8px 0 0 0; color: #666666; font-family: 'Courier New', monospace; font-size: 11px;">
                            <a href="https://domindev.com" style="color: #666666; text-decoration: none;">domindev.com</a> | <a href="mailto:contact@domindev.com" style="color: #666666; text-decoration: none;">contact@domindev.com</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="bottom" style="padding-bottom: 5px;">
                     <div class="font-display" style="font-family: Arial, sans-serif; font-weight: 900; font-size: 16px; color: #1a1a1a; letter-spacing: -0.5px;">
                        Domin<span style="color: #222222;">Dev</span>.
                      </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Footer note -->
        <p class="font-body" style="margin-top: 25px; color: #666666; font-family: 'Courier New', monospace; font-size: 10px; text-align: center; text-transform: uppercase; letter-spacing: 1.5px;">
          // Wiadomość wygenerowana automatycznie. Prosimy nie odpowiadać bezpośrednio na ten e-mail.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
