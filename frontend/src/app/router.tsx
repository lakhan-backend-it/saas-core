import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { GuestRoute } from '@/shared/components/GuestRoute';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { AppShell } from '@/shared/components/AppShell';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { AcceptInvitePage } from '@/pages/auth/AcceptInvitePage';
import { AdminHomePage } from '@/pages/super-admin/AdminHomePage';
import { PlansPage } from '@/pages/super-admin/PlansPage';
import { FeaturesPage } from '@/pages/super-admin/FeaturesPage';
import { TenantsPage } from '@/pages/super-admin/TenantsPage';
import { SubscriptionsPage } from '@/pages/super-admin/SubscriptionsPage';
import { AuditPage } from '@/pages/super-admin/AuditPage';
import { AdminBillingPage } from '@/pages/super-admin/AdminBillingPage';
import { TenantHomePage } from '@/pages/tenant/TenantHomePage';
import { ProjectsPage } from '@/pages/tenant/ProjectsPage';
import { TasksPage } from '@/pages/tenant/TasksPage';
import { UsersPage } from '@/pages/tenant/UsersPage';
import { InvitationsPage } from '@/pages/tenant/InvitationsPage';
import { UsagePage } from '@/pages/tenant/UsagePage';
import { NotificationsPage } from '@/pages/tenant/NotificationsPage';
import { FilesPage } from '@/pages/tenant/FilesPage';
import { BillingPage } from '@/pages/tenant/BillingPage';

function SuperAdminOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user?.isSuperAdmin) return <Navigate to="/app" replace />;
  return children;
}

function TenantOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.isSuperAdmin) return <Navigate to="/admin" replace />;
  return children;
}

const adminNav = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/plans', label: 'Plans' },
  { to: '/admin/features', label: 'Features' },
  { to: '/admin/tenants', label: 'Tenants' },
  { to: '/admin/subscriptions', label: 'Subscriptions' },
  { to: '/admin/audit', label: 'Audit' },
  { to: '/admin/billing', label: 'Billing' },
];

const tenantNav = [
  { to: '/app', label: 'Home' },
  { to: '/app/projects', label: 'Projects' },
  { to: '/app/tasks', label: 'Tasks' },
  { to: '/app/users', label: 'Users' },
  { to: '/app/invitations', label: 'Invites' },
  { to: '/app/usage', label: 'Usage' },
  { to: '/app/files', label: 'Files' },
  { to: '/app/notifications', label: 'Alerts' },
  { to: '/app/billing', label: 'Billing' },
];

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/accept-invite" element={<AcceptInvitePage />} />

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route
              path="/admin"
              element={
                <SuperAdminOnly>
                  <AppShell brand="Platform" nav={adminNav} />
                </SuperAdminOnly>
              }
            >
              <Route index element={<AdminHomePage />} />
              <Route path="plans" element={<PlansPage />} />
              <Route path="features" element={<FeaturesPage />} />
              <Route path="tenants" element={<TenantsPage />} />
              <Route path="subscriptions" element={<SubscriptionsPage />} />
              <Route path="audit" element={<AuditPage />} />
              <Route path="billing" element={<AdminBillingPage />} />
            </Route>

            <Route
              path="/app"
              element={
                <TenantOnly>
                  <AppShell brand="Workspace" nav={tenantNav} />
                </TenantOnly>
              }
            >
              <Route index element={<TenantHomePage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="invitations" element={<InvitationsPage />} />
              <Route path="usage" element={<UsagePage />} />
              <Route path="files" element={<FilesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="billing" element={<BillingPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
