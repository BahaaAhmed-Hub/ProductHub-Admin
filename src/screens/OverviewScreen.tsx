import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCompanies, PLAN_LABEL } from '@/features/platform/companies';
import { useAuditLogEntries } from '@/features/platform/audit-log';
import { usePlatformStats } from '@/features/platform/billing';
import { useNavigate } from 'react-router-dom';

function StatCard({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <Card className="flex-1 p-[18px]">
      <div className="text-[11px] text-label mb-1.5">{label}</div>
      <div className={`text-2xl font-bold ${tone ?? ''}`}>{value}</div>
      {sub && <div className="text-[11px] text-label mt-2">{sub}</div>}
    </Card>
  );
}

export function OverviewScreen() {
  const { companies } = useCompanies();
  const { entries } = useAuditLogEntries(4);
  const { stats } = usePlatformStats();
  const navigate = useNavigate();

  const active = companies.filter((c) => c.status === 'active');
  const trials = companies.filter((c) => c.plan === 'free');
  const distribution = (['free', 'pro', 'enterprise'] as const).map((plan) => {
    const count = companies.filter((c) => c.plan === plan).length;
    return { tier: PLAN_LABEL[plan], count, pct: companies.length ? Math.round((count / companies.length) * 100) : 0 };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3.5">
        <StatCard label="Active companies" value={String(active.length)} sub={`${trials.length} on trial`} />
        <StatCard label="Total MRR" value={stats ? `$${stats.totalMrr.toLocaleString()}` : '—'} sub={`${active.length} active subscriptions`} tone="" />
        <StatCard label="Open incidents" value="0" sub="Last incident 12d ago" tone="text-success" />
        <StatCard label="Pending approvals" value="—" sub="Company invites & OAuth requests" tone="text-warning" />
      </div>

      <div className="flex gap-4">
        <Card className="flex-[1.4] p-5">
          <div className="text-[13px] font-semibold mb-3">Recent admin actions</div>
          <div className="flex flex-col gap-2.5">
            {entries.map((e) => (
              <div key={e.id} className="flex items-baseline gap-2.5 text-[12px] pb-2.5 border-b-[0.5px] border-hairline last:border-0">
                <span className="font-semibold w-24 flex-shrink-0">{e.actor}</span>
                <span className="flex-1 text-body">{e.action} &middot; {e.target}</span>
                <span className="text-faint text-[11px] flex-shrink-0">{e.time}</span>
              </div>
            ))}
            {entries.length === 0 && <p className="text-[12px] text-label">No admin actions yet.</p>}
          </div>
        </Card>
        <Card className="flex-1 p-5">
          <div className="text-[13px] font-semibold mb-3">Plan distribution</div>
          <div className="flex flex-col gap-3 mb-3.5">
            {distribution.map((d) => (
              <div key={d.tier} className="flex items-center gap-2.5">
                <span className="w-[74px] text-[12px] font-medium">{d.tier}</span>
                <div className="flex-1 h-1.5 rounded-full bg-canvas overflow-hidden">
                  <div className="h-full bg-accent-bright rounded-full" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="w-5 text-right text-[11.5px] text-label">{d.count}</span>
              </div>
            ))}
          </div>
          <Button className="w-full justify-center" onClick={() => navigate('/billing')}>View billing</Button>
        </Card>
      </div>
    </div>
  );
}
