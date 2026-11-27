export function PageState({
  loading,
  error,
  children,
}: {
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
  if (loading) return <p className="muted">Loading…</p>;
  if (error) return <p className="form-error">{error}</p>;
  return <>{children}</>;
}
