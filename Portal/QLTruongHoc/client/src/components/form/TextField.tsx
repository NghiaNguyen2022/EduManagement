import { FormField } from "./FormField";

type TextFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password" | "search" | "tel" | "time";
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  autoComplete?: string;
  name?: string;
};

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  error,
  helpText,
  autoComplete,
  name,
}: TextFieldProps) {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
    >
      <input
        className="form-control"
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        name={name}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </FormField>
  );
}
