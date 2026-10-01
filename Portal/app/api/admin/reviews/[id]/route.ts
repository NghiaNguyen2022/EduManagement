import { isAdminAuthenticated } from "@/lib/auth/session";
import { deleteReview, updateReviewStatus, type ReviewStatus } from "@/lib/store/reviews";
import { handleApiRoute } from "@/lib/api-error";

const VALID_STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleApiRoute(async () => {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

    const { id } = await params;

    let payload: { status?: string };
    try {
      payload = await request.json();
    } catch {
      return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    if (!payload.status || !VALID_STATUSES.includes(payload.status as ReviewStatus)) {
      return Response.json({ error: "Trạng thái không hợp lệ." }, { status: 400 });
    }

    const review = await updateReviewStatus(id, payload.status as ReviewStatus);
    if (!review) {
      return Response.json({ error: "Không tìm thấy đánh giá." }, { status: 404 });
    }

    return Response.json({ review });
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleApiRoute(async () => {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await deleteReview(id);

    if (!deleted) {
      return Response.json({ error: "Không tìm thấy đánh giá." }, { status: 404 });
    }

    return Response.json({ ok: true });
  });
}
