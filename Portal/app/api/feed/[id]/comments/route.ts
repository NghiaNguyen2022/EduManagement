import { getPostById } from "@/lib/store/posts";
import { createComment } from "@/lib/store/comments";
import { handleApiRoute } from "@/lib/api-error";

type CommentPayload = {
  name?: string;
  comment?: string;
  website?: string; // honeypot: real visitors never fill this
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleApiRoute(async () => {
    const { id } = await params;
    const post = await getPostById(id);
    if (!post || !post.published) {
      return Response.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
    }

    let payload: CommentPayload;
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

    if (!name) {
      return Response.json({ error: "Vui lòng nhập tên." }, { status: 400 });
    }
    if (!comment) {
      return Response.json({ error: "Vui lòng nhập nội dung bình luận." }, { status: 400 });
    }

    const created = await createComment({ postId: id, name, comment });

    return Response.json({ comment: created }, { status: 201 });
  });
}
