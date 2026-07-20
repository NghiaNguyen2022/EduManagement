import { nhatKyHeThong } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

export type AuditLevel = "thong_tin" | "canh_bao" | "loi";

export async function createAuditLog(input: {
  userId?: number | null;
  organizationId?: number | null;
  action: string;
  objectType?: string | null;
  objectId?: string | null;
  content?: string | null;
  data?: unknown;
  level?: AuditLevel;
  ipAddress?: string | null;
}) {
  const db = getDb();

  await db.insert(nhatKyHeThong).values({
    nguoiDungId: input.userId ?? null,
    donViId: input.organizationId ?? null,
    hanhDong: input.action,
    doiTuong: input.objectType ?? null,
    doiTuongId: input.objectId ?? null,
    noiDung: input.content ?? null,
    duLieu:
      input.data === undefined
        ? null
        : JSON.stringify(input.data),
    mucDo: input.level ?? "thong_tin",
    diaChiIp: input.ipAddress ?? null,
    createdAt: now(),
  });
}
