export const formAppearance = {
  control: {
    height: 42,
    compactHeight: 36,
    radius: "10px",
    horizontalPadding: "12px",
    borderWidth: "1px",
  },

  field: {
    labelSize: "13px",
    labelWeight: 700,
    gap: "7px",
    helpSize: "12px",
  },

  number: {
    locale: "vi-VN",
    groupSeparator: ".",
    decimalSeparator: ",",
    maximumFractionDigits: 0,
  },

  currency: {
    locale: "vi-VN",
    currency: "VND",
    suffix: "₫",
    maximumFractionDigits: 0,
  },

  date: {
    displayFormat: "dd/mm/yyyy",
    placeholder: "dd/mm/yyyy",
    isoFormat: "yyyy-mm-dd",
  },

  dateTime: {
    datePlaceholder: "dd/mm/yyyy",
    timePlaceholder: "hh:mm",
  },

  dialog: {
    maxWidth: "460px",
  },
} as const;
