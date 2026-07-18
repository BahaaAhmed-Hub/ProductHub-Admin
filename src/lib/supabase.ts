import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.warn('[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — this console has nothing to connect to.');
}

// Same Supabase project as the main ProductHub app — this console reads
// cross-tenant data through the platform_admins-gated RLS policies added
// in ProductHub's 0025_platform_admin.sql migration, not a separate schema.
export const supabase = createClient(url ?? 'http://localhost', anon ?? 'anon', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export const isSupabaseConfigured = Boolean(url && anon);
