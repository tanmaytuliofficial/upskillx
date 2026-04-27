/**
 * Cloudflare Pages Function: /api/send-email
 * Sends email to enrolled students via SendGrid.
 * Required env vars: SENDGRID_API_KEY, FROM_EMAIL, FIREBASE_API_KEY (for Firestore REST)
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-token",
  "Content-Type": "application/json",
};

async function verifyAdminToken(token, env) {
  if (!token) return false;
  // Token format: hash.timestamp
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const timestamp = parseInt(parts[1]);
  // Token expires in 8 hours
  if (Date.now() - timestamp > 8 * 60 * 60 * 1000) return false;
  const raw = `${env.ADMIN_ID || "admin"}:${timestamp}:${env.ADMIN_SECRET || "upskillx_secret"}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const expectedHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return parts[0] === expectedHash;
}

async function getEnrolledEmails(courseId, env) {
  // Query Firestore REST API to get enrolled students
  const projectId = env.FIREBASE_PROJECT_ID;
  if (!projectId) return [];

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?key=${env.FIREBASE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();

  const emails = [];
  for (const doc of (data.documents || [])) {
    const fields = doc.fields || {};
    const enrolledCourses = fields.enrolledCourses?.arrayValue?.values?.map(v => v.stringValue) || [];
    if (courseId === "all" || enrolledCourses.includes(courseId)) {
      const email = fields.email?.stringValue;
      const name = fields.name?.stringValue || "Learner";
      if (email) emails.push({ email, name });
    }
  }
  return emails;
}

async function sendViasSendGrid(recipients, subject, body, env) {
  const SENDGRID_API_KEY = env.SENDGRID_API_KEY;
  const FROM_EMAIL = env.FROM_EMAIL || "official.tanmaytuli@gmail.com";
  const FROM_NAME = env.FROM_NAME || "UpSkillX by Tanmay Tuli";

  if (!SENDGRID_API_KEY) {
    return { sent: 0, error: "SENDGRID_API_KEY not configured" };
  }

  let sent = 0;
  // Batch into groups of 100 for SendGrid
  for (let i = 0; i < recipients.length; i += 100) {
    const batch = recipients.slice(i, i + 100);
    const personalizations = batch.map(r => ({
      to: [{ email: r.email, name: r.name }],
    }));

    const payload = {
      personalizations,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      content: [
        {
          type: "text/html",
          value: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: 'Segoe UI', sans-serif; background: #0D0D1A; color: #E8E8FF; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
  .header { background: linear-gradient(135deg, #6C63FF, #FF6B6B); border-radius: 16px 16px 0 0; padding: 32px; text-align: center; }
  .logo { font-size: 2rem; font-weight: 800; color: white; }
  .body { background: #13132A; border-radius: 0 0 16px 16px; padding: 32px; }
  h2 { color: #E8E8FF; margin-top: 0; }
  p { color: #AAAACC; line-height: 1.7; }
  .btn { display: inline-block; background: linear-gradient(135deg, #6C63FF, #9B59B6); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; margin-top: 20px; }
  .footer { text-align: center; margin-top: 24px; color: #6666AA; font-size: 0.82rem; }
</style></head>
<body>
  <div class="container">
    <div class="header"><div class="logo">⚡ UpSkillX</div></div>
    <div class="body">
      <h2>${subject}</h2>
      <p>${body.replace(/\n/g, "<br>")}</p>
      <a href="https://upskillx.pages.dev/pages/dashboard.html" class="btn">Open UpSkillX →</a>
    </div>
    <div class="footer">
      <p>Sent by Tanmay Tuli · <a href="mailto:official.tanmaytuli@gmail.com" style="color:#6C63FF;">official.tanmaytuli@gmail.com</a></p>
      <p>© 2024 UpSkillX. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
        },
      ],
    };

    const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (sgRes.status === 202) sent += batch.length;
  }
  return { sent };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const adminToken = request.headers.get("x-admin-token");
    const isValid = await verifyAdminToken(adminToken, env);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { courseId, subject, body } = await request.json();
    if (!subject || !body) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: corsHeaders });
    }

    const recipients = await getEnrolledEmails(courseId, env);
    if (recipients.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0, message: "No recipients found" }), { headers: corsHeaders });
    }

    const result = await sendViasSendGrid(recipients, subject, body, env);
    return new Response(JSON.stringify({ ok: true, ...result }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}
