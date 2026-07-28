import type {
  ConfirmRegistrationInput,
  ConfirmRegistrationResult,
  LeadActivityFormInput,
  LeadDetail,
  LeadFormInput,
  LeadItem,
  LichHenSapToiItem,
  TrangThaiHoatDong,
} from "./leadTypes";

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  const payload =
    (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.ok) {
    throw new Error(
      payload.error || "Yêu cầu thất bại.",
    );
  }

  return payload.data as T;
}

export async function listLeadApi() {
  const rows = await request<
    (LeadItem | { lead: LeadItem; donVi: LeadItem["donVi"] })[]
  >("/api/leads");

  return rows.map((row) =>
    "lead" in row ? { ...row.lead, donVi: row.donVi } : row,
  );
}

export function createLeadApi(input: LeadFormInput) {
  return request<LeadItem>("/api/leads", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getLeadDetailApi(id: number) {
  return request<LeadDetail>(`/api/leads/${id}`);
}

export function updateLeadApi(
  id: number,
  input: LeadFormInput,
) {
  return request<LeadItem>(`/api/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function addLeadActivityApi(
  id: number,
  input: LeadActivityFormInput,
) {
  return request(`/api/leads/${id}/hoat-dong`, {
    method: "POST",
    body: JSON.stringify({
      ...input,
      // `datetime-local` trả "YYYY-MM-DDTHH:mm" — đổi sang "YYYY-MM-DD HH:mm:ss" khớp cột DATETIME.
      thoiGian: input.thoiGian ? `${input.thoiGian.replace("T", " ")}:00` : null,
    }),
  });
}

export function listLichHenSapToiApi() {
  return request<LichHenSapToiItem[]>("/api/leads/lich-hen-sap-toi");
}

export function xuLyLichHenApi(hoatDongId: number, trangThai: TrangThaiHoatDong) {
  return request(`/api/leads/hoat-dong/${hoatDongId}/trang-thai`, {
    method: "PATCH",
    body: JSON.stringify({ trangThai }),
  });
}

export function markLeadNotContinuingApi(
  id: number,
  lyDo: string,
) {
  return request<LeadItem>(
    `/api/leads/${id}/khong-tiep-tuc`,
    {
      method: "POST",
      body: JSON.stringify({ lyDo }),
    },
  );
}

export function reopenLeadApi(id: number) {
  return request<LeadItem>(
    `/api/leads/${id}/mo-lai`,
    { method: "POST" },
  );
}

export function confirmLeadRegistrationApi(
  id: number,
  input: ConfirmRegistrationInput,
) {
  return request<ConfirmRegistrationResult>(
    `/api/leads/${id}/xac-nhan-dang-ky`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}
