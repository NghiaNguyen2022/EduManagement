type FormFieldProps = {
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormField({
  label,
  required = false,
  error,
  helpText,
  htmlFor,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <label
      className={[
        "form-field",
        error ? "form-field--error" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      htmlFor={htmlFor}
    >
      {label ? (
        <span className="form-field__label">
          {label}
          {required ? (
            <b aria-hidden="true"> *</b>
          ) : null}
        </span>
      ) : null}

      {children}

      {error ? (
        <small className="form-field__error">
          {error}
        </small>
      ) : helpText ? (
        <small className="form-field__help">
          {helpText}
        </small>
      ) : null}
    </label>
  );
}
