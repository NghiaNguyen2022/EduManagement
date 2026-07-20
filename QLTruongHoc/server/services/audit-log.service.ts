import {
  findAuditLogById,
  listAuditActions,
  listAuditLogs,
} from "../db/audit-log.repository.js";

export async function getAuditLogs(input: {
  organizationId?: number;
  search?: string;
  action?: string;
  level?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const page =
    Number.isInteger(input.page) &&
    Number(input.page) > 0
      ? Number(input.page)
      : 1;

  const requestedPageSize =
    Number.isInteger(input.pageSize) &&
    Number(input.pageSize) > 0
      ? Number(input.pageSize)
      : 20;

  const pageSize = Math.min(
    requestedPageSize,
    100,
  );

  const level =
    input.level === "thong_tin" ||
    input.level === "canh_bao" ||
    input.level === "loi"
      ? input.level
      : undefined;

  const result = await listAuditLogs({
    organizationId: input.organizationId,
    search: input.search?.trim() || undefined,
    action: input.action?.trim() || undefined,
    level,
    fromDate: input.fromDate || undefined,
    toDate: input.toDate || undefined,
    page,
    pageSize,
  });

  return {
    items: result.rows,
    pagination: {
      page,
      pageSize,
      total: result.total,
      totalPages: Math.max(
        1,
        Math.ceil(result.total / pageSize),
      ),
    },
  };
}

export async function getAuditActions(
  organizationId?: number,
) {
  return listAuditActions(organizationId);
}

export async function getAuditLogDetail(input: {
  logId: number;
  organizationId?: number;
  isSystemAdmin: boolean;
}) {
  const log = await findAuditLogById(
    input.logId,
  );

  if (!log) {
    throw new Error(
      "Không tìm thấy nhật ký.",
    );
  }

  if (
    !input.isSystemAdmin &&
    log.donViId !== input.organizationId
  ) {
    throw new Error(
      "Bạn không có quyền xem nhật ký này.",
    );
  }

  return log;
}
