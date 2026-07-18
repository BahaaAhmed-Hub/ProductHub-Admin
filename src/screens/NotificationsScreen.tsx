import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { useAlertRules } from '@/features/platform/ops';

export function NotificationsScreen() {
  const { rules } = useAlertRules();

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-[18px]">
        <div className="text-[13px] font-semibold mb-3">Alert rules</div>
        <div className="grid grid-cols-[1.2fr_1.4fr_1.4fr_1fr] pb-2 text-[10.5px] font-semibold text-label uppercase tracking-wide border-b-[0.5px] border-hairline">
          <span>Trigger</span><span>Condition</span><span>Channel</span><span>Status</span>
        </div>
        {rules.map((r) => (
          <div key={r.id} className="grid grid-cols-[1.2fr_1.4fr_1.4fr_1fr] items-center py-2.5 text-[12.5px] border-b-[0.5px] border-hairline last:border-0">
            <span className="font-medium">{r.trigger}</span>
            <span className="text-body">{r.condition}</span>
            <span className="text-body">{r.channel}</span>
            <Tag tone={r.status === 'active' ? 'success' : 'neutral'}>{r.status === 'active' ? 'Active' : 'Muted'}</Tag>
          </div>
        ))}
        {rules.length === 0 && <p className="text-[12px] text-label py-2">No alert rules configured.</p>}
      </Card>
    </div>
  );
}
