"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReviewStatus } from "@/lib/store/reviews";

type Props = {
  reviewId: string;
  status: ReviewStatus;
};

export default function ReviewActions({ reviewId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function setStatus(next: ReviewStatus) {
    setLoading(next);
    try {
      await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Xoá đánh giá này? Hành động này không thể hoàn tác.")) return;

    setLoading("delete");
    try {
      await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="review-actions">
      {status !== "approved" && (
        <button
          className="button-ghost"
          type="button"
          disabled={loading !== null}
          onClick={() => setStatus("approved")}
        >
          {loading === "approved" ? "Đang duyệt..." : "Duyệt"}
        </button>
      )}
      {status !== "rejected" && (
        <button
          className="button-ghost"
          type="button"
          disabled={loading !== null}
          onClick={() => setStatus("rejected")}
        >
          {loading === "rejected" ? "Đang từ chối..." : "Từ chối"}
        </button>
      )}
      <button
        className="button-danger"
        type="button"
        disabled={loading !== null}
        onClick={handleDelete}
      >
        {loading === "delete" ? "Đang xoá..." : "Xoá"}
      </button>
    </div>
  );
}
