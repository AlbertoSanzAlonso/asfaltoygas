import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { Order, OrderItem } from '../src/types/index.js';
import { sendOrderPaidEmails } from '../src/lib/emails/adminNewOrderNotification.js';

/**
 * Reenvía emails de pedido pagado (cliente + admin).
 * POST { orderId: string }
 * Solo con VITE_ENABLE_TEST_CHECKOUT=true (pruebas).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (process.env.VITE_ENABLE_TEST_CHECKOUT !== 'true') {
    return res.status(403).json({
      success: false,
      error: 'Solo disponible con VITE_ENABLE_TEST_CHECKOUT=true.',
    });
  }

  const orderId = String(req.body?.orderId || '').trim();
  if (!orderId) {
    return res.status(400).json({ success: false, error: 'Falta orderId' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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
    console.error('[resend-order-emails]', err);
    return res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
