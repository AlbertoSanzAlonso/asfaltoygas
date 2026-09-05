
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { canFulfillOrder } from '../src/lib/orderPayment.js';
import { BRAND } from '../src/lib/brand.js';
import { getEnv } from './_env.js';

/** Versión del handler (comprobar en Network → respuesta JSON tras redeploy). */
const NACEX_API_VERSION = '2026-09-latin1-encode-v6';
const NACEX_WS_URL = 'https://pda.nacex.com/nacex_ws/ws';

/** Evita romper el formato pipe-separated de Nacex. */
function nacexField(value: string): string {
  return value.replace(/\|/g, ' ').trim();
}

/** putExpedicion devuelve OK|... (antiguo) o código numérico|albarán|... (actual). */
function parsePutExpedicionResponse(raw: string): {
  tracking: string;
  albaran?: string;
  labelUrl?: string;
} | null {
  const text = raw.trim();
  if (!text || text.toUpperCase().startsWith('ERROR')) return null;

  const parts = text.split('|').map((p) => p.trim());
  if (parts[0] === 'OK' && parts[1]) {
    return { tracking: parts[1], labelUrl: parts[2] };
  }
  if (/^\d+$/.test(parts[0] ?? '')) {
    return { tracking: parts[0], albaran: parts[1] };
  }
  return null;
}

/**
 * Percent-encode en ISO-8859-1 (como PHP urlencode con Latin-1).
 * encodeURIComponent usa UTF-8 y Nacex lo lee como Latin-1 → "Nicolás" sale "NicolÃ¡s".
 */
function encodeNacexValue(value: string): string {
  let out = '';
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const ch = value[i]!;
    // Mismos caracteres “seguros” que encodeURIComponent
    if (/[A-Za-z0-9\-_.!~*'()]/.test(ch)) {
      out += ch;
      continue;
    }
    if (code === 0x20) {
      out += '%20';
      continue;
    }
    if (code <= 0xff) {
      out += `%${code.toString(16).toUpperCase().padStart(2, '0')}`;
      continue;
    }
    // Fuera de Latin-1 (emoji, etc.): omitir
  }
  return out;
}

/** Codifica cada valor clave=valor como la librería PHP oficial (ISO-8859-1). */
function encodeNacexData(pairs: string[]): string {
  return pairs
    .map((pair) => {
      const eq = pair.indexOf('=');
      if (eq === -1) return pair;
      const key = pair.slice(0, eq);
      const value = pair.slice(eq + 1);
      return `${key}=${encodeNacexValue(value)}`;
    })
    .join('|');
}

/** Nacex devuelve N puntos separados por `|`, cada uno con campos `~`. */
function parseNacexShopPoints(rawData: string): Array<{
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  hours: string;
  lat: string;
  lng: string;
}> {
  const trimmed = rawData.trim();
  if (!trimmed || trimmed.toUpperCase().startsWith('ERROR')) return [];

  const segments = trimmed.split('|').filter((segment) => segment.includes('~'));

  return segments
    .map((segment) => {
      const p = segment.split('~');
      const rawName = (p[1] || 'Punto Nacex').trim();
      let cleanName = rawName.replace(/^[0-9\-]+\s+/, '').trim();
      cleanName = cleanName.replace(/AGENCIA\s+[0-9]+/gi, '').trim();

      const commaIdx = cleanName.indexOf(',');
      const displayName = commaIdx > 0 ? cleanName.slice(0, commaIdx).trim() : cleanName;
      const street = commaIdx > 0 ? cleanName.slice(commaIdx + 1).trim() : '';

      return {
        id: (p[0] || '').trim(),
        name: displayName || cleanName,
        address: street,
        city: (p[2] || '').trim(),
        zip: (p[3] || '').trim(),
        phone: (p[4] || '').trim(),
        hours: (p[5] || '').trim(),
        lat: (p[p.length - 2] || '').trim(),
        lng: (p[p.length - 1] || '').trim(),
      };
    })
    .filter((point) => point.id && point.id !== 'null' && /^\d+$/.test(point.id));
}

/** Nacex responde en ISO-8859-1; response.text() asume UTF-8 y rompe tildes (Parmetros). */
async function decodeNacexResponse(response: Response): Promise<string> {
  const buffer = await response.arrayBuffer();
  return new TextDecoder('iso-8859-1').decode(buffer);
}

/** Convierte "ERROR|mensaje|5412" en texto legible para el admin. */
function formatNacexError(raw: string): string {
  const text = raw.trim();
  if (!text) return 'No se pudo crear el envío en Nacex.';

  const parts = text.split('|').map((p) => p.trim());
  const isError = parts[0]?.toUpperCase() === 'ERROR';
  const code =
    isError && parts.length > 2 && /^\d+$/.test(parts[parts.length - 1] ?? '')
      ? parts[parts.length - 1]
      : '';
  const mainMessage =
    (isError ? (code ? parts.slice(1, -1) : parts.slice(1)).join('|') : text) ||
    'Error al comunicar con Nacex.';

  const hints: string[] = [];
  if (/num_cli/i.test(mainMessage)) {
    hints.push('Número de cliente: revisa NACEX_CLIENTE en Vercel (máximo 5 dígitos).');
  }
  if (/cp_ent/i.test(mainMessage)) {
    hints.push('Código postal: el pedido debe tener un CP de envío válido.');
  }
  if (/dir_ent/i.test(mainMessage)) {
    hints.push('Dirección: comprueba calle y número en el pedido.');
  }
  if (/tel_ent/i.test(mainMessage)) {
    hints.push('Teléfono: añade un número de contacto del cliente.');
  }
  if (/nom_ent/i.test(mainMessage)) {
    hints.push('Nombre: revisa nombre y apellidos del destinatario.');
  }
  if (/del_cli/i.test(mainMessage)) {
    hints.push('Delegación: revisa NACEX_AGENCIA en la configuración.');
  }
  if (/recogida|nom_rec|dir_rec|cp_rec|pob_rec|5610/i.test(mainMessage) || code === '5610') {
    hints.push(
      'Dirección de recogida (tienda): añade en Vercel NACEX_NOMBRE_RECOGIDA, NACEX_DIR_RECOGIDA, NACEX_POBLACION_RECOGIDA, NACEX_CP_RECOGIDA y NACEX_TEL_RECOGIDA, y redeploy.',
    );
  }

  let message = mainMessage.trim();
  if (hints.length > 0) {
    message += '\n\n' + [...new Set(hints)].map((h) => `→ ${h}`).join('\n');
  }
  if (code) {
    message += `\n\n(Ref. Nacex: ${code})`;
  }
  return message;
}

function nacexLabelPath(codExp: string): string {
  return `/api/nacex?method=get_etiqueta&codExp=${encodeURIComponent(codExp)}`;
}

/** Parsea respuesta getInfoEnvio (tipo E = envío). */
function parseGetInfoEnvio(raw: string): {
  tracking?: string;
  albaran?: string;
  numCli?: string;
  remitente?: string;
  dirRecogida?: string;
  cpRecogida?: string;
  pobRecogida?: string;
  telRecogida?: string;
  destinatario?: string;
  dirEntrega?: string;
  cpEntrega?: string;
  raw?: string;
} | null {
  const text = raw.trim();
  if (!text || text.toUpperCase().startsWith('ERROR')) return null;
  const p = text.split('|');
  return {
    tracking: p[0],
    albaran: p[1] && p[2] ? `${p[1]}/${p[2]}` : undefined,
    numCli: p[4],
    remitente: p[16],
    dirRecogida: p[17],
    cpRecogida: p[18],
    pobRecogida: p[19],
    telRecogida: p[22],
    destinatario: p[25],
    dirEntrega: p[26],
    cpEntrega: p[27],
    raw: text.length > 400 ? `${text.slice(0, 400)}…` : text,
  };
}

function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 1) return '***';
  return `${email.slice(0, 2)}***${email.slice(at)}`;
}

/** Guarda tracking en Supabase con service role (el admin en cliente suele fallar por RLS). */
async function saveOrderTracking(orderId: string, tracking: string): Promise<boolean> {
  const supabaseUrl = getEnv('VITE_SUPABASE_URL');
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey || !orderId) return false;

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabase
    .from('orders')
    .update({
      tracking_number: tracking,
      carrier: 'NACEX',
      order_status: 'Shipped',
      shipped_date: new Date().toISOString(),
    })
    .eq('order_id', orderId)
    .select('order_id, tracking_number')
    .maybeSingle();

  if (error) {
    console.error('[nacex] No se pudo guardar tracking en orders:', error.message);
    return false;
  }
  return Boolean(data?.tracking_number);
}

/** Tracking ficticio del usuario Nacex TEST (no hay etiqueta real). */
function isNacexTestStubTracking(codExp: string): boolean {
  const t = codExp.trim().toUpperCase();
  return (
    t === '9999999' ||
    t === '999999' ||
    t.startsWith('TEST-') ||
    t.startsWith('TESTNX')
  );
}

/** Etiqueta SVG de prueba cuando Nacex TEST no emite PNG real. */
function buildNacexTestLabelSvg(codExp: string): string {
  const safe = nacexField(codExp).slice(0, 40);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
  <rect width="400" height="600" fill="#fff8e1"/>
  <rect x="16" y="16" width="368" height="568" fill="none" stroke="#f59e0b" stroke-width="4"/>
  <text x="200" y="80" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="700" fill="#92400e">NACEX TEST</text>
  <text x="200" y="130" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#78350f">Etiqueta de prueba</text>
  <text x="200" y="200" text-anchor="middle" font-family="monospace" font-size="22" fill="#111">#${safe}</text>
  <text x="200" y="280" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#78350f">El usuario Nacex TEST no genera</text>
  <text x="200" y="305" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#78350f">etiqueta real ni recogida en tienda.</text>
  <text x="200" y="360" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#a16207">Expedición de prueba OK.</text>
  <text x="200" y="520" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="#a16207">Asfalto y Gas — modo test</text>
</svg>`;
}

/** Descarga etiqueta PNG desde Nacex (respuesta en base64). */
async function fetchNacexLabelPng(
  user: string,
  pass: string,
  codExp: string
): Promise<{ png: Buffer | null; rawError?: string }> {
  const labelData = encodeNacexData([`codExp=${codExp}`, 'modelo=IMAGEN']);
  const labelRes = await fetch(
    `${NACEX_WS_URL}?method=getEtiqueta&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}&data=${labelData}`,
  );
  const decoded = (await decodeNacexResponse(labelRes)).trim();
  if (!decoded) return { png: null, rawError: 'Respuesta vacía de getEtiqueta' };
  if (decoded.toUpperCase().startsWith('ERROR')) {
    return { png: null, rawError: formatNacexError(decoded) };
  }

  // A veces viene OK|base64 o solo base64 (puede traer saltos de línea)
  let b64 = decoded;
  if (decoded.includes('|')) {
    const parts = decoded.split('|').map((p) => p.trim());
    b64 = parts.find((p) => p.length > 80 && !/^(OK|ERROR|\d+)$/i.test(p)) || parts[parts.length - 1];
  }
  b64 = b64.replace(/\s+/g, '');
  try {
    const png = Buffer.from(b64, 'base64');
    // PNG magic bytes
    if (png.length > 8 && png[0] === 0x89 && png[1] === 0x50) {
      return { png };
    }
    return { png: null, rawError: 'La respuesta de Nacex no es una imagen PNG válida.' };
  } catch {
    return { png: null, rawError: 'No se pudo decodificar la etiqueta (base64).' };
  }
}

/**
 * Nacex API Handler (Proxy para evitar CORS y ocultar credenciales)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuración de cabeceras para CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, cp, tracking, codExp, albaran } = req.query;

  // CREDENCIALES (Prioridad a Variables de Entorno)
  const NACEX_USER_PROD = getEnv('NACEX_USER') || 'ASFALTOYGASATCLIENTE@GMAIL.COM';
  const NACEX_USER_TEST =
    getEnv('NACEX_USER_TEST') || 'ASFALTOYGASATCLIENTE@GMAIL._T';
  const NACEX_PASS = getEnv('NACEX_PASSWORD') || '';
  const NACEX_AGENCY = getEnv('NACEX_AGENCIA') || '2924';
  const NACEX_CLIENT = getEnv('NACEX_CLIENTE') || '00485';
  const NACEX_CP_RECOGIDA = getEnv('NACEX_CP_RECOGIDA') || BRAND.address.postalCode;
  const NACEX_NOMBRE_RECOGIDA = getEnv('NACEX_NOMBRE_RECOGIDA') || BRAND.name;
  const NACEX_DIR_RECOGIDA = (getEnv('NACEX_DIR_RECOGIDA') || BRAND.address.street).slice(0, 45);
  const NACEX_POBLACION_RECOGIDA = getEnv('NACEX_POBLACION_RECOGIDA') || BRAND.address.city;
  const NACEX_TEL_RECOGIDA = (getEnv('NACEX_TEL_RECOGIDA') || BRAND.phone.replace(/\D/g, '').slice(-9))
    .replace(/\D/g, '')
    .slice(0, 15);

  const canUseRealAPI = NACEX_PASS && NACEX_PASS !== 'tu_password' && NACEX_PASS !== 'PON_AQUI_TU_CLAVE_MD5';

  /** Misma flag que el botón "Pago test": fuerza usuario Nacex de prueba. */
  const testCheckoutEnabled = getEnv('VITE_ENABLE_TEST_CHECKOUT') === 'true';

  /** Usuario WS activo: test si la flag está on o el body/query pide pruebas. */
  const paymentMethodHint = String(req.body?.payment_method || '').toUpperCase();
  const requestWantsNacexTest =
    testCheckoutEnabled ||
    req.body?.isTest === true ||
    req.body?.isTest === 'true' ||
    String(req.query?.isTest || '').toLowerCase() === 'true' ||
    paymentMethodHint.includes('TEST') ||
    paymentMethodHint.includes('PRUEBA') ||
    paymentMethodHint.includes('SIN PAGO') ||
    String(req.body?.orderId || req.query?.orderId || '')
      .toUpperCase()
      .includes('TEST');
  const NACEX_USER = requestWantsNacexTest ? NACEX_USER_TEST : NACEX_USER_PROD;

  // --- DIAGNÓSTICO (sin secretos) ---
  if (method === 'debug_config' || method === 'diagnostico') {
    return res.status(200).json({
      success: true,
      mode: canUseRealAPI ? 'real' : 'mock',
      apiVersion: NACEX_API_VERSION,
      config: {
        user: maskEmail(NACEX_USER_PROD),
        userTest: maskEmail(NACEX_USER_TEST),
        activeUser: maskEmail(NACEX_USER),
        testCheckoutEnabled,
        agencia: NACEX_AGENCY,
        cliente: NACEX_CLIENT,
        nombreRecogida: NACEX_NOMBRE_RECOGIDA,
        dirRecogida: NACEX_DIR_RECOGIDA,
        cpRecogida: NACEX_CP_RECOGIDA,
        pobRecogida: NACEX_POBLACION_RECOGIDA,
        telRecogida: NACEX_TEL_RECOGIDA,
      },
      checks: {
        clienteEs00485: NACEX_CLIENT === '00485',
        nombreEsAsfaltoYGas: NACEX_NOMBRE_RECOGIDA.toLowerCase().includes('asfalto'),
        sinReferenciasModas:
          !NACEX_NOMBRE_RECOGIDA.toLowerCase().includes('modas') &&
          !NACEX_USER.toLowerCase().includes('melomerezco'),
      },
    });
  }

  if (method === 'debug_expedition' || method === 'consultar_envio') {
    if (!canUseRealAPI) {
      return res.status(200).json({ success: false, mode: 'mock', error: 'Sin credenciales Nacex.' });
    }

    const codExpStr = String(codExp || tracking || '').trim();
    let del = NACEX_AGENCY;
    let num = '';

    const albaranStr = String(albaran || '').trim();
    if (albaranStr.includes('/')) {
      const [d, n] = albaranStr.split('/');
      del = d || del;
      num = n || '';
    } else if (codExpStr) {
      // Resolver albarán desde código expedición
      try {
        const codeRes = await fetch(
          `${NACEX_WS_URL}?method=getExpeCodigo&user=${encodeURIComponent(NACEX_USER)}&pass=${encodeURIComponent(NACEX_PASS)}&data=${encodeURIComponent(codExpStr)}`,
        );
        const codeRaw = (await decodeNacexResponse(codeRes)).trim();
        if (!codeRaw.toUpperCase().startsWith('ERROR') && codeRaw.includes('/')) {
          const [d, n] = codeRaw.split('/');
          del = d || del;
          num = n || '';
        }
      } catch {
        /* fallback abajo */
      }
    }

    if (!num) {
      return res.status(400).json({
        success: false,
        error: 'Indica albaran=2924/10501771 o codExp=488361849',
      });
    }

    try {
      const infoData = encodeNacexData([`del=${del}`, `num=${num}`, 'tipo=E']);
      const response = await fetch(
        `${NACEX_WS_URL}?method=getInfoEnvio&user=${encodeURIComponent(NACEX_USER)}&pass=${encodeURIComponent(NACEX_PASS)}&data=${infoData}`,
      );
      const raw = await decodeNacexResponse(response);
      const info = parseGetInfoEnvio(raw);

      if (!info) {
        return res.status(404).json({ success: false, error: formatNacexError(raw), raw });
      }

      return res.status(200).json({
        success: true,
        mode: 'real',
        albaran: `${del}/${num}`,
        envConfig: {
          cliente: NACEX_CLIENT,
          nombreRecogida: NACEX_NOMBRE_RECOGIDA,
        },
        nacex: info,
        coincidencias: {
          abonadoIgualQueEnv: info.numCli === NACEX_CLIENT.replace(/\D/g, '').slice(0, 5),
          remitenteIgualQueEnv:
            (info.remitente || '').trim().toLowerCase() === NACEX_NOMBRE_RECOGIDA.trim().toLowerCase(),
          remitenteContieneSL: /(\bs\.?\s*l\.?\b|modas|melomerezco|26691014)/i.test(info.remitente || ''),
        },
        etiquetaUrl: info.tracking ? nacexLabelPath(info.tracking) : undefined,
      });
    } catch {
      return res.status(500).json({ success: false, error: 'Error consultando Nacex.' });
    }
  }

  // --- ETIQUETA PNG (abrir en pestaña / imprimir) ---
  if (method === 'get_etiqueta' || method === 'get_label') {
    const expeditionCode = String(codExp || tracking || '').trim();
    if (!expeditionCode) {
      return res.status(400).json({ error: 'Falta codExp (código de expedición Nacex).' });
    }

    // Usuario TEST de Nacex suele devolver tracking 9999999 sin etiqueta real.
    if (isNacexTestStubTracking(expeditionCode) || (!canUseRealAPI && requestWantsNacexTest)) {
      const svg = buildNacexTestLabelSvg(expeditionCode);
      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      res.setHeader('Content-Disposition', `inline; filename="nacex-test-${expeditionCode}.svg"`);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).send(svg);
    }

    if (!canUseRealAPI) {
      return res.redirect(302, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    }

    try {
      const { png, rawError } = await fetchNacexLabelPng(NACEX_USER, NACEX_PASS, expeditionCode);
      if (!png?.length) {
        // Si falló con usuario prod pero estamos en modo test, intenta stub amigable
        if (requestWantsNacexTest) {
          const svg = buildNacexTestLabelSvg(expeditionCode);
          res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          return res.status(200).send(svg);
        }
        return res.status(404).json({
          error: rawError || 'No se pudo obtener la etiqueta de Nacex.',
          codExp: expeditionCode,
          nacexUser: maskEmail(NACEX_USER),
        });
      }
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="nacex-${expeditionCode}.png"`);
      res.setHeader('Cache-Control', 'private, max-age=3600');
      return res.status(200).send(png);
    } catch {
      return res.status(500).json({ error: 'Error al descargar la etiqueta.' });
    }
  }

  // --- 4. SEGUIMIENTO ---
  if (method === 'get_tracking' || method === 'estado_envio') {
    if (!canUseRealAPI) return res.status(200).json({ success: true, mode: 'mock' });

    try {
      const response = await fetch(`${NACEX_WS_URL}?method=getAgencia&user=${encodeURIComponent(NACEX_USER)}&pass=${encodeURIComponent(NACEX_PASS)}&data=28001`);
      const data = await decodeNacexResponse(response);
      if (response.ok && !data.includes('ERROR')) {
        return res.status(200).json({ success: true, mode: 'real' });
      }
      return res.status(401).json({ success: false, error: 'Credenciales inválidas', detail: formatNacexError(data) });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Error de red' });
    }
  }

  // --- 1. TEST CONNECTION ---
  if (method === 'test_connection') {
    if (!canUseRealAPI) return res.status(200).json({ success: true, mode: 'mock' });

    try {
      const response = await fetch(`${NACEX_WS_URL}?method=getAgencia&user=${encodeURIComponent(NACEX_USER)}&pass=${encodeURIComponent(NACEX_PASS)}&data=28001`);
      const data = await decodeNacexResponse(response);
      if (response.ok && !data.includes('ERROR')) {
        return res.status(200).json({ success: true, mode: 'real' });
      }
      return res.status(401).json({ success: false, error: 'Credenciales inválidas', detail: formatNacexError(data) });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Error de red' });
    }
  }

  // --- 2. OBTENER PUNTOS NACEX.SHOP ---
  if (method === 'getPoints' || method === 'get_puntos_shop') {
    const targetCP = cp || NACEX_CP_RECOGIDA;

    if (!canUseRealAPI) {
      // Mock points if no API key
      const mockPoints = [
        { id: 'S292401', name: 'Nacex Shop - Papelería Gema', address: 'Av. Constitución, 12', city: 'Benalmádena', zip: '29631', distance: '0.5km' },
        { id: 'S292402', name: 'Nacex Shop - Estanco Nº3', address: 'Calle Las Flores, 5', city: 'Benalmádena', zip: '29630', distance: '1.2km' },
        { id: 'S292403', name: 'Nacex Shop - Supermercado Local', address: 'Plaza de la Mezquita, s/n', city: 'Benalmádena', zip: '29631', distance: '0.8km' },
      ];
      return res.status(200).json(mockPoints);
    }

    try {
      // Método exacto encontrado en el WSDL para buscar puntos por CP
      const response = await fetch(`${NACEX_WS_URL}?method=getPuntoEntregaCP&user=${encodeURIComponent(NACEX_USER)}&pass=${encodeURIComponent(NACEX_PASS)}&data=${targetCP}`);

      const rawData = await decodeNacexResponse(response);
      const points = parseNacexShopPoints(rawData);

      return res.status(200).json(points);
    } catch (err) {
      return res.status(500).json({ error: 'Error cargando puntos Nacex' });
    }
  }

  // --- 3. CREAR ENVÍO ---
  if (method === 'create_expedition' || method === 'crear_envio') {
    const body = req.body || {};
    const { orderId, province } = body;

    // Admin envía nombre/cp/...; aceptar también nombres en inglés
    const customerName = (body.customerName || body.nombre || 'Cliente').toString().trim();
    const address = (body.address || body.direccion || '').toString().trim();
    const city = (body.city || body.poblacion || '').toString().trim();
    const zip = String(body.zip ?? body.cp ?? '').trim();
    const phone = String(body.phone || body.telefono || '000000000').trim();

    // Nacex: num_cli = máximo 5 dígitos (conservar ceros a la izquierda si caben)
    const cleanCliente = NACEX_CLIENT.trim().replace(/\D/g, '').slice(0, 5);
    
    // MODO PRUEBA: flag VITE_ENABLE_TEST_CHECKOUT o señales en el pedido
    const paymentMethod = (body.payment_method || '').toString().toUpperCase();
    const isTestOrder =
      testCheckoutEnabled ||
      (orderId || '').toString().toUpperCase().includes('TEST') ||
      body.isTest === true ||
      body.isTest === 'true' ||
      paymentMethod.includes('TEST') ||
      paymentMethod.includes('PRUEBA') ||
      paymentMethod.includes('SIN PAGO');

    console.log(`>>> [DEBUG API] Pedido: ${orderId} | Pago: ${paymentMethod} | MODO TEST: ${isTestOrder} | user: ${maskEmail(NACEX_USER)}`);

    // Sin credenciales → mock. Con isTest + password → API real con NACEX_USER_TEST (sin recogida real).
    if (!canUseRealAPI) {
      console.log('>>> MODO SIMULACIÓN ACTIVADO (sin NACEX_PASSWORD)');
      return res.status(200).json({ 
        success: true, 
        tracking: 'TEST-NX' + Date.now(), 
        label_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
        mode: 'mock' 
      });
    }

    if (isTestOrder) {
      console.log('>>> MODO TEST NACEX: usando', maskEmail(NACEX_USER_TEST));
    }

    const orderIdStr = String(orderId || '').trim();
    if (orderIdStr) {
      const supabaseUrl = getEnv('VITE_SUPABASE_URL');
      const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
      if (supabaseUrl && serviceKey) {
        const supabase = createClient(supabaseUrl, serviceKey);
        const { data: orderRow, error: orderLookupError } = await supabase
          .from('orders')
          .select('order_status, payment_status')
          .eq('order_id', orderIdStr)
          .maybeSingle();

        if (orderLookupError || !orderRow) {
          return res.status(404).json({
            success: false,
            error: 'Pedido no encontrado.',
          });
        }

        if (!canFulfillOrder(orderRow)) {
          return res.status(403).json({
            success: false,
            error:
              'El pedido no está pagado. No se puede crear el envío hasta que Redsys confirme el pago.',
          });
        }
      }
    }

    if (!cleanCliente) {
      return res.status(400).json({
        success: false,
        error: 'NACEX_CLIENTE no configurado o inválido (máx. 5 dígitos). Revisa las variables de entorno.',
      });
    }

    if (!zip || zip.length > 15) {
      return res.status(400).json({
        success: false,
        error: 'Código postal de entrega inválido. El pedido debe tener shipping_zip / cp (1-15 caracteres).',
      });
    }

    if (!city) {
      return res.status(400).json({
        success: false,
        error: 'Ciudad de entrega obligatoria. El pedido debe tener población/ciudad en la dirección de envío.',
      });
    }

    if (!NACEX_CP_RECOGIDA || !NACEX_DIR_RECOGIDA || !NACEX_NOMBRE_RECOGIDA) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos de recogida de la tienda. Configura NACEX_DIR_RECOGIDA, NACEX_CP_RECOGIDA y NACEX_NOMBRE_RECOGIDA.',
      });
    }

    try {
      // Solo construimos los datos reales si NO es modo test
      const isNacexShop = Boolean(body.isNacexShop);
      const nacexData = [
        `del_cli=${NACEX_AGENCY}`,
        `num_cli=${cleanCliente}`,
        `tip_ser=${isNacexShop ? '31' : '08'}`,
        `tip_cob=O`,
        `ref_cli=${(orderId || 'ORD').split('-')[0]}`,
        `tip_env=${isNacexShop ? '1' : '2'}`,
        `bul=001`,
        `kil=00001.000`,
        // Recogida (remitente / tienda) — obligatorio
        `nom_rec=${nacexField(NACEX_NOMBRE_RECOGIDA)}`,
        `dir_rec=${nacexField(NACEX_DIR_RECOGIDA)}`,
        `pais_rec=ES`,
        `cp_rec=${nacexField(NACEX_CP_RECOGIDA)}`,
        `pob_rec=${nacexField(NACEX_POBLACION_RECOGIDA)}`,
        `tel_rec=${NACEX_TEL_RECOGIDA}`,
        // Entrega (destinatario / cliente)
        `nom_ent=${nacexField(customerName)}`,
        `dir_ent=${nacexField(address)}`,
        `pais_ent=ES`,
        `cp_ent=${nacexField(zip)}`,
        `pob_ent=${nacexField(city)}`,
        `tel_ent=${phone.replace(/\D/g, '').slice(0, 15) || '600000000'}`,
      ].join('|');

      const nacexDataEncoded = encodeNacexData(nacexData.split('|'));
      console.log('Nacex Data Payload:', nacexData);
      console.log('Nacex API version:', NACEX_API_VERSION);

      const response = await fetch(
        `${NACEX_WS_URL}?method=putExpedicion&user=${encodeURIComponent(NACEX_USER)}&pass=${encodeURIComponent(NACEX_PASS)}&data=${nacexDataEncoded}`,
      );
      const rawData = await decodeNacexResponse(response);
      const created = parsePutExpedicionResponse(rawData);

      if (created) {
        const isStub = isNacexTestStubTracking(created.tracking);
        const label_url =
          created.labelUrl && !created.labelUrl.startsWith('data:')
            ? created.labelUrl
            : nacexLabelPath(created.tracking);

        const orderIdToSave = String(body.orderId || orderId || '').trim();
        const orderSaved = orderIdToSave
          ? await saveOrderTracking(orderIdToSave, created.tracking)
          : false;

        return res.status(200).json({
          success: true,
          tracking: created.tracking,
          albaran: created.albaran,
          label_url,
          orderSaved,
          mode: isTestOrder ? 'test' : 'real',
          testStubLabel: isStub,
          message: isStub
            ? 'Expedición TEST OK. Nacex TEST usa tracking 9999999 y no emite etiqueta real (se muestra una de prueba).'
            : undefined,
          nacexUser: maskEmail(NACEX_USER),
          apiVersion: NACEX_API_VERSION,
        });
      }

      return res.status(400).json({
        success: false,
        error: formatNacexError(rawData),
        apiVersion: NACEX_API_VERSION,
        hasRecogidaFields: nacexData.includes('nom_rec='),
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Error interno' });
    }
  }

  return res.status(400).json({ error: 'Método no soportado' });
}
