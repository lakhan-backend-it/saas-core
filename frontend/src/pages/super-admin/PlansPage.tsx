import { FormEvent, useEffect, useState } from 'react';
import { resources } from '@/shared/api/resources';
import { getApiErrorMessage } from '@/shared/api/client';
import { PageState } from '@/shared/components/PageState';

type Feature = { id: string; key: string; name: string };
type Plan = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  planFeatures: Array<{ featureId: string; enabled: boolean; limit: number | null; feature: Feature }>;
};

export function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [p, f] = await Promise.all([
        resources.plans.list() as Promise<Plan[]>,
        resources.features.list() as Promise<Feature[]>,
      ]);
      setPlans(p);
      setFeatures(f);
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
      await resources.plans.create({ name, code, description: `${name} plan` });
      setName('');
      setCode('');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function toggleFeature(plan: Plan, featureId: string, enabled: boolean) {
    const current = plan.planFeatures.map((pf) => ({
      featureId: pf.featureId,
      enabled: pf.featureId === featureId ? enabled : pf.enabled,
      limit: pf.limit,
    }));
    const missing = features
      .filter((f) => !current.some((c) => c.featureId === f.id))
      .map((f) => ({ featureId: f.id, enabled: f.id === featureId ? enabled : false, limit: null }));
    try {
      await resources.plans.setFeatures(plan.id, { features: [...current, ...missing] });
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Plans</h1>
        <p>Manage subscription plans and feature toggles.</p>
      </header>

      <form className="inline-form" onSubmit={onCreate}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="code" value={code} onChange={(e) => setCode(e.target.value)} required />
        <button className="btn primary" type="submit">
          Add plan
        </button>
      </form>

      <PageState loading={loading} error={error}>
        <div className="stack-lg">
          {plans.map((plan) => (
            <article key={plan.id} className="stat-block">
              <h2>
                {plan.name} <span className="muted tiny">({plan.code})</span>
              </h2>
              <div className="chip-row">
                {features.map((f) => {
                  const pf = plan.planFeatures.find((x) => x.featureId === f.id);
                  const on = !!pf?.enabled;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      className={`chip ${on ? 'on' : ''}`}
                      onClick={() => void toggleFeature(plan, f.id, !on)}
                    >
                      {f.key}
                      {pf?.limit != null ? ` · ${pf.limit}` : ''}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </PageState>
    </section>
  );
}
