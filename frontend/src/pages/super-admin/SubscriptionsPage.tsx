import { FormEvent, useEffect, useState } from 'react';
import { resources } from '@/shared/api/resources';
import { getApiErrorMessage } from '@/shared/api/client';
import { PageState } from '@/shared/components/PageState';

export function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [tenantId, setTenantId] = useState('');
  const [planId, setPlanId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [s, t, p] = await Promise.all([
        resources.subscriptions.list(),
        resources.tenants.list(),
        resources.plans.list(),
      ]);
      setSubs(s as any[]);
      setTenants(t as any[]);
      setPlans(p as any[]);
      setTenantId((t as any[])[0]?.id ?? '');
      setPlanId((p as any[])[0]?.id ?? '');
      setError(null);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onAssign(e: FormEvent) {
    e.preventDefault();
    try {
      await resources.subscriptions.assign({ tenantId, planId });
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Subscriptions</h1>
        <p>Assign plans to tenants.</p>
      </header>
      <form className="inline-form" onSubmit={onAssign}>
        <select value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button className="btn primary" type="submit">
          Assign
        </button>
      </form>
      <PageState loading={loading} error={error}>
        <ul className="list">
          {subs.map((s) => (
            <li key={s.id}>
              {s.tenant?.name} → {s.plan?.name} ({s.status})
            </li>
          ))}
        </ul>
      </PageState>
    </section>
  );
}
