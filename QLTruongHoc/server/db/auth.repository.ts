import {
  and,
  eq,
  gt,
  isNull,
  ne,
} from "drizzle-orm";

import {
  donVi,
  nguoiDung,
  nguoiDungVaiTroDonVi,
  phienDangNhap,
  quyen,
  vaiTro,
  vaiTroQuyen,
} from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

export async function findUserByUsername(username: string) {
  const db = getDb();

  const rows = await db
    .select()
    .from(nguoiDung)
    .where(eq(nguoiDung.tenDangNhap, username))
    .limit(1);

  return rows[0] ?? null;
}

export async function findUserById(userId: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(nguoiDung)
    .where(eq(nguoiDung.id, userId))
    .limit(1);

  return rows[0] ?? null;
}

export async function updateLastLogin(userId: number) {
  const db = getDb();

  await db
    .update(nguoiDung)
    .set({
      lanDangNhapCuoi: now(),
      updatedAt: now(),
    })
    .where(eq(nguoiDung.id, userId));
}

export async function updatePassword(input: {
  userId: number;
  passwordHash: string;
}) {
  const db = getDb();

  await db
    .update(nguoiDung)
    .set({
      matKhauHash: input.passwordHash,
      batBuocDoiMatKhau: false,
      updatedAt: now(),
    })
    .where(eq(nguoiDung.id, input.userId));
}

export async function setFailedLoginState(input: {
  userId: number;
  attempts: number;
  lockUntil: string | null;
}) {
  const db = getDb();

  await db
    .update(nguoiDung)
    .set({
      soLanDangNhapSaiLienTiep: input.attempts,
      khoaDangNhapDenLuc: input.lockUntil,
      updatedAt: now(),
    })
    .where(eq(nguoiDung.id, input.userId));
}

export async function resetFailedLoginState(userId: number) {
  const db = getDb();

  await db
    .update(nguoiDung)
    .set({
      soLanDangNhapSaiLienTiep: 0,
      khoaDangNhapDenLuc: null,
      updatedAt: now(),
    })
    .where(eq(nguoiDung.id, userId));
}

export async function createSession(input: {
  userId: number;
  tokenHash: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const db = getDb();

  await db.insert(phienDangNhap).values({
    nguoiDungId: input.userId,
    maPhienHash: input.tokenHash,
    diaChiIp: input.ipAddress,
    userAgent: input.userAgent,
    hetHanLuc: input.expiresAt,
    createdAt: now(),
    updatedAt: now(),
  });

  const rows = await db
    .select()
    .from(phienDangNhap)
    .where(eq(phienDangNhap.maPhienHash, input.tokenHash))
    .limit(1);

  return rows[0];
}

export async function findActiveSessionByHash(tokenHash: string) {
  const db = getDb();

  const rows = await db
    .select({
      session: phienDangNhap,
      user: nguoiDung,
    })
    .from(phienDangNhap)
    .innerJoin(
      nguoiDung,
      eq(phienDangNhap.nguoiDungId, nguoiDung.id),
    )
    .where(
      and(
        eq(phienDangNhap.maPhienHash, tokenHash),
        isNull(phienDangNhap.huyLuc),
        gt(phienDangNhap.hetHanLuc, now()),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function revokeSessionByHash(tokenHash: string) {
  const db = getDb();

  await db
    .update(phienDangNhap)
    .set({
      huyLuc: now(),
      updatedAt: now(),
    })
    .where(eq(phienDangNhap.maPhienHash, tokenHash));
}

export async function revokeOtherSessions(input: {
  userId: number;
  currentSessionId: number;
}) {
  const db = getDb();

  await db
    .update(phienDangNhap)
    .set({
      huyLuc: now(),
      updatedAt: now(),
    })
    .where(
      and(
        eq(phienDangNhap.nguoiDungId, input.userId),
        ne(phienDangNhap.id, input.currentSessionId),
        isNull(phienDangNhap.huyLuc),
      ),
    );
}

export async function updateCurrentOrganization(
  sessionId: number,
  organizationId: number,
) {
  const db = getDb();

  await db
    .update(phienDangNhap)
    .set({
      donViHienTaiId: organizationId,
      updatedAt: now(),
    })
    .where(eq(phienDangNhap.id, sessionId));
}

export async function getOrganizationsForUser(userId: number) {
  const db = getDb();

  const assignments = await db
    .select({
      organization: donVi,
      role: vaiTro,
      permissionCode: quyen.maQuyen,
    })
    .from(nguoiDungVaiTroDonVi)
    .innerJoin(
      donVi,
      eq(nguoiDungVaiTroDonVi.donViId, donVi.id),
    )
    .innerJoin(
      vaiTro,
      eq(nguoiDungVaiTroDonVi.vaiTroId, vaiTro.id),
    )
    .leftJoin(
      vaiTroQuyen,
      eq(vaiTroQuyen.vaiTroId, vaiTro.id),
    )
    .leftJoin(
      quyen,
      eq(vaiTroQuyen.quyenId, quyen.id),
    )
    .where(
      and(
        eq(nguoiDungVaiTroDonVi.nguoiDungId, userId),
        eq(nguoiDungVaiTroDonVi.dangHoatDong, true),
        eq(vaiTro.dangHoatDong, true),
        eq(donVi.trangThai, "hoat_dong"),
      ),
    );

  const map = new Map<number, {
    id: number;
    maDonVi: string;
    tenDonVi: string;
    loaiDonVi: string;
    loaiHinhDaoTao: string | null;
    vaiTro: Set<string>;
    quyen: Set<string>;
  }>();

  for (const row of assignments) {
    let item = map.get(row.organization.id);

    if (!item) {
      item = {
        id: row.organization.id,
        maDonVi: row.organization.maDonVi,
        tenDonVi: row.organization.tenDonVi,
        loaiDonVi: row.organization.loaiDonVi,
        loaiHinhDaoTao: row.organization.loaiHinhDaoTao,
        vaiTro: new Set<string>(),
        quyen: new Set<string>(),
      };

      map.set(row.organization.id, item);
    }

    item.vaiTro.add(row.role.maVaiTro);

    if (row.permissionCode) {
      item.quyen.add(row.permissionCode);
    }
  }

  const isSystemAdmin = assignments.some(
    (row) => row.permissionCode === "he_thong.quan_tri",
  );

  if (isSystemAdmin) {
    const allOrganizations = await db
      .select()
      .from(donVi)
      .where(eq(donVi.trangThai, "hoat_dong"));

    for (const organization of allOrganizations) {
      let item = map.get(organization.id);

      if (!item) {
        item = {
          id: organization.id,
          maDonVi: organization.maDonVi,
          tenDonVi: organization.tenDonVi,
          loaiDonVi: organization.loaiDonVi,
          loaiHinhDaoTao: organization.loaiHinhDaoTao,
          vaiTro: new Set<string>(),
          quyen: new Set<string>(),
        };

        map.set(organization.id, item);
      }

      // Quản trị hệ thống có toàn quyền ở mọi đơn vị, kể cả nơi chưa có
      // dòng gán vai trò tường minh — tránh mất quyền khi chuyển đơn vị.
      item.quyen.add("he_thong.quan_tri");
    }
  }

  return Array.from(map.values()).map((item) => ({
    ...item,
    vaiTro: Array.from(item.vaiTro),
    quyen: Array.from(item.quyen),
  }));
}
