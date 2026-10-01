import { getAppBySlug } from "@/lib/store/apps";
import { createReview } from "@/lib/store/reviews";
import { handleApiRoute } from "@/lib/api-error";

type ReviewPayload = {
  name?: string;
  phone?: string;
  email?: string;
  rating?: number;
  comment?: string;
  website?: string; // honeypot: real visitors never fill this
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handleApiRoute(async () => {
    const { slug } = await params;
    if (!(await getAppBySlug(slug, "vi"))) {
      return Response.json({ error: "Không tìm thấy ứng dụng." }, { status: 404 });
    }

    let payload: ReviewPayload;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    // Honeypot: pretend success so bots don't learn to avoid this field.
    if (payload.website) {
      return Response.json({ ok: true }, { status: 201 });
    }

    const name = payload.name?.trim().slice(0, 100) ?? "";
    const comment = payload.comment?.trim().slice(0, 2000) ?? "";
    const rating = Number(payload.rating);
    const phone = payload.phone?.trim().slice(0, 30) || null;
    const email = payload.email?.trim().slice(0, 200) || null;

    if (!name) {
      return Response.json({ error: "Vui lòng nhập tên." }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return Response.json({ error: "Đánh giá phải từ 1 đến 5 sao." }, { status: 400 });
    }
    if (!comment) {
      return Response.json({ error: "Vui lòng nhập nội dung bình luận." }, { status: 400 });
    }

    const review = await createReview({ appSlug: slug, name, phone, email, rating, comment });

    return Response.json({ review }, { status: 201 });
  });
}
