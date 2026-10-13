export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const { name, email, company, topic, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: "Missing fields" });
  }

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Portfolio <onboarding@resend.dev>",
      to: "hkphoenix778@gmail.com",
      reply_to: email,
      subject: `[${topic || "General"}] New message from ${name}`,
      text: `From: ${name} (${email})\nCompany: ${company || "-"}\n\n${message}`,
    }),
  });

  return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
}