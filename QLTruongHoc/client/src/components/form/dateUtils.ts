export function isValidIsoDate(
  value: string,
): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
  );

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function isoToDisplayDate(
  value: string,
): string {
  if (!isValidIsoDate(value)) {
    return "";
  }

  const [year, month, day] =
    value.split("-");

  return `${day}/${month}/${year}`;
}

export function displayToIsoDate(
  value: string,
): string | null {
  const normalized = value.trim();

  const match = normalized.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
  );

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const iso = [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");

  return isValidIsoDate(iso)
    ? iso
    : null;
}

export function normalizeDateTyping(
  value: string,
): string {
  const digits = value
    .replace(/\D/g, "")
    .slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}
