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
        aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
        {...props}
      >
        {children}
      </select>
      {hint && !error && (
        <p className="ds-field__hint" id={`${selectId}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="ds-field__error" id={`${selectId}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
