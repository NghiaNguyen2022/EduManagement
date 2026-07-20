import {
  eq,
  inArray,
} from "drizzle-orm";

import {
  quyen,
  vaiTro,
  vaiTroQuyen,
} from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

const now = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

export async function listRoles() {
  const db = getDb();

  return db
    .select({
      id: vaiTro.id,
      maVaiTro: vaiTro.maVaiTro,
      tenVaiTro: vaiTro.tenVaiTro,
      moTa: vaiTro.moTa,
      phamVi: vaiTro.phamVi,
      laVaiTroHeThong: vaiTro.laVaiTroHeThong,
      dangHoatDong: vaiTro.dangHoatDong,
    })
    .from(vaiTro);
}

export async function findRoleById(roleId: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(vaiTro)
    .where(eq(vaiTro.id, roleId))
    .limit(1);

  return rows[0] ?? null;
}

export async function listPermissions() {
  const db = getDb();

  return db
    .select({
      id: quyen.id,
      maQuyen: quyen.maQuyen,
      tenQuyen: quyen.tenQuyen,
      nhomQuyen: quyen.nhomQuyen,
      moTa: quyen.moTa,
      dangHoatDong: quyen.dangHoatDong,
    })
    .from(quyen)
    .where(eq(quyen.dangHoatDong, true));
}

export async function listPermissionIdsByRole(
  roleId: number,
) {
  const db = getDb();

  const rows = await db
    .select({
      permissionId: vaiTroQuyen.quyenId,
    })
    .from(vaiTroQuyen)
    .where(eq(vaiTroQuyen.vaiTroId, roleId));

  return rows.map((row) => row.permissionId);
}

export async function findPermissionsByIds(
  permissionIds: number[],
) {
  const db = getDb();

  if (permissionIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(quyen)
    .where(
      inArray(quyen.id, permissionIds),
    );
}

export async function replaceRolePermissions(input: {
  roleId: number;
  permissionIds: number[];
}) {
  const db = getDb();

  await db.transaction(async (tx) => {
    await tx
      .delete(vaiTroQuyen)
      .where(
        eq(
          vaiTroQuyen.vaiTroId,
          input.roleId,
        ),
      );

    if (input.permissionIds.length > 0) {
      await tx
        .insert(vaiTroQuyen)
        .values(
          input.permissionIds.map(
            (permissionId) => ({
              vaiTroId: input.roleId,
              quyenId: permissionId,
              createdAt: now(),
            }),
          ),
        );
    }
  });
}
