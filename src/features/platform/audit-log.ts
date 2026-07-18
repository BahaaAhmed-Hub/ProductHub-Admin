import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { timeAgo } from './audit';

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
}

export function useAuditLogEntries(limit = 30): { entries: AuditEntry[]; isLoading: boolean } {
  const q = useQuery({
    queryKey: ['platform', 'audit-log', limit],
    queryFn: async (): Promise<AuditEntry[]> => {
      const { data, error } = await supabase
        .from('platform_audit_log')
        .select('id, actor_name, action, target, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as { id: string; actor_name: string; action: string; target: string; created_at: string }[]).map((r) => ({
        id: r.id, actor: r.actor_name, action: r.action, target: r.target, time: timeAgo(r.created_at),
      }));
    },
  });
  return { entries: q.data ?? [], isLoading: q.isLoading };
}
