import clsx from 'clsx';
import { NavLink } from 'react-router-dom';
import { NAV } from '@/app/navConfig';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth/AuthProvider';
import { useUiStore } from '@/features/settings/store';

export function Sidebar() {
  const { admin, signOut } = useAuth();
  const visible = useUiStore((s) => s.sidebarVisible);
  const toggle = useUiStore((s) => s.toggleSidebar);
  if (!admin) return null;

  if (!visible) {
    return (
      <aside className="w-14 flex-shrink-0 border-r-[0.5px] border-hairline bg-canvas relative flex flex-col items-center justify-between py-4 px-2">
        <button
          onClick={toggle}
          title="Show navigation"
          className="absolute top-4 -right-[11px] w-[22px] h-[22px] rounded-full bg-white border-[0.5px] border-hairline flex items-center justify-center text-body z-10"
        >
          <Icon name="chevron_right" size={15} />
        </button>
        <div className="flex flex-col items-center gap-4">
          <Logo size={26} className="mb-1.5" />
          <div className="flex flex-col gap-1.5">
            {NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.label}
                className={({ isActive }) =>
                  clsx(
                    'w-8 h-8 rounded-[7px] flex items-center justify-center',
                    isActive ? 'bg-accent-bg text-navy' : 'text-label hover:bg-[#F4F3F0]',
                  )
                }
              >
                <Icon name={item.icon} size={18} />
              </NavLink>
            ))}
          </div>
        </div>
        <Avatar initials={admin.initials} size={26} />
      </aside>
    );
  }

  return (
    <aside className="w-56 flex-shrink-0 border-r-[0.5px] border-hairline bg-canvas relative flex flex-col justify-between py-4 px-3">
      <button
        onClick={toggle}
        title="Hide navigation"
        className="absolute top-4 -right-[11px] w-[22px] h-[22px] rounded-full bg-white border-[0.5px] border-hairline flex items-center justify-center text-body z-10"
      >
        <Icon name="chevron_left" size={15} />
      </button>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <Logo size={44} />
          <span className="text-lg font-semibold tracking-tight">ProductHub</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 h-8 px-2.5 rounded-[7px] text-[13px] transition-colors',
                  isActive ? 'text-navy bg-accent-bg font-medium' : 'text-body hover:bg-[#F4F3F0]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} size={18} className={isActive ? 'text-accent' : 'text-label'} />
                  <span className="flex-1">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 text-[11px] text-success bg-success-bg px-2.5 py-1.5 rounded-control">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          All systems operational
        </div>
        <div className="border-t-[0.5px] border-hairline pt-2.5 flex items-center gap-2">
          <Avatar initials={admin.initials} />
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium leading-tight truncate">{admin.name}</div>
            <div className="text-[10px] text-label">{admin.role}</div>
          </div>
          <button onClick={signOut} title="Sign out" className="text-label hover:text-body flex-shrink-0">
            <Icon name="logout" size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
