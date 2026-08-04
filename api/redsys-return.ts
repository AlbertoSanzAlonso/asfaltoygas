import type { VercelRequest, VercelResponse } from '@vercel/node';
import { confirmRedsysPayment } from './_redsysConfirm.js';

function siteOrigin(req: VercelRequest): string {
  const fromEnv = (process.env.SITE_URL || process.env.VITE_SITE_URL || '').replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

function collectParams(req: VercelRequest): Record<string, unknown> {
  const body =
    req.body && typeof req.body === 'object' && !Array.isArray(req.body)
      ? (req.body as Record<string, unknown>)
      : {};
  const query = (req.query || {}) as Record<string, unknown>;
  return { ...query, ...body };
}

/**
 * Retorno de navegador Redsys (URLOK / URLKO).
 * Redsys hace POST con Ds_*; las SPA no reciben ese POST → aquí confirmamos y redirigimos por GET.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const origin = siteOrigin(req);
  const params = collectParams(req);
  const resultHint = String(params.result || params.payment || '').toLowerCase();
  const hasDs =
    Boolean(params.Ds_MerchantParameters || params.DS_MERCHANTPARAMETERS) &&
    Boolean(params.Ds_Signature || params.DS_SIGNATURE);

  let payment: 'success' | 'error' = resultHint === 'ko' || resultHint === 'error' ? 'error' : 'success';

  if (hasDs) {
    try {
      const confirmed = await confirmRedsysPayment(params);
      if (!confirmed.ok) {
        console.error('[redsys-return] confirm failed:', confirmed.message);
        // Si la firma falla pero el usuario viene de URLOK, igual redirigimos a success
        // solo cuando el hint es ok; el webhook puede completar después.
        if (resultHint === 'ko' || resultHint === 'error') payment = 'error';
      } else if (confirmed.skipped && (resultHint === 'ko' || resultHint === 'error')) {
        payment = 'error';
      } else {
        payment = 'success';
      }
    } catch (err) {
      console.error('[redsys-return] error:', err);
    }
  } else if (resultHint === 'ko' || resultHint === 'error') {
    payment = 'error';
  }

  const target = `${origin}/checkout?payment=${payment}`;
  res.statusCode = 302;
  res.setHeader('Location', target);
  res.end();
}
