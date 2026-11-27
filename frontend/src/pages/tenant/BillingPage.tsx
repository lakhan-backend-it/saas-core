import { FormEvent, useEffect, useState } from 'react';
import { resources } from '@/shared/api/resources';
import { getApiErrorMessage } from '@/shared/api/client';
import { PageState } from '@/shared/components/PageState';

export function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [planId, setPlanId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      // Tenant cannot list /plans (super admin only) — use checkout against known seed codes via admin assign alternatively.
      // For demo, ask backend checkout with planId from usage/tenant endpoint.
      const tenantId = JSON.parse(localStorage.getItem('saas.activeTenant') || 'null');
      void tenantId;
      setInvoices((await resources.billing.invoices()) as any[]);
      setError(null);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // Super-admin plans list won't work for tenant; keep empty and use manual planId field if needed
    resources.plans
      .catalog()
      .then((p) => {
        setPlans(p as any[]);
        setPlanId((p as any[])[0]?.id ?? '');
      })
      .catch(() => undefined);
  }, []);

  async function onCheckout(e: FormEvent) {
    e.preventDefault();
    try {
      await resources.billing.checkout({ planId, amountCents: 3000 });
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Billing</h1>
        <p>Simulated checkout + invoices.</p>
      </header>
      {plans.length > 0 && (
        <form className="inline-form" onSubmit={onCheckout}>
          <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button className="btn primary" type="submit">
            Simulate checkout
          </button>
        </form>
      )}
      <PageState loading={loading} error={error}>
        <ul className="list">
          {invoices.map((i) => (
            <li key={i.id}>
              {(i.amountCents / 100).toFixed(2)} {i.currency} · {i.status}
            </li>
          ))}
        </ul>
      </PageState>
    </section>
  );
}
