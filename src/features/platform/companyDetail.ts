import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { invoke } from '@/lib/edgeFunctions';
import { useAuditLog } from './audit';

/** ProductHub's tenant role enum (types/domain.ts there) — duplicated here
 * rather than shared across repos since it's a fixed, rarely-changing set. */
export type Role = 'customer' | 'developer' | 'pm' | 'manager' | 'stakeholder';

export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  initials: string;
}

function initialsOf(name: string): string {
  return name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export function useWorkspaceUsers(workspaceId: string | null): { staff: WorkspaceUser[]; customers: WorkspaceUser[]; isLoading: boolean } {
  const q = useQuery({
    queryKey: ['platform', 'workspace-users', workspaceId],
    enabled: Boolean(workspaceId),
    queryFn: async (): Promise<WorkspaceUser[]> => {
      const { data, error } = await supabase.from('profiles').select('id, name, email, role, status').eq('workspace_id', workspaceId as string).order('name');
      if (error) throw error;
      return (data as { id: string; name: string; email: string; role: string; status: string | null }[]).map((r) => ({
        id: r.id, name: r.name, email: r.email, role: r.role, status: r.status ?? 'active', initials: initialsOf(r.name),
      }));
    },
  });
  const all = q.data ?? [];
  return {
    staff: all.filter((u) => u.role !== 'customer'),
    customers: all.filter((u) => u.role === 'customer'),
    isLoading: q.isLoading,
  };
}

export function useWorkspaceUserActions(workspaceId: string | null) {
  const qc = useQueryClient();
  const logAction = useAuditLog();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['platform', 'workspace-users', workspaceId] });
  return {
    async setStatus(user: WorkspaceUser, status: 'active' | 'pending'): Promise<void> {
      const { error } = await supabase.from('profiles').update({ status }).eq('id', user.id);
      if (error) throw error;
      await logAction(status === 'active' ? 'Activated user' : 'Suspended user', user.name);
      await invalidate();
    },
    async setRole(user: WorkspaceUser, role: Role): Promise<void> {
      const { error } = await supabase.from('profiles').update({ role }).eq('id', user.id);
      if (error) throw error;
      await logAction(`Changed role to ${role}`, user.name);
      await invalidate();
    },
    async bulkSetStatus(users: WorkspaceUser[], status: 'active' | 'pending'): Promise<void> {
      const { error } = await supabase.from('profiles').update({ status }).in('id', users.map((u) => u.id));
      if (error) throw error;
      await logAction(status === 'active' ? 'Bulk activated users' : 'Bulk suspended users', `${users.length} users`);
      await invalidate();
    },
    async bulkSetRole(users: WorkspaceUser[], role: Role): Promise<void> {
      const { error } = await supabase.from('profiles').update({ role }).in('id', users.map((u) => u.id));
      if (error) throw error;
      await logAction(`Bulk set role to ${role}`, `${users.length} users`);
      await invalidate();
    },
    /** A real password reset, not a stub — Supabase Admin's generateLink
     * actually creates a usable recovery link (see platform-reset-password
     * Edge Function, service role); logged either way. */
    async resetPassword(user: WorkspaceUser): Promise<void> {
      await invoke('platform-reset-password', { email: user.email });
      await logAction('Reset password', user.name);
    },
    async bulkResetPasswords(users: WorkspaceUser[]): Promise<void> {
      await Promise.all(users.map((u) => invoke('platform-reset-password', { email: u.email })));
      await logAction('Bulk reset passwords', `${users.length} users`);
    },
  };
}
