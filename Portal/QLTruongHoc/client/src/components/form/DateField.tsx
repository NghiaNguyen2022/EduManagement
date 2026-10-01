import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { FormField } from "./FormField";
import {
  displayToIsoDate,
  isoToDisplayDate,
  normalizeDateTyping,
  resolveShorthandDate,
} from "./dateUtils";

type DateFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  min?: string;
  max?: string;
  name?: string;
};

const weekdayNames = [
  "CN",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
];

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function fromIsoDate(
  value: string,
): Date | null {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})$/,
  );

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(
    year,
    month - 1,
    day,
  );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function sameDate(
  first: Date,
  second: Date,
): boolean {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
}

function buildCalendarDays(
  year: number,
  month: number,
): Date[] {
  const firstDay = new Date(
    year,
    month,
    1,
  );

  const start = new Date(
    year,
    month,
    1 - firstDay.getDay(),
  );

  return Array.from(
    { length: 42 },
    (_, index) => {
      const date = new Date(start);

      date.setDate(
        start.getDate() + index,
      );

      return date;
    },
  );
}

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

  const wrapperRef =
    useRef<HTMLDivElement | null>(null);

  const selectedDate =
    fromIsoDate(value);

  const initialDate =
    selectedDate ?? new Date();

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

  const [
    calendarOpen,
    setCalendarOpen,
  ] = useState(false);

  const [
    viewYear,
    setViewYear,
  ] = useState(
    initialDate.getFullYear(),
  );

  const [
    viewMonth,
    setViewMonth,
  ] = useState(
    initialDate.getMonth(),
  );

  const today = new Date();

  const calendarDays =
    useMemo(
      () =>
        buildCalendarDays(
          viewYear,
          viewMonth,
        ),
      [viewYear, viewMonth],
    );

  useEffect(() => {
    setDisplayValue(
      isoToDisplayDate(value),
    );

    const date =
      fromIsoDate(value);

    if (date) {
      setViewYear(
        date.getFullYear(),
      );
      setViewMonth(
        date.getMonth(),
      );
    }
  }, [value]);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node,
        )
      ) {
        setCalendarOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  function isAllowed(
    isoValue: string,
  ) {
    if (
      min &&
      isoValue < min
    ) {
      return false;
    }

    if (
      max &&
      isoValue > max
    ) {
      return false;
    }

    return true;
  }

  function commitText() {
    if (!displayValue.trim()) {
      setInternalError("");
      onChange("");
      return;
    }

    const isoValue =
      displayToIsoDate(displayValue) ??
      resolveShorthandDate(displayValue);

    if (!isoValue) {
      setInternalError(
        "Ngày không hợp lệ. Nhập dd/mm/yyyy.",
      );
      return;
    }

    if (!isAllowed(isoValue)) {
      setInternalError(
        "Ngày nằm ngoài khoảng cho phép.",
      );
      return;
    }

    setInternalError("");
    setDisplayValue(
      isoToDisplayDate(isoValue),
    );
    onChange(isoValue);
  }

  function selectDate(
    date: Date,
  ) {
    const isoValue =
      toIsoDate(date);

    if (!isAllowed(isoValue)) {
      return;
    }

    setInternalError("");
    setDisplayValue(
      isoToDisplayDate(isoValue),
    );
    onChange(isoValue);
    setCalendarOpen(false);
  }

  function moveMonth(
    offset: number,
  ) {
    const next = new Date(
      viewYear,
      viewMonth + offset,
      1,
    );

    setViewYear(
      next.getFullYear(),
    );
    setViewMonth(
      next.getMonth(),
    );
  }

  function moveYear(
    offset: number,
  ) {
    setViewYear(
      (current) =>
        current + offset,
    );
  }

  return (
    <FormField
      label={label}
      required={required}
      error={
        error ||
        internalError
      }
      helpText={helpText}
      htmlFor={inputId}
    >
      <div
        className="premium-date-picker"
        ref={wrapperRef}
      >
        <div className="premium-date-picker__input-wrap">
          <input
            id={inputId}
            name={name}
            className="form-control"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={displayValue}
            required={required}
            disabled={disabled}
            placeholder="dd/mm/yyyy"
            maxLength={10}
            onChange={(event) => {
              const raw = event.target.value;
              const trimmedLower = raw.trim().toLowerCase();

              if (trimmedLower === "t" || trimmedLower === "d") {
                const shortcutIso = resolveShorthandDate(raw);

                if (shortcutIso && isAllowed(shortcutIso)) {
                  setInternalError("");
                  setDisplayValue(
                    isoToDisplayDate(shortcutIso),
                  );
                  onChange(shortcutIso);
                  return;
                }
              }

              const formatted =
                normalizeDateTyping(
                  raw,
                );

              setDisplayValue(
                formatted,
              );

              if (!formatted) {
                setInternalError("");
                onChange("");
              }
            }}
            onBlur={commitText}
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                commitText();
              }

              if (
                event.key ===
                "ArrowDown"
              ) {
                event.preventDefault();
                setCalendarOpen(true);
              }

              if (
                event.key === "Escape"
              ) {
                setCalendarOpen(false);
              }
            }}
          />

          <button
            type="button"
            className="premium-date-picker__trigger"
            aria-label="Mở lịch chọn ngày"
            disabled={disabled}
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={() =>
              setCalendarOpen(
                (current) =>
                  !current,
              )
            }
          >
            <span aria-hidden="true">
              ▣
            </span>
          </button>
        </div>

        {calendarOpen ? (
          <section
            className="premium-date-picker__popover"
            role="dialog"
            aria-label="Lịch chọn ngày"
          >
            <header className="premium-date-picker__header">
              <button
                type="button"
                aria-label="Năm trước"
                onClick={() =>
                  moveYear(-1)
                }
              >
                «
              </button>

              <button
                type="button"
                aria-label="Tháng trước"
                onClick={() =>
                  moveMonth(-1)
                }
              >
                ‹
              </button>

              <strong>
                Tháng{" "}
                {viewMonth + 1}{" "}
                {viewYear}
              </strong>

              <button
                type="button"
                aria-label="Tháng sau"
                onClick={() =>
                  moveMonth(1)
                }
              >
                ›
              </button>

              <button
                type="button"
                aria-label="Năm sau"
                onClick={() =>
                  moveYear(1)
                }
              >
                »
              </button>
            </header>

            <div className="premium-date-picker__weekdays">
              {weekdayNames.map(
                (weekday) => (
                  <span
                    key={weekday}
                  >
                    {weekday}
                  </span>
                ),
              )}
            </div>

            <div className="premium-date-picker__days">
              {calendarDays.map(
                (date) => {
                  const isoValue =
                    toIsoDate(date);

                  const outside =
                    date.getMonth() !==
                    viewMonth;

                  const selected =
                    selectedDate
                      ? sameDate(
                          date,
                          selectedDate,
                        )
                      : false;

                  const currentDay =
                    sameDate(
                      date,
                      today,
                    );

                  const unavailable =
                    !isAllowed(
                      isoValue,
                    );

                  return (
                    <button
                      type="button"
                      key={isoValue}
                      disabled={
                        unavailable
                      }
                      className={[
                        "premium-date-picker__day",
                        outside
                          ? "premium-date-picker__day--outside"
                          : "",
                        selected
                          ? "premium-date-picker__day--selected"
                          : "",
                        currentDay
                          ? "premium-date-picker__day--today"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() =>
                        selectDate(
                          date,
                        )
                      }
                    >
                      {
                        date.getDate()
                      }
                    </button>
                  );
                },
              )}
            </div>

            <footer className="premium-date-picker__footer">
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setDisplayValue("");
                  setInternalError("");
                  onChange("");
                  setCalendarOpen(false);
                }}
              >
                Xóa
              </button>

              <button
                type="button"
                className="text-button"
                disabled={
                  !isAllowed(
                    toIsoDate(today),
                  )
                }
                onClick={() =>
                  selectDate(today)
                }
              >
                Hôm nay
              </button>
            </footer>
          </section>
        ) : null}
      </div>
    </FormField>
  );
}
