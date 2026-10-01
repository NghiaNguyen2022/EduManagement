import { getWorkApp } from "./work-apps";
export const pilotStatuses = [
  "new",
  "contacted",
  "piloting",
  "closed",
] as const;
export type PilotStatus = (typeof pilotStatuses)[number];
export const pilotStatusLabels: Record<PilotStatus, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  piloting: "Đang pilot",
  closed: "Kết thúc",
};
export function parsePilot(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Dữ liệu không hợp lệ.");
  const data = value as Record<string, unknown>;
  function field(name: string, max: number) {
    if (
      typeof data[name] !== "string" ||
      !data[name].trim() ||
      data[name].length > max
    )
      throw new Error(
        "Vui lòng kiểm tra các trường bắt buộc và độ dài nội dung.",
      );
    return data[name].trim();
  }
  const appSlug = field("appSlug", 80);
  if (!getWorkApp(appSlug) || data.consent !== "yes" || data.website)
    throw new Error("Đăng ký không hợp lệ hoặc chưa đồng ý liên hệ.");
  const contact = field("contact", 200);
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) &&
    !/^\+?[\d\s().-]{8,25}$/.test(contact)
  )
    throw new Error("Vui lòng nhập email hoặc số điện thoại hợp lệ.");
  return {
    appSlug,
    contact,
    name: field("name", 100),
    organization: field("organization", 200),
    need: field("need", 2000),
  };
}
