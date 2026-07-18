import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuditLog } from './audit';

// ---------- Security & Access ----------

export interface SecuritySettings {
  ssoConnected: boolean;
  scimEnabled: boolean;
  twoFactorEnforced: boolean;
}

export function useSecuritySettings() {
  const q = useQuery({
    queryKey: ['platform', 'security-settings'],
    queryFn: async (): Promise<SecuritySettings> => {
      const { data, error } = await supabase.from('platform_security_settings').select('sso_connected, scim_enabled, two_factor_enforced').eq('id', 1).single();
      if (error) throw error;
      return { ssoConnected: data.sso_connected, scimEnabled: data.scim_enabled, twoFactorEnforced: data.two_factor_enforced };
    },
  });
  const qc = useQueryClient();
  const logAction = useAuditLog();
  return {
    settings: q.data,
    isLoading: q.isLoading,
    async toggleTwoFactor() {
      if (!q.data) return;
      const next = !q.data.twoFactorEnforced;
      const { error } = await supabase.from('platform_security_settings').update({ two_factor_enforced: next, updated_at: new Date().toISOString() }).eq('id', 1);
      if (error) throw error;
      await logAction(next ? 'Enforced 2FA' : 'Disabled 2FA enforcement', 'Internal admins & billing roles');
      await qc.invalidateQueries({ queryKey: ['platform', 'security-settings'] });
    },
  };
}

export interface IpRange {
  id: string;
  cidr: string;
  label: string;
}

export function useIpAllowlist() {
  const qc = useQueryClient();
  const logAction = useAuditLog();
  const q = useQuery({
    queryKey: ['platform', 'ip-allowlist'],
    queryFn: async (): Promise<IpRange[]> => {
      const { data, error } = await supabase.from('platform_ip_allowlist').select('id, cidr, label').order('created_at');
      if (error) throw error;
      return data as IpRange[];
    },
  });
  return {
    ranges: q.data ?? [],
    isLoading: q.isLoading,
    async add(cidr: string, label: string) {
      const { error } = await supabase.from('platform_ip_allowlist').insert({ cidr, label });
      if (error) throw error;
      await logAction('Added IP range', cidr);
      await qc.invalidateQueries({ queryKey: ['platform', 'ip-allowlist'] });
    },
    async remove(range: IpRange) {
      const { error } = await supabase.from('platform_ip_allowlist').delete().eq('id', range.id);
      if (error) throw error;
      await logAction('Removed IP range', range.cidr);
      await qc.invalidateQueries({ queryKey: ['platform', 'ip-allowlist'] });
    },
  };
}

export interface ApiKey {
  id: string;
  name: string;
  scopes: string;
  lastUsed: string | null;
  created: string;
}

export function useApiKeys() {
  const qc = useQueryClient();
  const logAction = useAuditLog();
  const q = useQuery({
    queryKey: ['platform', 'api-keys'],
    queryFn: async (): Promise<ApiKey[]> => {
      const { data, error } = await supabase.from('platform_api_keys').select('id, name, scopes, last_used_at, created_at').is('revoked_at', null).order('created_at', { ascending: false });
      if (error) throw error;
      return (data as { id: string; name: string; scopes: string; last_used_at: string | null; created_at: string }[]).map((r) => ({
        id: r.id, name: r.name, scopes: r.scopes, lastUsed: r.last_used_at, created: r.created_at,
      }));
    },
  });
  return {
    keys: q.data ?? [],
    isLoading: q.isLoading,
    async revoke(key: ApiKey) {
      const { error } = await supabase.from('platform_api_keys').update({ revoked_at: new Date().toISOString() }).eq('id', key.id);
      if (error) throw error;
      await logAction('Revoked API key', key.name);
      await qc.invalidateQueries({ queryKey: ['platform', 'api-keys'] });
    },
  };
}

// ---------- Integrations ----------

export interface PlatformIntegration {
  id: string;
  key: string;
  name: string;
  description: string;
  status: 'connected' | 'needs_reauth' | 'disconnected';
}

export function usePlatformIntegrations() {
  const q = useQuery({
    queryKey: ['platform', 'integrations'],
    queryFn: async (): Promise<PlatformIntegration[]> => {
      const { data, error } = await supabase.from('platform_integrations').select('id, key, name, description, status').order('name');
      if (error) throw error;
      return data as PlatformIntegration[];
    },
  });
  return { integrations: q.data ?? [], isLoading: q.isLoading };
}

export interface PlatformWebhook {
  id: string;
  endpoint: string;
  events: string;
  status: 'healthy' | 'failing';
  lastDelivery: string | null;
}

export function usePlatformWebhooks() {
  const q = useQuery({
    queryKey: ['platform', 'webhooks'],
    queryFn: async (): Promise<PlatformWebhook[]> => {
      const { data, error } = await supabase.from('platform_webhooks').select('id, endpoint, events, status, last_delivery_at');
      if (error) throw error;
      return (data as { id: string; endpoint: string; events: string; status: 'healthy' | 'failing'; last_delivery_at: string | null }[]).map((r) => ({
        id: r.id, endpoint: r.endpoint, events: r.events, status: r.status, lastDelivery: r.last_delivery_at,
      }));
    },
  });
  return { webhooks: q.data ?? [], isLoading: q.isLoading };
}

export interface OAuthRequest {
  id: string;
  requesterName: string;
  description: string;
}

export function useOAuthRequests() {
  const qc = useQueryClient();
  const logAction = useAuditLog();
  const q = useQuery({
    queryKey: ['platform', 'oauth-requests'],
    queryFn: async (): Promise<OAuthRequest[]> => {
      const { data, error } = await supabase.from('platform_oauth_requests').select('id, requester_name, description').eq('status', 'pending');
      if (error) throw error;
      return (data as { id: string; requester_name: string; description: string }[]).map((r) => ({
        id: r.id, requesterName: r.requester_name, description: r.description,
      }));
    },
  });
  return {
    requests: q.data ?? [],
    isLoading: q.isLoading,
    async decide(request: OAuthRequest, approved: boolean) {
      const { error } = await supabase.from('platform_oauth_requests').update({ status: approved ? 'approved' : 'denied' }).eq('id', request.id);
      if (error) throw error;
      await logAction(approved ? 'Approved OAuth request' : 'Denied OAuth request', request.requesterName);
      await qc.invalidateQueries({ queryKey: ['platform', 'oauth-requests'] });
    },
  };
}

// ---------- Notifications & Alerts ----------

export interface AlertRule {
  id: string;
  trigger: string;
  condition: string;
  channel: string;
  status: 'active' | 'muted';
}

export function useAlertRules() {
  const q = useQuery({
    queryKey: ['platform', 'alert-rules'],
    queryFn: async (): Promise<AlertRule[]> => {
      const { data, error } = await supabase.from('platform_alert_rules').select('id, trigger_name, condition, channel, status');
      if (error) throw error;
      return (data as { id: string; trigger_name: string; condition: string; channel: string; status: 'active' | 'muted' }[]).map((r) => ({
        id: r.id, trigger: r.trigger_name, condition: r.condition, channel: r.channel, status: r.status,
      }));
    },
  });
  return { rules: q.data ?? [], isLoading: q.isLoading };
}

// ---------- Compliance & Data ----------

export interface DataRequest {
  id: string;
  type: 'Export' | 'Delete';
  requester: string;
  status: 'pending' | 'completed';
  date: string;
}

export function useDataRequests() {
  const q = useQuery({
    queryKey: ['platform', 'data-requests'],
    queryFn: async (): Promise<DataRequest[]> => {
      const { data, error } = await supabase
        .from('platform_data_requests')
        .select('id, type, status, created_at, orgs(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as { id: string; type: 'Export' | 'Delete'; status: 'pending' | 'completed'; created_at: string; orgs: { name: string } | null }[]).map((r) => ({
        id: r.id, type: r.type, status: r.status, date: r.created_at, requester: r.orgs?.name ?? 'Unknown',
      }));
    },
  });
  return { requests: q.data ?? [], isLoading: q.isLoading };
}
