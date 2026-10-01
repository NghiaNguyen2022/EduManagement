import { isAdminAuthenticated } from "@/lib/auth/session";
import { deletePost, updatePost } from "@/lib/store/posts";
import { parseTags } from "@/lib/tags";
import { handleApiRoute } from "@/lib/api-error";

type PostPayload = {
  title?: string;
  body?: string;
  tags?: string;
  coverImageKey?: string | null;
  published?: boolean;
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleApiRoute(async () => {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

    const { id } = await params;

    let payload: PostPayload;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const title = payload.title?.trim() ?? "";
    const body = payload.body?.trim() ?? "";

    if (!title) {
      return Response.json({ error: "Tiêu đề không được để trống." }, { status: 400 });
    }
    if (!body) {
      return Response.json({ error: "Nội dung không được để trống." }, { status: 400 });
    }

    const post = await updatePost(id, {
      title,
      body,
      tags: parseTags(payload.tags ?? ""),
      coverImageKey: payload.coverImageKey ?? null,
      published: Boolean(payload.published),
    });

    if (!post) {
      return Response.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
    }

    return Response.json({ post });
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
    const deleted = await deletePost(id);

    if (!deleted) {
      return Response.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
    }

    return Response.json({ ok: true });
  });
}
