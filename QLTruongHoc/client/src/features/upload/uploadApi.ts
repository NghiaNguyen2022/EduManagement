import { fetchApp } from "../../utils/appUrl";
type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export async function uploadFileApi(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchApp("/api/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const payload = (await response.json()) as ApiResponse<{ url: string }>;

  if (!response.ok || !payload.ok || payload.data === undefined) {
    throw new Error(payload.error || "Không thể tải lên tệp.");
  }

  return payload.data.url;
}

export async function uploadMultipleFilesApi(files: File[]): Promise<string[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }

  const response = await fetchApp("/api/upload/multiple", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const payload = (await response.json()) as ApiResponse<{ urls: string[] }>;

  if (!response.ok || !payload.ok || payload.data === undefined) {
    throw new Error(payload.error || "Không thể tải lên tệp.");
  }

  return payload.data.urls;
}
