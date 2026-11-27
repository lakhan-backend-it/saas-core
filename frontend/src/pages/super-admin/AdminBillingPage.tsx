import { useEffect, useState } from 'react';
import { resources } from '@/shared/api/resources';
import { getApiErrorMessage } from '@/shared/api/client';
import { PageState } from '@/shared/components/PageState';

export function AdminBillingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    resources.billing
      .adminInvoices()
      .then((d) => setItems(d as any[]))
      .catch((e) => setError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page">
      <header className="page-header">
        <h1>Billing</h1>
        <p>All tenant invoices.</p>
      </header>
      <PageState loading={loading} error={error}>
        <ul className="list">
          {items.map((i) => (
            <li key={i.id}>
              {i.tenant?.name} · {(i.amountCents / 100).toFixed(2)} {i.currency} · {i.status}
            </li>
          ))}
        </ul>
      </PageState>
    </section>
  );
}
