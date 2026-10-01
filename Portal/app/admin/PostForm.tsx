"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Post } from "@/lib/store/posts";

type Props = {
  mode: "create" | "edit";
  postId?: string;
  initialPost?: Post;
};

export default function PostForm({ mode, postId, initialPost }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [body, setBody] = useState(initialPost?.body ?? "");
  const [tags, setTags] = useState(initialPost?.tags.join(", ") ?? "");
  const [published, setPublished] = useState(initialPost?.published ?? false);
  const [coverImageKey, setCoverImageKey] = useState<string | null>(
    initialPost?.coverImageKey ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Tải ảnh thất bại.");
        return;
      }

      setCoverImageKey(data.key as string);
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const endpoint = mode === "create" ? "/api/admin/posts" : `/api/admin/posts/${postId}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, tags, coverImageKey, published }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Không thể lưu bài viết.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-field">
        <label htmlFor="title">Tiêu đề</label>
        <input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="body">
          Nội dung (hỗ trợ **đậm**, *nghiêng*, [link](https://...))
        </label>
        <textarea id="body" value={body} onChange={(event) => setBody(event.target.value)} required />
      </div>

      <div className="form-field">
        <label htmlFor="tags">Tag / chuyên mục (phân tách bằng dấu phẩy)</label>
        <input
          id="tags"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="ERP, Dữ liệu, Chuyển đổi số"
        />
      </div>

      <div className="form-field">
        <label htmlFor="cover">Ảnh đại diện</label>
        <input
          id="cover"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
        />
        {uploading && <span>Đang tải ảnh...</span>}
        {coverImageKey && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="cover-preview"
            src={`/api/images/${coverImageKey}`}
            alt="Xem trước ảnh đại diện"
          />
        )}
      </div>

      <label className="form-checkbox">
        <input
          type="checkbox"
          checked={published}
          onChange={(event) => setPublished(event.target.checked)}
        />
        Xuất bản ngay (hiển thị công khai trên /feed)
      </label>

      <div className="form-actions">
        <button className="button-submit" type="submit" disabled={submitting || uploading}>
          {submitting ? "Đang lưu..." : mode === "create" ? "Tạo bài viết" : "Lưu thay đổi"}
        </button>
        <a className="button-ghost" href="/admin">
          Huỷ
        </a>
      </div>
    </form>
  );
}
