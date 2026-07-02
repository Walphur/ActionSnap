import { cn } from "@/lib/ui/cn";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Select({ label, hint, error, className, id, children, ...props }: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <div className="ds-field">
      {label && (
        <label className="ds-field__label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn("ds-select", className)}
        data-error={error ? "true" : undefined}
        aria-invalid={error ? true : undefined}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <p className="ds-field__hint">{hint}</p>}
      {error && (
        <p className="ds-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
