import { useEffect, useState } from 'react';
import { resources } from '@/shared/api/resources';
import { getApiErrorMessage } from '@/shared/api/client';
import { PageState } from '@/shared/components/PageState';

export function UsagePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    resources.usage
      .get()
      .then(setData)
      .catch((e) => setError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page">
      <header className="page-header">
        <h1>Usage</h1>
        <p>Plan features, limits, and metering.</p>
      </header>
      <PageState loading={loading} error={error}>
        <pre className="code-block">{JSON.stringify(data, null, 2)}</pre>
      </PageState>
    </section>
  );
}
