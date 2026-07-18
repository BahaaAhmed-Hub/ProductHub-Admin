import { createHashRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth } from '@/features/auth/guards';
import { SignInScreen } from '@/screens/SignInScreen';
import { AcceptInviteScreen } from '@/screens/AcceptInviteScreen';
import { OverviewScreen } from '@/screens/OverviewScreen';
import { CompaniesScreen } from '@/screens/CompaniesScreen';
import { CompanyDetailScreen } from '@/screens/CompanyDetailScreen';
import { InternalTeamScreen } from '@/screens/InternalTeamScreen';
import { BillingScreen } from '@/screens/BillingScreen';
import { SecurityScreen } from '@/screens/SecurityScreen';
import { IntegrationsScreen } from '@/screens/IntegrationsScreen';
import { NotificationsScreen } from '@/screens/NotificationsScreen';
import { ComplianceScreen } from '@/screens/ComplianceScreen';

export const router = createHashRouter([
  { path: '/signin', element: <SignInScreen /> },
  { path: '/accept-invite', element: <AcceptInviteScreen /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <Navigate to="/overview" replace /> },
          { path: '/overview', element: <OverviewScreen /> },
          { path: '/companies', element: <CompaniesScreen /> },
          { path: '/companies/:id', element: <CompanyDetailScreen /> },
          { path: '/internal', element: <InternalTeamScreen /> },
          { path: '/billing', element: <BillingScreen /> },
          { path: '/security', element: <SecurityScreen /> },
          { path: '/integrations', element: <IntegrationsScreen /> },
          { path: '/notifications', element: <NotificationsScreen /> },
          { path: '/compliance', element: <ComplianceScreen /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
