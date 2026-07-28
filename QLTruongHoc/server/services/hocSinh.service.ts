import {
  createAuditLog,
} from "../db/audit.repository.js";
import {
  countHocSinhTheoMaPrefix,
  createHocSinh,
  createTrangThaiLichSu,
  findHocSinhById,
  listHocSinhAllDonVi,
  listHocSinhByDonVi,
  listHocSinhChoXepLop,
  listTrangThaiLichSuByHocSinh,
  updateHocSinh,
  updateHocSinhTrangThai,
  updateKetQuaTestDauVao,
} from "../db/hocSinh.repository.js";
import {
  closeEnrollment,
  listActiveEnrollmentsByHocSinh,
  listEnrollmentsByHocSinh,
  setEnrollmentTrangThai,
} from "../db/lopHoc.repository.js";
import {
  listGuardianLinksByHocSinh,
} from "../db/phuHuynh.repository.js";
import { assertDonViChoPhepNghiepVu } from "./donVi.service.js";
import { addGuardianToStudent } from "./phuHuynh.service.js";

type TrangThaiHocSinh =
  | "tiep_nhan"
  | "dang_hoc"
  | "bao_luu"
  | "ngung_hoc"
  | "hoan_thanh";

const TRANG_THAI_HOP_LE: TrangThaiHocSinh[] = [
  "tiep_nhan",
  "dang_hoc",
  "bao_luu",
  "ngung_hoc",
  "hoan_thanh",
];

async function sinhMaHocSinh(donViId: number) {
  const nam = new Date().getFullYear();
  const prefix = `HS${nam}`;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const total = await countHocSinhTheoMaPrefix(donViId, prefix);
    const seq = total + 1 + attempt;
    const ma = `${prefix}${String(seq).padStart(4, "0")}`;
    return ma;
  }

  throw new Error("Không thể sinh mã học sinh, vui lòng thử lại.");
}

export async function listHocSinh(donViId: number, loaiDonVi?: string) {
  if (loaiDonVi === "he_thong") {
    return listHocSinhAllDonVi();
  }

  return listHocSinhByDonVi(donViId);
}

export async function getHocSinhChoXepLop(donViId: number) {
  return listHocSinhChoXepLop(donViId);
}

/**
 * Học vụ ghi kết quả test đầu vào ngay lúc xếp lớp (nếu chương trình của lớp
 * yêu cầu) — chỉ là ghi chú ngữ cảnh, không phải trạng thái/luồng duyệt. Xem
 * docs/analysis/TUYEN_SINH_THEO_LOAI_HINH.md.
 */
export async function ghiNhanKetQuaTestDauVao(input: {
  donViId: number;
  id: number;
  ketQuaTestDauVao: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await findHocSinhById(input.donViId, input.id);

  if (!existing) {
    throw new Error("Không tìm thấy học sinh trong đơn vị hiện tại.");
  }

  const ketQuaTestDauVao = input.ketQuaTestDauVao?.trim() || null;

  const updated = await updateKetQuaTestDauVao({
    id: input.id,
    ketQuaTestDauVao,
  });

  if (!updated) {
    throw new Error("Không thể ghi nhận kết quả test đầu vào.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "hoc_sinh.ghi_ket_qua_test_dau_vao",
    objectType: "HocSinh",
    objectId: String(input.id),
    content: `Ghi kết quả test đầu vào cho học sinh ${existing.hoTen} (${existing.maHocSinh}): ${ketQuaTestDauVao ?? "(trống)"}.`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

export async function getHocSinhDetail(
  donViId: number,
  hocSinhId: number,
) {
  if (!Number.isInteger(donViId) || donViId <= 0) {
    throw new Error("Đơn vị làm việc không hợp lệ.");
  }

  if (!Number.isInteger(hocSinhId) || hocSinhId <= 0) {
    throw new Error("Mã định danh học sinh không hợp lệ.");
  }

  const student = await findHocSinhById(donViId, hocSinhId);

  if (!student) {
    throw new Error("Không tìm thấy học sinh trong đơn vị hiện tại.");
  }

  const [guardianLinks, lichSu, enrollments] = await Promise.all([
    listGuardianLinksByHocSinh(hocSinhId),
    listTrangThaiLichSuByHocSinh(hocSinhId),
    listEnrollmentsByHocSinh(hocSinhId),
  ]);

  return {
    hocSinh: student,
    lichSuTrangThai: lichSu,
    lopHoc: enrollments.map((row) => ({
      enrollmentId: row.enrollment.id,
      ngayVaoLop: row.enrollment.ngayVaoLop,
      ngayRoiLop: row.enrollment.ngayRoiLop,
      trangThai: row.enrollment.trangThai,
      lopHoc: row.lopHoc,
    })),
    phuHuynh: guardianLinks.map((row) => ({
      lienKetId: row.lienKet.id,
      moiQuanHe: row.lienKet.moiQuanHe,
      laLienHeChinh: row.lienKet.laLienHeChinh,
      duocDonTre: row.lienKet.duocDonTre,
      nhanThongBao: row.lienKet.nhanThongBao,
      nhanThongTinHocPhi: row.lienKet.nhanThongTinHocPhi,
      phuHuynh: row.phuHuynh,
    })),
  };
}

export async function createHocSinhMoi(input: {
  donViId: number;
  hoTen: string;
  tenThuongGoi?: string | null;
  ngaySinh: string;
  gioiTinh?: string | null;
  diaChi?: string | null;
  ngayNhapHoc?: string | null;
  nguyenVongLop?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  await assertDonViChoPhepNghiepVu(input.donViId);

  const hoTen = input.hoTen.trim();

  if (!hoTen) {
    throw new Error("Vui lòng nhập họ tên học sinh.");
  }

  if (!input.ngaySinh) {
    throw new Error("Vui lòng nhập ngày sinh.");
  }

  if (
    input.gioiTinh &&
    input.gioiTinh !== "nam" &&
    input.gioiTinh !== "nu" &&
    input.gioiTinh !== "khac"
  ) {
    throw new Error("Giới tính không hợp lệ.");
  }

  const maHocSinh = await sinhMaHocSinh(input.donViId);

  const created = await createHocSinh({
    donViId: input.donViId,
    maHocSinh,
    hoTen,
    tenThuongGoi: input.tenThuongGoi?.trim() || null,
    ngaySinh: input.ngaySinh,
    gioiTinh:
      (input.gioiTinh as "nam" | "nu" | "khac" | undefined) ?? null,
    diaChi: input.diaChi?.trim() || null,
    ngayNhapHoc: input.ngayNhapHoc || null,
    nguyenVongLop: input.nguyenVongLop?.trim() || null,
  });

  if (!created) {
    throw new Error("Không thể tạo hồ sơ học sinh.");
  }

  await createTrangThaiLichSu({
    hocSinhId: created.id,
    trangThaiCu: null,
    trangThaiMoi: "tiep_nhan",
    lyDo: null,
    ngayHieuLuc: created.createdAt.slice(0, 10),
    actorUserId: input.actorUserId,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "hoc_sinh.create",
    objectType: "HocSinh",
    objectId: String(created.id),
    content: `Tạo hồ sơ học sinh ${created.hoTen} (${created.maHocSinh}).`,
    ipAddress: input.ipAddress,
  });

  return created;
}

/**
 * Ghi danh trực tiếp — dùng cho mầm non: không có khách hàng tiềm năng/đặt
 * lịch như trung tâm ngoại ngữ, tuyển sinh ghi nhận thẳng hồ sơ học sinh +
 * phụ huynh trong 1 bước, học vụ xếp lớp sau (theo độ tuổi). Tái dùng đúng 2
 * hàm `confirmLeadRegistration` (trung tâm) đang dùng, chỉ khác là không có
 * Lead đi trước. Xem docs/analysis/TUYEN_SINH_THEO_LOAI_HINH.md.
 */
export async function ghiNhanHoSoHocSinh(input: {
  donViId: number;
  hoTenHocVien: string;
  ngaySinh: string;
  gioiTinh?: string | null;
  diaChiHocVien?: string | null;
  ngayNhapHoc?: string | null;
  hoTenNguoiLienHe: string;
  soDienThoaiNguoiLienHe: string;
  emailNguoiLienHe?: string | null;
  moiQuanHe: string;
  actorUserId: number;
  ipAddress?: string;
}) {
  const hocSinhMoi = await createHocSinhMoi({
    donViId: input.donViId,
    hoTen: input.hoTenHocVien,
    ngaySinh: input.ngaySinh,
    gioiTinh: input.gioiTinh ?? null,
    diaChi: input.diaChiHocVien ?? null,
    ngayNhapHoc: input.ngayNhapHoc ?? null,
    actorUserId: input.actorUserId,
    ipAddress: input.ipAddress,
  });

  await addGuardianToStudent({
    donViId: input.donViId,
    hocSinhId: hocSinhMoi.id,
    dienThoai: input.soDienThoaiNguoiLienHe,
    hoTen: input.hoTenNguoiLienHe,
    email: input.emailNguoiLienHe ?? null,
    moiQuanHe: input.moiQuanHe,
    laLienHeChinh: true,
    duocDonTre: true,
    nhanThongBao: true,
    nhanThongTinHocPhi: true,
    actorUserId: input.actorUserId,
    ipAddress: input.ipAddress,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "hoc_sinh.ghi_danh_truc_tiep",
    objectType: "HocSinh",
    objectId: String(hocSinhMoi.id),
    content: `Ghi danh trực tiếp học sinh ${hocSinhMoi.hoTen} (${hocSinhMoi.maHocSinh}), người liên hệ ${input.hoTenNguoiLienHe}.`,
    ipAddress: input.ipAddress,
  });

  return hocSinhMoi;
}

function parseSoDoTuyChon(
  value: string | null | undefined,
  tenTruong: string,
): string | null {
  if (!value) return null;

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${tenTruong} không hợp lệ.`);
  }

  return parsed.toFixed(1);
}

export async function updateHocSinhInfo(input: {
  donViId: number;
  id: number;
  hoTen: string;
  tenThuongGoi?: string | null;
  hinhAnhUrl?: string | null;
  ngaySinh: string;
  gioiTinh?: string | null;
  soDinhDanh?: string | null;
  noiSinh?: string | null;
  danToc?: string | null;
  quocTich?: string | null;
  diaChi?: string | null;
  truongLopTruocDo?: string | null;
  ngayNhapHoc?: string | null;
  dienChinhSach?: string | null;
  chieuCaoCm?: string | null;
  canNangKg?: string | null;
  diUngBenhNen?: string | null;
  lienHeKhanCapHoTen?: string | null;
  lienHeKhanCapSdt?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await findHocSinhById(input.donViId, input.id);

  if (!existing) {
    throw new Error("Không tìm thấy học sinh trong đơn vị hiện tại.");
  }

  const hoTen = input.hoTen.trim();

  if (!hoTen) {
    throw new Error("Vui lòng nhập họ tên học sinh.");
  }

  if (!input.ngaySinh) {
    throw new Error("Vui lòng nhập ngày sinh.");
  }

  const updated = await updateHocSinh({
    id: input.id,
    hoTen,
    tenThuongGoi: input.tenThuongGoi?.trim() || null,
    hinhAnhUrl: input.hinhAnhUrl?.trim() || null,
    ngaySinh: input.ngaySinh,
    gioiTinh:
      (input.gioiTinh as "nam" | "nu" | "khac" | undefined) ?? null,
    soDinhDanh: input.soDinhDanh?.trim() || null,
    noiSinh: input.noiSinh?.trim() || null,
    danToc: input.danToc?.trim() || null,
    quocTich: input.quocTich?.trim() || null,
    diaChi: input.diaChi?.trim() || null,
    truongLopTruocDo: input.truongLopTruocDo?.trim() || null,
    ngayNhapHoc: input.ngayNhapHoc || null,
    dienChinhSach: input.dienChinhSach?.trim() || null,
    chieuCaoCm: parseSoDoTuyChon(input.chieuCaoCm, "Chiều cao"),
    canNangKg: parseSoDoTuyChon(input.canNangKg, "Cân nặng"),
    diUngBenhNen: input.diUngBenhNen?.trim() || null,
    lienHeKhanCapHoTen: input.lienHeKhanCapHoTen?.trim() || null,
    lienHeKhanCapSdt: input.lienHeKhanCapSdt?.trim() || null,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật học sinh.");
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "hoc_sinh.update",
    objectType: "HocSinh",
    objectId: String(updated.id),
    content: `Cập nhật hồ sơ học sinh ${updated.hoTen} (${updated.maHocSinh}).`,
    ipAddress: input.ipAddress,
  });

  return updated;
}

export async function setHocSinhTrangThai(input: {
  donViId: number;
  id: number;
  trangThai: string;
  lyDo?: string | null;
  ngayHieuLuc?: string | null;
  actorUserId: number;
  ipAddress?: string;
}) {
  const existing = await findHocSinhById(input.donViId, input.id);

  if (!existing) {
    throw new Error("Không tìm thấy học sinh trong đơn vị hiện tại.");
  }

  if (!TRANG_THAI_HOP_LE.includes(input.trangThai as TrangThaiHocSinh)) {
    throw new Error("Trạng thái không hợp lệ.");
  }

  const trangThai = input.trangThai as TrangThaiHocSinh;

  if (trangThai === existing.trangThai) {
    throw new Error("Học sinh đã ở đúng trạng thái này.");
  }

  const lyDo = input.lyDo?.trim() || null;
  const ngayHieuLuc =
    input.ngayHieuLuc || new Date().toISOString().slice(0, 10);

  const updated = await updateHocSinhTrangThai({
    id: input.id,
    trangThai,
  });

  if (!updated) {
    throw new Error("Không thể cập nhật trạng thái học sinh.");
  }

  await createTrangThaiLichSu({
    hocSinhId: input.id,
    trangThaiCu: existing.trangThai,
    trangThaiMoi: trangThai,
    lyDo,
    ngayHieuLuc,
    actorUserId: input.actorUserId,
  });

  // Đồng bộ trạng thái ở tất cả lớp học sinh đang theo học — tránh lệch giữa hồ sơ chung
  // và trạng thái theo từng lớp (D06).
  if (
    trangThai === "ngung_hoc" ||
    trangThai === "hoan_thanh" ||
    trangThai === "bao_luu"
  ) {
    const activeEnrollments = await listActiveEnrollmentsByHocSinh(
      input.id,
    );

    for (const enrollment of activeEnrollments) {
      if (trangThai === "bao_luu") {
        if (enrollment.trangThai === "dang_hoc") {
          await setEnrollmentTrangThai({
            id: enrollment.id,
            trangThai: "bao_luu",
          });
        }

        continue;
      }

      await closeEnrollment({
        id: enrollment.id,
        ngayRoiLop: ngayHieuLuc,
        lyDoRoiLop: lyDo,
        trangThai,
      });
    }
  }

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.donViId,
    action: "hoc_sinh.set_status",
    objectType: "HocSinh",
    objectId: String(updated.id),
    content: `Đổi trạng thái học sinh ${updated.hoTen} (${updated.maHocSinh}) từ ${existing.trangThai} sang ${trangThai}.`,
    ipAddress: input.ipAddress,
  });

  return updated;
}
