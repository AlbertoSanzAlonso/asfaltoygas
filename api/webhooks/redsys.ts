import type { VercelRequest, VercelResponse } from '@vercel/node';
import { confirmRedsysPayment } from '../_redsysConfirm.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const body =
    req.body && typeof req.body === 'object'
      ? (req.body as Record<string, unknown>)
      : {};

  try {
    const result = await confirmRedsysPayment(body);
    if (result.ok === false) {
      return res.status(result.status).json({ message: result.message });
    }
    return res.status(200).json({
      success: true,
      orderId: result.orderId,
      alreadyProcessed: result.alreadyProcessed,
      skipped: result.skipped,
    });
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
}
