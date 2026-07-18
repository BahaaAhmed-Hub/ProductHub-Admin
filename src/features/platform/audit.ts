import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthProvider';

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.round(hr / 24)}d ago`;
}

export { timeAgo };

/** Every mutating action a platform admin takes goes through this — the
 * audit log (Overview's "Recent admin actions", Security's "Audit log") is
 * the whole point of the console being a separate, logged surface rather
 * than admins just running SQL by hand. */
export function useAuditLog() {
  const { admin } = useAuth();
  return async function logAction(action: string, target: string): Promise<void> {
    if (!admin) return;
    await supabase.from('platform_audit_log').insert({
      actor_admin_id: admin.id,
      actor_name: admin.name,
      action,
      target,
    });
  };
}
