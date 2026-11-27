import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { loginSchema } from '@/features/auth/schemas';
import { getApiErrorMessage } from '@/shared/api/client';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setPending(true);
    try {
      const session = await login(parsed.data.email, parsed.data.password);
      navigate(session.user.isSuperAdmin ? '/admin' : '/app', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-panel">
        <p className="eyebrow">SaaS Core</p>
        <h1>Sign in</h1>
        <p className="lede">Access your workspace or platform console.</p>

        <form className="stack" onSubmit={onSubmit} noValidate>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="btn primary" type="submit" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          New workspace? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}
