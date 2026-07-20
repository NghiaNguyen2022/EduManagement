import {
  and,
  eq,
} from "drizzle-orm";

import {
  donVi,
  nguoiDungVaiTroDonVi,
  vaiTro,
} from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

export async function listUserAssignments(
  userId: number,
) {
  const db = getDb();

  return db
    .select({
      id:
        nguoiDungVaiTroDonVi.id,
      nguoiDungId:
        nguoiDungVaiTroDonVi.nguoiDungId,
      vaiTroId:
        nguoiDungVaiTroDonVi.vaiTroId,
      donViId:
        nguoiDungVaiTroDonVi.donViId,
      dangHoatDong:
        nguoiDungVaiTroDonVi.dangHoatDong,
      tuNgay:
        nguoiDungVaiTroDonVi.tuNgay,
      denNgay:
        nguoiDungVaiTroDonVi.denNgay,
      maVaiTro:
        vaiTro.maVaiTro,
      tenVaiTro:
        vaiTro.tenVaiTro,
      maDonVi:
        donVi.maDonVi,
      tenDonVi:
        donVi.tenDonVi,
    })
    .from(nguoiDungVaiTroDonVi)
    .innerJoin(
      vaiTro,
      eq(
        nguoiDungVaiTroDonVi.vaiTroId,
        vaiTro.id,
      ),
    )
    .innerJoin(
      donVi,
      eq(
        nguoiDungVaiTroDonVi.donViId,
        donVi.id,
      ),
    )
    .where(
      eq(
        nguoiDungVaiTroDonVi.nguoiDungId,
        userId,
      ),
    );
}

export async function findAssignment(
  userId: number,
  roleId: number,
  organizationId: number,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(nguoiDungVaiTroDonVi)
    .where(
      and(
        eq(
          nguoiDungVaiTroDonVi.nguoiDungId,
          userId,
        ),
        eq(
          nguoiDungVaiTroDonVi.vaiTroId,
          roleId,
        ),
        eq(
          nguoiDungVaiTroDonVi.donViId,
          organizationId,
        ),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function createAssignment(
  input: {
    userId: number;
    roleId: number;
    organizationId: number;
  },
) {
  const db = getDb();

  await db
    .insert(
      nguoiDungVaiTroDonVi,
    )
    .values({
      nguoiDungId: input.userId,
      vaiTroId: input.roleId,
      donViId: input.organizationId,
      dangHoatDong: true,
    });

  return findAssignment(
    input.userId,
    input.roleId,
    input.organizationId,
  );
}

export async function findAssignmentById(
  assignmentId: number,
) {
  const db = getDb();

  const rows = await db
    .select()
    .from(nguoiDungVaiTroDonVi)
    .where(
      eq(
        nguoiDungVaiTroDonVi.id,
        assignmentId,
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function deleteAssignment(
  assignmentId: number,
) {
  const db = getDb();

  await db
    .delete(
      nguoiDungVaiTroDonVi,
    )
    .where(
      eq(
        nguoiDungVaiTroDonVi.id,
        assignmentId,
      ),
    );
}
