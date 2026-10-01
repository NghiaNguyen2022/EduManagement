import type { RowDataPacket } from "mysql2";
import { execute, queryRows } from "../db/mysql";

export type ReviewStatus = "pending" | "approved" | "rejected";
export type Review = {
  id: string;
  appSlug: string;
  name: string;
  phone: string | null;
  email: string | null;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
};
export type ReviewInput = Omit<Review, "id" | "status" | "createdAt">;

type ReviewRow = RowDataPacket & {
  id: string;
  app_slug: string;
  name: string;
  phone: string | null;
  email: string | null;
  rating: number;
  comment: string;
  status: ReviewStatus;
  created_at: Date;
};

function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    appSlug: row.app_slug,
    name: row.name,
    phone: row.phone,
    email: row.email,
    rating: row.rating,
    comment: row.comment,
    status: row.status,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listAllReviews(): Promise<Review[]> {
  return (await queryRows<ReviewRow[]>("SELECT * FROM reviews ORDER BY created_at DESC")).map(
    mapReview,
  );
}

export async function listApprovedReviews(appSlug: string): Promise<Review[]> {
  return (
    await queryRows<ReviewRow[]>(
      "SELECT * FROM reviews WHERE app_slug = ? AND status = 'approved' ORDER BY created_at DESC",
      [appSlug],
    )
  ).map(mapReview);
}

export async function getRatingSummary(
  appSlug: string,
): Promise<{ average: number; count: number }> {
  const approved = await listApprovedReviews(appSlug);
  return approved.length
    ? {
        average: approved.reduce((sum, review) => sum + review.rating, 0) / approved.length,
        count: approved.length,
      }
    : { average: 0, count: 0 };
}

export async function createReview(input: ReviewInput): Promise<Review> {
  const review: Review = {
    id: crypto.randomUUID(),
    ...input,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  await execute(
    "INSERT INTO reviews (id, app_slug, name, phone, email, rating, comment, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      review.id,
      review.appSlug,
      review.name,
      review.phone,
      review.email,
      review.rating,
      review.comment,
      review.status,
      new Date(review.createdAt),
    ],
  );
  return review;
}

export async function updateReviewStatus(
  id: string,
  status: ReviewStatus,
): Promise<Review | null> {
  const result = await execute("UPDATE reviews SET status = ? WHERE id = ?", [status, id]);
  if (!result.affectedRows) return null;
  const rows = await queryRows<ReviewRow[]>("SELECT * FROM reviews WHERE id = ? LIMIT 1", [id]);
  return rows[0] ? mapReview(rows[0]) : null;
}

export async function deleteReview(id: string): Promise<boolean> {
  return (await execute("DELETE FROM reviews WHERE id = ?", [id])).affectedRows > 0;
}
