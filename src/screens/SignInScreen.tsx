import { useState, type FormEvent } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthProvider';
import { isSupabaseConfigured } from '@/lib/supabase';

export function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="min-h-screen w-screen flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(1200px 600px at 20% 30%, #22304f 0%, #1B2A4A 40%, #12203a 100%)' }}
    >
      <div className="absolute top-6 left-6 flex items-center gap-2 text-white/90">
        <Logo size={20} />
        <span className="text-sm font-semibold tracking-tight">ProductHub Admin</span>
      </div>

      <div className="bg-surface rounded-frame shadow-pop p-8 w-[380px]">
        <h1 className="text-xl font-semibold tracking-tight">Platform sign-in</h1>
        <p className="text-sm text-body mt-1">Internal ops console — ProductHub staff only.</p>

        {!isSupabaseConfigured && (
          <div className="mt-4 text-[12px] text-warning-text bg-warning-bg px-3 py-2 rounded-control">
            VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — this console has nothing to connect to.
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-eyebrow font-semibold uppercase text-label">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@productHub.com"
              className="h-11 px-3 rounded-control border-[0.5px] border-hairline bg-surface text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-eyebrow font-semibold uppercase text-label">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 px-3 rounded-control border-[0.5px] border-hairline bg-surface text-sm outline-none focus:border-accent"
            />
          </label>
          {error && <div className="text-xs text-danger">{error}</div>}
          <Button type="submit" disabled={busy} className="w-full h-11 justify-center">
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
