import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { useDataRequests } from '@/features/platform/ops';

export function ComplianceScreen() {
  const { requests } = useDataRequests();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Card className="flex-1 p-[18px]">
          <div className="text-[13px] font-semibold mb-2.5">Data retention</div>
          <div className="text-[12px] text-body leading-relaxed">
            Audit logs retained for 400 days<br />Customer data retained per plan tier<br />Deleted records purged after 30 days
          </div>
        </Card>
        <Card className="flex-1 p-[18px]">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[13px] font-semibold">Backups</div>
            <span className="inline-flex items-center h-5 px-2.5 rounded-full text-[10px] font-medium bg-success-bg text-success-text">Healthy</span>
          </div>
          <div className="text-[12px] text-body">Last backup: Today, 3:00 AM &middot; Daily snapshot</div>
        </Card>
      </div>

      <Card className="p-[18px]">
        <div className="text-[13px] font-semibold mb-3">GDPR / CCPA request log</div>
        <div className="grid grid-cols-[1.2fr_1.6fr_1fr_1fr] pb-2 text-[10.5px] font-semibold text-label uppercase tracking-wide border-b-[0.5px] border-hairline">
          <span>Type</span><span>Requesting company</span><span>Status</span><span>Date</span>
        </div>
        {requests.map((r) => (
          <div key={r.id} className="grid grid-cols-[1.2fr_1.6fr_1fr_1fr] items-center py-2.5 text-[12.5px] border-b-[0.5px] border-hairline last:border-0">
            <span className="font-medium">{r.type}</span>
            <span className="text-body">{r.requester}</span>
            <Tag tone={r.status === 'completed' ? 'success' : 'warning'}>{r.status === 'completed' ? 'Completed' : 'Pending'}</Tag>
            <span className="text-label">{new Date(r.date).toLocaleDateString()}</span>
          </div>
        ))}
        {requests.length === 0 && <p className="text-[12px] text-label py-2">No data requests on file.</p>}
      </Card>
    </div>
  );
}
