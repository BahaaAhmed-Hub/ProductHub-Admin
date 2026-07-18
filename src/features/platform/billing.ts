import { useQuery } from '@tanstack/react-query';
import { invoke } from '@/lib/edgeFunctions';

export interface CompanySubscription {
  orgId: string;
  orgName: string;
  plan: string;
  mrr: number;
  status: string | null;
  renewsOn: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface PlatformInvoice {
  id: string;
  orgName: string;
  date: string;
  amount: number;
  status: string;
  pdfUrl: string | null;
}

export interface PlatformStats {
  totalMrr: number;
  activeCount: number;
  trialCount: number;
  pastDueCount: number;
  totalCompanies: number;
  companies: CompanySubscription[];
  invoices: PlatformInvoice[];
}

export function usePlatformStats() {
  const q = useQuery({
    queryKey: ['platform', 'stats'],
    queryFn: () => invoke<PlatformStats>('platform-stats', {}),
  });
  return { stats: q.data, isLoading: q.isLoading, error: q.error as Error | null };
}
