import { hash } from "bcryptjs";

import { findChuongTrinhByMa } from "../db/chuongTrinh.repository.js";
import { closeDbConnection } from "../db/connection.js";
import { findDonViByCode } from "../db/donVi.repository.js";
import { findRoleByCode } from "../db/role.repository.js";
import {
  createUserWithRole,
  findUserByUsername,
} from "../db/user.repository.js";
import { createChuongTrinhMoi } from "../services/chuongTrinh.service.js";
import { createGiaoVienMoi } from "../services/giaoVien.service.js";
import { createHocSinhMoi } from "../services/hocSinh.service.js";
import {
  addLeadHoatDongMoi,
  createLeadMoi,
} from "../services/lead.service.js";
import {
  assignGiaoVienVaoLop,
  createLopHocMoi,
  xepHocSinhVaoLop,
} from "../services/lopHoc.service.js";
import {
  sinhBuoiHoc,
  taoQuyTacLichHoc,
} from "../services/lichHoc.service.js";
import { addGuardianToStudent } from "../services/phuHuynh.service.js";
import { createTemporaryPassword } from "../services/user.service.js";

const STAFF_ACCOUNTS = [
  {
    username: "demo_tuyensinh",
    fullName: "Tài khoản demo Tuyển sinh",
    roleCode: "tuyen_sinh",
  },
  {
    username: "demo_hocvu",
    fullName: "Tài khoản demo Học vụ",
    roleCode: "hoc_vu",
  },
  {
    username: "demo_ketoan",
    fullName: "Tài khoản demo Kế toán",
    roleCode: "ke_toan",
  },
  {
    username: "demo_giaovien",
    fullName: "Tài khoản demo Giáo viên",
    roleCode: "giao_vien",
  },
] as const;

const MAM_NON_STAFF_ACCOUNTS = [
  {
    username: "demo_ketoan_mn",
    fullName: "Tài khoản demo Kế toán (Mầm non)",
    roleCode: "ke_toan",
  },
] as const;

async function main() {
  const admin = await findUserByUsername("admin");

  if (!admin) {
    throw new Error(
      "Không tìm thấy tài khoản admin để làm actor tạo dữ liệu mẫu. Chạy pnpm db:seed:auth trước.",
    );
  }

  const actorUserId = admin.id;

  const ttnn = await findDonViByCode("TTNN-Q8");
  const mamNon = await findDonViByCode("MN-HOA-NANG");

  if (!ttnn || !mamNon) {
    throw new Error(
      "Chưa có đơn vị mẫu TTNN-Q8 / MN-HOA-NANG. Chạy pnpm db:seed:auth trước.",
    );
  }

  const existed = await findChuongTrinhByMa(ttnn.id, "IELTS-CB");

  if (existed) {
    console.log(
      "Dữ liệu mẫu (chương trình IELTS-CB) đã tồn tại — bỏ qua, không tạo lại.",
    );
    return;
  }

  // ---- TTNN-Q8 — Trung tâm Ngoại ngữ ----

  const ct1 = await createChuongTrinhMoi({
    donViId: ttnn.id,
    maChuongTrinh: "IELTS-CB",
    tenChuongTrinh: "IELTS Cơ bản",
    capDo: "5.5",
    tongSoBuoi: 30,
    tongSoGio: "60.00",
    moTa: "Chương trình luyện thi IELTS trình độ cơ bản.",
    actorUserId,
  });

  const ct2 = await createChuongTrinhMoi({
    donViId: ttnn.id,
    maChuongTrinh: "GT-CB",
    tenChuongTrinh: "Giao tiếp cơ bản",
    capDo: "A2",
    tongSoBuoi: 24,
    tongSoGio: "48.00",
    moTa: "Chương trình giao tiếp tiếng Anh cơ bản.",
    actorUserId,
  });

  const gv1 = await createGiaoVienMoi({
    donViId: ttnn.id,
    hoTen: "Nguyễn Thị Mai",
    dienThoai: "0901111111",
    email: "mai.nguyen@example.com",
    chuyenMon: "IELTS",
    trinhDo: "Thạc sĩ Ngôn ngữ Anh",
    actorUserId,
  });

  const gv2 = await createGiaoVienMoi({
    donViId: ttnn.id,
    hoTen: "Trần Văn Hùng",
    dienThoai: "0902222222",
    email: "hung.tran@example.com",
    chuyenMon: "Giao tiếp",
    trinhDo: "Cử nhân Sư phạm Anh",
    actorUserId,
  });

  const lop1 = await createLopHocMoi({
    donViId: ttnn.id,
    chuongTrinhDaoTaoId: ct1.id,
    maLop: "IELTS-S246",
    tenLop: "IELTS Sáng Thứ 2-4-6",
    capDo: "5.5",
    ngayBatDau: "2026-08-03",
    ngayKetThuc: "2026-11-03",
    siSoToiDa: 12,
    phongHoc: "P201",
    actorUserId,
  });

  const lop2 = await createLopHocMoi({
    donViId: ttnn.id,
    chuongTrinhDaoTaoId: ct2.id,
    maLop: "GT-T357",
    tenLop: "Giao tiếp Tối Thứ 3-5-7",
    capDo: "A2",
    ngayBatDau: "2026-08-04",
    ngayKetThuc: "2026-10-04",
    siSoToiDa: 15,
    phongHoc: "P105",
    actorUserId,
  });

  await assignGiaoVienVaoLop({
    donViId: ttnn.id,
    lopHocId: lop1.id,
    giaoVienId: gv1.id,
    vaiTro: "giao_vien_chinh",
    tuNgay: "2026-08-03",
    actorUserId,
  });

  await assignGiaoVienVaoLop({
    donViId: ttnn.id,
    lopHocId: lop2.id,
    giaoVienId: gv2.id,
    vaiTro: "giao_vien_chinh",
    tuNgay: "2026-08-04",
    actorUserId,
  });

  // Lịch học lặp lại (E05) — sáng Thứ 2-4-6 cho IELTS, tối Thứ 3-5-7 cho Giao tiếp, đúng
  // theo tên lớp. Sinh sẵn 4 tuần buổi học để có dữ liệu minh hoạ thời khóa biểu/điểm danh.
  const lichLop1 = await taoQuyTacLichHoc({
    donViId: ttnn.id,
    lopHocId: lop1.id,
    thuTrongTuanList: [2, 4, 6],
    gioBatDau: "08:00",
    gioKetThuc: "09:30",
    ngayApDungTu: lop1.ngayBatDau ?? "2026-08-03",
    ngayApDungDen: lop1.ngayKetThuc,
    actorUserId,
  });

  const lichLop2 = await taoQuyTacLichHoc({
    donViId: ttnn.id,
    lopHocId: lop2.id,
    thuTrongTuanList: [3, 5, 7],
    gioBatDau: "18:00",
    gioKetThuc: "19:30",
    ngayApDungTu: lop2.ngayBatDau ?? "2026-08-04",
    ngayApDungDen: lop2.ngayKetThuc,
    actorUserId,
  });

  for (const rule of [...lichLop1, ...lichLop2]) {
    await sinhBuoiHoc({
      donViId: ttnn.id,
      lichHocId: rule.id,
      denNgay: "2026-08-29",
      actorUserId,
    });
  }

  const hs1 = await createHocSinhMoi({
    donViId: ttnn.id,
    hoTen: "Phạm Gia Bảo",
    ngaySinh: "2012-03-15",
    gioiTinh: "nam",
    diaChi: "12 Nguyễn Thị Thập, Quận 7",
    ngayNhapHoc: "2026-08-01",
    actorUserId,
  });

  const hs2 = await createHocSinhMoi({
    donViId: ttnn.id,
    hoTen: "Phạm Gia Hân",
    ngaySinh: "2014-07-22",
    gioiTinh: "nu",
    diaChi: "12 Nguyễn Thị Thập, Quận 7",
    ngayNhapHoc: "2026-08-01",
    actorUserId,
  });

  const hs3 = await createHocSinhMoi({
    donViId: ttnn.id,
    hoTen: "Lê Khánh Linh",
    ngaySinh: "2011-11-05",
    gioiTinh: "nu",
    diaChi: "45 Huỳnh Tấn Phát, Quận 7",
    ngayNhapHoc: "2026-08-01",
    actorUserId,
  });

  // Cùng một phụ huynh cho 2 con — minh hoạ tái sử dụng theo số điện thoại (D03).
  await addGuardianToStudent({
    donViId: ttnn.id,
    hocSinhId: hs1.id,
    dienThoai: "0933444555",
    hoTen: "Phạm Văn Long",
    moiQuanHe: "cha",
    laLienHeChinh: true,
    duocDonTre: true,
    nhanThongBao: true,
    nhanThongTinHocPhi: true,
    actorUserId,
  });

  await addGuardianToStudent({
    donViId: ttnn.id,
    hocSinhId: hs2.id,
    dienThoai: "0933444555",
    moiQuanHe: "cha",
    laLienHeChinh: true,
    duocDonTre: true,
    nhanThongBao: true,
    nhanThongTinHocPhi: true,
    actorUserId,
  });

  await addGuardianToStudent({
    donViId: ttnn.id,
    hocSinhId: hs3.id,
    dienThoai: "0944555666",
    hoTen: "Lê Thị Kim Ngân",
    moiQuanHe: "me",
    laLienHeChinh: true,
    duocDonTre: true,
    nhanThongBao: true,
    nhanThongTinHocPhi: true,
    actorUserId,
  });

  await xepHocSinhVaoLop({
    donViId: ttnn.id,
    hocSinhId: hs1.id,
    lopHocId: lop1.id,
    ngayVaoLop: "2026-08-03",
    actorUserId,
  });

  await xepHocSinhVaoLop({
    donViId: ttnn.id,
    hocSinhId: hs2.id,
    lopHocId: lop2.id,
    ngayVaoLop: "2026-08-04",
    actorUserId,
  });

  await xepHocSinhVaoLop({
    donViId: ttnn.id,
    hocSinhId: hs3.id,
    lopHocId: lop1.id,
    ngayVaoLop: "2026-08-03",
    actorUserId,
  });

  const lead1 = await createLeadMoi({
    donViId: ttnn.id,
    hoTen: "Đỗ Thị Thu Hường",
    soDienThoai: "0955666777",
    email: "huong.do@example.com",
    nguon: "facebook",
    doTuoiHoacTrinhDo: "12 tuổi, mất gốc",
    nhuCau: "Quan tâm lớp giao tiếp buổi tối",
    actorUserId,
  });

  const lead2 = await createLeadMoi({
    donViId: ttnn.id,
    hoTen: "Bùi Anh Quân",
    soDienThoai: "0966777888",
    nguon: "gioi_thieu",
    doTuoiHoacTrinhDo: "Trình độ B1",
    nhuCau: "Muốn luyện thi IELTS 6.5",
    actorUserId,
  });

  console.log(`Lead mẫu (chưa chuyển đổi): ${lead1.maLead}, ${lead2.maLead}`);

  await addLeadHoatDongMoi({
    donViId: ttnn.id,
    leadId: lead2.id,
    loaiHoatDong: "goi_dien",
    noiDung: "Gọi tư vấn lần đầu, hẹn tham quan trung tâm.",
    ketQua: "Đồng ý tham quan cuối tuần",
    trangThaiMoi: "dang_cham_soc",
    actorUserId,
  });

  // ---- MN-HOA-NANG — Trường Mầm non ----

  const ctMam = await createChuongTrinhMoi({
    donViId: mamNon.id,
    maChuongTrinh: "MAM-LA",
    tenChuongTrinh: "Chương trình lớp Lá",
    capDo: "5-6 tuổi",
    moTa: "Chương trình phát triển toàn diện cho trẻ 5-6 tuổi.",
    actorUserId,
  });

  const gvMam = await createGiaoVienMoi({
    donViId: mamNon.id,
    hoTen: "Ngô Thị Thanh",
    dienThoai: "0977888999",
    email: "thanh.ngo@example.com",
    chuyenMon: "Giáo dục mầm non",
    trinhDo: "Cử nhân Sư phạm Mầm non",
    actorUserId,
  });

  const lopMam = await createLopHocMoi({
    donViId: mamNon.id,
    chuongTrinhDaoTaoId: ctMam.id,
    maLop: "LA-1",
    tenLop: "Lá 1",
    capDo: "5-6 tuổi",
    ngayBatDau: "2026-08-01",
    siSoToiDa: 20,
    phongHoc: "Phòng Lá 1",
    actorUserId,
  });

  await assignGiaoVienVaoLop({
    donViId: mamNon.id,
    lopHocId: lopMam.id,
    giaoVienId: gvMam.id,
    vaiTro: "chu_nhiem",
    tuNgay: "2026-08-01",
    actorUserId,
  });

  // Lịch học lặp lại — mầm non học cả tuần (Thứ 2 - Thứ 6), giờ đón/trả cả ngày.
  const lichMam = await taoQuyTacLichHoc({
    donViId: mamNon.id,
    lopHocId: lopMam.id,
    thuTrongTuanList: [2, 3, 4, 5, 6],
    gioBatDau: "07:30",
    gioKetThuc: "16:30",
    ngayApDungTu: lopMam.ngayBatDau ?? "2026-08-01",
    ngayApDungDen: null,
    actorUserId,
  });

  for (const rule of lichMam) {
    await sinhBuoiHoc({
      donViId: mamNon.id,
      lichHocId: rule.id,
      denNgay: "2026-08-14",
      actorUserId,
    });
  }

  const hsMam1 = await createHocSinhMoi({
    donViId: mamNon.id,
    hoTen: "Vũ Bảo Nam",
    ngaySinh: "2020-05-10",
    gioiTinh: "nam",
    ngayNhapHoc: "2026-08-01",
    actorUserId,
  });

  const hsMam2 = await createHocSinhMoi({
    donViId: mamNon.id,
    hoTen: "Đặng Khánh Vy",
    ngaySinh: "2020-09-18",
    gioiTinh: "nu",
    ngayNhapHoc: "2026-08-01",
    actorUserId,
  });

  await addGuardianToStudent({
    donViId: mamNon.id,
    hocSinhId: hsMam1.id,
    dienThoai: "0988999000",
    hoTen: "Vũ Thị Hồng",
    moiQuanHe: "me",
    laLienHeChinh: true,
    duocDonTre: true,
    nhanThongBao: true,
    nhanThongTinHocPhi: true,
    actorUserId,
  });

  await addGuardianToStudent({
    donViId: mamNon.id,
    hocSinhId: hsMam2.id,
    dienThoai: "0999000111",
    hoTen: "Đặng Văn Toàn",
    moiQuanHe: "cha",
    laLienHeChinh: true,
    duocDonTre: true,
    nhanThongBao: true,
    nhanThongTinHocPhi: true,
    actorUserId,
  });

  await xepHocSinhVaoLop({
    donViId: mamNon.id,
    hocSinhId: hsMam1.id,
    lopHocId: lopMam.id,
    ngayVaoLop: "2026-08-01",
    actorUserId,
  });

  await xepHocSinhVaoLop({
    donViId: mamNon.id,
    hocSinhId: hsMam2.id,
    lopHocId: lopMam.id,
    ngayVaoLop: "2026-08-01",
    actorUserId,
  });

  // ---- Tài khoản demo theo vai trò (TTNN-Q8) ----

  const createdAccounts: string[] = [];

  for (const account of STAFF_ACCOUNTS) {
    const role = await findRoleByCode(account.roleCode);

    if (!role) {
      console.warn(`Bỏ qua ${account.username}: chưa có vai trò ${account.roleCode}.`);
      continue;
    }

    const existingUser = await findUserByUsername(account.username);

    if (existingUser) {
      console.log(`${account.username} đã tồn tại — bỏ qua.`);
      continue;
    }

    const passwordHash = await hash(createTemporaryPassword(), 12);

    await createUserWithRole({
      username: account.username,
      passwordHash,
      fullName: account.fullName,
      roleId: role.id,
      organizationId: ttnn.id,
    });

    createdAccounts.push(account.username);
  }

  // ---- Tài khoản demo theo vai trò (MN-HOA-NANG) ----

  for (const account of MAM_NON_STAFF_ACCOUNTS) {
    const role = await findRoleByCode(account.roleCode);

    if (!role) {
      console.warn(`Bỏ qua ${account.username}: chưa có vai trò ${account.roleCode}.`);
      continue;
    }

    const existingUser = await findUserByUsername(account.username);

    if (existingUser) {
      console.log(`${account.username} đã tồn tại — bỏ qua.`);
      continue;
    }

    const passwordHash = await hash(createTemporaryPassword(), 12);

    await createUserWithRole({
      username: account.username,
      passwordHash,
      fullName: account.fullName,
      roleId: role.id,
      organizationId: mamNon.id,
    });

    createdAccounts.push(account.username);
  }

  console.log("Đã tạo xong dữ liệu mẫu cho TTNN-Q8 và MN-HOA-NANG.");

  if (createdAccounts.length > 0) {
    console.log(
      `Tài khoản demo mới tạo (mật khẩu tạm Edu@123Qaz, bắt buộc đổi lần đầu): ${createdAccounts.join(", ")}`,
    );
  }
}

main()
  .catch((error) => {
    console.error("Seed dữ liệu mẫu thất bại:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDbConnection();
  });
