import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 465);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

export const EMAIL_FROM = process.env.EMAIL_FROM || "MyAIDiary <hello@myaidiary.me>";

export function isEmailConfigured() {
  return !!(host && user && pass);
}

export function getTransport() {
  if (!isEmailConfigured()) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587 (STARTTLS)
    auth: { user: user!, pass: pass! },
  });
}

export async function sendMail(opts: { to: string; subject: string; html?: string; text?: string }) {
  const transport = getTransport();
  if (!transport) throw new Error("SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS.");
  return transport.sendMail({ from: EMAIL_FROM, ...opts });
}
