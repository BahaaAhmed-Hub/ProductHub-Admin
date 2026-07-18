import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { usePlatformIntegrations, usePlatformWebhooks, useOAuthRequests } from '@/features/platform/ops';
import { timeAgo } from '@/features/platform/audit';

const STATUS_TONE = { connected: 'success', needs_reauth: 'warning', disconnected: 'neutral' } as const;
const STATUS_LABEL = { connected: 'Connected', needs_reauth: 'Needs reauth', disconnected: 'Disconnected' } as const;

export function IntegrationsScreen() {
  const { integrations } = usePlatformIntegrations();
  const { webhooks } = usePlatformWebhooks();
  const { requests, decide } = useOAuthRequests();

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[12px] text-label">Tools your internal team uses to run ProductHub operations.</div>

      <div className="grid grid-cols-2 gap-3.5">
        {integrations.map((it) => (
          <Card key={it.id} className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-control bg-canvas flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-label">
              {it.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold">{it.name}</div>
              <div className="text-[11.5px] text-label">{it.description}</div>
            </div>
            <Tag tone={STATUS_TONE[it.status]}>{STATUS_LABEL[it.status]}</Tag>
          </Card>
        ))}
      </div>

      <Card className="p-[18px]">
        <div className="text-[13px] font-semibold mb-3">Webhooks</div>
        <div className="grid grid-cols-[1.6fr_1.6fr_1fr_1fr] pb-2 text-[10.5px] font-semibold text-label uppercase tracking-wide border-b-[0.5px] border-hairline">
          <span>Endpoint</span><span>Events</span><span>Status</span><span>Last delivery</span>
        </div>
        {webhooks.map((w) => (
          <div key={w.id} className="grid grid-cols-[1.6fr_1.6fr_1fr_1fr] items-center py-2.5 text-[12px] border-b-[0.5px] border-hairline last:border-0">
            <span className="font-mono text-[11.5px]">{w.endpoint}</span>
            <span className="text-body">{w.events}</span>
            <Tag tone={w.status === 'healthy' ? 'success' : 'danger'}>{w.status === 'healthy' ? 'Healthy' : 'Failing'}</Tag>
            <span className="text-label">{w.lastDelivery ? timeAgo(w.lastDelivery) : '—'}</span>
          </div>
        ))}
        {webhooks.length === 0 && <p className="text-[12px] text-label py-2">No webhooks configured.</p>}
      </Card>

      <Card className="p-[18px]">
        <div className="text-[13px] font-semibold mb-3">Pending OAuth approvals</div>
        {requests.map((r) => (
          <div key={r.id} className="flex items-center gap-2.5 text-[12.5px] py-2 border-b-[0.5px] border-hairline last:border-0">
            <span className="flex-1">{r.description}</span>
            <Button variant="secondary" onClick={() => decide(r, false)}>Deny</Button>
            <Button onClick={() => decide(r, true)}>Approve</Button>
          </div>
        ))}
        {requests.length === 0 && <p className="text-[12px] text-label">Nothing pending.</p>}
      </Card>
    </div>
  );
}
