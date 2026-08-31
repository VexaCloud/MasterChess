// Calls a Supabase Edge Function with the caller's access token attached.
// Every edge function in supabase/functions/ requires this header and
// verifies it server-side (see supabase/functions/_shared/auth.ts) —
// there is no way to call them anonymously.
import { CONFIG } from './config.js';
import { getAccessToken } from './supabase-client.js';

export async function callFunction(name, body = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not signed in');
  const res = await fetch(`${CONFIG.supabaseUrl}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: CONFIG.supabaseAnonKey,
    },
    body: JSON.stringify(body),
  });
  let data;
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) throw new Error(data.error || `${name} failed (${res.status})`);
  return data;
}
