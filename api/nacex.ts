
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { canFulfillOrder } from '../src/lib/orderPayment.js';
import { BRAND } from '../src/lib/brand.js';

/** Versión del handler (comprobar en Network → respuesta JSON tras redeploy). */
const NACEX_API_VERSION = '2026-05-recogida-v4';
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

/** Codifica cada valor como la librería PHP oficial (clave=urlencode(valor)). */
function encodeNacexData(pairs: string[]): string {
  return pairs
    .map((pair) => {
      const eq = pair.indexOf('=');
      if (eq === -1) return pair;
      const key = pair.slice(0, eq);
      const value = pair.slice(eq + 1);
      return `${key}=${encodeURIComponent(value)}`;
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
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

/** Descarga etiqueta PNG desde Nacex (respuesta en base64). */
async function fetchNacexLabelPng(user: string, pass: string, codExp: string): Promise<Buffer | null> {
  const labelData = encodeNacexData([`codExp=${codExp}`, 'modelo=IMAGEN']);
  const labelRes = await fetch(
    `${NACEX_WS_URL}?method=getEtiqueta&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}&data=${labelData}`,
  );
  const labelRaw = (await decodeNacexResponse(labelRes)).trim().replace(/\s+/g, '');
  if (!labelRaw || labelRaw.toUpperCase().startsWith('ERROR')) return null;
  try {
    return Buffer.from(labelRaw, 'base64');
  } catch {
    return null;
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
  const NACEX_USER = process.env.NACEX_USER || 'ASFALTOYGASATCLIENTE@GMAIL.COM';
  const NACEX_PASS = process.env.NACEX_PASSWORD || '';
  const NACEX_AGENCY = process.env.NACEX_AGENCIA || '2924';
  const NACEX_CLIENT = process.env.NACEX_CLIENTE || '00485';
  const NACEX_CP_RECOGIDA = process.env.NACEX_CP_RECOGIDA || BRAND.address.postalCode;
  const NACEX_NOMBRE_RECOGIDA = process.env.NACEX_NOMBRE_RECOGIDA || BRAND.name;
  const NACEX_DIR_RECOGIDA = (process.env.NACEX_DIR_RECOGIDA || BRAND.address.street).slice(0, 45);
  const NACEX_POBLACION_RECOGIDA = process.env.NACEX_POBLACION_RECOGIDA || BRAND.address.city;
  const NACEX_TEL_RECOGIDA = (process.env.NACEX_TEL_RECOGIDA || BRAND.phone.replace(/\D/g, '').slice(-9))
    .replace(/\D/g, '')
    .slice(0, 15);

  const canUseRealAPI = NACEX_PASS && NACEX_PASS !== 'tu_password' && NACEX_PASS !== 'PON_AQUI_TU_CLAVE_MD5';

  // --- DIAGNÓSTICO (sin secretos) ---
  if (method === 'debug_config' || method === 'diagnostico') {
    return res.status(200).json({
      success: true,
      mode: canUseRealAPI ? 'real' : 'mock',
      apiVersion: NACEX_API_VERSION,
      config: {
        user: maskEmail(NACEX_USER),
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

    if (!canUseRealAPI) {
      return res.redirect(302, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    }

    try {
      const png = await fetchNacexLabelPng(NACEX_USER, NACEX_PASS, expeditionCode);
      if (!png?.length) {
        return res.status(404).json({ error: 'No se pudo obtener la etiqueta de Nacex.' });
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
    
    // MODO PRUEBA: Detección ultra-robusta
    const paymentMethod = (body.payment_method || '').toString().toUpperCase();
    const isTestOrder = 
      (orderId || '').toString().toUpperCase().includes('TEST') || 
      body.isTest === true || 
      body.isTest === 'true' ||
      paymentMethod.includes('TEST') ||
      paymentMethod.includes('PRUEBA') ||
      paymentMethod.includes('SIN PAGO');

    console.log(`>>> [DEBUG API] Pedido: ${orderId} | Pago: ${paymentMethod} | MODO TEST: ${isTestOrder}`);

    if (!canUseRealAPI || isTestOrder) {
      console.log('>>> MODO SIMULACIÓN ACTIVADO');
      return res.status(200).json({ 
        success: true, 
        tracking: 'TEST-NX' + Date.now(), 
        label_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
        mode: 'mock' 
      });
    }

    const orderIdStr = String(orderId || '').trim();
    if (orderIdStr) {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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
          mode: 'real',
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
