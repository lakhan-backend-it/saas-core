import { FormEvent, useEffect, useState } from 'react';
import { resources } from '@/shared/api/resources';
import { getApiErrorMessage } from '@/shared/api/client';
import { PageState } from '@/shared/components/PageState';

type Feature = { id: string; key: string; name: string; description?: string | null };

export function FeaturesPage() {
  const [items, setItems] = useState<Feature[]>([]);
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setItems((await resources.features.list()) as Feature[]);
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
      await resources.features.create({ key, name });
      setKey('');
      setName('');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Features</h1>
        <p>Feature catalog used by plan gating.</p>
      </header>
      <form className="inline-form" onSubmit={onCreate}>
        <input placeholder="key" value={key} onChange={(e) => setKey(e.target.value)} required />
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <button className="btn primary" type="submit">
          Add
        </button>
      </form>
      <PageState loading={loading} error={error}>
        <ul className="list">
          {items.map((f) => (
            <li key={f.id}>
              <strong>{f.key}</strong> — {f.name}
            </li>
          ))}
        </ul>
      </PageState>
    </section>
  );
}
