import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// SMTP is optional in dev: without credentials we log the code instead of
// failing, so the Confirmation screen flow always works locally.
const hasSmtp = Boolean(env.smtp.user && env.smtp.pass);

const transporter = hasSmtp
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure, // false = STARTTLS on 587
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    })
  : null;

// FASCO-branded HTML shell shared by both emails (keeps the codebase small
// the way the guide project shares one template per email).
const shell = (heading, name, code, note) => `
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:Arial,sans-serif">
  <table cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f7fa;padding:40px 0">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;width:600px;max-width:95%">
        <tr><td align="center" style="background:#111;padding:30px">
          <h1 style="color:#fff;margin:0;font-size:28px">${heading}</h1>
        </td></tr>
        <tr><td style="padding:40px 30px;color:#333">
          <h2 style="margin-top:0">Hello ${escapeHtml(name || "User")},</h2>
          <p style="font-size:16px;line-height:1.6">${note}</p>
          <div style="text-align:center;margin:35px 0">
            <span style="display:inline-block;background:#111;color:#fff;padding:16px 34px;border-radius:8px;font-size:26px;font-weight:700;letter-spacing:8px">${code}</span>
          </div>
          <p style="font-size:14px;color:#666;line-height:1.6">This code expires in <strong>10 minutes</strong>. If you didn't request it, you can safely ignore this email.</p>
        </td></tr>
        <tr><td align="center" style="padding:20px;background:#f8fafc;color:#888;font-size:12px">© ${new Date().getFullYear()} FASCO. All rights reserved.</td></tr>
      </table>
    </td></tr>
  </table>
</body>`;

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

const deliver = async (to, subject, html, code) => {
  if (!transporter) {
    return { delivered: false, code };
  }
  try {
    const info = await transporter.sendMail({ from: env.smtp.from, to, subject, html });
    console.log(`[mailer] ${subject} sent to ${to} (${info.messageId})`);
    return { delivered: true };
  } catch (err) {
    console.error("[mailer] Email delivery failed:", err.message);
    // surface the code anyway in dev so a broken SMTP never locks anyone out
    if (!env.isProduction) {
      return { delivered: false, code };
    }
    throw err;
  }
};

export const sendVerificationEmail = ({ to, name, code }) =>
  deliver(
    to,
    "Verify your email",
    shell("Verify Your Email", name, code, "Thanks for signing up at FASCO. Enter this confirmation code to activate your account."),
    code
  );

export const sendPasswordResetEmail = ({ to, name, code }) =>
  deliver(
    to,
    "Reset your password",
    shell("Reset Your Password", name, code, "We received a request to reset your FASCO password. Use the code below to choose a new one."),
    code
  );

export const sendEmailChangeVerification = ({ to, name, code }) =>
  deliver(
    to,
    "Confirm your new FASCO email",
    shell("Confirm Your New Email", name, code, "Use this code to confirm the new email address for your FASCO account."),
    code
  );

const orderEmailShell = (heading, content) => `
<body style="margin:0;padding:32px;background:#f4f7fa;font-family:Arial,sans-serif;color:#333">
  <table cellpadding="0" cellspacing="0" style="max-width:620px;margin:auto;background:#fff;border-radius:12px;width:100%">
    <tr><td style="background:#111;padding:26px 30px;color:#fff"><h1 style="margin:0">${heading}</h1></td></tr>
    <tr><td style="padding:30px;line-height:1.6">${content}</td></tr>
    <tr><td style="padding:18px 30px;background:#f8fafc;color:#888;font-size:12px">FASCO customer support</td></tr>
  </table>
</body>`;

const sendOrderEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.info(`[mailer] SMTP is not configured; skipped "${subject}" for ${to}`);
    return false;
  }
  try {
    const info = await transporter.sendMail({ from: env.smtp.from, to, subject, html });
    console.info(`[mailer] ${subject} sent to ${to} (${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`[mailer] Could not send "${subject}" to ${to}:`, error.message);
    return false;
  }
};

export const sendOrderConfirmation = (order) => {
  const name = escapeHtml([order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ") || "Customer");
  const items = order.items.map((item) =>
    `<li>${escapeHtml(item.title)} × ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}</li>`
  ).join("");
  return sendOrderEmail({
    to: order.customer.email,
    subject: `FASCO order ${order.orderNumber} confirmed`,
    html: orderEmailShell(
      "Order confirmed",
      `<p>Hello ${name}, your payment was received and your order is confirmed.</p>
       <p><strong>Order ${escapeHtml(order.orderNumber)}</strong></p><ul>${items}</ul>
       <p><strong>Total: $${Number(order.total).toFixed(2)}</strong></p>`
    ),
  });
};

export const sendOrderStatusUpdate = (order) =>
  sendOrderEmail({
    to: order.customer.email,
    subject: `FASCO order ${order.orderNumber}: ${order.status}`,
    html: orderEmailShell(
      "Order update",
      `<p>Hello ${escapeHtml([order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ") || "Customer")},</p>
       <p>Your order <strong>${escapeHtml(order.orderNumber)}</strong> is now <strong>${escapeHtml(order.status)}</strong>.</p>`
    ),
  });