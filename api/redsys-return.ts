import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCanonicalSiteUrl } from './_siteUrl.js';

function collectParams(req: VercelRequest): Record<string, unknown> {
  const body =
    req.body && typeof req.body === 'object' && !Array.isArray(req.body)
      ? (req.body as Record<string, unknown>)
      : {};
  const query = (req.query || {}) as Record<string, unknown>;
  return { ...query, ...body };
}

function redirectToCheckout(
  res: VercelResponse,
  payment: 'success' | 'error'
): void {
  const origin = getCanonicalSiteUrl();
  const target = `${origin}/checkout?payment=${payment}`;
  res.statusCode = 302;
  res.setHeader('Location', target);
  res.setHeader('Cache-Control', 'no-store');
  res.end();
}

/**
 * Retorno de navegador Redsys (URLOK / URLKO).
 * Nunca debe devolver 500: si algo falla, redirige a checkout con payment=error.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  let payment: 'success' | 'error' = 'error';

  try {
    if (req.method !== 'POST' && req.method !== 'GET') {
      redirectToCheckout(res, 'error');
      return;
    }

    const params = collectParams(req);
    const resultHint = String(params.result || params.payment || '').toLowerCase();
    const isKo = resultHint === 'ko' || resultHint === 'error';
    payment = isKo ? 'error' : 'success';

    const merchantParameters =
      params.Ds_MerchantParameters ||
      params.DS_MERCHANTPARAMETERS ||
      params.ds_merchantparameters;
    const signature =
      params.Ds_Signature || params.DS_SIGNATURE || params.ds_signature;
    const hasDs = Boolean(merchantParameters) && Boolean(signature);

    if (hasDs && !isKo) {
      try {
        const { confirmRedsysPayment } = await import('./_redsysConfirm.js');
        const confirmed = await confirmRedsysPayment(params);
        if (confirmed.ok === false) {
          console.error('[redsys-return] confirm failed:', confirmed.message);
          // URLOK con firma inválida: dejamos success en UI; el webhook puede completar.
        } else if (confirmed.skipped) {
          payment = isKo ? 'error' : 'success';
        } else {
          payment = 'success';
        }
      } catch (err) {
        console.error('[redsys-return] confirm threw:', err);
        // No tumbar el retorno: el usuario vuelve a la tienda.
      }
    }
  } catch (err) {
    console.error('[redsys-return] fatal:', err);
    payment = 'error';
  }

  try {
    redirectToCheckout(res, payment);
  } catch (err) {
    console.error('[redsys-return] redirect failed:', err);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(
      `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Pago</title></head><body>
      <p>No se pudo completar la redirección. <a href="https://www.asfaltoygas.es/checkout?payment=${payment}">Volver a la tienda</a></p>
      <script>location.replace("https://www.asfaltoygas.es/checkout?payment=${payment}");</script>
      </body></html>`
    );
  }
}
