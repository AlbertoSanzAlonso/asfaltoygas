import type { VercelRequest, VercelResponse } from '@vercel/node';
import CryptoJS from 'crypto-js';
import { createClient } from '@supabase/supabase-js';
import type { Order, OrderItem } from '../../src/types/index.js';
import { sendOrderPaidEmails } from '../../src/lib/emails/adminNewOrderNotification.js';
import { isOrderPaid } from '../../src/lib/orderPayment.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { Ds_Signature, Ds_MerchantParameters } = req.body;

  if (!Ds_Signature || !Ds_MerchantParameters) {
    // Redsys sometimes sends parameters in different casing or direct body
    // but usually it's standard POST parameters.
    return res.status(400).json({ message: 'Missing parameters' });
  }

  const secretKey = process.env.VITE_REDSYS_SECRET_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretKey || !supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    // 1. Verify Signature
    const merchantParamsString = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(Ds_MerchantParameters));
    const merchantParams = JSON.parse(merchantParamsString);
    const orderIdNumeric = merchantParams.Ds_Order;
    
    const key = CryptoJS.enc.Base64.parse(secretKey);
    const iv = CryptoJS.enc.Hex.parse('0000000000000000');
    const cipher = CryptoJS.TripleDES.encrypt(orderIdNumeric, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.ZeroPadding
    });

    const localKey = cipher.ciphertext;
    const expectedSignature = CryptoJS.HmacSHA256(Ds_MerchantParameters, localKey);
    const expectedSignatureB64 = CryptoJS.enc.Base64.stringify(expectedSignature).replace(/\+/g, '-').replace(/\//g, '_');
    
    // Redsys uses a URL-safe Base64 for the signature in notifications sometimes, 
    // but the comparison should be robust.
    const providedSignature = Ds_Signature.replace(/\+/g, '-').replace(/\//g, '_');

    if (providedSignature !== expectedSignatureB64) {
      console.error('Invalid Redsys signature');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // 2. Check Payment Status (0000 to 0099 is success)
    const responseCode = parseInt(merchantParams.Ds_Response);
    if (responseCode >= 0 && responseCode <= 99) {
      // SUCCESS!
      const orderUuid = merchantParams.Ds_MerchantData; // Here is our real ID
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Idempotencia: solo marcar pagado si sigue Pending (reintentos de Redsys).
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
          console.log('[redsys-webhook] Pedido ya procesado:', orderUuid);
          return res.status(200).json({ success: true, alreadyProcessed: true });
        }

        if (!existing) {
          console.error('[redsys-webhook] Pedido no encontrado:', orderUuid);
          return res.status(404).json({ message: 'Order not found' });
        }

        console.warn('[redsys-webhook] Pedido en estado no procesable:', orderUuid, existing);
        return res.status(200).json({ success: true, skipped: true });
      }

      // 3. Decrement Stock
      // We need the order items. They are in the 'order_items' table usually, 
      // but in your schema they might be a JSON column or a separate table.
      // Based on CheckoutPage, they seem to be passed to api.orders.create.
      // Let's check if there are order items to process.
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderUuid);

      if (!itemsError && items) {
        for (const item of items) {
          // We need the variant_id to decrement stock accurately
          // If variant_id is not in order_items, we'd need to find it.
          // In CheckoutPage, it was: item.selectedVariant.variant_id
          if (item.variant_id) {
            await supabase.rpc('decrement_stock', { 
              p_variant_id: item.variant_id, 
              p_quantity: item.quantity 
            });
          }
        }
      }

      // 4. Emails cliente + admin (en paralelo, mismo momento)
      const orderItems: OrderItem[] =
        items && items.length > 0
          ? items
          : Array.isArray(order.items)
            ? order.items
            : [];

      const emailResults = await sendOrderPaidEmails(order as Order, orderItems);
      if (!emailResults.admin) {
        console.error('[redsys-webhook] No se pudo enviar el aviso al admin.');
      }

      return res.status(200).json({ success: true });
    } else {
      console.log('Payment failed or cancelled by user. Response:', responseCode);
      return res.status(200).json({ message: 'Payment not successful' });
    }
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
}
