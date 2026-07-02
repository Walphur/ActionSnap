import { forwardRef } from "react";
import { cn } from "@/lib/ui/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  success?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, success, className, id, ...props },
  ref
) {
  const inputId = id ?? props.name;

  return (
    <div className="ds-field">
      {label && (
        <label className="ds-field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn("ds-input", className)}
        data-error={error ? "true" : undefined}
        data-success={success ? "true" : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {hint && !error && (
        <p className="ds-field__hint" id={`${inputId}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="ds-field__error" id={`${inputId}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
