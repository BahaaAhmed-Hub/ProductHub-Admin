import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuditLog } from './audit';

export type PlanTier = 'free' | 'pro' | 'enterprise';
export type OrgStatus = 'active' | 'suspended';

export interface Company {
  id: string;
  name: string;
  plan: PlanTier;
  status: OrgStatus;
  createdAt: string;
  workspaceId: string | null;
  seatCount: number;
  seatLimit: number;
  contactName: string | null;
  contactEmail: string | null;
}

const PLAN_LABEL: Record<PlanTier, string> = { free: 'Starter', pro: 'Business', enterprise: 'Enterprise' };
export { PLAN_LABEL };

interface OrgRow {
  id: string;
  name: string;
  plan: PlanTier;
  status: OrgStatus;
  created_at: string;
  workspaces: { id: string; profiles: { id: string; name: string; email: string; role: string }[] }[] | null;
}

/** Every org on the platform, with its one workspace's member count and a
 * best-guess "primary contact" (the workspace's manager). ProductHub's
 * tenancy model is org → workspace(s) → profiles; in practice each org has
 * exactly one workspace today, so this flattens that for the list view. */
export function useCompanies(): { companies: Company[]; isLoading: boolean } {
  const q = useQuery({
    queryKey: ['platform', 'companies'],
    queryFn: async (): Promise<Company[]> => {
      const { data, error } = await supabase
        .from('orgs')
        .select('id, name, plan, status, created_at, workspaces(id, profiles(id, name, email, role))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as OrgRow[]).map((r) => {
        const ws = r.workspaces?.[0];
        const members = ws?.profiles ?? [];
        const manager = members.find((m) => m.role === 'manager');
        return {
          id: r.id,
          name: r.name,
          plan: r.plan,
          status: r.status,
          createdAt: r.created_at,
          workspaceId: ws?.id ?? null,
          seatCount: members.length,
          seatLimit: r.plan === 'free' ? 3 : r.plan === 'pro' ? 25 : 250,
          contactName: manager?.name ?? null,
          contactEmail: manager?.email ?? null,
        };
      });
    },
  });
  return { companies: q.data ?? [], isLoading: q.isLoading };
}

export function useCompanyActions() {
  const qc = useQueryClient();
  const logAction = useAuditLog();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['platform', 'companies'] });

  return {
    async setStatus(company: Company, status: OrgStatus): Promise<void> {
      const { error } = await supabase.from('orgs').update({ status }).eq('id', company.id);
      if (error) throw error;
      await logAction(status === 'active' ? 'Reactivated account' : 'Suspended account', company.name);
      await invalidate();
    },
    async setPlan(company: Company, plan: PlanTier): Promise<void> {
      const { error } = await supabase.from('orgs').update({ plan }).eq('id', company.id);
      if (error) throw error;
      await logAction(`Changed plan to ${PLAN_LABEL[plan]}`, company.name);
      await invalidate();
    },
    async bulkSetStatus(companies: Company[], status: OrgStatus): Promise<void> {
      const { error } = await supabase.from('orgs').update({ status }).in('id', companies.map((c) => c.id));
      if (error) throw error;
      await logAction(status === 'active' ? 'Bulk activated' : 'Bulk suspended', `${companies.length} companies`);
      await invalidate();
    },
    async bulkSetPlan(companies: Company[], plan: PlanTier): Promise<void> {
      const { error } = await supabase.from('orgs').update({ plan }).in('id', companies.map((c) => c.id));
      if (error) throw error;
      await logAction(`Bulk set plan to ${PLAN_LABEL[plan]}`, `${companies.length} companies`);
      await invalidate();
    },
  };
}

export interface CompanyInvite {
  id: string;
  companyName: string;
  contactEmail: string;
  sentAt: string;
}

export function useCompanyInvites(): { invites: CompanyInvite[]; isLoading: boolean } {
  const q = useQuery({
    queryKey: ['platform', 'company-invites'],
    queryFn: async (): Promise<CompanyInvite[]> => {
      const { data, error } = await supabase
        .from('platform_company_invites')
        .select('id, company_name, contact_email, sent_at')
        .order('sent_at', { ascending: false });
      if (error) throw error;
      return (data as { id: string; company_name: string; contact_email: string; sent_at: string }[]).map((r) => ({
        id: r.id, companyName: r.company_name, contactEmail: r.contact_email, sentAt: r.sent_at,
      }));
    },
  });
  return { invites: q.data ?? [], isLoading: q.isLoading };
}

export function useCompanyInviteActions() {
  const qc = useQueryClient();
  const logAction = useAuditLog();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['platform', 'company-invites'] });

  return {
    async create(companyName: string, contactEmail: string): Promise<void> {
      const { error } = await supabase.from('platform_company_invites').insert({ company_name: companyName, contact_email: contactEmail });
      if (error) throw error;
      await logAction('Invited company', companyName);
      await invalidate();
    },
    async resend(invite: CompanyInvite): Promise<void> {
      const { error } = await supabase.from('platform_company_invites').update({ sent_at: new Date().toISOString() }).eq('id', invite.id);
      if (error) throw error;
      await logAction('Resent company invite', invite.companyName);
      await invalidate();
    },
  };
}
