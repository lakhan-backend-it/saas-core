import { useAuth } from '@/features/auth/AuthContext';

export function AdminHomePage() {
  const { user } = useAuth();

  return (
    <section className="page">
      <header className="page-header">
        <h1>Platform console</h1>
        <p>Welcome, {user?.fullName}. Manage plans, tenants, and subscriptions here.</p>
      </header>

      <div className="grid-3">
        <article className="stat-block">
          <h2>Plans</h2>
          <p>Create Free / Pro plans and toggle features.</p>
          <p className="muted">Module wiring next</p>
        </article>
        <article className="stat-block">
          <h2>Tenants</h2>
          <p>Onboard organizations and assign subscriptions.</p>
          <p className="muted">Module wiring next</p>
        </article>
        <article className="stat-block">
          <h2>Features</h2>
          <p>Gate modules per plan for API + UI.</p>
          <p className="muted">Module wiring next</p>
        </article>
      </div>
    </section>
  );
}
