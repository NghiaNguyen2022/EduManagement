import { and, eq, inArray, isNull } from "drizzle-orm";
import {
  nguoiDung,
  nguoiDungVaiTroDonVi,
  phienDangNhap,
  vaiTro,
} from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");

export async function listUsersByOrganization(organizationId: number) {
  const db = getDb();
  return db
    .select({
      id: nguoiDung.id,
      tenDangNhap: nguoiDung.tenDangNhap,
      hoTen: nguoiDung.hoTen,
      email: nguoiDung.email,
      soDienThoai: nguoiDung.soDienThoai,
      trangThai: nguoiDung.trangThai,
      batBuocDoiMatKhau: nguoiDung.batBuocDoiMatKhau,
      roleId: vaiTro.id,
      maVaiTro: vaiTro.maVaiTro,
      tenVaiTro: vaiTro.tenVaiTro,
      assignmentActive: nguoiDungVaiTroDonVi.dangHoatDong,
    })
    .from(nguoiDungVaiTroDonVi)
    .innerJoin(nguoiDung, eq(nguoiDungVaiTroDonVi.nguoiDungId, nguoiDung.id))
    .innerJoin(vaiTro, eq(nguoiDungVaiTroDonVi.vaiTroId, vaiTro.id))
    .where(eq(nguoiDungVaiTroDonVi.donViId, organizationId));
}

export async function listAssignableRoles() {
  const db = getDb();
  return db
    .select({
      id: vaiTro.id,
      maVaiTro: vaiTro.maVaiTro,
      tenVaiTro: vaiTro.tenVaiTro,
      phamVi: vaiTro.phamVi,
    })
    .from(vaiTro)
    .where(
      and(
        eq(vaiTro.dangHoatDong, true),
        inArray(vaiTro.phamVi, ["don_vi", "cong_thong_tin"]),
      ),
    );
}

export async function findAssignableRoleById(roleId: number) {
  const db = getDb();
  const rows = await db
    .select()
    .from(vaiTro)
    .where(
      and(
        eq(vaiTro.id, roleId),
        eq(vaiTro.dangHoatDong, true),
        inArray(vaiTro.phamVi, ["don_vi", "cong_thong_tin"]),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function findUserByUsername(username: string) {
  const db = getDb();
  const rows = await db.select().from(nguoiDung)
    .where(eq(nguoiDung.tenDangNhap, username)).limit(1);
  return rows[0] ?? null;
}

export async function findUserById(userId: number) {
  const db = getDb();
  const rows = await db.select().from(nguoiDung)
    .where(eq(nguoiDung.id, userId)).limit(1);
  return rows[0] ?? null;
}

export async function createUserWithRole(input: {
  username: string;
  passwordHash: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  roleId: number;
  organizationId: number;
}) {
  const db = getDb();
  return db.transaction(async (tx) => {
    await tx.insert(nguoiDung).values({
      tenDangNhap: input.username,
      matKhauHash: input.passwordHash,
      hoTen: input.fullName,
      email: input.email ?? null,
      soDienThoai: input.phone ?? null,
      trangThai: "hoat_dong",
      batBuocDoiMatKhau: true,
      createdAt: now(),
      updatedAt: now(),
    });
    const rows = await tx.select().from(nguoiDung)
      .where(eq(nguoiDung.tenDangNhap, input.username)).limit(1);
    const created = rows[0];
    if (!created) throw new Error("Không thể tải tài khoản vừa tạo.");
    await tx.insert(nguoiDungVaiTroDonVi).values({
      nguoiDungId: created.id,
      vaiTroId: input.roleId,
      donViId: input.organizationId,
      dangHoatDong: true,
      createdAt: now(),
      updatedAt: now(),
    });
    return created;
  });
}

export async function updateUserStatus(input: {
  userId: number;
  status: "hoat_dong" | "tam_khoa";
}) {
  const db = getDb();
  await db.update(nguoiDung).set({
    trangThai: input.status,
    updatedAt: now(),
  }).where(eq(nguoiDung.id, input.userId));
}

export async function revokeAllUserSessions(userId: number) {
  const db = getDb();
  await db.update(phienDangNhap).set({
    huyLuc: now(),
    updatedAt: now(),
  }).where(
    and(
      eq(phienDangNhap.nguoiDungId, userId),
      isNull(phienDangNhap.huyLuc),
    ),
  );
}

export async function resetUserPassword(input: {
  userId: number;
  passwordHash: string;
}) {
  const db = getDb();
  await db.update(nguoiDung).set({
    matKhauHash: input.passwordHash,
    batBuocDoiMatKhau: true,
    updatedAt: now(),
  }).where(eq(nguoiDung.id, input.userId));
}
