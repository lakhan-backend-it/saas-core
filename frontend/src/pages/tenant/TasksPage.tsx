import { FormEvent, useEffect, useState } from 'react';
import { resources } from '@/shared/api/resources';
import { getApiErrorMessage } from '@/shared/api/client';
import { PageState } from '@/shared/components/PageState';

export function TasksPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([resources.projects.list(), resources.tasks.list()]);
      setProjects(p as any[]);
      setTasks(t as any[]);
      setProjectId((p as any[])[0]?.id ?? '');
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
      await resources.tasks.create({ projectId, title });
      setTitle('');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Tasks</h1>
        <p>Feature-gated module — unavailable on Free plan.</p>
      </header>
      <form className="inline-form" onSubmit={onCreate}>
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required />
        <button className="btn primary" type="submit">
          Add task
        </button>
      </form>
      <PageState loading={loading} error={error}>
        <ul className="list">
          {tasks.map((t) => (
            <li key={t.id}>
              <label>
                <input
                  type="checkbox"
                  checked={!!t.isDone}
                  onChange={() => void resources.tasks.update(t.id, { isDone: !t.isDone }).then(load)}
                />{' '}
                {t.title}
              </label>
            </li>
          ))}
        </ul>
      </PageState>
    </section>
  );
}
