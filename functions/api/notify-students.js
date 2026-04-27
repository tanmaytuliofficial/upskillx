/**
 * Cloudflare Pages Function: /api/notify-students
 * Auto-notifies enrolled students when new notes/content is uploaded.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { courseId, notesTitle } = await request.json();
    if (!courseId) return new Response(JSON.stringify({ ok: false }), { headers: corsHeaders });

    // Get course name from Firestore
    const projectId = env.FIREBASE_PROJECT_ID;
    const apiKey = env.FIREBASE_API_KEY;
    let courseName = "your enrolled course";

    if (projectId && apiKey) {
      const cRes = await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/courses/${courseId}?key=${apiKey}`
      );
      if (cRes.ok) {
        const cData = await cRes.json();
        courseName = cData.fields?.title?.stringValue || courseName;
      }

      // Get enrolled students
      const uRes = await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?key=${apiKey}`
      );
      if (uRes.ok) {
        const uData = await uRes.json();
        const recipients = [];
        for (const doc of (uData.documents || [])) {
          const fields = doc.fields || {};
          const enrolled = fields.enrolledCourses?.arrayValue?.values?.map(v => v.stringValue) || [];
          if (enrolled.includes(courseId)) {
            const email = fields.email?.stringValue;
            const name = fields.name?.stringValue || "Learner";
            if (email) recipients.push({ email, name });
          }
        }

        // Send notification emails
        if (recipients.length > 0 && env.SENDGRID_API_KEY) {
          const subject = `📄 New content uploaded in ${courseName}!`;
          const body = `Hey there! 👋\n\nNew study material has just been uploaded in "${courseName}":\n\n📄 ${notesTitle || "New Notes"}\n\nLog in to UpSkillX now to access your latest course content and stay ahead!\n\nKeep learning,\nTanmay Tuli\nUpSkillX`;

          const htmlBody = `
<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{font-family:'Segoe UI',sans-serif;background:#0D0D1A;color:#E8E8FF;margin:0;padding:0}
.container{max-width:560px;margin:0 auto;padding:40px 20px}
.header{background:linear-gradient(135deg,#6C63FF,#FF6B6B);border-radius:16px 16px 0 0;padding:32px;text-align:center}
.logo{font-size:2rem;font-weight:800;color:white}
.body{background:#13132A;border-radius:0 0 16px 16px;padding:32px}
h2{color:#E8E8FF;margin-top:0}p{color:#AAAACC;line-height:1.7}
.highlight{background:rgba(108,99,255,0.15);border:1px solid rgba(108,99,255,0.3);border-radius:12px;padding:16px;margin:20px 0}
.btn{display:inline-block;background:linear-gradient(135deg,#6C63FF,#9B59B6);color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;margin-top:20px}
.footer{text-align:center;margin-top:24px;color:#6666AA;font-size:0.82rem}
</style></head><body>
<div class="container">
  <div class="header"><div class="logo">⚡ UpSkillX</div><p style="color:rgba(255,255,255,0.8);margin:8px 0 0">New Content Alert 🎉</p></div>
  <div class="body">
    <h2>New Study Material Available!</h2>
    <p>Hey there! New content has just been added to one of your enrolled courses.</p>
    <div class="highlight">
      <strong style="color:#6C63FF;">📚 Course:</strong> <span style="color:#E8E8FF;">${courseName}</span><br>
      <strong style="color:#43E97B;">📄 New Upload:</strong> <span style="color:#E8E8FF;">${notesTitle || "New Notes"}</span>
    </div>
    <p>Log in now to access your latest content and keep your learning streak going! 🔥</p>
    <a href="https://upskillx.pages.dev/pages/dashboard.html" class="btn">Open Course →</a>
  </div>
  <div class="footer">
    <p>Sent by Tanmay Tuli · <a href="mailto:official.tanmaytuli@gmail.com" style="color:#6C63FF;">official.tanmaytuli@gmail.com</a></p>
    <p>© 2024 UpSkillX · You're receiving this because you're enrolled in this course.</p>
  </div>
</div></body></html>`;

          for (let i = 0; i < recipients.length; i += 100) {
            const batch = recipients.slice(i, i + 100);
            await fetch("https://api.sendgrid.com/v3/mail/send", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                personalizations: batch.map(r => ({ to: [{ email: r.email, name: r.name }] })),
                from: { email: env.FROM_EMAIL || "official.tanmaytuli@gmail.com", name: "UpSkillX" },
                subject,
                content: [{ type: "text/html", value: htmlBody }],
              }),
            });
          }
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}
