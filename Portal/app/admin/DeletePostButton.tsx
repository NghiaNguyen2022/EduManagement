"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  postId: string;
  title: string;
  redirectTo?: string;
};

export default function DeletePostButton({ postId, title, redirectTo }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Xoá bài viết "${title}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    setLoading(true);
    try {
      await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="button-danger" onClick={handleDelete} disabled={loading} type="button">
      {loading ? "Đang xoá..." : "Xoá"}
    </button>
  );
}
