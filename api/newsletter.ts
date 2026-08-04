import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getEnv } from './_env.js';

/**
 * Newsletter consolidado (Hobby: máx. 12 funciones).
 * POST ?op=subscribe | confirm | unsubscribe
 */

function cors(req: VercelRequest, res: VercelResponse) {
  const allowedOrigins = [
    'https://asfaltoygas.es',
    'https://www.asfaltoygas.es',
    'https://asfaltoygas.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

function getOp(req: VercelRequest): string {
  return String(req.query.op || req.body?.op || '').trim().toLowerCase();
}

function getSupabase() {
  const supabaseUrl = getEnv('VITE_SUPABASE_URL') || '';
  const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function handleSubscribe(req: VercelRequest, res: VercelResponse) {
  const { email, status = 'pending', confirmation_token } = req.body || {};
  if (!email) {
    return res.status(400).json({ message: 'Missing email' });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(
        [
          {
            email,
            status,
            confirmation_token,
            subscribed_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'email' }
      )
      .select()
      .maybeSingle();

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('[newsletter/subscribe]', error);
    return res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

async function handleConfirm(req: VercelRequest, res: VercelResponse) {
  const { token } = req.body || {};
  if (!token) {
    return res.status(400).json({ message: 'Missing token' });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const { data, error: fetchError } = await supabase
      .from('subscriptions')
      .select('email')
      .eq('confirmation_token', token)
      .maybeSingle();

    if (fetchError || !data) {
      return res.status(404).json({ message: 'Token de confirmación no válido o expirado.' });
    }

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        confirmation_token: null,
        subscribed_at: new Date().toISOString(),
      })
      .eq('email', data.email);

    if (updateError) throw updateError;
    return res.status(200).json({ success: true, message: 'Suscripción confirmada con éxito.' });
  } catch (error) {
    console.error('[newsletter/confirm]', error);
    return res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

async function handleUnsubscribe(req: VercelRequest, res: VercelResponse) {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ message: 'Missing email' });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'unsubscribed' })
      .eq('email', email)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'No se encontró ninguna suscripción con este email.' });
    }
    return res.status(200).json({ success: true, message: 'Baja tramitada con éxito.' });
  } catch (error) {
    console.error('[newsletter/unsubscribe]', error);
    return res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const op = getOp(req);
  if (op === 'subscribe') return handleSubscribe(req, res);
  if (op === 'confirm') return handleConfirm(req, res);
  if (op === 'unsubscribe') return handleUnsubscribe(req, res);

  return res.status(400).json({
    message: 'Missing or unknown op. Use subscribe | confirm | unsubscribe',
  });
}
