"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  slug: string;
  title: string;
  redirectTo?: string;
};

export default function DeleteAppButton({ slug, title, redirectTo }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Xoá ứng dụng "${title}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    setLoading(true);
    try {
      await fetch(`/api/admin/apps/${slug}`, { method: "DELETE" });
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
