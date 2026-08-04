import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

/**
 * Transporter de correo.
 * - DonDominio / SMTP genérico: SMTP_HOST + SMTP_USER + SMTP_PASS
 * - Compat Gmail: GMAIL_USER + GMAIL_APP_PASSWORD
 */
export function createMailTransporter(): nodemailer.Transporter | null {
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();
  const smtpPass = (
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD ||
    ''
  ).trim();

  if (!smtpUser || !smtpPass) return null;

  // DonDominio u otro SMTP explícito
  if (smtpHost) {
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

    // Puerto 587 = STARTTLS (recomendado DonDominio)
    if (!secure && port === 587) {
      options.requireTLS = true;
    }

    return nodemailer.createTransport(options);
  }

  // Fallback Gmail (configuración anterior)
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpPass },
  });
}

/** Dirección From visible (ej. info@asfaltoygas.es). */
export function getMailFromAddress(): string {
  const from =
    process.env.MAIL_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    process.env.GMAIL_USER?.trim() ||
    'info@asfaltoygas.es';
  return from;
}

export function getMailFromHeader(): string {
  return `"Asfalto y Gas" <${getMailFromAddress()}>`;
}
