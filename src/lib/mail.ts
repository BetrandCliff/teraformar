import nodemailer from "nodemailer";

function getTransport() {
  const user = process.env.NAMECHEAP_EMAIL_USER;
  const pass = process.env.NAMECHEAP_EMAIL_PASSWORD;
  if (!user || !pass) {
    throw new Error("Email is not configured. Set NAMECHEAP_EMAIL_USER and NAMECHEAP_EMAIL_PASSWORD.");
  }

  return {
    user,
    transport: nodemailer.createTransport({
      host: process.env.NAMECHEAP_SMTP_HOST || "mail.privateemail.com",
      port: Number(process.env.NAMECHEAP_SMTP_PORT || 465),
      secure: Number(process.env.NAMECHEAP_SMTP_PORT || 465) === 465,
      auth: { user, pass },
    }),
  };
}

export async function sendFormEmail(subject: string, lines: string[], replyTo?: string) {
  const { user, transport } = getTransport();
  await transport.sendMail({
    from: `Website form <${user}>`,
    to: process.env.APPLICATION_EMAIL_TO || user,
    replyTo,
    subject,
    text: lines.join("\n"),
  });
}
