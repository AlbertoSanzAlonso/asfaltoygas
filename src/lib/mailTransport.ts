import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

/**
 * Transporter SMTP (DonDominio u otro).
 * Requiere: SMTP_HOST, SMTP_USER, SMTP_PASS
 */
export function createMailTransporter(): nodemailer.Transporter | null {
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim() || '';
  const smtpPass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '').trim();

  if (!smtpHost || !smtpUser || !smtpPass) return null;

  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    process.env.SMTP_SECURE === 'true' ||
    process.env.SMTP_SECURE === '1' ||
    port === 465;

  const options: SMTPTransport.Options = {
    host: smtpHost,
    port,
    secure,
    auth: { user: smtpUser, pass: smtpPass },
  };

  // Puerto 587 = STARTTLS (DonDominio)
  if (!secure && port === 587) {
    options.requireTLS = true;
  }

  return nodemailer.createTransport(options);
}

/** Dirección From (ej. info@asfaltoygas.es). */
export function getMailFromAddress(): string {
  return (
    process.env.MAIL_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    'info@asfaltoygas.es'
  );
}

export function getMailFromHeader(): string {
  return `"Asfalto y Gas" <${getMailFromAddress()}>`;
}
