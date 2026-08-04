import CryptoJS from 'crypto-js';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Order, OrderItem } from '../src/types/index.js';
import { sendOrderPaidEmails } from '../src/lib/emails/adminNewOrderNotification.js';
import { isOrderPaid } from '../src/lib/orderPayment.js';
import { getEnv } from './_env.js';

export type RedsysConfirmResult =
  | { ok: true; orderId?: string; alreadyProcessed?: boolean; skipped?: boolean }
  | { ok: false; status: number; message: string };

function extractRedsysFields(body: Record<string, unknown>): {
  signature?: string;
  merchantParameters?: string;
} {
  const signature =
    (body.Ds_Signature as string) ||
    (body.DS_SIGNATURE as string) ||
    (body.ds_signature as string);
  const merchantParameters =
    (body.Ds_MerchantParameters as string) ||
    (body.DS_MERCHANTPARAMETERS as string) ||
    (body.ds_merchantparameters as string);
  return { signature, merchantParameters };
}

function redsysOrderDigits(orderId: string): string {
  return orderId.replace(/[^0-9]/g, '').slice(0, 12).padStart(12, '0');
}

async function findOrderId(
  supabase: SupabaseClient,
  merchantParams: Record<string, string>
): Promise<string | null> {
  const fromData =
    merchantParams.Ds_MerchantData ||
    merchantParams.DS_MERCHANTDATA ||
    merchantParams.Ds_Merchant_MerchantData;
  if (fromData && String(fromData).includes('-')) {
    return String(fromData);
  }

  const dsOrder = String(merchantParams.Ds_Order || merchantParams.DS_ORDER || '');
  if (!dsOrder) return null;

  // Fallback: pedidos recientes Pending cuyo UUID produce el mismo Ds_Order
  const { data: candidates } = await supabase
    .from('orders')
    .select('order_id, order_status')
    .eq('order_status', 'Pending')
    .order('order_date', { ascending: false })
    .limit(50);

  const match = (candidates || []).find((o) => redsysOrderDigits(o.order_id) === dsOrder.padStart(12, '0') || redsysOrderDigits(o.order_id) === dsOrder);
  return match?.order_id ?? null;
}

/**
 * Verifica firma Redsys y marca el pedido como pagado (idempotente).
 * Usado por webhook (MERCHANTURL) y por retorno de navegador (URLOK).
 */
export async function confirmRedsysPayment(
  rawBody: Record<string, unknown>
): Promise<RedsysConfirmResult> {
  const { signature, merchantParameters } = extractRedsysFields(rawBody);
  if (!signature || !merchantParameters) {
    return { ok: false, status: 400, message: 'Missing parameters' };
  }

  const secretKey = getEnv('VITE_REDSYS_SECRET_KEY');
  const supabaseUrl = getEnv('VITE_SUPABASE_URL');
  const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!secretKey || !supabaseUrl || !supabaseServiceKey) {
    return { ok: false, status: 500, message: 'Server configuration error' };
  }

  const merchantParamsString = CryptoJS.enc.Utf8.stringify(
    CryptoJS.enc.Base64.parse(merchantParameters)
  );
  const merchantParams = JSON.parse(merchantParamsString) as Record<string, string>;
  const orderIdNumeric = String(merchantParams.Ds_Order || merchantParams.DS_ORDER || '');

  const key = CryptoJS.enc.Base64.parse(secretKey);
  const iv = CryptoJS.enc.Hex.parse('0000000000000000');
  const cipher = CryptoJS.TripleDES.encrypt(orderIdNumeric, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding,
  });

  const expectedSignatureB64 = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(merchantParameters, cipher.ciphertext)
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const providedSignature = signature.replace(/\+/g, '-').replace(/\//g, '_');
  if (providedSignature !== expectedSignatureB64) {
    console.error('[redsys] Invalid signature');
    return { ok: false, status: 401, message: 'Invalid signature' };
  }

  const responseCode = parseInt(String(merchantParams.Ds_Response ?? merchantParams.DS_RESPONSE), 10);
  if (!(responseCode >= 0 && responseCode <= 99)) {
    console.log('[redsys] Payment not successful. Response:', responseCode);
    return { ok: true, skipped: true };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const orderUuid = await findOrderId(supabase, merchantParams);
  if (!orderUuid) {
    console.error('[redsys] Pedido no encontrado para Ds_Order:', orderIdNumeric);
    return { ok: false, status: 404, message: 'Order not found' };
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .update({ order_status: 'Paid', payment_status: 'Paid' })
    .eq('order_id', orderUuid)
    .eq('order_status', 'Pending')
    .select()
    .maybeSingle();

  if (orderError) throw orderError;

  if (!order) {
    const { data: existing } = await supabase
      .from('orders')
      .select('order_id, order_status, payment_status')
      .eq('order_id', orderUuid)
      .maybeSingle();

    if (existing && isOrderPaid(existing)) {
      return { ok: true, orderId: orderUuid, alreadyProcessed: true };
    }
    if (!existing) {
      return { ok: false, status: 404, message: 'Order not found' };
    }
    return { ok: true, orderId: orderUuid, skipped: true };
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderUuid);

  if (items) {
    for (const item of items) {
      if (item.variant_id) {
        await supabase.rpc('decrement_stock', {
          p_variant_id: item.variant_id,
          p_quantity: item.quantity,
        });
      }
    }
  }

  const orderItems: OrderItem[] =
    items && items.length > 0
      ? items
      : Array.isArray(order.items)
        ? order.items
        : [];

  const emailResults = await sendOrderPaidEmails(order as Order, orderItems);
  if (!emailResults.admin) {
    console.error('[redsys] No se pudo enviar el aviso al admin.');
  }

  return { ok: true, orderId: orderUuid };
}
