import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createMailTransporter, getMailFromAddress } from '../src/lib/mailTransport.js';

function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 1) return '***';
  return `${email.slice(0, 2)}***${email.slice(at)}`;
}

/**
 * Diagnóstico de correo (sin secretos).
 * GET /api/mail-status
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const host = process.env.SMTP_HOST?.trim() || '';
  const user = process.env.SMTP_USER?.trim() || '';
  const pass = Boolean((process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '').trim());
  const port = process.env.SMTP_PORT || '587';
  const from = getMailFromAddress();
  const admin = process.env.ADMIN_ORDER_EMAIL?.trim() || '';
  const transporter = createMailTransporter();

  let smtpVerify: 'ok' | 'fail' | 'skipped' = 'skipped';
  let smtpError: string | undefined;
  if (transporter && String(req.query.verify || '') === '1') {
    try {
      await transporter.verify();
      smtpVerify = 'ok';
    } catch (err) {
      smtpVerify = 'fail';
      smtpError = err instanceof Error ? err.message : String(err);
    }
  }

  return res.status(200).json({
    configured: Boolean(transporter),
    smtp: {
      host: host || null,
      port,
      user: user ? maskEmail(user) : null,
      passSet: pass,
      from,
      adminOrderEmail: admin ? maskEmail(admin) : null,
    },
    verify: smtpVerify,
    error: smtpError,
    hint: !transporter
      ? 'Faltan SMTP_HOST, SMTP_USER o SMTP_PASS en Vercel. Tras añadirlas, Redeploy.'
      : smtpVerify === 'fail'
        ? 'Credenciales SMTP rechazadas por DonDominio. Revisa usuario/contraseña.'
        : 'SMTP configurado. Los correos salen al confirmar el pago (webhook/retorno Redsys).',
  });
}
