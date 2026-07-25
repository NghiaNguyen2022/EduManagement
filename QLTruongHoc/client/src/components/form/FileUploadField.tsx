import { useState } from "react";

import { uploadFileApi } from "../../features/upload/uploadApi";
import { FormField } from "./FormField";

type FileUploadFieldProps = {
  label?: string;
  value: string | null;
  onChange: (url: string | null) => void;
  accept?: string;
  required?: boolean;
  helpText?: string;
  previewAsImage?: boolean;
};

/** Ô tải lên 1 tệp dùng chung (ảnh, PDF) — lưu URL trả về từ `/api/upload`. */
export function FileUploadField({
  label,
  value,
  onChange,
  accept = "image/*",
  required = false,
  helpText,
  previewAsImage = true,
}: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const url = await uploadFileApi(file);
      onChange(url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Không thể tải lên tệp.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <FormField label={label} required={required} error={error} helpText={helpText}>
      <div className="file-upload-field">
        {value ? (
          <div className="file-upload-field__preview">
            {previewAsImage ? (
              <img src={value} alt="" className="file-upload-field__thumb" />
            ) : (
              <a href={value} target="_blank" rel="noreferrer" className="text-button">
                Xem tệp đã tải lên
              </a>
            )}

            <button
              type="button"
              className="text-button"
              onClick={() => onChange(null)}
            >
              Xoá
            </button>
          </div>
        ) : null}

        <input
          type="file"
          accept={accept}
          disabled={uploading}
          onChange={(event) => void handleFileChange(event)}
        />

        {uploading ? <small>Đang tải lên...</small> : null}
      </div>
    </FormField>
  );
}
