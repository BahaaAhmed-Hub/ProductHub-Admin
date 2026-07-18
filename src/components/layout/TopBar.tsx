import { useLocation } from 'react-router-dom';
import { NAV } from '@/app/navConfig';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/features/auth/AuthProvider';

export function TopBar() {
  const { pathname } = useLocation();
  const { admin } = useAuth();
  const current = NAV.find((n) => pathname.startsWith(n.path));

  return (
    <header className="h-[52px] flex-shrink-0 flex items-center justify-between px-6 border-b-[0.5px] border-hairline bg-white">
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-label">Admin</span>
        <span className="text-borderStrong">/</span>
        <span className="font-semibold">{current?.label ?? 'Overview'}</span>
      </div>
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-1.5 bg-[#F4F3F0] rounded-control h-8 px-3 w-64 text-label">
          <Icon name="search" size={16} />
          <span className="text-[12px]">Search companies, users, invoices…</span>
        </div>
        <Icon name="notifications_active" size={18} className="text-body" />
        {admin && <Avatar initials={admin.initials} size={26} />}
      </div>
    </header>
  );
}
