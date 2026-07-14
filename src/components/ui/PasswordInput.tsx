"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/ui/cn";

export type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: string;
  hint?: string;
  error?: string;
  success?: boolean;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ label, hint, error, success, className, id, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? props.name ?? "password";

    return (
      <div className="ds-field">
        {label && (
          <label className="ds-field__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <div className="ds-input-password">
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            className={cn("ds-input ds-input--with-toggle", className)}
            data-error={error ? "true" : undefined}
            data-success={success ? "true" : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
          <button
            type="button"
            className="ds-input-password__toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={visible}
            tabIndex={0}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
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
  }
);
