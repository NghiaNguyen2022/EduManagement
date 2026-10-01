import { hash } from "bcryptjs";
import { and, eq } from "drizzle-orm";

import {
  giaoVien,
  hocSinh,
  hocSinhLopHoc,
  hocSinhLopHocDanhGia,
  lichHoc,
  lopHocGiaoVien,
  nguoiDung,
  nguoiDungVaiTroDonVi,
  thongBao,
} from "../../drizzle/schema.js";
import { listChuongTrinhByDonVi } from "../db/chuongTrinh.repository.js";
import { closeDbConnection, getDb } from "../db/connection.js";
import { findDonViByCode } from "../db/donVi.repository.js";
import { updateGiaoVienNguoiDungId } from "../db/giaoVien.repository.js";
import { listBuoiHocByLopHoc } from "../db/lichHoc.repository.js";
import { listLopHocByDonVi } from "../db/lopHoc.repository.js";
import { findRoleByCode } from "../db/role.repository.js";
import {
  findGuardianLink,
  findPhuHuynhByPhoneGlobal,
} from "../db/phuHuynh.repository.js";
import {
  listDanhMucKhoanThuByDonVi,
  listKyThuByDonVi,
} from "../db/taiChinh.repository.js";
import {
  createUserWithRole,
  findUserByUsername,
  resetUserPassword,
} from "../db/user.repository.js";
import { createChuongTrinhMoi } from "../services/chuongTrinh.service.js";
import { getDiemDanhRoster } from "../services/diemDanh.service.js";
import { createGiaoVienMoi } from "../services/giaoVien.service.js";
import { addDanhGia } from "../services/danhGia.service.js";
import {
  createHocSinhMoi,
  setHocSinhTrangThai,
} from "../services/hocSinh.service.js";
import {
  assignGiaoVienVaoLop,
  createLopHocMoi,
  setLopHocStatus,
  xepHocSinhVaoLop,
} from "../services/lopHoc.service.js";
import {
  sinhBuoiHoc,
  taoQuyTacLichHoc,
} from "../services/lichHoc.service.js";
import {
  addGuardianToStudent,
  createGuardianAccount,
} from "../services/phuHuynh.service.js";
import { getTeacherPortalOverview } from "../services/portal.service.js";
import { createThongBaoMoi } from "../services/thongBao.service.js";
import {
  capNhatKhoanApDungKyThu,
  createDanhMucKhoanThuMoi,
  createKyThuMoi,
  ghiNhanThuTien,
  listKhoanPhaiThuTheoKyThu,
  moKyThu,
  sinhKhoanPhaiThuChoLop,
} from "../services/taiChinh.service.js";
import {
  todayInBusinessTimeZone,
  toDatabaseDateTime,
} from "../utils/dateTime.js";

const TEMPORARY_PASSWORD = "Edu@123Qaz";
const PARENT_PHONE = "0988002026";
const PARENT_USERNAME = PARENT_PHONE;
const PARENT_NAME = "Nguyễn Minh Anh";
const isEnglishCenter = process.argv.includes("--ngoai-ngu");
const config = isEnglishCenter
  ? {
      organizationCode: "TTNN-Q8",
      programCode: "NN-TEST-FULL",
      programName: "Chương trình test giáo viên tiếng Anh",
      programLevel: "A2",
      programDescription: "Dữ liệu chuyên dùng để test portal giáo viên trung tâm tiếng Anh.",
      classCode: "NN-A2-TEST",
      className: "English A2 Test Full",
      classLevel: "A2",
      classroom: "Phòng NN Test",
      teacherUsername: "demo_giaovien_nn",
      operationsUsername: "demo_hocvu_nn",
      operationsName: "Học vụ Test Ngoại ngữ",
      admissionsUsername: "demo_tuyensinh_nn",
      admissionsName: "Tuyển sinh Test Ngoại ngữ",
      accountingUsername: "demo_ketoan_nn",
      managerUsername: "demo_quanly_nn",
      managerName: "Quản lý Test Ngoại ngữ",
      accountingName: "Kế toán Test Ngoại ngữ",
      teacherPhone: "0977002001",
      teacherName: "Giáo viên Test Tiếng Anh",
      teacherSpecialty: "Tiếng Anh giao tiếp A2",
      teacherQualification: "Cử nhân Sư phạm Anh",
      teacherClassRole: "giao_vien_chinh" as const,
      weekdays: [2, 4, 6],
      startTime: "18:00",
      endTime: "19:30",
      statusReason: "Kích hoạt dữ liệu test giáo viên trung tâm tiếng Anh.",
      feePrefix: "NNTEST",
      feePeriodName: "Kỳ thu test khóa tiếng Anh",
      fees: [
        { code: "HOC-PHI", name: "Học phí khóa A2 test", type: "hoc_phi" as const, amount: 2_000_000 },
        { code: "TAI-LIEU", name: "Giáo trình A2 test", type: "tai_lieu" as const, amount: 300_000 },
      ],
      students: [
        { hoTen: "Test Học viên Minh", tenThuongGoi: "Minh", ngaySinh: "2012-03-12", gioiTinh: "nam" as const },
        { hoTen: "Test Học viên Ngọc", tenThuongGoi: "Ngọc", ngaySinh: "2013-06-08", gioiTinh: "nu" as const },
        { hoTen: "Test Học viên Phúc", tenThuongGoi: "Phúc", ngaySinh: "2011-09-21", gioiTinh: "nam" as const },
        { hoTen: "Test Học viên Trang", tenThuongGoi: "Trang", ngaySinh: "2014-11-02", gioiTinh: "nu" as const },
      ],
    }
  : {
      organizationCode: "MN-HOA-NANG",
      programCode: "MN-TEST-FULL",
      programName: "Chương trình test giáo viên mầm non",
      programLevel: "Lớp Lá 5-6 tuổi",
      programDescription: "Dữ liệu chuyên dùng để test đầy đủ portal giáo viên mầm non.",
      classCode: "MN-LA-TEST",
      className: "Lá Test Full",
      classLevel: "5-6 tuổi",
      classroom: "Phòng Lá Test",
      teacherUsername: "demo_giaovien_mn",
      operationsUsername: "demo_hocvu_mn",
      operationsName: "Học vụ Test Mầm non",
      admissionsUsername: "demo_tuyensinh_mn",
      admissionsName: "Tuyển sinh Test Mầm non",
      accountingUsername: "demo_ketoan_mn",
      managerUsername: "demo_quanly_mn",
      managerName: "Quản lý Test Mầm non",
      accountingName: "Kế toán Test Mầm non",
      teacherPhone: "0977001001",
      teacherName: "Giáo viên Test Mầm non",
      teacherSpecialty: "Chăm sóc và giáo dục trẻ 5-6 tuổi",
      teacherQualification: "Cử nhân Giáo dục Mầm non",
      teacherClassRole: "chu_nhiem" as const,
      weekdays: [2, 3, 4, 5, 6],
      startTime: "07:30",
      endTime: "16:30",
      statusReason: "Kích hoạt dữ liệu test giáo viên mầm non.",
      feePrefix: "MNTEST",
      feePeriodName: "Kỳ thu test mầm non",
      fees: [
        { code: "HOC-PHI", name: "Học phí mầm non test", type: "hoc_phi" as const, amount: 3_000_000 },
        { code: "TIEN-AN", name: "Tiền ăn mầm non test", type: "tien_an" as const, amount: 1_000_000 },
        { code: "DICH-VU", name: "Phí dịch vụ test", type: "dich_vu" as const, amount: 200_000 },
      ],
      students: [
        { hoTen: "Test Bé An", tenThuongGoi: "An", ngaySinh: "2021-03-12", gioiTinh: "nam" as const },
        { hoTen: "Test Bé Bình", tenThuongGoi: "Bình", ngaySinh: "2021-06-08", gioiTinh: "nam" as const },
        { hoTen: "Test Bé Chi", tenThuongGoi: "Chi", ngaySinh: "2021-09-21", gioiTinh: "nu" as const },
        { hoTen: "Test Bé Dương", tenThuongGoi: "Dương", ngaySinh: "2021-11-02", gioiTinh: "nu" as const },
        { hoTen: "Test Bé Gia Hân", tenThuongGoi: "Hân", ngaySinh: "2022-01-15", gioiTinh: "nu" as const },
      ],
    };

function addDaysIso(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function main() {
  const db = getDb();
  const today = todayInBusinessTimeZone();
  const scheduleEnd = addDaysIso(today, 28);

  const [admin, organization, teacherRole, operationsRole, admissionsRole, accountingRole, managerRole] = await Promise.all([
    findUserByUsername("admin"),
    findDonViByCode(config.organizationCode),
    findRoleByCode("giao_vien"),
    findRoleByCode("hoc_vu"),
    findRoleByCode("tuyen_sinh"),
    findRoleByCode("ke_toan"),
    findRoleByCode("quan_ly_don_vi"),
  ]);

  if (!admin || !organization || !teacherRole || !operationsRole || !admissionsRole || !accountingRole || !managerRole) {
    throw new Error(
      `Thiếu admin, đơn vị ${config.organizationCode} hoặc vai trò giao_vien. Hãy chạy pnpm db:seed:auth trước.`,
    );
  }

  const actorUserId = admin.id;

  const existingChuongTrinh = await listChuongTrinhByDonVi(organization.id);
  let program = existingChuongTrinh.find((item) => item.tenChuongTrinh === config.programName) ?? null;
  if (!program) {
    program = await createChuongTrinhMoi({
      donViId: organization.id,
      tenChuongTrinh: config.programName,
      capDo: config.programLevel,
      moTa: config.programDescription,
      actorUserId,
    });
  }

  let teacher = (
    await db
      .select()
      .from(giaoVien)
      .where(
        and(
          eq(giaoVien.donViId, organization.id),
          eq(giaoVien.dienThoai, config.teacherPhone),
        ),
      )
      .limit(1)
  )[0];

  if (!teacher) {
    teacher = await createGiaoVienMoi({
      donViId: organization.id,
      hoTen: config.teacherName,
      dienThoai: config.teacherPhone,
      chuyenMon: config.teacherSpecialty,
      trinhDo: config.teacherQualification,
      actorUserId,
    });
  }

  const passwordHash = await hash(TEMPORARY_PASSWORD, 12);
  let teacherUser = await findUserByUsername(config.teacherUsername);

  if (!teacherUser) {
    teacherUser = await createUserWithRole({
      username: config.teacherUsername,
      passwordHash,
      fullName: teacher.hoTen,
      roleId: teacherRole.id,
      organizationId: organization.id,
    });
  } else {
    await resetUserPassword({ userId: teacherUser.id, passwordHash });

    const assignment = (
      await db
        .select()
        .from(nguoiDungVaiTroDonVi)
        .where(
          and(
            eq(nguoiDungVaiTroDonVi.nguoiDungId, teacherUser.id),
            eq(nguoiDungVaiTroDonVi.vaiTroId, teacherRole.id),
            eq(nguoiDungVaiTroDonVi.donViId, organization.id),
          ),
        )
        .limit(1)
    )[0];

    if (!assignment) {
      const now = toDatabaseDateTime();
      await db.insert(nguoiDungVaiTroDonVi).values({
        nguoiDungId: teacherUser.id,
        vaiTroId: teacherRole.id,
        donViId: organization.id,
        dangHoatDong: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  if (teacher.nguoiDungId !== teacherUser.id) {
    teacher = (await updateGiaoVienNguoiDungId({
      id: teacher.id,
      nguoiDungId: teacherUser.id,
    }))!;
  }

  await db
    .update(nguoiDung)
    .set({
      batBuocDoiMatKhau: false,
      trangThai: "hoat_dong",
      soLanDangNhapSaiLienTiep: 0,
      khoaDangNhapDenLuc: null,
      updatedAt: toDatabaseDateTime(),
    })
    .where(eq(nguoiDung.id, teacherUser.id));

  let operationsUser = await findUserByUsername(config.operationsUsername);
  if (!operationsUser) {
    operationsUser = await createUserWithRole({
      username: config.operationsUsername,
      passwordHash,
      fullName: config.operationsName,
      roleId: operationsRole.id,
      organizationId: organization.id,
    });
  } else {
    const assignment = (
      await db
        .select()
        .from(nguoiDungVaiTroDonVi)
        .where(
          and(
            eq(nguoiDungVaiTroDonVi.nguoiDungId, operationsUser.id),
            eq(nguoiDungVaiTroDonVi.vaiTroId, operationsRole.id),
            eq(nguoiDungVaiTroDonVi.donViId, organization.id),
          ),
        )
        .limit(1)
    )[0];

    if (!assignment) {
      const now = toDatabaseDateTime();
      await db.insert(nguoiDungVaiTroDonVi).values({
        nguoiDungId: operationsUser.id,
        vaiTroId: operationsRole.id,
        donViId: organization.id,
        dangHoatDong: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  await db
    .update(nguoiDung)
    .set({
      trangThai: "hoat_dong",
      soLanDangNhapSaiLienTiep: 0,
      khoaDangNhapDenLuc: null,
      updatedAt: toDatabaseDateTime(),
    })
    .where(eq(nguoiDung.id, operationsUser.id));

  let admissionsUser = await findUserByUsername(config.admissionsUsername);
  if (!admissionsUser) {
    admissionsUser = await createUserWithRole({
      username: config.admissionsUsername,
      passwordHash,
      fullName: config.admissionsName,
      roleId: admissionsRole.id,
      organizationId: organization.id,
    });
  } else {
    const assignment = (
      await db
        .select()
        .from(nguoiDungVaiTroDonVi)
        .where(
          and(
            eq(nguoiDungVaiTroDonVi.nguoiDungId, admissionsUser.id),
            eq(nguoiDungVaiTroDonVi.vaiTroId, admissionsRole.id),
            eq(nguoiDungVaiTroDonVi.donViId, organization.id),
          ),
        )
        .limit(1)
    )[0];
    if (!assignment) {
      const now = toDatabaseDateTime();
      await db.insert(nguoiDungVaiTroDonVi).values({
        nguoiDungId: admissionsUser.id,
        vaiTroId: admissionsRole.id,
        donViId: organization.id,
        dangHoatDong: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  await resetUserPassword({ userId: admissionsUser.id, passwordHash });
  await db
    .update(nguoiDung)
    .set({
      batBuocDoiMatKhau: false,
      trangThai: "hoat_dong",
      soLanDangNhapSaiLienTiep: 0,
      khoaDangNhapDenLuc: null,
      updatedAt: toDatabaseDateTime(),
    })
    .where(eq(nguoiDung.id, admissionsUser.id));

  let accountingUser = await findUserByUsername(config.accountingUsername);
  if (!accountingUser) {
    accountingUser = await createUserWithRole({
      username: config.accountingUsername,
      passwordHash,
      fullName: config.accountingName,
      roleId: accountingRole.id,
      organizationId: organization.id,
    });
  } else {
    const assignment = (
      await db
        .select()
        .from(nguoiDungVaiTroDonVi)
        .where(
          and(
            eq(nguoiDungVaiTroDonVi.nguoiDungId, accountingUser.id),
            eq(nguoiDungVaiTroDonVi.vaiTroId, accountingRole.id),
            eq(nguoiDungVaiTroDonVi.donViId, organization.id),
          ),
        )
        .limit(1)
    )[0];

    if (!assignment) {
      const now = toDatabaseDateTime();
      await db.insert(nguoiDungVaiTroDonVi).values({
        nguoiDungId: accountingUser.id,
        vaiTroId: accountingRole.id,
        donViId: organization.id,
        dangHoatDong: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  await db
    .update(nguoiDung)
    .set({
      trangThai: "hoat_dong",
      soLanDangNhapSaiLienTiep: 0,
      khoaDangNhapDenLuc: null,
      updatedAt: toDatabaseDateTime(),
    })
    .where(eq(nguoiDung.id, accountingUser.id));
  await resetUserPassword({ userId: accountingUser.id, passwordHash });
  await db
    .update(nguoiDung)
    .set({ batBuocDoiMatKhau: false, updatedAt: toDatabaseDateTime() })
    .where(eq(nguoiDung.id, accountingUser.id));

  let managerUser = await findUserByUsername(config.managerUsername);
  if (!managerUser) {
    managerUser = await createUserWithRole({
      username: config.managerUsername,
      passwordHash,
      fullName: config.managerName,
      roleId: managerRole.id,
      organizationId: organization.id,
    });
  } else {
    const assignment = (
      await db
        .select()
        .from(nguoiDungVaiTroDonVi)
        .where(
          and(
            eq(nguoiDungVaiTroDonVi.nguoiDungId, managerUser.id),
            eq(nguoiDungVaiTroDonVi.vaiTroId, managerRole.id),
            eq(nguoiDungVaiTroDonVi.donViId, organization.id),
          ),
        )
        .limit(1)
    )[0];

    if (!assignment) {
      const now = toDatabaseDateTime();
      await db.insert(nguoiDungVaiTroDonVi).values({
        nguoiDungId: managerUser.id,
        vaiTroId: managerRole.id,
        donViId: organization.id,
        dangHoatDong: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  await resetUserPassword({ userId: managerUser.id, passwordHash });
  await db
    .update(nguoiDung)
    .set({
      batBuocDoiMatKhau: false,
      trangThai: "hoat_dong",
      soLanDangNhapSaiLienTiep: 0,
      khoaDangNhapDenLuc: null,
      updatedAt: toDatabaseDateTime(),
    })
    .where(eq(nguoiDung.id, managerUser.id));
  await resetUserPassword({ userId: operationsUser.id, passwordHash });
  await db
    .update(nguoiDung)
    .set({
      batBuocDoiMatKhau: false,
      updatedAt: toDatabaseDateTime(),
    })
    .where(eq(nguoiDung.id, operationsUser.id));
  // Ghi hash sau cùng: một số môi trường MySQL có trigger cập nhật hồ sơ
  // người dùng; thứ tự này bảo đảm tài khoản demo luôn đăng nhập được.
  await resetUserPassword({ userId: teacherUser.id, passwordHash });
  await db
    .update(nguoiDung)
    .set({
      batBuocDoiMatKhau: false,
      updatedAt: toDatabaseDateTime(),
    })
    .where(eq(nguoiDung.id, teacherUser.id));

  const existingLopHoc = await listLopHocByDonVi(organization.id);
  let classItem = existingLopHoc.find((item) => item.tenLop === config.className) ?? null;
  if (!classItem) {
    classItem = await createLopHocMoi({
      donViId: organization.id,
      chuongTrinhDaoTaoId: program.id,
      tenLop: config.className,
      capDo: config.classLevel,
      ngayBatDau: today,
      ngayKetThuc: addDaysIso(today, 90),
      siSoToiDa: 20,
      phongHoc: config.classroom,
      actorUserId,
    });
  }

  if (classItem.trangThai !== "dang_hoc") {
    classItem = await setLopHocStatus({
      donViId: organization.id,
      id: classItem.id,
      trangThai: "dang_hoc",
      actorUserId,
    });
  }

  const teacherAssignment = (
    await db
      .select()
      .from(lopHocGiaoVien)
      .where(
        and(
          eq(lopHocGiaoVien.lopHocId, classItem.id),
          eq(lopHocGiaoVien.giaoVienId, teacher.id),
          eq(lopHocGiaoVien.trangThai, "hoat_dong"),
        ),
      )
      .limit(1)
  )[0];

  if (!teacherAssignment) {
    await assignGiaoVienVaoLop({
      donViId: organization.id,
      lopHocId: classItem.id,
      giaoVienId: teacher.id,
      vaiTro: config.teacherClassRole,
      tuNgay: today,
      actorUserId,
    });
  }

  for (const studentInput of config.students) {
    let student = (
      await db
        .select()
        .from(hocSinh)
        .where(
          and(
            eq(hocSinh.donViId, organization.id),
            eq(hocSinh.hoTen, studentInput.hoTen),
          ),
        )
        .limit(1)
    )[0];

    if (!student) {
      student = await createHocSinhMoi({
        donViId: organization.id,
        ...studentInput,
        ngayNhapHoc: today,
        actorUserId,
      });
    }

    if (student.trangThai !== "dang_hoc") {
      student = await setHocSinhTrangThai({
        donViId: organization.id,
        id: student.id,
        trangThai: "dang_hoc",
        lyDo: config.statusReason,
        ngayHieuLuc: today,
        actorUserId,
      });
    }

    const enrollment = (
      await db
        .select()
        .from(hocSinhLopHoc)
        .where(
          and(
            eq(hocSinhLopHoc.hocSinhId, student.id),
            eq(hocSinhLopHoc.lopHocId, classItem.id),
            eq(hocSinhLopHoc.trangThai, "dang_hoc"),
          ),
        )
        .limit(1)
    )[0];

    if (!enrollment) {
      await xepHocSinhVaoLop({
        donViId: organization.id,
        hocSinhId: student.id,
        lopHocId: classItem.id,
        ngayVaoLop: today,
        actorUserId,
      });
    }
  }

  const enrollmentsForGuide = await db
    .select()
    .from(hocSinhLopHoc)
    .where(
      and(
        eq(hocSinhLopHoc.lopHocId, classItem.id),
        eq(hocSinhLopHoc.trangThai, "dang_hoc"),
      ),
    );
  const firstEnrollment = enrollmentsForGuide[0];
  const firstStudent = firstEnrollment
    ? (
        await db
          .select()
          .from(hocSinh)
          .where(eq(hocSinh.id, firstEnrollment.hocSinhId))
          .limit(1)
      )[0]
    : null;

  let parentUsername: string | null = null;
  if (firstStudent) {
    let guardian = await findPhuHuynhByPhoneGlobal(PARENT_PHONE);
    let guardianLink = guardian
      ? await findGuardianLink(firstStudent.id, guardian.id)
      : null;

    if (!guardianLink) {
      const linked = await addGuardianToStudent({
        donViId: organization.id,
        hocSinhId: firstStudent.id,
        dienThoai: PARENT_PHONE,
        hoTen: PARENT_NAME,
        email: "phuhuynh.demo@example.com",
        ngheNghiep: "Nhân viên văn phòng",
        diaChi: "Quận 8, Thành phố Hồ Chí Minh",
        moiQuanHe: "me",
        laLienHeChinh: true,
        duocDonTre: true,
        nhanThongBao: true,
        nhanThongTinHocPhi: true,
        confirmCrossOrgReuse: Boolean(guardian && guardian.donViId !== organization.id),
        actorUserId,
      });
      guardian = linked.guardian;
      guardianLink = linked.link;
    }

    if (guardianLink) {
      const account = await createGuardianAccount({
        donViId: organization.id,
        linkId: guardianLink.id,
        actorUserId,
      });
      parentUsername = account.tenDangNhap ?? PARENT_USERNAME;
      const parentUser = await findUserByUsername(parentUsername);
      if (parentUser) {
        await resetUserPassword({ userId: parentUser.id, passwordHash });
        await db
          .update(nguoiDung)
          .set({
            batBuocDoiMatKhau: false,
            trangThai: "hoat_dong",
            soLanDangNhapSaiLienTiep: 0,
            khoaDangNhapDenLuc: null,
            updatedAt: toDatabaseDateTime(),
          })
          .where(eq(nguoiDung.id, parentUser.id));
      }
    }

    const existingEvaluation = (
      await db
        .select()
        .from(hocSinhLopHocDanhGia)
        .where(
          and(
            eq(hocSinhLopHocDanhGia.enrollmentId, firstEnrollment.id),
            eq(hocSinhLopHocDanhGia.loaiDanhGia, "theo_thang"),
          ),
        )
        .limit(1)
    )[0];

    if (!existingEvaluation) {
      await addDanhGia({
        donViId: organization.id,
        hocSinhId: firstStudent.id,
        enrollmentId: firstEnrollment.id,
        loaiDanhGia: "theo_thang",
        linhVucPhatTrien: isEnglishCenter ? null : "ngon_ngu",
        diemSo: isEnglishCenter ? "8.5" : null,
        xepLoai: isEnglishCenter ? "Đạt" : "Tiến bộ tốt",
        nhanXet: isEnglishCenter
          ? "Học viên chủ động giao tiếp và hoàn thành tốt hoạt động trên lớp."
          : "Trẻ diễn đạt rõ ý, biết lắng nghe và tự tin trao đổi cùng cô và các bạn.",
        ngayDanhGia: today,
        actorUserId: teacherUser.id,
      });
    }
  }

  const notificationTitle = isEnglishCenter
    ? `Thông báo lịch học tháng ${today.slice(5, 7)}`
    : `Thông báo sinh hoạt tháng ${today.slice(5, 7)}`;
  const existingNotification = (
    await db
      .select()
      .from(thongBao)
      .where(
        and(
          eq(thongBao.donViId, organization.id),
          eq(thongBao.tieuDe, notificationTitle),
        ),
      )
      .limit(1)
  )[0];
  if (!existingNotification) {
    await createThongBaoMoi({
      donViId: organization.id,
      tieuDe: notificationTitle,
      noiDung: isEnglishCenter
        ? "Trung tâm thông báo lịch học và hoạt động bổ trợ trong tháng. Phụ huynh vui lòng theo dõi lịch trên Portal."
        : "Nhà trường thông báo kế hoạch chăm sóc, giáo dục và hoạt động trải nghiệm trong tháng. Phụ huynh vui lòng theo dõi trên Portal.",
      phamVi: "toan_truong",
      doiTuong: "Phụ huynh và học sinh toàn đơn vị",
      actorUserId: operationsUser.id,
    });
  }

  const existingRules = await db
    .select()
    .from(lichHoc)
    .where(
      and(
        eq(lichHoc.lopHocId, classItem.id),
        eq(lichHoc.trangThai, "hoat_dong"),
      ),
    );
  const existingWeekdays = new Set(existingRules.map((rule) => rule.thuTrongTuan));
  const missingWeekdays = config.weekdays.filter(
    (weekday) => !existingWeekdays.has(weekday),
  );

  if (missingWeekdays.length > 0) {
    await taoQuyTacLichHoc({
      donViId: organization.id,
      lopHocId: classItem.id,
      thuTrongTuanList: missingWeekdays,
      gioBatDau: config.startTime,
      gioKetThuc: config.endTime,
      phongHoc: classItem.phongHoc,
      giaoVienId: teacher.id,
      ngayApDungTu: today,
      ngayApDungDen: null,
      actorUserId,
    });
  }

  const activeRules = await db
    .select()
    .from(lichHoc)
    .where(
      and(
        eq(lichHoc.lopHocId, classItem.id),
        eq(lichHoc.trangThai, "hoat_dong"),
      ),
    );

  for (const rule of activeRules) {
    await sinhBuoiHoc({
      donViId: organization.id,
      lichHocId: rule.id,
      denNgay: scheduleEnd,
      actorUserId,
    });
  }

  // Mã khoản thu/kỳ thu giờ do hệ thống tự sinh (không nhận từ input nữa) —
  // đối chiếu idempotency theo TÊN thay vì mã cố định trước đây.
  const existingKhoanThu = await listDanhMucKhoanThuByDonVi(organization.id);
  const feeCategories = [];
  for (const fee of config.fees) {
    let category = existingKhoanThu.find((item) => item.tenKhoanThu === fee.name) ?? null;
    if (!category) {
      category = await createDanhMucKhoanThuMoi({
        donViId: organization.id,
        tenKhoanThu: fee.name,
        loaiKhoanThu: fee.type,
        soTienMacDinh: fee.amount,
        batBuoc: true,
        actorUserId: accountingUser.id,
      });
    }
    feeCategories.push({ category, amount: fee.amount });
  }

  const feePeriodName = `${config.feePeriodName} ${today.slice(0, 7)}`;
  const existingKyThu = await listKyThuByDonVi(organization.id);
  let feePeriod = existingKyThu.find((item) => item.tenKyThu === feePeriodName) ?? null;
  if (!feePeriod) {
    feePeriod = await createKyThuMoi({
      donViId: organization.id,
      tenKyThu: feePeriodName,
      loaiKy: isEnglishCenter ? "khoa_hoc" : "thang",
      tuNgay: today,
      denNgay: addDaysIso(today, 30),
      hanThanhToan: addDaysIso(today, 10),
      actorUserId: accountingUser.id,
    });
  }

  if (feePeriod.trangThai === "nhap") {
    await capNhatKhoanApDungKyThu({
      donViId: organization.id,
      id: feePeriod.id,
      danhSach: feeCategories.map(({ category, amount }) => ({
        danhMucKhoanThuId: category.id,
        soTien: amount,
      })),
      actorUserId: accountingUser.id,
    });
    feePeriod = await moKyThu({
      donViId: organization.id,
      id: feePeriod.id,
      actorUserId: accountingUser.id,
    });
  }

  await sinhKhoanPhaiThuChoLop({
    donViId: organization.id,
    kyThuId: feePeriod.id,
    lopHocId: classItem.id,
    actorUserId: accountingUser.id,
  });

  let receivables = await listKhoanPhaiThuTheoKyThu(organization.id, feePeriod.id);
  const totalFee = config.fees.reduce((sum, fee) => sum + fee.amount, 0);
  if (receivables[0] && Number(receivables[0].daThu) === 0) {
    await ghiNhanThuTien({
      donViId: organization.id,
      khoanPhaiThuId: receivables[0].id,
      soTien: 500_000,
      phuongThuc: "chuyen_khoan",
      ghiChu: "Phiếu thu một phần cho dữ liệu test.",
      actorUserId: accountingUser.id,
    });
  }
  if (receivables[1] && Number(receivables[1].daThu) === 0) {
    await ghiNhanThuTien({
      donViId: organization.id,
      khoanPhaiThuId: receivables[1].id,
      soTien: totalFee,
      phuongThuc: "tien_mat",
      ghiChu: "Phiếu thu đủ cho dữ liệu test.",
      actorUserId: accountingUser.id,
    });
  }
  receivables = await listKhoanPhaiThuTheoKyThu(organization.id, feePeriod.id);

  const [enrollments, sessions, portal] = await Promise.all([
    db
      .select()
      .from(hocSinhLopHoc)
      .where(
        and(
          eq(hocSinhLopHoc.lopHocId, classItem.id),
          eq(hocSinhLopHoc.trangThai, "dang_hoc"),
        ),
      ),
    listBuoiHocByLopHoc({
      lopHocId: classItem.id,
      tuNgay: today,
      denNgay: scheduleEnd,
    }),
    getTeacherPortalOverview({
      userId: teacherUser.id,
      donViId: organization.id,
    }),
  ]);
  const attendance = sessions[0]
    ? await getDiemDanhRoster(organization.id, sessions[0].id)
    : null;

  console.log(JSON.stringify({
    organization: `${organization.maDonVi} - ${organization.tenDonVi}`,
    username: config.teacherUsername,
    operationsUsername: config.operationsUsername,
    admissionsUsername: config.admissionsUsername,
    accountingUsername: config.accountingUsername,
    managerUsername: config.managerUsername,
    parentUsername,
    temporaryPassword: TEMPORARY_PASSWORD,
    teacherId: teacher.id,
    classId: classItem.id,
    classCode: classItem.maLop,
    scheduleFrom: today,
    scheduleTo: scheduleEnd,
    students: enrollments.length,
    sessions: sessions.length,
    portalClasses: portal.classes.length,
    portalSessionsNext7Days: portal.sessions.length,
    attendanceRoster: attendance?.hocSinh.length ?? 0,
    feePeriodCode: feePeriod.maKyThu,
    receivables: receivables.length,
    receivableStatuses: Object.fromEntries(
      ["chua_thu", "thu_mot_phan", "da_thu_du"].map((status) => [
        status,
        receivables.filter((item) => item.trangThai === status).length,
      ]),
    ),
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(`Seed test giáo viên ${isEnglishCenter ? "tiếng Anh" : "mầm non"} thất bại:`, error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDbConnection();
  });
