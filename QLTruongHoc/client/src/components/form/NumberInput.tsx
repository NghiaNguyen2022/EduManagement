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

type NumberInputProps = {
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
  allowDecimal?: boolean;
  maximumFractionDigits?: number;
  min?: number;
  max?: number;
  name?: string;
};

export function NumberInput({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  helpText,
  placeholder = "0",
  allowDecimal = false,
  maximumFractionDigits =
    formAppearance.number
      .maximumFractionDigits,
  min,
  max,
  name,
}: NumberInputProps) {
  const [
    displayValue,
    setDisplayValue,
  ] = useState(
    formatVietnameseNumber(
      value,
      maximumFractionDigits,
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
        maximumFractionDigits,
      ),
    );
  }, [
    value,
    maximumFractionDigits,
  ]);

  function commit(
    rawValue: string,
  ) {
    const parsed =
      parseVietnameseNumber(
        rawValue,
        allowDecimal,
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
        `Giá trị tối thiểu là ${formatVietnameseNumber(min, maximumFractionDigits)}.`,
      );
      return;
    }

    if (
      max !== undefined &&
      parsed > max
    ) {
      setInternalError(
        `Giá trị tối đa là ${formatVietnameseNumber(max, maximumFractionDigits)}.`,
      );
      return;
    }

    setInternalError("");
    setDisplayValue(
      formatVietnameseNumber(
        parsed,
        maximumFractionDigits,
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
      <input
        name={name}
        className="form-control form-control--number"
        type="text"
        inputMode={
          allowDecimal
            ? "decimal"
            : "numeric"
        }
        value={displayValue}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => {
          if (value !== null) {
            setDisplayValue(
              allowDecimal
                ? String(value).replace(
                    ".",
                    ",",
                  )
                : String(
                    Math.trunc(value),
                  ),
            );
          }
        }}
        onChange={(event) => {
          const raw =
            event.target.value;

          const allowed =
            allowDecimal
              ? raw.replace(
                  /[^\d,.-]/g,
                  "",
                )
              : raw.replace(
                  /[^\d-]/g,
                  "",
                );

          setDisplayValue(
            allowed,
          );
        }}
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
    </FormField>
  );
}
