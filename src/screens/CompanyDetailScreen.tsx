import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Icon } from '@/components/ui/Icon';
import { SelectionBar } from '@/components/ui/SelectionBar';
import { Avatar } from '@/components/ui/Avatar';
import { usePagination, PaginationBar } from '@/components/ui/Pagination';
import { useCompanies, useCompanyActions, PLAN_LABEL, type PlanTier } from '@/features/platform/companies';
import { useWorkspaceUsers, useWorkspaceUserActions, type Role } from '@/features/platform/companyDetail';
import { useAuditLogEntries } from '@/features/platform/audit-log';

const PLANS: PlanTier[] = ['free', 'pro', 'enterprise'];
const ROLES: { value: Role; label: string }[] = [
  { value: 'manager', label: 'Owner' },
  { value: 'pm', label: 'Manager' },
  { value: 'developer', label: 'Member' },
];

export function CompanyDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { companies } = useCompanies();
  const company = companies.find((c) => c.id === id);
  const companyActions = useCompanyActions();
  const { staff, customers, isLoading: usersLoading } = useWorkspaceUsers(company?.workspaceId ?? null);
  const userActions = useWorkspaceUserActions(company?.workspaceId ?? null);
  const { entries } = useAuditLogEntries(50);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const staffPag = usePagination(staff);
  const customersPag = usePagination(customers);
  const activityPag = usePagination(company ? entries.filter((e) => e.target === company.name) : []);

  if (!company) {
    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => navigate('/companies')} className="text-accent text-[12px] font-semibold flex items-center gap-1">
          <Icon name="arrow_back" size={16} /> Back to Companies
        </button>
        <p className="text-[13px] text-body">Company not found.</p>
      </div>
    );
  }

  const selectedUsers = staff.filter((u) => selected.has(u.id));
  const statusTone = company.status === 'active' ? 'success' : 'danger';

  function toggle(uid: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(uid)) next.delete(uid); else next.add(uid);
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

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => navigate('/companies')} className="text-accent text-[12px] font-semibold flex items-center gap-1 w-fit">
        <Icon name="arrow_back" size={16} /> Back to Companies
      </button>

      <div className="flex items-center gap-2.5">
        <div className="text-xl font-bold">{company.name}</div>
        <Tag tone={statusTone}>{company.status === 'active' ? 'Active' : 'Suspended'}</Tag>
      </div>

      {error && <div className="text-[12px] text-danger">{error}</div>}

      <Card className="grid grid-cols-3 gap-[18px] p-[18px]">
        <div><div className="text-[10.5px] text-label mb-1">Plan</div><div className="text-[13px] font-semibold">{PLAN_LABEL[company.plan]}</div></div>
        <div><div className="text-[10.5px] text-label mb-1">Seats</div><div className="text-[13px] font-semibold">{company.seatCount}/{company.seatLimit}</div></div>
        <div><div className="text-[10.5px] text-label mb-1">Created</div><div className="text-[13px] font-semibold">{new Date(company.createdAt).toLocaleDateString()}</div></div>
        <div><div className="text-[10.5px] text-label mb-1">Primary contact</div><div className="text-[13px] font-semibold">{company.contactName ?? '—'}</div></div>
        <div className="col-span-2"><div className="text-[10.5px] text-label mb-1">Contact email</div><div className="text-[13px] font-semibold font-mono">{company.contactEmail ?? '—'}</div></div>
      </Card>

      <Card className="p-[18px]">
        <div className="text-[13px] font-semibold mb-3.5">Account controls</div>
        <div className="grid grid-cols-3 gap-5">
          <div>
            <div className="text-[10.5px] text-label mb-2">Account status</div>
            {company.status === 'suspended' ? (
              <Button variant="success" disabled={busy} onClick={() => run(() => companyActions.setStatus(company, 'active'))}>Reactivate account</Button>
            ) : (
              <Button variant="danger" disabled={busy} onClick={() => run(() => companyActions.setStatus(company, 'suspended'))}>Suspend account</Button>
            )}
          </div>
          <div>
            <div className="text-[10.5px] text-label mb-2">Plan</div>
            <div className="flex gap-1.5">
              {PLANS.map((p) => (
                p === company.plan
                  ? <span key={p} className="h-[30px] inline-flex items-center px-2.5 rounded-control bg-navy text-white text-[12px] font-semibold">{PLAN_LABEL[p]}</span>
                  : <button key={p} disabled={busy} onClick={() => run(() => companyActions.setPlan(company, p))} className="h-[30px] px-2.5 rounded-control border-[0.5px] border-hairline bg-white text-[12px] font-semibold text-body">{PLAN_LABEL[p]}</button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-[18px]">
        <div className="text-[13px] font-semibold mb-3">Users</div>
        {selected.size > 0 && (
          <div className="mb-3">
            <SelectionBar count={selected.size}>
              <Button variant="secondary" disabled={busy} onClick={() => run(() => userActions.bulkSetStatus(selectedUsers, 'active'))}>
                <Icon name="check" size={14} /> Activate
              </Button>
              <Button variant="outline-danger" disabled={busy} onClick={() => run(() => userActions.bulkSetStatus(selectedUsers, 'pending'))}>
                <Icon name="ban" size={14} /> Suspend
              </Button>
              <span className="text-[11px] text-body">Set role:</span>
              {ROLES.map((r) => (
                <Button key={r.value} variant="secondary" disabled={busy} onClick={() => run(() => userActions.bulkSetRole(selectedUsers, r.value))}>{r.label}</Button>
              ))}
              <Button variant="secondary" disabled={busy} onClick={() => run(() => userActions.bulkResetPasswords(selectedUsers))}>Reset passwords</Button>
            </SelectionBar>
          </div>
        )}
        <div className="grid grid-cols-[24px_1.8fr_1fr_1fr_1fr_60px] text-[10px] font-semibold text-label uppercase tracking-wide pb-2 border-b-[0.5px] border-hairline">
          <span /><span>User</span><span>Role</span><span>Status</span><span>Last active</span><span />
        </div>
        {usersLoading && <div className="py-3 text-[12px] text-body">Loading…</div>}
        {staffPag.pageItems.map((u) => (
          <div key={u.id} className="grid grid-cols-[24px_1.8fr_1fr_1fr_1fr_60px] items-center py-2.5 text-[12px] border-b-[0.5px] border-hairline last:border-0">
            <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggle(u.id)} className="w-3.5 h-3.5" />
            <div className="flex items-center gap-2 min-w-0">
              <Avatar initials={u.initials} size={22} />
              <div className="min-w-0">
                <div className="font-medium truncate">{u.name}</div>
                <div className="text-[10.5px] text-label font-mono truncate">{u.email}</div>
              </div>
            </div>
            <span className="text-body capitalize">{u.role}</span>
            <Tag tone={u.status === 'active' ? 'success' : 'warning'}>{u.status === 'active' ? 'Active' : 'Pending'}</Tag>
            <span className="text-faint text-[11px]">—</span>
            <span className="flex gap-1.5">
              <button title="Reset password" onClick={() => run(() => userActions.resetPassword(u))} disabled={busy}>
                <Icon name="key" size={15} className="text-label" />
              </button>
            </span>
          </div>
        ))}
        <PaginationBar pag={staffPag} />
      </Card>

      <Card className="p-[18px]">
        <div className="text-[13px] font-semibold mb-0.5">End customers</div>
        <div className="text-[11px] text-label mb-3">{company.name}'s own customers</div>
        <div className="grid grid-cols-[1.8fr_1fr_1fr] text-[10px] font-semibold text-label uppercase tracking-wide pb-2 border-b-[0.5px] border-hairline">
          <span>Customer</span><span>Status</span><span>Last active</span>
        </div>
        {customersPag.pageItems.map((c) => (
          <div key={c.id} className="grid grid-cols-[1.8fr_1fr_1fr] items-center py-2.5 text-[12px] border-b-[0.5px] border-hairline last:border-0">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-[10.5px] text-label font-mono">{c.email}</div>
            </div>
            <Tag tone={c.status === 'active' ? 'success' : 'neutral'}>{c.status === 'active' ? 'Active' : c.status}</Tag>
            <span className="text-faint text-[11px]">—</span>
          </div>
        ))}
        {customers.length === 0 && <p className="text-[12px] text-label py-2">No end customers yet.</p>}
        {customers.length > 0 && <PaginationBar pag={customersPag} />}
      </Card>

      <Card className="p-[18px]">
        <div className="text-[13px] font-semibold mb-3">Account activity</div>
        <div className="flex flex-col gap-0.5">
          {activityPag.pageItems.map((log) => (
            <div key={log.id} className="flex items-baseline gap-3 text-[12px] py-2.5 border-b-[0.5px] border-hairline last:border-0">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-bright flex-shrink-0 self-center" />
              <span className="font-semibold w-24 flex-shrink-0">{log.actor}</span>
              <span className="flex-1 text-body">{log.action}</span>
              <span className="text-faint flex-shrink-0">{log.time}</span>
            </div>
          ))}
          {activityPag.total === 0 && <p className="text-[12px] text-label py-2">No activity recorded for this company yet.</p>}
        </div>
        {activityPag.total > 0 && <PaginationBar pag={activityPag} />}
      </Card>
    </div>
  );
}
