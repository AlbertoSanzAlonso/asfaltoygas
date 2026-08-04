import type { VercelRequest, VercelResponse } from '@vercel/node';
import CryptoJS from 'crypto-js';
import { getEnv } from './_env.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  const allowedOrigins = [
    'https://asfaltoygas.es',
    'https://asfaltoygas.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderId, amount, options } = req.body;

  if (!orderId || amount === undefined) {
    return res.status(400).json({ message: 'Missing required fields: orderId, amount' });
  }

  const amountNumber = Number(amount);
  if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than 0' });
  }

  /**
   * Getnet envía FUC real + clave TEST (p. ej. sq7H…) para el entorno de pruebas.
   * Lo que cambia entre test y prod es la URL (y, al pasar a producción, la clave SHA).
   * Con VITE_ENABLE_TEST_CHECKOUT=true → sis-t.redsys.es (nunca producción).
   */
  const testMode = getEnv('VITE_ENABLE_TEST_CHECKOUT') === 'true';
  const REDSYS_URL_TEST = 'https://sis-t.redsys.es:25443/sis/realizarPago';
  const REDSYS_URL_PROD = 'https://sis.redsys.es/sis/realizarPago';

  const merchantCode =
    getEnv('VITE_REDSYS_COMMERCE_NUMBER_TEST') ||
    getEnv('VITE_REDSYS_COMMERCE_NUMBER');
  const terminal =
    getEnv('VITE_REDSYS_TERMINAL_NUMBER_TEST') ||
    getEnv('VITE_REDSYS_TERMINAL_NUMBER') ||
    '001';
  const secretKey =
    getEnv('VITE_REDSYS_SECRET_KEY_TEST') ||
    getEnv('VITE_REDSYS_SECRET_KEY');
  const redsysUrl = testMode ? REDSYS_URL_TEST : REDSYS_URL_PROD;

  if (!merchantCode || !secretKey) {
    return res.status(500).json({ message: 'Server configuration error: Redsys keys missing' });
  }

  try {
    // 1. Prepare Merchant Parameters
    const amountCents = Math.round(amountNumber * 100).toString();
    // Redsys requires the first 4 positions to be numeric.
    // We'll take only digits from the UUID and pad to 12 chars.
    const formattedOrderId = orderId.replace(/[^0-9]/g, '').slice(0, 12).padStart(12, '0');

    if (formattedOrderId.length < 4 || !/^\d+$/.test(formattedOrderId)) {
      return res.status(400).json({ message: 'Invalid order id for Redsys' });
    }

    const merchantParams = {
      DS_MERCHANT_AMOUNT: amountCents,
      DS_MERCHANT_ORDER: formattedOrderId,
      DS_MERCHANT_MERCHANTCODE: merchantCode,
      DS_MERCHANT_CURRENCY: '978', // Euro
      DS_MERCHANT_TERMINAL: terminal,
      DS_MERCHANT_TRANSACTIONTYPE: '0', // Authorization
      DS_MERCHANT_MERCHANTURL: options?.urlNotification || '',
      DS_MERCHANT_URLOK: options?.urlOk || '',
      DS_MERCHANT_URLKO: options?.urlKo || '',
      DS_MERCHANT_PRODUCTDESCRIPTION: options?.productDescription || 'Compra en Asfalto y Gas',
      DS_MERCHANT_MERCHANTDATA: orderId, // MANDAMOS EL UUID REAL AQUÍ
      ...(options?.paymentMethod === 'bizum' ? { DS_MERCHANT_PAYMETHODS: 'z' } : {}),
      ...(options?.paymentMethod === 'card' ? { DS_MERCHANT_PAYMETHODS: 'c' } : {})
    };

    const merchantParamsString = JSON.stringify(merchantParams);
    const merchantParamsB64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(merchantParamsString));

    // 2. Generate Signature
    const key = CryptoJS.enc.Base64.parse(secretKey);
    const iv = CryptoJS.enc.Hex.parse('0000000000000000');
    const cipher = CryptoJS.TripleDES.encrypt(formattedOrderId, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.ZeroPadding
    });

    const localKey = cipher.ciphertext;
    const signature = CryptoJS.HmacSHA256(merchantParamsB64, localKey);
    const signatureB64 = CryptoJS.enc.Base64.stringify(signature);

    return res.status(200).json({
      Ds_SignatureVersion: 'HMAC_SHA256_V1',
      Ds_MerchantParameters: merchantParamsB64,
      Ds_Signature: signatureB64,
      redsysUrl,
      testMode,
    });
  } catch (error) {
    console.error('Error generating Redsys params:', error);
    return res.status(500).json({ message: 'Error generating signature' });
  }
}
