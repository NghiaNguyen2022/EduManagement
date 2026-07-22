import { hash } from "bcryptjs";

import { createAuditLog } from "../db/audit.repository.js";
import { findDonViById } from "../db/donVi.repository.js";
import { findHocSinhById } from "../db/hocSinh.repository.js";
import {
  clearPrimaryContact,
  countGuardianLinksForHocSinh,
  countPhuHuynhTheoMaPrefix,
  createGuardianLink,
  createPhuHuynh,
  deleteGuardianLink,
  findGuardianLink,
  findGuardianLinkById,
  findPhuHuynhById,
  findPhuHuynhByPhoneGlobal,
  listPhuHuynhByNguoiDungId,
  updateGuardianLink,
  updatePhuHuynhNguoiDungId,
} from "../db/phuHuynh.repository.js";
import { findRoleByCode } from "../db/role.repository.js";
import { createUserWithRole, findUserById, findUserByUsername } from "../db/user.repository.js";
import { createTemporaryPassword } from "./user.service.js";

/**
 * Danh sách đơn vị mà tài khoản này là phụ huynh (có con đang học), dùng để
 * gộp dữ liệu chỉ-xem (thông báo, học phí...) đúng phạm vi con của họ — thay
 * vì dựa vào đơn vị "đang chọn" của phiên đăng nhập (chỉ là nơi neo phiên,
 * xem `docs/analysis/D01_D03_ho_so_hoc_sinh_phu_huynh.md` mục 11).
 */
export async function getGuardianDonViIds(userId: number) {
  const guardians = await listPhuHuynhByNguoiDungId(userId);

  return Array.from(new Set(guardians.map((guardian) => guardian.donViId)));
}

/**
 * Ném ra khi số điện thoại đã khớp một hồ sơ phụ huynh thuộc đơn vị KHÁC đơn vị
 * đang thao tác — đúng chủ đích "một phụ huynh có con học nhiều đơn vị" (dùng
 * chung 1 hồ sơ/tài khoản), nhưng cần người dùng xác nhận rõ ràng trước khi
 * gộp, để tránh gán nhầm danh tính chỉ vì trùng số điện thoại giữa 2 đơn vị
 * không liên quan.
 */
export class CrossOrgGuardianConfirmError extends Error {
  guardianInfo: {
    hoTen: string;
    maPhuHuynh: string;
    donVi: { id: number; maDonVi: string; tenDonVi: string };
  };

  constructor(guardianInfo: CrossOrgGuardianConfirmError["guardianInfo"]) {
    super(
      `Số điện thoại này đã là phụ huynh ${guardianInfo.hoTen} (${guardianInfo.maPhuHuynh}) tại đơn vị ${guardianInfo.donVi.tenDonVi}. Vui lòng xác nhận để dùng chung hồ sơ cho phụ huynh có con học nhiều đơn vị.`,
    );
    this.guardianInfo = guardianInfo;
  }
}

type MoiQuanHe = "cha" | "me" | "ong" | "ba" | "nguoi_giam_ho" | "khac";

const MOI_QUAN_HE_HOP_LE: MoiQuanHe[] = ["cha", "me", "ong", "ba", "nguoi_giam_ho", "khac"];

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
  /**
   * Bắt buộc = true khi số điện thoại khớp một hồ sơ phụ huynh ở đơn vị
   * khác — người dùng đã xem thông tin hồ sơ đó và xác nhận đây đúng là
   * cùng một phụ huynh (có con học nhiều đơn vị), không phải trùng lặp
   * ngẫu nhiên. Xem `CrossOrgGuardianConfirmError`.
   */
  confirmCrossOrgReuse?: boolean;
  actorUserId: number;
  ipAddress?: string;
}) {
  const student = await findHocSinhById(input.donViId, input.hocSinhId);

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

  let guardian = await findPhuHuynhByPhoneGlobal(dienThoai);
  let isCrossOrgReuse = false;

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
      gioiTinh: (input.gioiTinh as "nam" | "nu" | "khac" | undefined) ?? null,
      dienThoai,
      email: input.email?.trim() || null,
      ngheNghiep: input.ngheNghiep?.trim() || null,
      diaChi: input.diaChi?.trim() || null,
    });

    if (!guardian) {
      throw new Error("Không thể tạo hồ sơ phụ huynh.");
    }
  } else if (guardian.donViId !== input.donViId) {
    isCrossOrgReuse = true;

    if (!input.confirmCrossOrgReuse) {
      const guardianDonVi = await findDonViById(guardian.donViId);

      throw new CrossOrgGuardianConfirmError({
        hoTen: guardian.hoTen,
        maPhuHuynh: guardian.maPhuHuynh,
        donVi: guardianDonVi
          ? {
              id: guardianDonVi.id,
              maDonVi: guardianDonVi.maDonVi,
              tenDonVi: guardianDonVi.tenDonVi,
            }
          : {
              id: guardian.donViId,
              maDonVi: `DV-${guardian.donViId}`,
              tenDonVi: "Đơn vị khác",
            },
      });
    }
  }

  const existedLink = await findGuardianLink(input.hocSinhId, guardian.id);

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
    action: isCrossOrgReuse ? "hoc_sinh.add_guardian_cross_org" : "hoc_sinh.add_guardian",
    objectType: "HocSinhPhuHuynh",
    objectId: link ? String(link.id) : null,
    content: isCrossOrgReuse
      ? `Thêm phụ huynh ${guardian.hoTen} (${guardian.maPhuHuynh}, hồ sơ gốc ở đơn vị #${guardian.donViId}) cho học sinh ${student.hoTen} (${student.maHocSinh}) — đã xác nhận dùng chung hồ sơ khác đơn vị.`
      : `Thêm phụ huynh ${guardian.hoTen} (${guardian.maPhuHuynh}) cho học sinh ${student.hoTen} (${student.maHocSinh}).`,
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

  const total = await countGuardianLinksForHocSinh(found.lienKet.hocSinhId);

  if (total <= 1) {
    throw new Error("Không thể gỡ liên kết cuối cùng của học sinh. Cần thêm phụ huynh khác trước.");
  }

  if (found.lienKet.laLienHeChinh) {
    throw new Error("Đây là liên hệ chính. Vui lòng chỉ định liên hệ chính khác trước khi gỡ.");
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

function normalizeUsernameFromPhone(dienThoai: string) {
  return dienThoai.replace(/[^0-9]/g, "");
}

async function sinhTenDangNhapPhuHuynh(dienThoai: string) {
  const base = normalizeUsernameFromPhone(dienThoai);

  if (!base) {
    throw new Error("Không thể sinh tên đăng nhập vì phụ huynh chưa có số điện thoại hợp lệ.");
  }

  let candidate = base;
  let attempt = 1;

  while (await findUserByUsername(candidate)) {
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }

  return candidate;
}

export async function createGuardianAccount(input: {
  donViId: number;
  linkId: number;
  actorUserId: number;
  ipAddress?: string;
}) {
  const found = await findGuardianLinkById(input.linkId);

  if (!found || found.donViId !== input.donViId) {
    throw new Error("Không tìm thấy liên kết phụ huynh.");
  }

  const guardian = await findPhuHuynhById(found.lienKet.phuHuynhId);

  if (!guardian) {
    throw new Error("Không tìm thấy hồ sơ phụ huynh.");
  }

  if (guardian.nguoiDungId) {
    const existingUser = await findUserById(guardian.nguoiDungId);

    /**
     * Tài khoản có thể đã được tạo từ một đơn vị khác (phụ huynh có con học
     * nhiều đơn vị, hồ sơ dùng chung qua số điện thoại — xem
     * `CrossOrgGuardianConfirmError` ở trên). Không cần gán thêm vai trò
     * `phu_huynh` riêng cho từng đơn vị con học: quyền xem dữ liệu con trên
     * Portal (`getParentPortalOverview`) đi thẳng theo liên kết
     * `PhuHuynh.nguoiDungId` — chính liên kết này (và bước xác nhận cross-org
     * ở trên) mới là điểm chốt quyền thực sự, không phải việc có được gán
     * vai trò ở đúng đơn vị đang chọn hay không.
     */
    await createAuditLog({
      userId: input.actorUserId,
      organizationId: input.donViId,
      action: "hoc_sinh.guardian_account_existing",
      objectType: "PhuHuynh",
      objectId: String(guardian.id),
      content: `Phụ huynh ${guardian.hoTen} (${guardian.maPhuHuynh}) đã có tài khoản, không tạo mới.`,
      ipAddress: input.ipAddress,
    });

    return {
      created: false as const,
      nguoiDungId: guardian.nguoiDungId,
      tenDangNhap: existingUser?.tenDangNhap ?? null,
      temporaryPassword: null,
    };
  }

  const role = await findRoleByCode("phu_huynh");

  if (!role) {
    throw new Error("Chưa cấu hình vai trò phụ huynh trong hệ thống.");
  }

  const tenDangNhap = await sinhTenDangNhapPhuHuynh(guardian.dienThoai);
  const temporaryPassword = createTemporaryPassword();
  const passwordHash = await hash(temporaryPassword, 12);

  let createdUser;

  try {
    createdUser = await createUserWithRole({
      username: tenDangNhap,
      passwordHash,
      fullName: guardian.hoTen,
      email: guardian.email,
      phone: guardian.dienThoai,
      roleId: role.id,
      organizationId: input.donViId,
    });
  } catch {
    throw new Error(
      "Không thể tạo tài khoản. Email hoặc số điện thoại có thể đã được dùng cho tài khoản khác.",
    );
  }

  await updatePhuHuynhNguoiDungId({
    id: guardian.id,
    nguoiDungId: createdUser.id,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "hoc_sinh.guardian_account_create",
    objectType: "PhuHuynh",
    objectId: String(guardian.id),
    content: `Tạo tài khoản đăng nhập ${tenDangNhap} cho phụ huynh ${guardian.hoTen} (${guardian.maPhuHuynh}).`,
    ipAddress: input.ipAddress,
  });

  return {
    created: true as const,
    nguoiDungId: createdUser.id,
    tenDangNhap,
    temporaryPassword,
  };
}
