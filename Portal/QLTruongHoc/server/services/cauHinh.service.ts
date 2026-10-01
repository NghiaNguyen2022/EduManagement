import { createAuditLog } from "../db/audit.repository.js";
import { findCauHinhHeThong, updateCauHinhHeThong } from "../db/cauHinh.repository.js";

const GIOI_HAN = {
  soLanDangNhapSaiToiDa: { min: 3, max: 20 },
  soPhutKhoaDangNhap: { min: 1, max: 1440 },
  doDaiMatKhauToiThieu: { min: 6, max: 32 },
};

export async function getCauHinhHeThong() {
  const config = await findCauHinhHeThong();

  if (!config) {
    throw new Error("Chưa có cấu hình hệ thống.");
  }

  return config;
}

export async function updateCauHinh(input: {
  soLanDangNhapSaiToiDa: number;
  soPhutKhoaDangNhap: number;
  doDaiMatKhauToiThieu: number;
  actorUserId: number;
  ipAddress?: string;
}) {
  for (const [field, { min, max }] of Object.entries(GIOI_HAN)) {
    const value = input[field as keyof typeof GIOI_HAN];

    if (!Number.isInteger(value) || value < min || value > max) {
      throw new Error(
        `Giá trị "${field}" phải là số nguyên trong khoảng ${min}–${max}.`,
      );
    }
  }

  const updated = await updateCauHinhHeThong({
    soLanDangNhapSaiToiDa: input.soLanDangNhapSaiToiDa,
    soPhutKhoaDangNhap: input.soPhutKhoaDangNhap,
    doDaiMatKhauToiThieu: input.doDaiMatKhauToiThieu,
    capNhatBoiId: input.actorUserId,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật cấu hình hệ thống.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    action: "cau_hinh_he_thong.update",
    objectType: "CauHinhHeThong",
    objectId: "1",
    content: `Cập nhật cấu hình hệ thống: tối đa ${updated.soLanDangNhapSaiToiDa} lần đăng nhập sai, khoá ${updated.soPhutKhoaDangNhap} phút, mật khẩu tối thiểu ${updated.doDaiMatKhauToiThieu} ký tự.`,
    ipAddress: input.ipAddress,
  });

  return updated;
}
