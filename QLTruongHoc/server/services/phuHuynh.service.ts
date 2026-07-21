import {
  createAuditLog,
} from "../db/audit.repository.js";
import {
  findHocSinhById,
} from "../db/hocSinh.repository.js";
import {
  clearPrimaryContact,
  countGuardianLinksForHocSinh,
  countPhuHuynhTheoMaPrefix,
  createGuardianLink,
  createPhuHuynh,
  deleteGuardianLink,
  findGuardianLink,
  findGuardianLinkById,
  findPhuHuynhByPhone,
  updateGuardianLink,
} from "../db/phuHuynh.repository.js";

type MoiQuanHe =
  | "cha"
  | "me"
  | "ong"
  | "ba"
  | "nguoi_giam_ho"
  | "khac";

const MOI_QUAN_HE_HOP_LE: MoiQuanHe[] = [
  "cha",
  "me",
  "ong",
  "ba",
  "nguoi_giam_ho",
  "khac",
];

async function sinhMaPhuHuynh(donViId: number) {
  const total = await countPhuHuynhTheoMaPrefix(donViId, "PH");
  const seq = total + 1;
  return `PH${String(seq).padStart(6, "0")}`;
}

export async function addGuardianToStudent(input: {
  donViId: number;
  hocSinhId: number;
  dienThoai: string;
  hoTen?: string;
  ngaySinh?: string | null;
  gioiTinh?: string | null;
  email?: string | null;
  ngheNghiep?: string | null;
  diaChi?: string | null;
  moiQuanHe: string;
  laLienHeChinh: boolean;
  duocDonTre: boolean;
  nhanThongBao: boolean;
  nhanThongTinHocPhi: boolean;
  actorUserId: number;
  ipAddress?: string;
}) {
  const student = await findHocSinhById(
    input.donViId,
    input.hocSinhId,
  );

  if (!student) {
    throw new Error("Không tìm thấy học sinh trong đơn vị hiện tại.");
  }

  const dienThoai = input.dienThoai.trim();

  if (!dienThoai) {
    throw new Error("Vui lòng nhập số điện thoại phụ huynh.");
  }

  if (!MOI_QUAN_HE_HOP_LE.includes(input.moiQuanHe as MoiQuanHe)) {
    throw new Error("Mối quan hệ không hợp lệ.");
  }

  let guardian = await findPhuHuynhByPhone(input.donViId, dienThoai);

  if (!guardian) {
    const hoTen = input.hoTen?.trim();

    if (!hoTen) {
      throw new Error(
        "Chưa có phụ huynh với số điện thoại này, vui lòng nhập họ tên để tạo hồ sơ mới.",
      );
    }

    const maPhuHuynh = await sinhMaPhuHuynh(input.donViId);

    guardian = await createPhuHuynh({
      donViId: input.donViId,
      maPhuHuynh,
      hoTen,
      ngaySinh: input.ngaySinh || null,
      gioiTinh:
        (input.gioiTinh as "nam" | "nu" | "khac" | undefined) ?? null,
      dienThoai,
      email: input.email?.trim() || null,
      ngheNghiep: input.ngheNghiep?.trim() || null,
      diaChi: input.diaChi?.trim() || null,
    });

    if (!guardian) {
      throw new Error("Không thể tạo hồ sơ phụ huynh.");
    }
  }

  const existedLink = await findGuardianLink(
    input.hocSinhId,
    guardian.id,
  );

  if (existedLink) {
    throw new Error("Phụ huynh này đã liên kết với học sinh.");
  }

  if (input.laLienHeChinh) {
    await clearPrimaryContact(input.hocSinhId);
  }

  const link = await createGuardianLink({
    hocSinhId: input.hocSinhId,
    phuHuynhId: guardian.id,
    moiQuanHe: input.moiQuanHe as MoiQuanHe,
    laLienHeChinh: input.laLienHeChinh,
    duocDonTre: input.duocDonTre,
    nhanThongBao: input.nhanThongBao,
    nhanThongTinHocPhi: input.nhanThongTinHocPhi,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "hoc_sinh.add_guardian",
    objectType: "HocSinhPhuHuynh",
    objectId: link ? String(link.id) : null,
    content: `Thêm phụ huynh ${guardian.hoTen} (${guardian.maPhuHuynh}) cho học sinh ${student.hoTen} (${student.maHocSinh}).`,
    ipAddress: input.ipAddress,
  });

  return { link, guardian };
}

export async function updateGuardianLinkInfo(input: {
  donViId: number;
  linkId: number;
  moiQuanHe: string;
  laLienHeChinh: boolean;
  duocDonTre: boolean;
  nhanThongBao: boolean;
  nhanThongTinHocPhi: boolean;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findGuardianLinkById(input.linkId);

  if (!found || found.donViId !== input.donViId) {
    throw new Error("Không tìm thấy liên kết phụ huynh.");
  }

  if (!MOI_QUAN_HE_HOP_LE.includes(input.moiQuanHe as MoiQuanHe)) {
    throw new Error("Mối quan hệ không hợp lệ.");
  }

  if (input.laLienHeChinh && !found.lienKet.laLienHeChinh) {
    await clearPrimaryContact(found.lienKet.hocSinhId);
  }

  const updated = await updateGuardianLink({
    id: input.linkId,
    moiQuanHe: input.moiQuanHe as MoiQuanHe,
    laLienHeChinh: input.laLienHeChinh,
    duocDonTre: input.duocDonTre,
    nhanThongBao: input.nhanThongBao,
    nhanThongTinHocPhi: input.nhanThongTinHocPhi,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật liên kết phụ huynh.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "hoc_sinh.update_guardian",
    objectType: "HocSinhPhuHuynh",
    objectId: String(updated.id),
    content: "Cập nhật thông tin liên kết phụ huynh - học sinh.",
    ipAddress: input.ipAddress,
  });

  return updated;
}

export async function removeGuardianLink(input: {
  donViId: number;
  linkId: number;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findGuardianLinkById(input.linkId);

  if (!found || found.donViId !== input.donViId) {
    throw new Error("Không tìm thấy liên kết phụ huynh.");
  }

  const total = await countGuardianLinksForHocSinh(
    found.lienKet.hocSinhId,
  );

  if (total <= 1) {
    throw new Error(
      "Không thể gỡ liên kết cuối cùng của học sinh. Cần thêm phụ huynh khác trước.",
    );
  }

  if (found.lienKet.laLienHeChinh) {
    throw new Error(
      "Đây là liên hệ chính. Vui lòng chỉ định liên hệ chính khác trước khi gỡ.",
    );
  }

  await deleteGuardianLink(input.linkId);

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "hoc_sinh.remove_guardian",
    objectType: "HocSinhPhuHuynh",
    objectId: String(input.linkId),
    content: "Gỡ liên kết phụ huynh - học sinh.",
    ipAddress: input.ipAddress,
  });
}
