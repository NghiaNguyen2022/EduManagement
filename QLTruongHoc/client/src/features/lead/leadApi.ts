import type {
  ConfirmRegistrationInput,
  LeadActivityFormInput,
  LeadDetail,
  LeadFormInput,
  LeadItem,
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

export function listLeadApi() {
  return request<LeadItem[]>("/api/leads");
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
    body: JSON.stringify(input),
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
  return request(
    `/api/leads/${id}/xac-nhan-dang-ky`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}
