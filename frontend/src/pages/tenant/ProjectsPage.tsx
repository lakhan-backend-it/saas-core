import { FormEvent, useEffect, useState } from 'react';
import { resources } from '@/shared/api/resources';
import { getApiErrorMessage } from '@/shared/api/client';
import { PageState } from '@/shared/components/PageState';

export function ProjectsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setItems((await resources.projects.list()) as any[]);
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
      await resources.projects.create({ name });
      setName('');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Projects</h1>
        <p>Tenant-scoped projects (plan limits enforced).</p>
      </header>
      <form className="inline-form" onSubmit={onCreate}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" required />
        <button className="btn primary" type="submit">
          Create
        </button>
      </form>
      <PageState loading={loading} error={error}>
        <ul className="list">
          {items.map((p) => (
            <li key={p.id}>
              {p.name}{' '}
              <button type="button" className="btn ghost" onClick={() => void resources.projects.remove(p.id).then(load)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </PageState>
    </section>
  );
}
