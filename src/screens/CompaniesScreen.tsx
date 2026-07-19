import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Icon } from '@/components/ui/Icon';
import { SelectionBar } from '@/components/ui/SelectionBar';
import { usePagination, PaginationBar } from '@/components/ui/Pagination';
import {
  useCompanies, useCompanyActions, useCompanyInvites, useCompanyInviteActions,
  PLAN_LABEL, type PlanTier,
} from '@/features/platform/companies';
import { timeAgo } from '@/features/platform/audit';

const STATUS_TONE = { active: 'success', suspended: 'danger' } as const;

export function CompaniesScreen() {
  const { companies, isLoading } = useCompanies();
  const actions = useCompanyActions();
  const { invites } = useCompanyInvites();
  const inviteActions = useCompanyInviteActions();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = companies.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
  const pag = usePagination(filtered);
  const selectedCompanies = companies.filter((c) => selected.has(c.id));

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function bulkStatus(status: 'active' | 'suspended') {
    setBusy(true);
    setError(null);
    try {
      await actions.bulkSetStatus(selectedCompanies, status);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  }

  async function bulkPlan(plan: PlanTier) {
    setBusy(true);
    setError(null);
    try {
      await actions.bulkSetPlan(selectedCompanies, plan);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  }

  async function onInviteSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await inviteActions.create(inviteName, inviteEmail);
      setShowInvite(false);
      setInviteName('');
      setInviteEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add company.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[12px] text-label">
        Customer companies on ProductHub. Click a company to view full details, controls, and its account activity log.
      </div>

      <div className="flex gap-2.5 items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search companies…"
          className="flex-1 h-[38px] px-3 rounded-control border-[0.5px] border-hairline bg-white text-[12.5px] outline-none focus:border-accent"
        />
        <Button onClick={() => setShowInvite((s) => !s)}>+ Add company</Button>
      </div>

      {error && <div className="text-[12px] text-danger">{error}</div>}

      {showInvite && (
        <Card className="p-4">
          <form onSubmit={onInviteSubmit} className="flex items-center gap-2">
            <input
              required
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Company name"
              className="flex-1 h-9 px-3 rounded-control border-[0.5px] border-hairline text-[12.5px] outline-none"
            />
            <input
              required
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Contact email"
              className="flex-1 h-9 px-3 rounded-control border-[0.5px] border-hairline text-[12.5px] outline-none"
            />
            <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
          </form>
        </Card>
      )}

      {selected.size > 0 && (
        <SelectionBar count={selected.size}>
          <Button variant="secondary" disabled={busy} onClick={() => bulkStatus('active')}>
            <Icon name="check" size={14} /> Activate
          </Button>
          <Button variant="outline-danger" disabled={busy} onClick={() => bulkStatus('suspended')}>
            <Icon name="ban" size={14} /> Suspend
          </Button>
          <span className="text-[11px] text-body ml-1">Set plan:</span>
          <Button variant="secondary" disabled={busy} onClick={() => bulkPlan('free')}>Starter</Button>
          <Button variant="secondary" disabled={busy} onClick={() => bulkPlan('pro')}>Business</Button>
          <Button variant="secondary" disabled={busy} onClick={() => bulkPlan('enterprise')}>Enterprise</Button>
        </SelectionBar>
      )}

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[28px_1.8fr_1fr_1fr_1.3fr_1.2fr] px-[18px] py-2.5 text-[10.5px] font-semibold text-label uppercase tracking-wide border-b-[0.5px] border-hairline">
          <span /><span>Company</span><span>Plan</span><span>Status</span><span>Seats</span><span>Primary contact</span>
        </div>
        {isLoading && <div className="p-4 text-[12.5px] text-body">Loading…</div>}
        {pag.pageItems.map((c) => (
          <div key={c.id} className="grid grid-cols-[28px_1.8fr_1fr_1fr_1.3fr_1.2fr] items-center px-[18px] py-3 text-[12.5px] border-b-[0.5px] border-hairline last:border-0">
            <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} className="w-3.5 h-3.5" />
            <span onClick={() => navigate(`/companies/${c.id}`)} className="font-semibold cursor-pointer text-accent">{c.name}</span>
            <span className="text-body">{PLAN_LABEL[c.plan]}</span>
            <Tag tone={STATUS_TONE[c.status]}>{c.status === 'active' ? 'Active' : 'Suspended'}</Tag>
            <span className="flex items-center gap-2 text-body">
              {c.seatCount}/{c.seatLimit}
              <span className="flex-1 max-w-[60px] h-[5px] rounded-full bg-canvas overflow-hidden">
                <span className="block h-full bg-accent-bright rounded-full" style={{ width: `${Math.min(100, (c.seatCount / c.seatLimit) * 100)}%` }} />
              </span>
            </span>
            <span className="text-body truncate">{c.contactName ?? '—'}</span>
          </div>
        ))}
        <div className="px-[18px] pb-3">
          <PaginationBar pag={pag} />
        </div>
      </Card>

      <Card className="p-[18px]">
        <div className="text-[13px] font-semibold mb-3">Pending company invites</div>
        <div className="flex flex-col gap-2.5">
          {invites.map((inv) => (
            <div key={inv.id} className="flex items-center gap-2 text-[12px]">
              <div className="flex-1 min-w-0">
                <div className="font-medium">{inv.companyName}</div>
                <div className="text-label text-[11px] font-mono">{inv.contactEmail} &middot; sent {timeAgo(inv.sentAt)}</div>
              </div>
              <Button variant="secondary" onClick={() => inviteActions.resend(inv)}>Resend</Button>
            </div>
          ))}
          {invites.length === 0 && <p className="text-[12px] text-label">No pending invites.</p>}
        </div>
      </Card>
    </div>
  );
}
