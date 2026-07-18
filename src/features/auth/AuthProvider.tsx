import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export type PlatformRole = 'Platform Owner' | 'Billing Admin' | 'IT / Security Admin' | 'Support Ops';

export interface PlatformAdmin {
  id: string;
  name: string;
  email: string;
  role: PlatformRole;
  area: string;
  initials: string;
}

function initialsOf(name: string): string {
  return name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

/** A signed-in Supabase user isn't necessarily a platform admin — this
 * console's entire value is restricting cross-tenant access to exactly the
 * people in platform_admins, so every sign-in double-checks membership and
 * signs back out immediately if the row isn't there (or is suspended). */
async function resolveAdmin(session: Session | null): Promise<PlatformAdmin | null> {
  if (!session) return null;
  const { data, error } = await supabase
    .from('platform_admins')
    .select('id, name, email, role, status')
    .eq('auth_uid', session.user.id)
    .maybeSingle();
  if (error || !data || data.status !== 'active') return null;
  return { id: data.id, name: data.name, email: data.email, role: data.role, area: '', initials: initialsOf(data.name) };
}

interface AuthState {
  admin: PlatformAdmin | null;
  loading: boolean;
  deniedReason: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<PlatformAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [deniedReason, setDeniedReason] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      setAdmin(await resolveAdmin(data.session));
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setAdmin(await resolveAdmin(session));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      admin,
      loading,
      deniedReason,
      async signIn(email, password) {
        setDeniedReason(null);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const resolved = await resolveAdmin(data.session);
        if (!resolved) {
          await supabase.auth.signOut();
          setDeniedReason('This account is not a ProductHub platform admin.');
          throw new Error('This account is not a ProductHub platform admin.');
        }
        setAdmin(resolved);
      },
      async signOut() {
        await supabase.auth.signOut();
        setAdmin(null);
      },
    }),
    [admin, loading, deniedReason],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
