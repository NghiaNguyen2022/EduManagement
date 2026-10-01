"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  slug: string;
  initialUrl: string | null;
};

export default function VideoUrlForm({ slug, initialUrl }: Props) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/app-portal/${slug}/video`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Không thể lưu.");
        return;
      }

      setSuccess(true);
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
      {success && <div className="form-success">Đã lưu link video.</div>}

      <div className="form-field">
        <label htmlFor="video-url">Link video demo (YouTube/Vimeo)</label>
        <input
          id="video-url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>

      <div className="form-actions">
        <button className="button-submit" type="submit" disabled={submitting}>
          {submitting ? "Đang lưu..." : "Lưu video"}
        </button>
      </div>
    </form>
  );
}
