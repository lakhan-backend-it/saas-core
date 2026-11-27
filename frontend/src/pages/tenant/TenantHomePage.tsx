import { useAuth } from '@/features/auth/AuthContext';

export function TenantHomePage() {
  const { user, memberships, activeTenantId, membershipRole } = useAuth();
  const workspace = memberships.find((m) => m.tenantId === activeTenantId);

  return (
    <section className="page">
      <header className="page-header">
        <h1>{workspace?.tenant.name ?? 'Workspace'}</h1>
        <p>
          Signed in as {user?.fullName}
          {membershipRole ? ` · ${membershipRole.replace('_', ' ')}` : ''}
        </p>
      </header>

      <div className="grid-2">
        <article className="stat-block">
          <h2>Projects</h2>
          <p>Tenant-scoped project CRUD (feature: projects).</p>
          <p className="muted">API module next</p>
        </article>
        <article className="stat-block">
          <h2>Tasks</h2>
          <p>Plan-gated module — Free plan should block, Pro allow.</p>
          <p className="muted">API module next</p>
        </article>
      </div>
    </section>
  );
}
