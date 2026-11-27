import { FormEvent, useEffect, useState } from 'react';
import { resources } from '@/shared/api/resources';
import { getApiErrorMessage } from '@/shared/api/client';
import { PageState } from '@/shared/components/PageState';

export function InvitationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setItems((await resources.invitations.list()) as any[]);
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
      const res = (await resources.invitations.create({ email, role: 'TENANT_USER' })) as any;
      setLastUrl(res.acceptUrl ?? null);
      setEmail('');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Invitations</h1>
        <p>Invite teammates by email.</p>
      </header>
      <form className="inline-form" onSubmit={onCreate}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@company.com" required />
        <button className="btn primary" type="submit">
          Invite
        </button>
      </form>
      {lastUrl && <p className="muted">Accept URL: {lastUrl}</p>}
      <PageState loading={loading} error={error}>
        <ul className="list">
          {items.map((i) => (
            <li key={i.id}>
              {i.email} · {i.status} · {i.role}
            </li>
          ))}
        </ul>
      </PageState>
    </section>
  );
}
