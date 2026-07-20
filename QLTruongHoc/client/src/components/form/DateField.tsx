import {
  useEffect,
  useId,
  useState,
} from "react";

import {
  formAppearance,
} from "../../config/formAppearance";
import {
  FormField,
} from "./FormField";
import {
  displayToIsoDate,
  isoToDisplayDate,
  normalizeDateTyping,
} from "./dateUtils";

type DateFieldProps = {
  label?: string;

  /**
   * Giá trị chuẩn ISO: yyyy-mm-dd.
   * Ví dụ: 2026-07-20.
   */
  value: string;

  /**
   * Trả về giá trị ISO yyyy-mm-dd.
   * Khi xóa input, trả về chuỗi rỗng.
   */
  onChange: (value: string) => void;

  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  min?: string;
  max?: string;
  name?: string;
};

export function DateField({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  helpText,
  min,
  max,
  name,
}: DateFieldProps) {
  const generatedId = useId();
  const inputId =
    name || `date-field-${generatedId}`;

  const [
    displayValue,
    setDisplayValue,
  ] = useState(
    isoToDisplayDate(value),
  );

  const [
    internalError,
    setInternalError,
  ] = useState("");

  useEffect(() => {
    setDisplayValue(
      isoToDisplayDate(value),
    );
  }, [value]);

  function validateAndCommit(
    nextDisplayValue: string,
  ) {
    if (!nextDisplayValue.trim()) {
      setInternalError("");
      onChange("");
      return;
    }

    const isoValue =
      displayToIsoDate(
        nextDisplayValue,
      );

    if (!isoValue) {
      setInternalError(
        "Ngày không hợp lệ. Dùng định dạng dd/mm/yyyy.",
      );
      return;
    }

    if (min && isoValue < min) {
      setInternalError(
        `Ngày phải từ ${isoToDisplayDate(min)} trở đi.`,
      );
      return;
    }

    if (max && isoValue > max) {
      setInternalError(
        `Ngày không được sau ${isoToDisplayDate(max)}.`,
      );
      return;
    }

    setInternalError("");
    setDisplayValue(
      isoToDisplayDate(isoValue),
    );
    onChange(isoValue);
  }

  return (
    <FormField
      label={label}
      required={required}
      error={error || internalError}
      helpText={helpText}
      htmlFor={inputId}
    >
      <div className="date-control">
        <input
          id={inputId}
          name={name}
          className="form-control"
          type="text"
          inputMode="numeric"
          value={displayValue}
          required={required}
          disabled={disabled}
          placeholder={
            formAppearance.date.placeholder
          }
          maxLength={10}
          autoComplete="off"
          onChange={(event) => {
            const formatted =
              normalizeDateTyping(
                event.target.value,
              );

            setDisplayValue(
              formatted,
            );

            if (!formatted) {
              setInternalError("");
              onChange("");
            }
          }}
          onBlur={() =>
            validateAndCommit(
              displayValue,
            )
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter"
            ) {
              validateAndCommit(
                displayValue,
              );
            }
          }}
        />

        <span
          className="date-control__format"
          aria-hidden="true"
        >
          dd/mm/yyyy
        </span>
      </div>
    </FormField>
  );
}
