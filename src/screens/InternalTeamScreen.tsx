import { useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { usePagination, PaginationBar } from '@/components/ui/Pagination';
import { useInternalTeam, useInternalTeamActions, INTERNAL_ROLES } from '@/features/platform/internalTeam';
import type { PlatformRole } from '@/features/auth/AuthProvider';

export function InternalTeamScreen() {
  const { admins, isLoading } = useInternalTeam();
  const actions = useInternalTeamActions();
  const pag = usePagination(admins);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showInvite, setShowInvite] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<PlatformRole>('Support Ops');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAdmins = admins.filter((a) => selected.has(a.id));

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  }

  async function onInvite(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await actions.invite(name, email, role);
      setShowInvite(false);
      setName('');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not invite admin.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[12px] text-label">Your own staff with access to this ops console — not customer users.</div>

      <div className="flex justify-end">
        <Button onClick={() => setShowInvite((s) => !s)}>+ Invite internal admin</Button>
      </div>

      {error && <div className="text-[12px] text-danger">{error}</div>}

      {showInvite && (
        <Card className="p-4">
          <form onSubmit={onInvite} className="flex items-center gap-2">
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="flex-1 h-9 px-3 rounded-control border-[0.5px] border-hairline text-[12.5px] outline-none" />
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="flex-1 h-9 px-3 rounded-control border-[0.5px] border-hairline text-[12.5px] outline-none" />
            <select value={role} onChange={(e) => setRole(e.target.value as PlatformRole)} className="h-9 px-2 rounded-control border-[0.5px] border-hairline text-[12px]">
              {INTERNAL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <Button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send invite'}</Button>
          </form>
        </Card>
      )}

      {selected.size > 0 && (
        <div className="flex items-center gap-2 flex-wrap bg-accent-bg rounded-control px-3 py-2">
          <span className="text-[12px] font-semibold text-navy">{selected.size} selected</span>
          <Button variant="success" disabled={busy} onClick={() => run(() => actions.bulkSetStatus(selectedAdmins, 'active'))}>Activate</Button>
          <Button variant="danger" disabled={busy} onClick={() => run(() => actions.bulkSetStatus(selectedAdmins, 'suspended'))}>Suspend</Button>
          <Button variant="secondary" disabled={busy} onClick={() => run(() => actions.bulkRemove(selectedAdmins))}>Delete</Button>
        </div>
      )}

      <Card className="p-[18px]">
        <div className="grid grid-cols-[24px_1.3fr_1.2fr_1.4fr_1fr_90px] text-[10.5px] font-semibold text-label uppercase tracking-wide pb-2 border-b-[0.5px] border-hairline">
          <span /><span>Name</span><span>Role</span><span>Area</span><span>Status</span><span />
        </div>
        {isLoading && <div className="py-3 text-[12.5px] text-body">Loading…</div>}
        {pag.pageItems.map((a) => (
          <div key={a.id} className="grid grid-cols-[24px_1.3fr_1.2fr_1.4fr_1fr_90px] items-center py-2.5 text-[12.5px] border-b-[0.5px] border-hairline last:border-0">
            <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)} className="w-3.5 h-3.5" />
            <span className="font-medium">{a.name}</span>
            <span className="text-body">{a.role}</span>
            <span className="text-body">{a.area || '—'}</span>
            <Tag tone={a.status === 'active' ? 'success' : 'danger'}>{a.status === 'active' ? 'Active' : 'Suspended'}</Tag>
            <select
              value={a.role}
              onChange={(e) => run(() => actions.setRole(a, e.target.value as PlatformRole))}
              className="text-[11.5px] font-semibold text-accent bg-transparent outline-none"
            >
              {INTERNAL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        ))}
        <PaginationBar pag={pag} />
      </Card>
    </div>
  );
}
