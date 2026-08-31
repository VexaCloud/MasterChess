// Central Supabase client + the auth gate every protected page uses.
// Import { requireSession } from this module at the top of any page
// that should not render without a logged-in user.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CONFIG } from './config.js';

export const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

/**
 * Resolves once we know whether there's a logged-in user.
 * If not, redirects to login.html (preserving where the user was headed)
 * and never resolves (the redirect takes over).
 */
export function requireSession() {
  return new Promise((resolve) => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        resolve(data.session);
      } else {
        const next = encodeURIComponent(location.pathname + location.search);
        location.replace(`login.html?next=${next}`);
      }
    });
  });
}

export async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

export async function signOut() {
  await supabase.auth.signOut();
  location.replace('login.html');
}

export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export function initials(name) {
  if (!name) return '?';
  return name.trim().slice(0, 2).toUpperCase();
}
