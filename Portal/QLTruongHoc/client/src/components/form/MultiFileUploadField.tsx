import { useState } from "react";
import { appUrl } from "../../utils/appUrl";

import { uploadMultipleFilesApi } from "../../features/upload/uploadApi";
import { FormField } from "./FormField";

type MultiFileUploadFieldProps = {
  label?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  accept?: string;
  required?: boolean;
  helpText?: string;
  className?: string;
};

/** Ô tải lên nhiều ảnh cùng lúc — dùng cho album hoạt động lớp học. */
export function MultiFileUploadField({
  label,
  value,
  onChange,
  accept = "image/*",
  required = false,
  helpText,
  className,
}: MultiFileUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) return;

    setError("");
    setUploading(true);

    try {
      const urls = await uploadMultipleFilesApi(files);
      onChange([...value, ...urls]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Không thể tải lên tệp.",
      );
    } finally {
      setUploading(false);
    }
  }

  function handleRemove(url: string) {
    onChange(value.filter((item) => item !== url));
  }

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
      className={className}
    >
      <div className="file-upload-field">
        {value.length > 0 ? (
          <div className="multi-file-upload-field__grid">
            {value.map((url) => (
              <div key={url} className="multi-file-upload-field__thumb-wrap">
                <img src={appUrl(url)} alt="" className="file-upload-field__thumb" />
                <button type="button" className="text-button" onClick={() => handleRemove(url)}>
                  Xoá
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <input
          type="file"
          accept={accept}
          multiple
          disabled={uploading}
          onChange={(event) => void handleFilesChange(event)}
        />

        {uploading ? <small>Đang tải lên...</small> : null}
      </div>
    </FormField>
  );
}
