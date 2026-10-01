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

      {/*
        Luôn render slot này (kể cả rỗng) và giữ chiều cao cố định qua CSS
        (`.form-field__error`/`.form-field__help` có `min-height`) — để khi
        lỗi validation xuất hiện/biến mất, control không bị đẩy lên/xuống so
        với các control khác cùng hàng (grid `align-items: end` ở nhiều form
        dùng chung sẽ lệch hàng nếu chiều cao từng field thay đổi).
      */}
      {error ? (
        <small className="form-field__error">
          {error}
        </small>
      ) : (
        <small className="form-field__help">
          {helpText ?? ""}
        </small>
      )}
    </label>
  );
}
