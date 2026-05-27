export function AdminCard({
  title,
  step,
  description,
  children,
  className = "",
}: {
  title: string;
  step?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`card p-6 ${className}`}>
      <div className="mb-5 flex items-start gap-3">
        {step && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-bold text-white">
            {step}
          </span>
        )}
        <div>
          <h2 className="font-display text-lg font-bold">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

export function AdminField({
  label,
  name,
  type = "text",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {label}
      </label>
      <input
        name={name}
        type={type}
        className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-muted)]"
        {...rest}
      />
    </div>
  );
}
