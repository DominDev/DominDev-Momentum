// functions/_middleware.js
// Site-wide maintenance mode gate.
//
// Flag lives in KV (binding: MAINTENANCE_KV, key: "maintenance"):
//   - key absent / "off" / "0" / "false"  -> normal traffic
//   - any other value (e.g. "on")         -> serve maintenance.html with 503
//   - numeric value (e.g. "7200")         -> also used as Retry-After seconds
//
// Toggle without a deploy:
//   npx wrangler kv key put maintenance on --binding MAINTENANCE_KV --remote
//   npx wrangler kv key delete maintenance --binding MAINTENANCE_KV --remote
//
// Owner bypass: open https://domindev.com/?bypass=<MAINTENANCE_BYPASS_SECRET>
// once - a cookie keeps subsequent requests open for 24h.

const BYPASS_COOKIE = "dd_maint_bypass";
const DEFAULT_RETRY_AFTER = "3600";

// Assets the maintenance page itself needs (plus favicons/fonts under /assets/).
const ALLOWED_PREFIXES = [
  "/css/maintenance.css",
  "/js/maintenance-page.js",
  "/assets/",
  "/favicon",
];

export async function onRequest(context) {
  const { request, env, next } = context;

  // No KV binding configured -> feature disabled, never block traffic.
  const kv = env.MAINTENANCE_KV;
  if (!kv) return next();

  let flag;
  try {
    flag = await kv.get("maintenance");
  } catch {
    // KV outage must never take the site down.
    return next();
  }

  if (!flag || flag === "off" || flag === "0" || flag === "false") {
    return next();
  }

  const url = new URL(request.url);

  // Let the maintenance page's own assets through.
  if (ALLOWED_PREFIXES.some((p) => url.pathname.startsWith(p))) {
    return next();
  }

  // Owner bypass: secret in query -> set cookie and redirect to clean URL.
  const secret = env.MAINTENANCE_BYPASS_SECRET;
  if (secret) {
    if (url.searchParams.get("bypass") === secret) {
      url.searchParams.delete("bypass");
      return new Response(null, {
        status: 302,
        headers: {
          Location: url.toString(),
          "Set-Cookie": `${BYPASS_COOKIE}=${secret}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
          "Cache-Control": "no-store",
        },
      });
    }
    const cookies = request.headers.get("Cookie") || "";
    if (cookies.includes(`${BYPASS_COOKIE}=${secret}`)) {
      return next();
    }
  }

  // API calls get a JSON 503 instead of HTML.
  if (url.pathname.startsWith("/api/")) {
    return new Response(
      JSON.stringify({ error: "maintenance", message: "Service temporarily unavailable" }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Retry-After": retryAfterFrom(flag),
          "Cache-Control": "no-store",
        },
      }
    );
  }

  // Serve the static maintenance page with a proper 503.
  const asset = await env.ASSETS.fetch(new URL("/maintenance.html", url.origin));
  return new Response(asset.body, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": retryAfterFrom(flag),
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

function retryAfterFrom(flag) {
  const n = Number(flag);
  return Number.isFinite(n) && n > 0 ? String(Math.floor(n)) : DEFAULT_RETRY_AFTER;
}
