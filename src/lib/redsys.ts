import CryptoJS from 'crypto-js';

/**
 * REDSYS SHA256 SIGNATURE GENERATION
 * 
 * NOTE: Calculating signatures on the frontend is a security risk as it exposes 
 * the merchant secret key. Use this only if a backend is not available.
 */

export const generateRedsysParameters = (
  orderId: string,
  amount: number, // In euros, will be converted to cents
  merchantCode: string,
  terminal: string,
  secretKey: string,
  options: {
    urlOk: string;
    urlKo: string;
    urlNotification: string;
    productDescription?: string;
    paymentMethod?: 'card' | 'bizum';
  }
) => {
  // 1. Prepare Merchant Parameters
  // Redsys expects amount in cents without decimals
  const amountCents = Math.round(amount * 100).toString();
  
  // Order ID must be 4 to 12 chars. First 4 must be digits.
  // We'll prefix with '0000' and take the last 12 chars if needed, 
  // but let's ensure it starts with digits.
  // Redsys requires the first 4 positions to be numeric.
  // We'll take only digits from the UUID and pad to 12 chars.
  const formattedOrderId = orderId.replace(/[^0-9]/g, '').slice(0, 12).padStart(12, '0');

  const merchantParams = {
    DS_MERCHANT_AMOUNT: amountCents,
    DS_MERCHANT_ORDER: formattedOrderId,
    DS_MERCHANT_MERCHANTCODE: merchantCode,
    DS_MERCHANT_CURRENCY: '978', // Euro
    DS_MERCHANT_TERMINAL: terminal,
    DS_MERCHANT_TRANSACTIONTYPE: '0', // Authorization
    DS_MERCHANT_MERCHANTURL: options.urlNotification,
    DS_MERCHANT_URLOK: options.urlOk,
    DS_MERCHANT_URLKO: options.urlKo,
    DS_MERCHANT_PRODUCTDESCRIPTION: options.productDescription || 'Compra en Asfalto y Gas',
    ...(options.paymentMethod === 'bizum' ? { DS_MERCHANT_PAYMETHODS: 'z' } : {}),
    ...(options.paymentMethod === 'card' ? { DS_MERCHANT_PAYMETHODS: 'c' } : {})
  };

  const merchantParamsString = JSON.stringify(merchantParams);
  const merchantParamsB64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(merchantParamsString));

  // 2. Generate Signature
  // Decode the secret key from Base64
  const key = CryptoJS.enc.Base64.parse(secretKey);
  
  // Encrypt Order ID with the key using 3DES (CBC mode, zero IV)
  const iv = CryptoJS.enc.Hex.parse('0000000000000000');
  const cipher = CryptoJS.TripleDES.encrypt(formattedOrderId, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding
  });

  // The local key for HMAC is the ciphertext resulting from 3DES
  const localKey = cipher.ciphertext;

  // Calculate HMAC-SHA256 of the Base64 Merchant Parameters
  const signature = CryptoJS.HmacSHA256(merchantParamsB64, localKey);
  const signatureB64 = CryptoJS.enc.Base64.stringify(signature);

  return {
    Ds_SignatureVersion: 'HMAC_SHA256_V1',
    Ds_MerchantParameters: merchantParamsB64,
    Ds_Signature: signatureB64
  };
};

export type RedsysFormParams = {
  Ds_SignatureVersion: string;
  Ds_MerchantParameters: string;
  Ds_Signature: string;
  /** URL de la pasarela (sandbox o producción). La decide el API. */
  redsysUrl: string;
  testMode?: boolean;
};

export const fetchRedsysParameters = async (
  orderId: string,
  amount: number,
  options: {
    urlOk: string;
    urlKo: string;
    urlNotification: string;
    productDescription?: string;
    paymentMethod?: 'card' | 'bizum';
  }
): Promise<RedsysFormParams> => {
  const response = await fetch('/api/redsys-params', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, amount, options })
  });
  
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    const message =
      (detail && typeof detail.message === 'string' && detail.message) ||
      'Error al generar los parámetros de pago';
    throw new Error(message);
  }
  
  const data = (await response.json()) as Partial<RedsysFormParams>;
  if (!data.Ds_MerchantParameters || !data.Ds_Signature || !data.redsysUrl) {
    throw new Error('Respuesta de pago incompleta');
  }

  return {
    Ds_SignatureVersion: data.Ds_SignatureVersion || 'HMAC_SHA256_V1',
    Ds_MerchantParameters: data.Ds_MerchantParameters,
    Ds_Signature: data.Ds_Signature,
    redsysUrl: data.redsysUrl,
    testMode: data.testMode,
  };
};

export const REDSYS_URL_TEST = 'https://sis-t.redsys.es:25443/sis/realizarPago';
export const REDSYS_URL_PROD = 'https://sis.redsys.es/sis/realizarPago';
