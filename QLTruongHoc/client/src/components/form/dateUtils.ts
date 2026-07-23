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

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Nhập tắt cho ngày: "t"/"d" = hôm nay; 1-2 số = ngày (tháng/năm lấy hiện
 * tại); 3-4 số = ngày+tháng (năm lấy hiện tại); 5 số = vẫn lấy năm hiện tại
 * (số thứ 5 là chữ số năm chưa gõ xong, chưa đủ để suy ra năm); 6 số = 2 số
 * cuối là 2 số cuối năm, tự thêm "20" phía trước; 7-8 số = năm đầy đủ như
 * gõ tay bình thường. Trả về `null` nếu không suy ra được ngày hợp lệ.
 */
export function resolveShorthandDate(
  raw: string,
  referenceDate: Date = new Date(),
): string | null {
  const trimmedLower = raw.trim().toLowerCase();

  if (trimmedLower === "t" || trimmedLower === "d") {
    const iso = [
      referenceDate.getFullYear(),
      pad2(referenceDate.getMonth() + 1),
      pad2(referenceDate.getDate()),
    ].join("-");

    return isValidIsoDate(iso) ? iso : null;
  }

  const digits = raw.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1;

  let day: number;
  let month: number;
  let year: number;

  if (digits.length <= 2) {
    day = Number(digits);
    month = currentMonth;
    year = currentYear;
  } else if (digits.length <= 5) {
    day = Number(digits.slice(0, 2));
    month = Number(digits.slice(2, 4));
    year = currentYear;
  } else if (digits.length === 6) {
    day = Number(digits.slice(0, 2));
    month = Number(digits.slice(2, 4));
    year = 2000 + Number(digits.slice(4, 6));
  } else {
    day = Number(digits.slice(0, 2));
    month = Number(digits.slice(2, 4));
    year = Number(digits.slice(4, 8));
  }

  if (!day || !month || !year) {
    return null;
  }

  const iso = `${String(year).padStart(4, "0")}-${pad2(month)}-${pad2(day)}`;

  return isValidIsoDate(iso) ? iso : null;
}
