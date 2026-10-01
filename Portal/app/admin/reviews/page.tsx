import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listAllReviews } from "@/lib/store/reviews";
import { listApps } from "@/lib/store/apps";
import { formatStars } from "@/lib/ratings";
import ReviewActions from "./ReviewActions";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Đã từ chối",
};

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const [allReviews, apps] = await Promise.all([listAllReviews(), listApps("vi")]);
  const appTitle = (slug: string): string =>
    apps.find((app) => app.slug === slug)?.title ?? slug;
  const reviews = status ? allReviews.filter((review) => review.status === status) : allReviews;

  const counts = {
    pending: allReviews.filter((review) => review.status === "pending").length,
    approved: allReviews.filter((review) => review.status === "approved").length,
    rejected: allReviews.filter((review) => review.status === "rejected").length,
  };

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <h1>Đánh giá &amp; bình luận</h1>
        <Link className="button-ghost" href="/admin">
          ← Bảng điều khiển
        </Link>
      </div>

      <div className="feed-filters">
        <Link className={!status ? "active" : ""} href="/admin/reviews">
          Tất cả ({allReviews.length})
        </Link>
        <Link className={status === "pending" ? "active" : ""} href="/admin/reviews?status=pending">
          Chờ duyệt ({counts.pending})
        </Link>
        <Link className={status === "approved" ? "active" : ""} href="/admin/reviews?status=approved">
          Đã duyệt ({counts.approved})
        </Link>
        <Link className={status === "rejected" ? "active" : ""} href="/admin/reviews?status=rejected">
          Đã từ chối ({counts.rejected})
        </Link>
      </div>

      <div className="admin-card">
        {reviews.length === 0 ? (
          <p className="admin-empty">Không có đánh giá nào.</p>
        ) : (
          <div className="review-list">
            {reviews.map((review) => (
              <article className="review-item" key={review.id}>
                <div className="review-item-head">
                  <div>
                    <strong>{review.name}</strong>
                    <span className="review-app">{appTitle(review.appSlug)}</span>
                  </div>
                  <span className={`status-pill ${review.status}`}>
                    {STATUS_LABELS[review.status]}
                  </span>
                </div>
                <div className="review-stars">{formatStars(review.rating)}</div>
                <p>{review.comment}</p>
                <div className="review-meta">
                  {review.phone && <span>SĐT: {review.phone}</span>}
                  {review.email && <span>Email: {review.email}</span>}
                  <span>{new Date(review.createdAt).toLocaleString("vi-VN")}</span>
                </div>
                <ReviewActions reviewId={review.id} status={review.status} />
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
