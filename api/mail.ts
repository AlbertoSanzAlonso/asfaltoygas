import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { Order, OrderItem } from '../src/types/index.js';
import {
  sendAdminNewOrderEmail,
  sendOrderPaidEmails,
} from '../src/lib/emails/adminNewOrderNotification.js';
import { createMailTransporter, getMailFromAddress, getMailFromHeader } from '../src/lib/mailTransport.js';
import { getEnv } from './_env.js';

/**
 * API de correo consolidada (Hobby: máx. 12 funciones).
 * GET  ?op=status → diagnóstico SMTP
 * POST ?op=send | body sin op → enviar email
 * POST ?op=notify-admin → aviso admin de pedido
 * POST ?op=resend-order → reenviar emails pedido (solo test checkout)
 */

function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 1) return '***';
  return `${email.slice(0, 2)}***${email.slice(at)}`;
}

function getOp(req: VercelRequest): string {
  const fromQuery = String(req.query.op || '').trim().toLowerCase();
  if (fromQuery) return fromQuery;
  if (req.method === 'GET') return 'status';
  return 'send';
}

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

async function handleStatus(req: VercelRequest, res: VercelResponse) {
  const host = getEnv('SMTP_HOST')?.trim() || '';
  const user = getEnv('SMTP_USER')?.trim() || '';
  const pass = Boolean((getEnv('SMTP_PASS') || getEnv('SMTP_PASSWORD') || '').trim());
  const port = getEnv('SMTP_PORT') || '587';
  const from = getMailFromAddress();
  const admin = getEnv('ADMIN_ORDER_EMAIL')?.trim() || '';
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

async function handleSend(req: VercelRequest, res: VercelResponse) {
  const { to, subject, text, html, attachments } = req.body || {};

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const transporter = createMailTransporter();
  if (!transporter) {
    return res.status(500).json({
      success: false,
      error: 'Correo no configurado. Define SMTP_HOST, SMTP_USER y SMTP_PASS.',
    });
  }

  try {
    const info = await transporter.sendMail({
      from: getMailFromHeader(),
      to,
      subject,
      text,
      html,
      attachments,
    });
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('[mail/send]', error);
    return res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

async function handleNotifyAdmin(req: VercelRequest, res: VercelResponse) {
  const orderId = String(req.body?.orderId || '').trim();
  if (!orderId) {
    return res.status(400).json({ message: 'Falta orderId' });
  }

  const supabaseUrl = getEnv('VITE_SUPABASE_URL');
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ message: 'Supabase no configurado' });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const { data: itemsRows } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    const items: OrderItem[] =
      itemsRows && itemsRows.length > 0
        ? itemsRows
        : Array.isArray((order as Order).items)
          ? (order as Order).items
          : [];

    await sendAdminNewOrderEmail(order as Order, items);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[mail/notify-admin]', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar aviso',
    });
  }
}

async function handleResendOrder(req: VercelRequest, res: VercelResponse) {
  if (getEnv('VITE_ENABLE_TEST_CHECKOUT') !== 'true') {
    return res.status(403).json({
      success: false,
      error: 'Solo disponible con VITE_ENABLE_TEST_CHECKOUT=true.',
    });
  }

  const orderId = String(req.body?.orderId || '').trim();
  if (!orderId) {
    return res.status(400).json({ success: false, error: 'Falta orderId' });
  }

  const supabaseUrl = getEnv('VITE_SUPABASE_URL');
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ success: false, error: 'Supabase no configurado' });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (error || !order) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }

    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    const orderItems: OrderItem[] =
      items && items.length > 0
        ? items
        : Array.isArray(order.items)
          ? order.items
          : [];

    const result = await sendOrderPaidEmails(order as Order, orderItems);
    return res.status(200).json({
      success: result.customer || result.admin,
      customer: result.customer,
      admin: result.admin,
      to: order.customer_email,
    });
  } catch (err) {
    console.error('[mail/resend-order]', err);
    return res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const op = getOp(req);

  if (op === 'status') {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
    return handleStatus(req, res);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (op === 'notify-admin') return handleNotifyAdmin(req, res);
  if (op === 'resend-order') return handleResendOrder(req, res);
  if (op === 'send') return handleSend(req, res);

  return res.status(400).json({ message: `Unknown op: ${op}` });
}
