import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/** Landing screen for a platform-invite-admin email link — mirrors
 * ProductHub's own /accept-invite exactly, just for platform_admins
 * instead of profiles (no activation RPC needed here since
 * platform_admins rows are already 'active' from creation — there's no
 * approval workflow for internal staff the way there is for tenants). */
export function AcceptInviteScreen() {
  const navigate = useNavigate();
  const [ready, setReady] = useState<'checking' | 'ready' | 'invalid'>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady('invalid');
      return;
    }
    supabase.auth.getSession().then(({ data }) => setReady(data.session ? 'ready' : 'invalid'));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setBusy(true);
    setError(null);
    try {
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) throw updErr;
      navigate('/overview', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not set your password.');
      setBusy(false);
    }
  }

  if (ready === 'checking') {
    return <Shell><p className="text-sm text-body">Checking your invite…</p></Shell>;
  }
  if (ready === 'invalid') {
    return (
      <Shell>
        <h1 className="text-xl font-semibold tracking-tight">Invite link invalid or expired</h1>
        <p className="text-sm text-body mt-1.5">Ask a Platform Owner to resend it from Internal Team.</p>
        <Button className="w-full h-11 mt-6 justify-center" onClick={() => navigate('/signin')}>Go to sign in</Button>
      </Shell>
    );
  }
  return (
    <Shell>
      <h1 className="text-xl font-semibold tracking-tight">Set your password</h1>
      <p className="text-sm text-body mt-1">Choose a password to finish joining the ops console.</p>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3.5">
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="h-11 px-3 rounded-control border-[0.5px] border-hairline text-sm outline-none focus:border-accent" />
        <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter your password" className="h-11 px-3 rounded-control border-[0.5px] border-hairline text-sm outline-none focus:border-accent" />
        {error && <div className="text-xs text-danger">{error}</div>}
        <Button type="submit" disabled={busy} className="w-full h-11 justify-center">{busy ? 'Saving…' : 'Set password & continue'}</Button>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-6" style={{ background: 'radial-gradient(1200px 600px at 20% 30%, #22304f 0%, #1B2A4A 40%, #12203a 100%)' }}>
      <div className="absolute top-6 left-6 flex items-center gap-2 text-white/90">
        <Logo size={20} />
        <span className="text-sm font-semibold tracking-tight">ProductHub Admin</span>
      </div>
      <div className="bg-surface rounded-frame shadow-pop p-8 w-[380px]">{children}</div>
    </div>
  );
}
