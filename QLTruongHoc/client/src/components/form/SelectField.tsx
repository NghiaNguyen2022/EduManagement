import { FormField } from "./FormField";

export type SelectOption = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

type SelectFieldProps = {
  label?: string;
  value: string | number;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
};

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = "Chọn dữ liệu",
  required = false,
  disabled = false,
  error,
  helpText,
}: SelectFieldProps) {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
    >
      <select
        className="form-control"
        value={value}
        required={required}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={String(option.value)}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
