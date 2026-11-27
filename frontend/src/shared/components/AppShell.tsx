import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

type NavItem = { to: string; label: string };

export function AppShell({
  brand,
  nav,
}: {
  brand: string;
  nav: NavItem[];
}) {
  const { user, memberships, activeTenantId, switchTenant, logout } = useAuth();
  const active = memberships.find((m) => m.tenantId === activeTenantId);

  return (
    <div className="shell">
      <aside className="shell-aside">
        <div className="shell-brand">
          <span className="brand-mark">SC</span>
          <div>
            <p className="brand-title">{brand}</p>
            <p className="brand-sub">{user?.fullName}</p>
          </div>
        </div>

        <nav className="shell-nav">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="shell-footer">
          {memberships.length > 0 && (
            <label className="field compact">
              <span>Workspace</span>
              <select
                value={activeTenantId ?? ''}
                onChange={(e) => {
                  void switchTenant(e.target.value);
                }}
              >
                {memberships.map((m) => (
                  <option key={m.tenantId} value={m.tenantId}>
                    {m.tenant.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {active && <p className="muted tiny">Role: {active.role.replace('_', ' ')}</p>}
          <button type="button" className="btn ghost" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  );
}
