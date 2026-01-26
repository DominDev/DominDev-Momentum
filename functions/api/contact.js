// functions/api/contact.js
// Cloudflare Pages Function - Contact Form Handler
// Uses Resend for email delivery, Turnstile for anti-spam, KV for fallback

import { generateLeadEmailHTML } from "../templates/leadEmail.js";
import { generateAutoresponderHTML } from "../templates/autoresponderEmail.js";

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // 1. Parse request body
    const body = await request.json().catch(() => null);
    if (!body) {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    const { name, email, message, budget, service, rodoAccepted, honey, turnstileToken } = body;

    // 2. Honeypot check (silent rejection for bots)
    if (honey) {
      return jsonResponse({ ok: true }, 200);
    }

    // 3. Basic validation
    if (!name || !email || !message) {
      return jsonResponse({ error: "Wypełnij wymagane pola." }, 400);
    }

    if (!rodoAccepted) {
      return jsonResponse({ error: "Wymagana zgoda RODO." }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonResponse({ error: "Nieprawidłowy format e-mail." }, 400);
    }

    // 4. Turnstile verification
    const turnstileSecret = env.TURNSTILE_SECRET_KEY;
    if (!turnstileSecret) {
      console.error("Missing TURNSTILE_SECRET_KEY");
      return jsonResponse({ error: "Server configuration error." }, 500);
    }

    if (!turnstileToken) {
      return jsonResponse({ error: "Brak weryfikacji anty-spam." }, 400);
    }

    const formData = new URLSearchParams();
    formData.append("secret", turnstileSecret);
    formData.append("response", turnstileToken);
    formData.append("remoteip", request.headers.get("CF-Connecting-IP") || "");

    const turnstileResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: formData }
    );

    const turnstileResult = await turnstileResponse.json();
    if (!turnstileResult.success) {
      console.error("Turnstile verification failed:", turnstileResult);
      return jsonResponse({ error: "Weryfikacja anty-spam nieudana." }, 403);
    }

    // 5. Prepare lead payload (for emails and potential KV fallback)
    const leadPayload = {
      name,
      email,
      message,
      budget: budget || null,
      service: service || null,
    };

    // 6. Send emails via Resend (with KV fallback on failure)
    const resendKey = env.RESEND_API_KEY;
    if (!resendKey) {
      console.error("Missing RESEND_API_KEY");
      // Save to KV if Resend not configured
      if (env.LEADS_KV) {
        const fallbackId = await saveLeadToKV(env, leadPayload, new Error("RESEND_API_KEY not configured"));
        console.log("Lead saved to KV fallback:", fallbackId);
      }
      return jsonResponse({ error: "Server mail configuration error." }, 500);
    }

    const budgetDisplay = formatBudget(budget);
    const serviceDisplay = service || "Nie określono";
    const timestamp = new Date().toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });

    try {
      // A) Lead notification email (to you)
      const leadEmailResult = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "DominDev System <contact@domindev.com>",
          to: ["contact@domindev.com"],
          reply_to: email,
          subject: `[LEAD] Nowy sygnał: ${name}`,
          html: generateLeadEmailHTML({ name, email, message, budgetDisplay, serviceDisplay, timestamp }),
        }),
      });

      if (!leadEmailResult.ok) {
        const errorText = await leadEmailResult.text();
        throw new Error(`Resend lead email failed: ${leadEmailResult.status} - ${errorText}`);
      }

      // B) Autoresponder email (to client)
      const autoresponderResult = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Contact DominDev <contact@domindev.com>",
          to: [email],
          subject: "Sygnał odebrany — potwierdzenie kontaktu",
          html: generateAutoresponderHTML({ name }),
        }),
      });

      if (!autoresponderResult.ok) {
        // Lead email sent, but autoresponder failed - log but don't fail the request
        console.error("Autoresponder failed:", await autoresponderResult.text());
      }

      return jsonResponse({ ok: true }, 200);

    } catch (resendError) {
      // Resend failed - save lead to KV as fallback
      console.error("Resend error:", resendError);

      if (env.LEADS_KV) {
        const fallbackId = await saveLeadToKV(env, leadPayload, resendError);
        console.log("Lead saved to KV fallback:", fallbackId);

        return jsonResponse({
          ok: false,
          error: "Tymczasowy problem z wysyłką. Twoja wiadomość została zapisana - skontaktujemy się wkrótce.",
          ref: fallbackId,
        }, 502);
      }

      return jsonResponse({ error: "Błąd wysyłki powiadomienia." }, 502);
    }

  } catch (error) {
    console.error("Contact form error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}

// ============================================
// KV Fallback Functions
// ============================================

/**
 * Generate unique key for KV storage
 * Format: lead_2026-01-26T12:34:56.000Z_a1b2c3
 */
function buildFallbackKey() {
  const stamp = new Date().toISOString();
  const rand = Math.random().toString(16).slice(2, 8);
  return `lead_${stamp}_${rand}`;
}

/**
 * Save lead to KV when Resend fails
 * @param {Object} env - Cloudflare environment with LEADS_KV binding
 * @param {Object} payload - Lead data (name, email, message, budget, service)
 * @param {Error} error - The error that caused the fallback
 * @returns {string} - The KV key (fallback ID)
 */
async function saveLeadToKV(env, payload, error) {
  const key = buildFallbackKey();

  const record = {
    payload,
    error: {
      message: error?.message ?? String(error),
      stack: error?.stack ?? null,
    },
    createdAt: new Date().toISOString(),
    status: "pending", // For future: could be "processed", "contacted"
  };

  // TTL: 7 days (in seconds) - enough time to notice and process
  const TTL_SECONDS = 60 * 60 * 24 * 7;

  await env.LEADS_KV.put(key, JSON.stringify(record), {
    expirationTtl: TTL_SECONDS,
  });

  return key;
}

// ============================================
// Helper Functions
// ============================================

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function formatBudget(budget) {
  if (!budget || budget === "0" || budget === 0) {
    return "Partnerstwo / Win-Win";
  }
  const val = parseInt(budget, 10);
  if (val >= 15000) {
    return "15 000+ PLN";
  }
  return val.toLocaleString("pl-PL") + " PLN";
}
