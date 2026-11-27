import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resources } from '@/shared/api/resources';
import { getApiErrorMessage } from '@/shared/api/client';

export function AcceptInvitePage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await resources.invitations.accept({ token, fullName, password });
      navigate('/login');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-panel">
        <p className="eyebrow">SaaS Core</p>
        <h1>Accept invite</h1>
        <p className="lede">Create your password to join the workspace.</p>
        <form className="stack" onSubmit={onSubmit}>
          <label className="field">
            <span>Full name</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn primary" type="submit" disabled={pending || !token}>
            {pending ? 'Joining…' : 'Join workspace'}
          </button>
        </form>
        <p className="auth-footer">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
