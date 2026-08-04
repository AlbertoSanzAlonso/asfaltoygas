import { getEnv } from './env.js';

/**
 * Transporter SMTP (DonDominio u otro).
 * Requiere: SMTP_HOST, SMTP_USER, SMTP_PASS
 */
import nodemailer from 'nodemailer';

export function createMailTransporter(): nodemailer.Transporter | null {
  const smtpHost = getEnv('SMTP_HOST')?.trim();
  const smtpUser = getEnv('SMTP_USER')?.trim() || '';
  const smtpPass = (getEnv('SMTP_PASS') || getEnv('SMTP_PASSWORD') || '').trim();

  if (!smtpHost || !smtpUser || !smtpPass) return null;

  const port = Number(getEnv('SMTP_PORT') || 587);
  const secure =
    getEnv('SMTP_SECURE') === 'true' ||
    getEnv('SMTP_SECURE') === '1' ||
    port === 465;

  return nodemailer.createTransport({
    host: smtpHost,
    port,
    secure,
    auth: { user: smtpUser, pass: smtpPass },
    ...(!secure && port === 587 ? { requireTLS: true } : {}),
  });
}

/** Dirección From (ej. info@asfaltoygas.es). */
export function getMailFromAddress(): string {
  return (
    getEnv('MAIL_FROM')?.trim() ||
    getEnv('SMTP_USER')?.trim() ||
    'info@asfaltoygas.es'
  );
}

export function getMailFromHeader(): string {
  return `"Asfalto y Gas" <${getMailFromAddress()}>`;
}
