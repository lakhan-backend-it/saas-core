import { FormEvent, useEffect, useState } from 'react';
import { resources } from '@/shared/api/resources';
import { getApiErrorMessage } from '@/shared/api/client';
import { PageState } from '@/shared/components/PageState';

export function UsersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('TenantUser1!');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setItems((await resources.users.list()) as any[]);
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
      await resources.users.create({ email, fullName, password, role: 'TENANT_USER' });
      setEmail('');
      setFullName('');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Users</h1>
        <p>Members of this workspace.</p>
      </header>
      <form className="inline-form" onSubmit={onCreate}>
        <input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn primary" type="submit">
          Add user
        </button>
      </form>
      <PageState loading={loading} error={error}>
        <ul className="list">
          {items.map((u) => (
            <li key={u.id}>
              {u.fullName} · {u.email} · {u.role}
            </li>
          ))}
        </ul>
      </PageState>
    </section>
  );
}
