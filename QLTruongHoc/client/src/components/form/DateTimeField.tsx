import { FormField } from "./FormField";

type DateTimeFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  min?: string;
  max?: string;
};

export function DateTimeField({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  min,
  max,
}: DateTimeFieldProps) {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
    >
      <input
        className="form-control"
        type="datetime-local"
        value={value}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </FormField>
  );
}
