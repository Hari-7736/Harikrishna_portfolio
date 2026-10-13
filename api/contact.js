export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, company, topic, message, website } = req.body || {};

  // Honeypot: bots fill this hidden field, so pretend success and drop it
  if (website) return res.status(200).json({ ok: true });

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }

  const esc = (s = "") =>
    String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Portfolio <onboarding@resend.dev>",
      to: "harikrishna773626@gmail.com",
      reply_to: email,
      subject: `[${topic || "General"}] New message from ${name}`,
      html: `
        <p><b>Name:</b> ${esc(name)}</p>
        <p><b>Email:</b> ${esc(email)}</p>
        <p><b>Company:</b> ${esc(company) || "-"}</p>
        <p><b>Topic:</b> ${esc(topic)}</p>
        <p><b>Message:</b><br>${esc(message).replace(/\n/g, "<br>")}</p>
      `,
    }),
  });

  if (!r.ok) {
    console.error("Resend error:", await r.text());
    return res.status(500).json({ error: "Something went wrong. Please email me directly." });
  }

  return res.status(200).json({ ok: true });
}
