export function parseVietnameseNumber(
  value: string,
  allowDecimal = false,
): number | null {
  let normalized = value
    .trim()
    .replace(/\s/g, "")
    .replace(/\./g, "");

  if (allowDecimal) {
    normalized = normalized.replace(
      ",",
      ".",
    );
  } else {
    normalized = normalized.replace(
      /[^\d-]/g,
      "",
    );
  }

  if (
    normalized === "" ||
    normalized === "-"
  ) {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

export function formatVietnameseNumber(
  value: number | null,
  maximumFractionDigits = 0,
): string {
  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return "";
  }

  return new Intl.NumberFormat(
    "vi-VN",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits,
    },
  ).format(value);
}
