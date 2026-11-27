import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { registerSchema } from '@/features/auth/schemas';
import { getApiErrorMessage } from '@/shared/api/client';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = registerSchema.safeParse({ fullName, tenantName, email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setPending(true);
    try {
      await register(parsed.data);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed'));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-panel">
        <p className="eyebrow">SaaS Core</p>
        <h1>Create workspace</h1>
        <p className="lede">Spin up a tenant and admin account in one step.</p>

        <form className="stack" onSubmit={onSubmit} noValidate>
          <label className="field">
            <span>Your name</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Morgan" />
          </label>
          <label className="field">
            <span>Workspace name</span>
            <input value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="Acme Inc" />
          </label>
          <label className="field">
            <span>Work email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@acme.com"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, letter + number"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="btn primary" type="submit" disabled={pending}>
            {pending ? 'Creating…' : 'Create workspace'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
