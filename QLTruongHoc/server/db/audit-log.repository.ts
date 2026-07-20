import {
  and,
  asc,
  desc,
  eq,
  gte,
  like,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import {
  donVi,
  nhatKyHeThong,
  nguoiDung,
} from "../../drizzle/schema.js";
import { getDb } from "./connection.js";

export type AuditLogQuery = {
  organizationId?: number;
  search?: string;
  action?: string;
  level?: "thong_tin" | "canh_bao" | "loi";
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
};

function buildConditions(
  input: AuditLogQuery,
): SQL[] {
  const conditions: SQL[] = [];

  if (input.organizationId) {
    conditions.push(
      eq(
        nhatKyHeThong.donViId,
        input.organizationId,
      ),
    );
  }

  if (input.action) {
    conditions.push(
      eq(
        nhatKyHeThong.hanhDong,
        input.action,
      ),
    );
  }

  if (input.level) {
    conditions.push(
      eq(
        nhatKyHeThong.mucDo,
        input.level,
      ),
    );
  }

  if (input.fromDate) {
    conditions.push(
      gte(
        nhatKyHeThong.createdAt,
        `${input.fromDate} 00:00:00`,
      ),
    );
  }

  if (input.toDate) {
    conditions.push(
      lte(
        nhatKyHeThong.createdAt,
        `${input.toDate} 23:59:59`,
      ),
    );
  }

  if (input.search) {
    const keyword = `%${input.search}%`;

    const searchCondition = or(
      like(
        nhatKyHeThong.hanhDong,
        keyword,
      ),
      like(
        nhatKyHeThong.noiDung,
        keyword,
      ),
      like(
        nhatKyHeThong.doiTuong,
        keyword,
      ),
      like(
        nhatKyHeThong.doiTuongId,
        keyword,
      ),
      like(
        nguoiDung.hoTen,
        keyword,
      ),
      like(
        nguoiDung.tenDangNhap,
        keyword,
      ),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  return conditions;
}

function combineConditions(
  conditions: SQL[],
): SQL | undefined {
  if (conditions.length === 0) {
    return undefined;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return and(...conditions);
}

export async function listAuditLogs(
  input: AuditLogQuery,
) {
  const db = getDb();
  const conditions =
    buildConditions(input);
  const whereCondition =
    combineConditions(conditions);
  const offset =
    (input.page - 1) *
    input.pageSize;

  const rows = await db
    .select({
      id: nhatKyHeThong.id,
      nguoiDungId:
        nhatKyHeThong.nguoiDungId,
      donViId:
        nhatKyHeThong.donViId,
      hanhDong:
        nhatKyHeThong.hanhDong,
      doiTuong:
        nhatKyHeThong.doiTuong,
      doiTuongId:
        nhatKyHeThong.doiTuongId,
      noiDung:
        nhatKyHeThong.noiDung,
      mucDo:
        nhatKyHeThong.mucDo,
      diaChiIp:
        nhatKyHeThong.diaChiIp,
      createdAt:
        nhatKyHeThong.createdAt,
      nguoiDungHoTen:
        nguoiDung.hoTen,
      nguoiDungTenDangNhap:
        nguoiDung.tenDangNhap,
      donViTen:
        donVi.tenDonVi,
      donViMa:
        donVi.maDonVi,
    })
    .from(nhatKyHeThong)
    .leftJoin(
      nguoiDung,
      eq(
        nhatKyHeThong.nguoiDungId,
        nguoiDung.id,
      ),
    )
    .leftJoin(
      donVi,
      eq(
        nhatKyHeThong.donViId,
        donVi.id,
      ),
    )
    .where(whereCondition)
    .orderBy(
      desc(
        nhatKyHeThong.createdAt,
      ),
    )
    .limit(input.pageSize)
    .offset(offset);

  const countRows = await db
    .select({
      total:
        sql<number>`count(*)`,
    })
    .from(nhatKyHeThong)
    .leftJoin(
      nguoiDung,
      eq(
        nhatKyHeThong.nguoiDungId,
        nguoiDung.id,
      ),
    )
    .where(whereCondition);

  return {
    rows,
    total: Number(
      countRows[0]?.total ?? 0,
    ),
  };
}

export async function listAuditActions(
  organizationId?: number,
) {
  const db = getDb();

  const rows = await db
    .select({
      action:
        nhatKyHeThong.hanhDong,
    })
    .from(nhatKyHeThong)
    .where(
      organizationId
        ? eq(
            nhatKyHeThong.donViId,
            organizationId,
          )
        : undefined,
    )
    .groupBy(
      nhatKyHeThong.hanhDong,
    )
    .orderBy(
      asc(
        nhatKyHeThong.hanhDong,
      ),
    );

  return rows
    .map((row) => row.action)
    .filter(
      (action): action is string =>
        Boolean(action),
    );
}

export async function findAuditLogById(
  logId: number,
) {
  const db = getDb();

  const rows = await db
    .select({
      id: nhatKyHeThong.id,
      nguoiDungId:
        nhatKyHeThong.nguoiDungId,
      donViId:
        nhatKyHeThong.donViId,
      hanhDong:
        nhatKyHeThong.hanhDong,
      doiTuong:
        nhatKyHeThong.doiTuong,
      doiTuongId:
        nhatKyHeThong.doiTuongId,
      noiDung:
        nhatKyHeThong.noiDung,
      duLieu:
        nhatKyHeThong.duLieu,
      mucDo:
        nhatKyHeThong.mucDo,
      diaChiIp:
        nhatKyHeThong.diaChiIp,
      createdAt:
        nhatKyHeThong.createdAt,
      nguoiDungHoTen:
        nguoiDung.hoTen,
      nguoiDungTenDangNhap:
        nguoiDung.tenDangNhap,
      donViTen:
        donVi.tenDonVi,
      donViMa:
        donVi.maDonVi,
    })
    .from(nhatKyHeThong)
    .leftJoin(
      nguoiDung,
      eq(
        nhatKyHeThong.nguoiDungId,
        nguoiDung.id,
      ),
    )
    .leftJoin(
      donVi,
      eq(
        nhatKyHeThong.donViId,
        donVi.id,
      ),
    )
    .where(
      eq(
        nhatKyHeThong.id,
        logId,
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}
