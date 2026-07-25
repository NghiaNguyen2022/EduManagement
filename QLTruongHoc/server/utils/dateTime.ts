export const BUSINESS_TIME_ZONE = "Asia/Ho_Chi_Minh";

function partsInBusinessTimeZone(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}

export function toDatabaseDateTime(date = new Date()) {
  const parts = partsInBusinessTimeZone(date);

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

export function todayInBusinessTimeZone(date = new Date()) {
  return toDatabaseDateTime(date).slice(0, 10);
}
