export interface NavItem {
  label: string;
  icon: string;
  path: string;
}

export const NAV: NavItem[] = [
  { label: 'Overview', icon: 'dashboard', path: '/overview' },
  { label: 'Companies', icon: 'group', path: '/companies' },
  { label: 'Internal Team', icon: 'badge', path: '/internal' },
  { label: 'Billing & Subscription', icon: 'payments', path: '/billing' },
  { label: 'Security & Access', icon: 'shield_lock', path: '/security' },
  { label: 'Integrations', icon: 'hub', path: '/integrations' },
  { label: 'Notifications & Alerts', icon: 'notifications_active', path: '/notifications' },
  { label: 'Compliance & Data', icon: 'gpp_maybe', path: '/compliance' },
];
