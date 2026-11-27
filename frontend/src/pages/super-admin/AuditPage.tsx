import { useEffect, useState } from 'react';
import { resources } from '@/shared/api/resources';
import { getApiErrorMessage } from '@/shared/api/client';
import { PageState } from '@/shared/components/PageState';

export function AuditPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    resources.audit
      .list()
      .then((d) => setItems(d as any[]))
      .catch((e) => setError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page">
      <header className="page-header">
        <h1>Audit logs</h1>
        <p>Recent platform and tenant actions.</p>
      </header>
      <PageState loading={loading} error={error}>
        <ul className="list">
          {items.map((l) => (
            <li key={l.id}>
              <strong>{l.action}</strong> · {l.resource} · {l.actor?.email ?? 'system'} ·{' '}
              {new Date(l.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </PageState>
    </section>
  );
}
