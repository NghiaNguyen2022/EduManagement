import { eq } from "drizzle-orm";

import { cauHinhMauIn } from "../../drizzle/schema.js";
import { getDb } from "./connection.js";
import { toDatabaseDateTime } from "../utils/dateTime.js";

const now = toDatabaseDateTime;

const CAU_HINH_MAC_DINH = {
  hienThiLogo: true,
  ghiChuFooter: null as string | null,
  nhanKyNguoiLap: "Người lập phiếu",
  nhanKyNguoiNop: "Phụ huynh / Người nộp",
  nhanKyDaiDienDonVi: "Đại diện đơn vị",
};

/** Đơn vị chưa từng cấu hình → mặc định, khớp hành vi trước khi có cấu hình. */
export async function getCauHinhMauIn(donViId: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(cauHinhMauIn)
    .where(eq(cauHinhMauIn.donViId, donViId))
    .limit(1);

  return rows[0] ?? { donViId, ...CAU_HINH_MAC_DINH };
}

export async function upsertCauHinhMauIn(input: {
  donViId: number;
  hienThiLogo: boolean;
  ghiChuFooter: string | null;
  nhanKyNguoiLap: string;
  nhanKyNguoiNop: string;
  nhanKyDaiDienDonVi: string;
  capNhatBoiId: number;
}) {
  const db = getDb();
  const updatedAt = now();

  await db
    .insert(cauHinhMauIn)
    .values({
      donViId: input.donViId,
      hienThiLogo: input.hienThiLogo,
      ghiChuFooter: input.ghiChuFooter,
      nhanKyNguoiLap: input.nhanKyNguoiLap,
      nhanKyNguoiNop: input.nhanKyNguoiNop,
      nhanKyDaiDienDonVi: input.nhanKyDaiDienDonVi,
      capNhatBoiId: input.capNhatBoiId,
      updatedAt,
    })
    .onDuplicateKeyUpdate({
      set: {
        hienThiLogo: input.hienThiLogo,
        ghiChuFooter: input.ghiChuFooter,
        nhanKyNguoiLap: input.nhanKyNguoiLap,
        nhanKyNguoiNop: input.nhanKyNguoiNop,
        nhanKyDaiDienDonVi: input.nhanKyDaiDienDonVi,
        capNhatBoiId: input.capNhatBoiId,
        updatedAt,
      },
    });

  return getCauHinhMauIn(input.donViId);
}
