import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Icon } from '@/components/ui/Icon';
import { usePagination, PaginationBar } from '@/components/ui/Pagination';
import { usePlatformStats } from '@/features/platform/billing';
import { PLAN_LABEL } from '@/features/platform/companies';

function StatCard({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card className="flex-1 p-[18px]">
      <div className="text-[11px] text-label mb-1.5">{label}</div>
      <div className={`text-[22px] font-bold ${tone ?? ''}`}>{value}</div>
    </Card>
  );
}

export function BillingScreen() {
  const { stats, isLoading, error } = usePlatformStats();
  const companies = stats?.companies ?? [];
  const invoices = stats?.invoices ?? [];
  const companiesPag = usePagination(companies);
  const invoicesPag = usePagination(invoices);

  if (error) {
    return <div className="text-[13px] text-danger">Could not load billing data: {error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3.5">
        <StatCard label="Total MRR" value={stats ? `$${stats.totalMrr.toLocaleString()}` : '—'} />
        <StatCard label="Active subscriptions" value={stats ? String(stats.activeCount) : '—'} />
        <StatCard label="Trials" value={stats ? String(stats.trialCount) : '—'} tone="text-warning" />
        <StatCard label="Past due" value={stats ? String(stats.pastDueCount) : '—'} tone="text-danger" />
      </div>

      <Card className="overflow-hidden">
        <div className="flex justify-between items-baseline px-[18px] pt-3.5">
          <div className="text-[13px] font-semibold">Company subscriptions</div>
        </div>
        <div className="grid grid-cols-[1.8fr_1fr_1fr_1fr_1.3fr] px-[18px] py-2.5 text-[10.5px] font-semibold text-label uppercase tracking-wide border-b-[0.5px] border-hairline">
          <span>Company</span><span>Plan</span><span>MRR</span><span>Status</span><span>Renews</span>
        </div>
        {isLoading && <div className="p-4 text-[12.5px] text-body">Loading…</div>}
        {companiesPag.pageItems.map((c) => (
          <div key={c.orgId} className="grid grid-cols-[1.8fr_1fr_1fr_1fr_1.3fr] items-center px-[18px] py-2.5 text-[12.5px] border-b-[0.5px] border-hairline last:border-0">
            <span className="font-semibold">{c.orgName}</span>
            <span className="text-body">{PLAN_LABEL[c.plan as 'free' | 'pro' | 'enterprise'] ?? c.plan}</span>
            <span className="font-medium">${c.mrr.toLocaleString()}</span>
            <span>
              {c.status ? (
                <Tag tone={c.status === 'past_due' ? 'danger' : c.status === 'trialing' ? 'warning' : 'success'}>{c.status}</Tag>
              ) : <span className="text-label text-[11px]">no subscription</span>}
            </span>
            <span className="text-body text-[11.5px]">{c.renewsOn ? new Date(c.renewsOn).toLocaleDateString() : '—'}</span>
          </div>
        ))}
        <div className="px-[18px] pb-3">
          <PaginationBar pag={companiesPag} />
        </div>
      </Card>

      <Card className="overflow-hidden p-[18px]">
        <div className="text-[13px] font-semibold mb-3">Invoices</div>
        <div className="grid grid-cols-[1fr_1.3fr_1fr_1fr_1fr_60px] pb-2 text-[10.5px] font-semibold text-label uppercase tracking-wide border-b-[0.5px] border-hairline">
          <span>Invoice</span><span>Company</span><span>Date</span><span>Amount</span><span>Status</span><span />
        </div>
        {invoicesPag.pageItems.map((inv) => (
          <div key={inv.id} className="grid grid-cols-[1fr_1.3fr_1fr_1fr_1fr_60px] items-center py-2.5 text-[12.5px] border-b-[0.5px] border-hairline last:border-0">
            <span className="font-mono text-[11.5px]">{inv.id}</span>
            <span className="text-body">{inv.orgName}</span>
            <span className="text-body">{new Date(inv.date).toLocaleDateString()}</span>
            <span className="font-medium">${(inv.amount / 100).toLocaleString()}</span>
            <Tag tone={inv.status === 'paid' ? 'success' : 'danger'}>{inv.status}</Tag>
            {inv.pdfUrl
              ? <a href={inv.pdfUrl} target="_blank" rel="noreferrer"><Icon name="download" size={16} className="text-label" /></a>
              : <span />}
          </div>
        ))}
        {invoices.length === 0 && !isLoading && <p className="text-[12px] text-label py-2">No invoices yet.</p>}
        {invoices.length > 0 && <PaginationBar pag={invoicesPag} />}
      </Card>
    </div>
  );
}
