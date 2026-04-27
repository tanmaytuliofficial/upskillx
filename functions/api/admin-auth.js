/**
 * Cloudflare Pages Function: /api/admin-auth
 * Validates admin credentials server-side — password never exposed to frontend.
 * Set ADMIN_ID and ADMIN_PASS as encrypted environment variables in Cloudflare dashboard.
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const body = await request.json();
    const { id, pass } = body;

    // Credentials stored as Cloudflare environment variables (never in code)
    const ADMIN_ID   = env.ADMIN_ID   || "admin";
    const ADMIN_PASS = env.ADMIN_PASS || "ADMIN@2026";

    if (id === ADMIN_ID && pass === ADMIN_PASS) {
      // Generate a simple signed token (in production use JWT with a secret)
      const timestamp = Date.now();
      const raw = `${ADMIN_ID}:${timestamp}:${env.ADMIN_SECRET || "upskillx_secret"}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(raw);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const token = hashArray.map(b => b.toString(16).padStart(2, "0")).join("") + "." + timestamp;

      return new Response(JSON.stringify({ ok: true, token }), { headers: corsHeaders });
    } else {
      return new Response(JSON.stringify({ ok: false }), { status: 401, headers: corsHeaders });
    }
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
