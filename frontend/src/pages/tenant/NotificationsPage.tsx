import { useEffect, useState } from 'react';
import { resources } from '@/shared/api/resources';
import { getApiErrorMessage } from '@/shared/api/client';
import { PageState } from '@/shared/components/PageState';

export function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setItems((await resources.notifications.list()) as any[]);
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

  return (
    <section className="page">
      <header className="page-header">
        <h1>Notifications</h1>
      </header>
      <PageState loading={loading} error={error}>
        <ul className="list">
          {items.map((n) => (
            <li key={n.id}>
              <strong>{n.title}</strong> — {n.body}{' '}
              {!n.isRead && (
                <button type="button" className="btn ghost" onClick={() => void resources.notifications.read(n.id).then(load)}>
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      </PageState>
    </section>
  );
}
