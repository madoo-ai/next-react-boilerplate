import "server-only";

import { render } from "@react-email/render";
import nodemailer, { type Transporter } from "nodemailer";

import {
  ResetPasswordTemplate,
  VerifyEmailTemplate,
} from "@/emails/auth-email";
import { env } from "@/lib/env";

export type AuthEmailType = "verify-email" | "reset-password";

type SendAuthEmailInput = {
  to: string;
  name: string;
  url: string;
  type: AuthEmailType;
};

let transporter: Transporter | null = null;

function getTransporter() {
  if (!env.SMTP_HOST) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER
        ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
        : undefined,
    });
  }

  return transporter;
}

export async function sendAuthEmail({
  to,
  name,
  url,
  type,
}: SendAuthEmailInput) {
  const isVerification = type === "verify-email";
  const subject = isVerification
    ? "Verify your email address"
    : "Reset your password";

  const html = await render(
    isVerification ? (
      <VerifyEmailTemplate name={name} url={url} />
    ) : (
      <ResetPasswordTemplate name={name} url={url} />
    ),
  );

  const text = isVerification
    ? `Welcome, ${name}. Verify your email address: ${url}`
    : `Reset your password, ${name}: ${url}`;

  const transport = getTransporter();

  if (!transport) {
    console.info(`[mail:${type}] ${to} -> ${url}`);
    return;
  }

  try {
    await transport.sendMail({
      from: env.MAIL_FROM,
      to,
      subject,
      html,
      text,
    });
  } catch (error) {
    // A missing local mail server must not block sign-up or password reset.
    console.error(`[mail:${type}] failed to send to ${to}`, error);
    console.info(`[mail:${type}] fallback link: ${url}`);
  }
}
