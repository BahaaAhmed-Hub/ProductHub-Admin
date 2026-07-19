import {
  LayoutDashboard, Users, BadgeCheck, CreditCard, ShieldCheck, Share2, BellRing, ShieldAlert,
  ChevronLeft, ChevronRight, Search, X, KeyRound, Eye, ArrowLeft, Download, Check, LogOut,
  Ban, Trash2, Circle, type LucideIcon,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  group: Users,
  badge: BadgeCheck,
  payments: CreditCard,
  shield_lock: ShieldCheck,
  hub: Share2,
  notifications_active: BellRing,
  gpp_maybe: ShieldAlert,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  search: Search,
  close: X,
  key: KeyRound,
  visibility: Eye,
  arrow_back: ArrowLeft,
  download: Download,
  check: Check,
  logout: LogOut,
  ban: Ban,
  delete: Trash2,
};

export function Icon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  const Cmp = MAP[name] ?? Circle;
  return <Cmp size={size} className={className} strokeWidth={2} aria-hidden />;
}
