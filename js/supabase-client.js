// Central Supabase client + the auth gate every protected page uses.
// Import { requireSession } from this module at the top of any page
// that should not render without a logged-in user.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CONFIG, isConfigMissing } from './config.js';

function showConfigError() {
  document.body.innerHTML = `
    <div style="
      min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:#1a1a1a;color:#efefef;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;
      padding:2rem;text-align:center;
    ">
      <div style="max-width:480px;">
        <div style="
          width:48px;height:48px;border-radius:12px;background:#81b64c;color:#fff;
          display:inline-flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;
          margin-bottom:1.25rem;
        ">♟</div>
        <h1 style="font-size:1.5rem;margin:0 0 0.5rem;letter-spacing:-0.02em;">Setup required</h1>
        <p style="color:#8a8a8a;margin:0 0 1.25rem;line-height:1.55;">
          Open <code style="background:#2c2c2c;padding:0.15rem 0.4rem;border-radius:4px;font-size:0.85rem;">js/config.js</code>
          and replace the placeholder values with your Supabase project URL and anon key
          (Project Settings → API in the Supabase dashboard).
        </p>
        <p style="color:#6b6b6b;font-size:0.85rem;margin:0;">
          Until then, auth and online features cannot load.
        </p>
      </div>
    </div>`;
}

if (isConfigMissing()) {
  // Delay slightly so the page has a chance to paint, then replace content.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showConfigError);
  } else {
    showConfigError();
  }
}

export const supabase = isConfigMissing()
  ? null
  : createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });

/**
 * Resolves once we know whether there's a logged-in user.
 * If not, redirects to login.html (preserving where the user was headed)
 * and never resolves (the redirect takes over).
 */
export function requireSession() {
  return new Promise((resolve) => {
    if (isConfigMissing() || !supabase) {
      showConfigError();
      return; // never resolves — config page is shown
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        resolve(data.session);
      } else {
        const next = encodeURIComponent(location.pathname + location.search);
        location.replace(`login.html?next=${next}`);
      }
    }).catch(() => {
      showConfigError();
    });
  });
}

export async function getAccessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
  location.replace('login.html');
}

export async function getProfile(userId) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export function initials(name) {
  if (!name) return '?';
  return name.trim().slice(0, 2).toUpperCase();
}
