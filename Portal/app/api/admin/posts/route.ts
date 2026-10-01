import { isAdminAuthenticated } from "@/lib/auth/session";
import { createPost } from "@/lib/store/posts";
import { parseTags } from "@/lib/tags";
import { handleApiRoute } from "@/lib/api-error";

type PostPayload = {
  title?: string;
  body?: string;
  tags?: string;
  coverImageKey?: string | null;
  published?: boolean;
};

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

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

    const post = await createPost({
      title,
      body,
      tags: parseTags(payload.tags ?? ""),
      coverImageKey: payload.coverImageKey ?? null,
      published: Boolean(payload.published),
    });

    return Response.json({ post }, { status: 201 });
  });
}
