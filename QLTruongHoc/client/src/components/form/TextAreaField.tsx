import { FormField } from "./FormField";

type TextAreaFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  rows?: number;
  name?: string;
};

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  rows = 5,
  name,
}: TextAreaFieldProps) {
  return (
    <FormField label={label} required={required} error={error} helpText={helpText}>
      <textarea
        className="form-control"
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        name={name}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormField>
  );
}
