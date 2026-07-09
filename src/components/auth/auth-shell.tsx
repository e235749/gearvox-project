interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-4 py-12">
      <section className="space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-muted">GearVox</p>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted">{description}</p>
        </header>
        {children}
      </section>
    </main>
  );
}
