import { FormEvent, useEffect, useState } from 'react';
import { resources } from '@/shared/api/resources';
import { getApiErrorMessage } from '@/shared/api/client';
import { PageState } from '@/shared/components/PageState';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  subscription?: { plan?: { name: string; code: string } } | null;
};

type Plan = { id: string; name: string; code: string };

export function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [name, setName] = useState('');
  const [planId, setPlanId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([
        resources.tenants.list() as Promise<Tenant[]>,
        resources.plans.list() as Promise<Plan[]>,
      ]);
      setTenants(t);
      setPlans(p);
      if (!planId && p[0]) setPlanId(p[0].id);
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

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    try {
      await resources.tenants.create({ name, planId: planId || undefined });
      setName('');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Tenants</h1>
        <p>Organizations on the platform.</p>
      </header>
      <form className="inline-form" onSubmit={onCreate}>
        <input placeholder="Tenant name" value={name} onChange={(e) => setName(e.target.value)} required />
        <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button className="btn primary" type="submit">
          Create
        </button>
      </form>
      <PageState loading={loading} error={error}>
        <ul className="list">
          {tenants.map((t) => (
            <li key={t.id}>
              <strong>{t.name}</strong> · {t.slug} · plan: {t.subscription?.plan?.code ?? 'none'} ·{' '}
              {t.isActive ? 'active' : 'inactive'}
            </li>
          ))}
        </ul>
      </PageState>
    </section>
  );
}
