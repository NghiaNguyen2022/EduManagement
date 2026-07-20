import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

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

const monthNames = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const weekdayNames = [
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "CN",
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

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date;
}

function sameDate(
  a: Date,
  b: Date,
): boolean {
  return (
    a.getFullYear() ===
      b.getFullYear() &&
    a.getMonth() ===
      b.getMonth() &&
    a.getDate() ===
      b.getDate()
  );
}

function buildCalendarDays(
  year: number,
  month: number,
) {
  const firstDay = new Date(
    year,
    month,
    1,
  );

  const nativeWeekday =
    firstDay.getDay();

  const mondayBasedOffset =
    nativeWeekday === 0
      ? 6
      : nativeWeekday - 1;

  const start = new Date(
    year,
    month,
    1 - mondayBasedOffset,
  );

  return Array.from(
    { length: 42 },
    (_, index) => {
      const date = new Date(
        start,
      );

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

  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const initialDate =
    fromIsoDate(value) ??
    new Date();

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

  const selectedDate =
    fromIsoDate(value);

  const today = new Date();

  const calendarDays =
    useMemo(
      () =>
        buildCalendarDays(
          viewYear,
          viewMonth,
        ),
      [
        viewYear,
        viewMonth,
      ],
    );

  useEffect(() => {
    setDisplayValue(
      isoToDisplayDate(value),
    );

    const nextDate =
      fromIsoDate(value);

    if (nextDate) {
      setViewYear(
        nextDate.getFullYear(),
      );
      setViewMonth(
        nextDate.getMonth(),
      );
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setCalendarOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  function isDateAllowed(
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

  function validateAndCommit(
    nextDisplayValue: string,
  ) {
    if (
      !nextDisplayValue.trim()
    ) {
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
        "Ngày không hợp lệ. Nhập theo dd/mm/yyyy.",
      );
      return;
    }

    if (
      !isDateAllowed(
        isoValue,
      )
    ) {
      setInternalError(
        "Ngày nằm ngoài khoảng cho phép.",
      );
      return;
    }

    setInternalError("");
    setDisplayValue(
      isoToDisplayDate(
        isoValue,
      ),
    );
    onChange(isoValue);
  }

  function selectDate(
    date: Date,
  ) {
    const isoValue =
      toIsoDate(date);

    if (
      !isDateAllowed(
        isoValue,
      )
    ) {
      return;
    }

    setInternalError("");
    setDisplayValue(
      isoToDisplayDate(
        isoValue,
      ),
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
        className="vn-date-picker"
        ref={containerRef}
      >
        <div className="vn-date-picker__control">
          <input
            id={inputId}
            name={name}
            className="form-control"
            type="text"
            inputMode="numeric"
            value={displayValue}
            required={required}
            disabled={disabled}
            placeholder="dd/mm/yyyy"
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

              if (
                event.key ===
                "ArrowDown"
              ) {
                event.preventDefault();
                setCalendarOpen(true);
              }
            }}
          />

          <button
            type="button"
            className="vn-date-picker__trigger"
            aria-label="Mở lịch"
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
              ▦
            </span>
          </button>
        </div>

        {calendarOpen ? (
          <section
            className="vn-date-picker__popover"
            role="dialog"
            aria-label="Chọn ngày"
          >
            <header className="vn-date-picker__header">
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
                {
                  monthNames[
                    viewMonth
                  ]
                }{" "}
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
            </header>

            <div className="vn-date-picker__weekdays">
              {weekdayNames.map(
                (weekday) => (
                  <span
                    key={
                      weekday
                    }
                  >
                    {weekday}
                  </span>
                ),
              )}
            </div>

            <div className="vn-date-picker__days">
              {calendarDays.map(
                (date) => {
                  const isoValue =
                    toIsoDate(
                      date,
                    );

                  const outsideMonth =
                    date.getMonth() !==
                    viewMonth;

                  const selected =
                    selectedDate
                      ? sameDate(
                          date,
                          selectedDate,
                        )
                      : false;

                  const isToday =
                    sameDate(
                      date,
                      today,
                    );

                  const disabledDay =
                    !isDateAllowed(
                      isoValue,
                    );

                  return (
                    <button
                      type="button"
                      key={isoValue}
                      disabled={
                        disabledDay
                      }
                      className={[
                        "vn-date-picker__day",
                        outsideMonth
                          ? "vn-date-picker__day--outside"
                          : "",
                        selected
                          ? "vn-date-picker__day--selected"
                          : "",
                        isToday
                          ? "vn-date-picker__day--today"
                          : "",
                      ]
                        .filter(
                          Boolean,
                        )
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

            <footer className="vn-date-picker__footer">
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
                  !isDateAllowed(
                    toIsoDate(
                      today,
                    ),
                  )
                }
                onClick={() =>
                  selectDate(
                    today,
                  )
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
