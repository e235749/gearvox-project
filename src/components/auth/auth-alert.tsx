interface AuthAlertProps {
  message: string;
  variant?: "error" | "success";
}

export function AuthAlert({ message, variant = "error" }: AuthAlertProps) {
  const styles =
    variant === "success"
      ? "border-accent/40 bg-accent/10 text-foreground"
      : "border-red-500/40 bg-red-500/10 text-foreground";

  return (
    <p
      role="alert"
      className={`rounded-lg border px-4 py-3 text-sm ${styles}`}
    >
      {message}
    </p>
  );
}
