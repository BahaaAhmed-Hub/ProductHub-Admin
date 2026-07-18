import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { invoke } from '@/lib/edgeFunctions';
import { useAuditLog } from './audit';
import type { PlatformRole } from '@/features/auth/AuthProvider';

export interface InternalAdmin {
  id: string;
  name: string;
  email: string;
  role: PlatformRole;
  area: string;
  status: 'active' | 'suspended';
}

export const INTERNAL_ROLES: PlatformRole[] = ['Platform Owner', 'Billing Admin', 'IT / Security Admin', 'Support Ops'];

export function useInternalTeam(): { admins: InternalAdmin[]; isLoading: boolean } {
  const q = useQuery({
    queryKey: ['platform', 'internal-team'],
    queryFn: async (): Promise<InternalAdmin[]> => {
      const { data, error } = await supabase.from('platform_admins').select('id, name, email, role, area, status').order('name');
      if (error) throw error;
      return data as InternalAdmin[];
    },
  });
  return { admins: q.data ?? [], isLoading: q.isLoading };
}

export function useInternalTeamActions() {
  const qc = useQueryClient();
  const logAction = useAuditLog();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['platform', 'internal-team'] });

  return {
    async setStatus(admin: InternalAdmin, status: 'active' | 'suspended'): Promise<void> {
      const { error } = await supabase.from('platform_admins').update({ status }).eq('id', admin.id);
      if (error) throw error;
      await logAction(status === 'active' ? 'Activated internal admin' : 'Suspended internal admin', admin.name);
      await invalidate();
    },
    async setRole(admin: InternalAdmin, role: PlatformRole): Promise<void> {
      const { error } = await supabase.from('platform_admins').update({ role }).eq('id', admin.id);
      if (error) throw error;
      await logAction(`Changed role to ${role}`, admin.name);
      await invalidate();
    },
    async remove(admin: InternalAdmin): Promise<void> {
      const { error } = await supabase.from('platform_admins').delete().eq('id', admin.id);
      if (error) throw error;
      await logAction('Removed internal admin', admin.name);
      await invalidate();
    },
    async bulkSetStatus(admins: InternalAdmin[], status: 'active' | 'suspended'): Promise<void> {
      const { error } = await supabase.from('platform_admins').update({ status }).in('id', admins.map((a) => a.id));
      if (error) throw error;
      await logAction(status === 'active' ? 'Bulk activated' : 'Bulk suspended', `${admins.length} internal admins`);
      await invalidate();
    },
    async bulkRemove(admins: InternalAdmin[]): Promise<void> {
      const { error } = await supabase.from('platform_admins').delete().in('id', admins.map((a) => a.id));
      if (error) throw error;
      await logAction('Bulk removed', `${admins.length} internal admins`);
      await invalidate();
    },
    /** Invites a new internal admin — reuses the same admin.inviteUserByEmail
     * pattern as ProductHub's Team & Members (see its invite-member Edge
     * Function), pointed at a new platform-admin-scoped function so the
     * created auth user gets a platform_admins row instead of a profiles one. */
    async invite(name: string, email: string, role: PlatformRole): Promise<void> {
      const redirectTo = `${window.location.origin}${window.location.pathname}#/accept-invite`;
      await invoke('platform-invite-admin', { name, email, role, redirectTo });
      await logAction('Invited internal admin', `${name} (${role})`);
      await invalidate();
    },
  };
}
