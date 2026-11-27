import { FormEvent, useEffect, useState } from 'react';
import { resources } from '@/shared/api/resources';
import { getApiErrorMessage } from '@/shared/api/client';
import { PageState } from '@/shared/components/PageState';

export function FilesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setItems((await resources.files.list()) as any[]);
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

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = (e.currentTarget.elements.namedItem('file') as HTMLInputElement)?.files?.[0];
    if (!input) return;
    const buffer = await input.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
    const contentBase64 = btoa(binary);
    try {
      await resources.files.upload({
        fileName: input.name,
        mimeType: input.type || 'application/octet-stream',
        contentBase64,
      });
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Files</h1>
        <p>Feature-gated uploads (Pro plan).</p>
      </header>
      <form className="inline-form" onSubmit={onUpload}>
        <input name="file" type="file" required />
        <button className="btn primary" type="submit">
          Upload
        </button>
      </form>
      <PageState loading={loading} error={error}>
        <ul className="list">
          {items.map((f) => (
            <li key={f.id}>
              {f.fileName} · {f.sizeBytes} bytes
            </li>
          ))}
        </ul>
      </PageState>
    </section>
  );
}
