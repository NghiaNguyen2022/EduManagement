import { createAuditLog } from "../db/audit.repository.js";
import { getCauHinhMauIn, upsertCauHinhMauIn } from "../db/mauIn.repository.js";

export async function getCauHinhMauInHienTai(donViId: number) {
  return getCauHinhMauIn(donViId);
}

export async function updateCauHinhMauIn(input: {
  donViId: number;
  hienThiLogo: boolean;
  ghiChuFooter: string | null;
  nhanKyNguoiLap: string;
  nhanKyNguoiNop: string;
  nhanKyDaiDienDonVi: string;
  actorUserId: number;
  ipAddress?: string;
}) {
  const updated = await upsertCauHinhMauIn({
    donViId: input.donViId,
    hienThiLogo: input.hienThiLogo,
    ghiChuFooter: input.ghiChuFooter?.trim() || null,
    nhanKyNguoiLap: input.nhanKyNguoiLap.trim() || "Người lập phiếu",
    nhanKyNguoiNop: input.nhanKyNguoiNop.trim() || "Phụ huynh / Người nộp",
    nhanKyDaiDienDonVi: input.nhanKyDaiDienDonVi.trim() || "Đại diện đơn vị",
    capNhatBoiId: input.actorUserId,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "cau_hinh_mau_in.update",
    objectType: "CauHinhMauIn",
    objectId: String(input.donViId),
    content: "Cập nhật thiết lập mẫu in.",
    ipAddress: input.ipAddress,
  });

  return updated;
}
