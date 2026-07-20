import type {
  AuditLogDetail,
  AuditLogListResult,
} from "./auditLogTypes";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

async function request<T>(
  url: string,
): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
  });

  const payload =
    (await response.json()) as ApiResponse<T>;

  if (
    !response.ok ||
    !payload.ok ||
    payload.data === undefined
  ) {
    throw new Error(
      payload.error ||
        "Không thể tải dữ liệu.",
    );
  }

  return payload.data;
}

export function listAuditLogsApi(input: {
  search: string;
  action: string;
  level: string;
  fromDate: string;
  toDate: string;
  page: number;
  pageSize: number;
}) {
  const params = new URLSearchParams();

  if (input.search) {
    params.set("search", input.search);
  }

  if (input.action) {
    params.set("action", input.action);
  }

  if (input.level) {
    params.set("level", input.level);
  }

  if (input.fromDate) {
    params.set("fromDate", input.fromDate);
  }

  if (input.toDate) {
    params.set("toDate", input.toDate);
  }

  params.set("page", String(input.page));
  params.set(
    "pageSize",
    String(input.pageSize),
  );

  return request<AuditLogListResult>(
    `/api/audit-logs?${params.toString()}`,
  );
}

export function listAuditActionsApi() {
  return request<string[]>(
    "/api/audit-logs/actions",
  );
}

export function getAuditLogDetailApi(
  logId: number,
) {
  return request<AuditLogDetail>(
    `/api/audit-logs/${logId}`,
  );
}
