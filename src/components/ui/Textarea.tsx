import { cn } from "@/lib/ui/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
  success?: boolean;
};

export function Textarea({
  label,
  hint,
  error,
  success,
  className,
  id,
  ...props
}: TextareaProps) {
  const inputId = id ?? props.name;

  return (
    <div className="ds-field">
      {label && (
        <label className="ds-field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn("ds-textarea", className)}
        data-error={error ? "true" : undefined}
        data-success={success ? "true" : undefined}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {hint && !error && <p className="ds-field__hint">{hint}</p>}
      {error && (
        <p className="ds-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
