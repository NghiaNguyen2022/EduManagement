import { isAdminAuthenticated } from "@/lib/auth/session";
import { deleteApp, updateApp, type AppRecordInput } from "@/lib/store/apps";
import { handleApiRoute } from "@/lib/api-error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handleApiRoute(async () => {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

    const { slug } = await params;
    let payload: Omit<AppRecordInput, "slug">;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    if (!payload.titleVi?.trim() || !payload.descriptionVi?.trim() || !payload.href?.trim()) {
      return Response.json({ error: "Thiếu tiêu đề, mô tả hoặc đường dẫn." }, { status: 400 });
    }

    const record = await updateApp(slug, payload);
    if (!record) {
      return Response.json({ error: "Không tìm thấy ứng dụng." }, { status: 404 });
    }

    return Response.json({ app: record });
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handleApiRoute(async () => {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

    const { slug } = await params;
    const deleted = await deleteApp(slug);
    if (!deleted) {
      return Response.json({ error: "Không tìm thấy ứng dụng." }, { status: 404 });
    }

    return Response.json({ ok: true });
  });
}
