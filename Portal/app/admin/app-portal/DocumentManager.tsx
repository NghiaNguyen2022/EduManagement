"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AppDocument } from "@/lib/store/app-content";

type Props = {
  slug: string;
  documents: AppDocument[];
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentManager({ slug, documents }: Props) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`/api/admin/app-portal/${slug}/documents`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Tải tài liệu thất bại.");
        return;
      }

      router.refresh();
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleDelete(docId: string) {
    if (!window.confirm("Xoá tài liệu này?")) return;

    setDeletingId(docId);
    try {
      await fetch(`/api/admin/app-portal/${slug}/documents/${docId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {error && <div className="form-error">{error}</div>}

      <div className="form-field">
        <label htmlFor="doc-upload">
          Tải lên tài liệu mới (PDF, Word, PowerPoint — tối đa 15MB)
        </label>
        <input
          id="doc-upload"
          type="file"
          accept="application/pdf,.doc,.docx,.ppt,.pptx"
          onChange={handleUpload}
          disabled={uploading}
        />
        {uploading && <span>Đang tải lên...</span>}
      </div>

      {documents.length === 0 ? (
        <p className="admin-empty">Chưa có tài liệu nào.</p>
      ) : (
        <div className="document-list">
          {documents.map((doc) => (
            <div className="document-item" key={doc.id}>
              <span className="document-icon">
                {doc.name.split(".").pop()?.slice(0, 4).toUpperCase()}
              </span>
              <div className="document-info">
                <strong>{doc.name}</strong>
                <span>{formatSize(doc.size)}</span>
              </div>
              <button
                className="button-danger"
                type="button"
                disabled={deletingId === doc.id}
                onClick={() => handleDelete(doc.id)}
              >
                {deletingId === doc.id ? "Đang xoá..." : "Xoá"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
