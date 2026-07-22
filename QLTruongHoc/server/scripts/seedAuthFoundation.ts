import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

import {
  donVi,
  nguoiDung,
  nguoiDungVaiTroDonVi,
  quyen,
  vaiTro,
  vaiTroQuyen,
} from "../../drizzle/schema.js";
import { closeDbConnection, getDb } from "../db/connection.js";

const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");

const roleSeeds = [
  {
    maVaiTro: "quan_tri_he_thong",
    tenVaiTro: "Quản trị hệ thống",
    phamVi: "he_thong" as const,
  },
  {
    maVaiTro: "quan_ly_don_vi",
    tenVaiTro: "Quản lý đơn vị",
    phamVi: "don_vi" as const,
  },
  {
    maVaiTro: "tuyen_sinh",
    tenVaiTro: "Nhân viên tuyển sinh",
    phamVi: "don_vi" as const,
  },
  {
    maVaiTro: "tu_van",
    tenVaiTro: "Nhân viên tư vấn",
    phamVi: "don_vi" as const,
  },
  {
    maVaiTro: "hoc_vu",
    tenVaiTro: "Nhân viên học vụ",
    phamVi: "don_vi" as const,
  },
  {
    maVaiTro: "ke_toan",
    tenVaiTro: "Kế toán",
    phamVi: "don_vi" as const,
  },
  {
    maVaiTro: "giao_vien",
    tenVaiTro: "Giáo viên",
    phamVi: "don_vi" as const,
  },
  {
    maVaiTro: "phu_huynh",
    tenVaiTro: "Phụ huynh",
    phamVi: "cong_thong_tin" as const,
  },
];

const permissionSeeds = [
  ["he_thong.quan_tri", "Quản trị hệ thống", "Hệ thống"],
  ["don_vi.xem", "Xem đơn vị", "Đơn vị"],
  ["don_vi.quan_ly", "Quản lý đơn vị", "Đơn vị"],
  ["nguoi_dung.xem", "Xem người dùng", "Người dùng"],
  ["nguoi_dung.quan_ly", "Quản lý người dùng", "Người dùng"],
  ["phan_quyen.xem", "Xem phân quyền", "Phân quyền"],
  ["phan_quyen.quan_ly", "Quản lý phân quyền", "Phân quyền"],
  ["tuyen_sinh.xem", "Xem tuyển sinh", "Tuyển sinh"],
  ["tuyen_sinh.quan_ly", "Quản lý tuyển sinh", "Tuyển sinh"],
  ["hoc_sinh.xem", "Xem học sinh", "Học sinh"],
  ["hoc_sinh.quan_ly", "Quản lý học sinh", "Học sinh"],
  ["lop_hoc.xem", "Xem lớp học", "Lớp học"],
  ["lop_hoc.quan_ly", "Quản lý lớp học", "Lớp học"],
  ["diem_danh.xem", "Xem điểm danh", "Điểm danh"],
  ["diem_danh.thuc_hien", "Thực hiện điểm danh", "Điểm danh"],
  ["hoc_tap.xem", "Xem báo giảng", "Học tập"],
  ["hoc_tap.ghi_nhan", "Ghi nhận báo giảng", "Học tập"],
  ["tai_chinh.xem", "Xem tài chính", "Tài chính"],
  ["tai_chinh.quan_ly", "Quản lý tài chính", "Tài chính"],
  ["tai_chinh.duyet", "Duyệt điều chỉnh tài chính", "Tài chính"],
];

async function upsertRole(
  maVaiTro: string,
  tenVaiTro: string,
  phamVi: "he_thong" | "don_vi" | "cong_thong_tin",
) {
  const db = getDb();

  const existing = await db.select().from(vaiTro).where(eq(vaiTro.maVaiTro, maVaiTro)).limit(1);

  if (existing[0]) {
    return existing[0];
  }

  await db.insert(vaiTro).values({
    maVaiTro,
    tenVaiTro,
    phamVi,
    laVaiTroHeThong: true,
    dangHoatDong: true,
    createdAt: now(),
    updatedAt: now(),
  });

  const created = await db.select().from(vaiTro).where(eq(vaiTro.maVaiTro, maVaiTro)).limit(1);

  return created[0];
}

async function upsertPermission(maQuyen: string, tenQuyen: string, nhomQuyen: string) {
  const db = getDb();

  const existing = await db.select().from(quyen).where(eq(quyen.maQuyen, maQuyen)).limit(1);

  if (existing[0]) {
    return existing[0];
  }

  await db.insert(quyen).values({
    maQuyen,
    tenQuyen,
    nhomQuyen,
    dangHoatDong: true,
    createdAt: now(),
    updatedAt: now(),
  });

  const created = await db.select().from(quyen).where(eq(quyen.maQuyen, maQuyen)).limit(1);

  return created[0];
}

async function main() {
  const db = getDb();

  const roleMap = new Map<string, number>();

  for (const item of roleSeeds) {
    const role = await upsertRole(item.maVaiTro, item.tenVaiTro, item.phamVi);

    if (!role) {
      throw new Error(`Không thể tạo vai trò ${item.maVaiTro}`);
    }

    roleMap.set(item.maVaiTro, role.id);
  }

  const permissionMap = new Map<string, number>();

  for (const [maQuyen, tenQuyen, nhomQuyen] of permissionSeeds) {
    const permission = await upsertPermission(maQuyen, tenQuyen, nhomQuyen);

    if (!permission) {
      throw new Error(`Không thể tạo quyền ${maQuyen}`);
    }

    permissionMap.set(maQuyen, permission.id);
  }

  const systemRoleId = roleMap.get("quan_tri_he_thong");

  if (!systemRoleId) {
    throw new Error("Thiếu vai trò quản trị hệ thống.");
  }

  for (const permissionId of permissionMap.values()) {
    await db
      .insert(vaiTroQuyen)
      .values({
        vaiTroId: systemRoleId,
        quyenId: permissionId,
        createdAt: now(),
      })
      .onDuplicateKeyUpdate({
        set: {
          createdAt: now(),
        },
      });
  }

  const units = [
    {
      maDonVi: "SYSTEM",
      tenDonVi: "Hệ thống quản lý giáo dục",
      loaiDonVi: "he_thong" as const,
      loaiHinhDaoTao: "khac" as const,
    },
    {
      maDonVi: "TTNN-Q8",
      tenDonVi: "Trung tâm Ngoại ngữ Quận 8",
      loaiDonVi: "trung_tam" as const,
      loaiHinhDaoTao: "ngoai_ngu" as const,
    },
    {
      maDonVi: "MN-HOA-NANG",
      tenDonVi: "Trường Mầm non Hoa Nắng",
      loaiDonVi: "truong" as const,
      loaiHinhDaoTao: "mam_non" as const,
    },
  ];

  for (const unit of units) {
    const existing = await db.select().from(donVi).where(eq(donVi.maDonVi, unit.maDonVi)).limit(1);

    if (!existing[0]) {
      await db.insert(donVi).values({
        ...unit,
        trangThai: "hoat_dong",
        createdAt: now(),
        updatedAt: now(),
      });
    }
  }

  const systemUnit = await db.select().from(donVi).where(eq(donVi.maDonVi, "SYSTEM")).limit(1);

  if (!systemUnit[0]) {
    throw new Error("Không tìm thấy đơn vị SYSTEM.");
  }

  const existingAdmin = await db
    .select()
    .from(nguoiDung)
    .where(eq(nguoiDung.tenDangNhap, "admin"))
    .limit(1);

  let adminId = existingAdmin[0]?.id;

  if (!adminId) {
    const passwordHash = await hash("Admin@123", 12);

    await db.insert(nguoiDung).values({
      tenDangNhap: "admin",
      matKhauHash: passwordHash,
      hoTen: "Quản trị hệ thống",
      trangThai: "hoat_dong",
      batBuocDoiMatKhau: true,
      createdAt: now(),
      updatedAt: now(),
    });

    const createdAdmin = await db
      .select()
      .from(nguoiDung)
      .where(eq(nguoiDung.tenDangNhap, "admin"))
      .limit(1);

    adminId = createdAdmin[0]?.id;
  }

  if (!adminId) {
    throw new Error("Không thể tạo tài khoản admin.");
  }

  await db
    .insert(nguoiDungVaiTroDonVi)
    .values({
      nguoiDungId: adminId,
      vaiTroId: systemRoleId,
      donViId: systemUnit[0].id,
      dangHoatDong: true,
      createdAt: now(),
      updatedAt: now(),
    })
    .onDuplicateKeyUpdate({
      set: {
        dangHoatDong: true,
        updatedAt: now(),
      },
    });

  console.log("Seed nền tảng đăng nhập hoàn tất.");
  console.log("Tên đăng nhập: admin");
  console.log("Mật khẩu tạm: Admin@123");
  console.log("Bắt buộc đổi mật khẩu: Có");
}

main()
  .catch((error) => {
    console.error("Seed thất bại:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDbConnection();
  });
