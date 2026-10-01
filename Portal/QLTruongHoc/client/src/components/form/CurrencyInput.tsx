import {
  useEffect,
  useState,
} from "react";

import {
  formAppearance,
} from "../../config/formAppearance";
import {
  FormField,
} from "./FormField";
import {
  formatVietnameseNumber,
  parseVietnameseNumber,
} from "./numberUtils";

type CurrencyInputProps = {
  label?: string;
  value: number | null;
  onChange: (
    value: number | null,
  ) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  name?: string;
};

export function CurrencyInput({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  helpText,
  placeholder = "0",
  min = 0,
  max,
  name,
}: CurrencyInputProps) {
  const [
    displayValue,
    setDisplayValue,
  ] = useState(
    formatVietnameseNumber(
      value,
      formAppearance.currency
        .maximumFractionDigits,
    ),
  );

  const [
    internalError,
    setInternalError,
  ] = useState("");

  useEffect(() => {
    setDisplayValue(
      formatVietnameseNumber(
        value,
        formAppearance.currency
          .maximumFractionDigits,
      ),
    );
  }, [value]);

  function commit(
    rawValue: string,
  ) {
    const parsed =
      parseVietnameseNumber(
        rawValue,
        false,
      );

    if (parsed === null) {
      setInternalError("");
      setDisplayValue("");
      onChange(null);
      return;
    }

    if (
      min !== undefined &&
      parsed < min
    ) {
      setInternalError(
        `Số tiền tối thiểu là ${formatVietnameseNumber(min)} ₫.`,
      );
      return;
    }

    if (
      max !== undefined &&
      parsed > max
    ) {
      setInternalError(
        `Số tiền tối đa là ${formatVietnameseNumber(max)} ₫.`,
      );
      return;
    }

    setInternalError("");
    setDisplayValue(
      formatVietnameseNumber(
        parsed,
      ),
    );
    onChange(parsed);
  }

  return (
    <FormField
      label={label}
      required={required}
      error={error || internalError}
      helpText={helpText}
    >
      <div className="currency-control">
        <input
          name={name}
          className="form-control form-control--number"
          type="text"
          inputMode="numeric"
          value={displayValue}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => {
            if (value !== null) {
              setDisplayValue(
                String(
                  Math.trunc(value),
                ),
              );
            }
          }}
          onChange={(event) =>
            setDisplayValue(
              event.target.value.replace(
                /[^\d]/g,
                "",
              ),
            )
          }
          onBlur={() =>
            commit(displayValue)
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter"
            ) {
              commit(
                displayValue,
              );
            }
          }}
        />

        <span>
          {
            formAppearance.currency
              .suffix
          }
        </span>
      </div>
    </FormField>
  );
}
