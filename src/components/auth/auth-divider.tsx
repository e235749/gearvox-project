export function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted">または</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
