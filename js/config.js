// MasterChess config — set your Supabase project credentials here.
// Find these in your Supabase dashboard: Project Settings -> API.
// The anon/publishable key is meant to be public client-side (it's
// constrained entirely by the Row Level Security policies in
// supabase/migrations/), but it must match YOUR project below or
// nothing in this app will be able to reach your database.
export const CONFIG = {
  supabaseUrl: 'https://ikbblffrtgemyktrkgae.supabase.co', // e.g. https://xxxxxxxx.supabase.co
  supabaseAnonKey: 'sb_publishable_mOT9PUzKPUYHGY2oKdAS9g_-ZS1yiCh',
  timeControls: {
    bullet: [
      { label: '1+0', base: 60, increment: 0 },
      { label: '1+1', base: 60, increment: 1 },
      { label: '2+1', base: 120, increment: 1 },
    ],
    blitz: [
      { label: '3+0', base: 180, increment: 0 },
      { label: '3+2', base: 180, increment: 2 },
      { label: '5+0', base: 300, increment: 0 },
      { label: '5+5', base: 300, increment: 5 },
    ],
    rapid: [
      { label: '10+0', base: 600, increment: 0 },
      { label: '15+10', base: 900, increment: 10 },
      { label: '30+0', base: 1800, increment: 0 },
    ],
  },
};

/** True when the placeholders above have not been replaced. */
export function isConfigMissing() {
  return (
    !CONFIG.supabaseUrl ||
    CONFIG.supabaseUrl.includes('REPLACE_WITH') ||
    !CONFIG.supabaseAnonKey ||
    CONFIG.supabaseAnonKey.includes('REPLACE_WITH')
  );
}
