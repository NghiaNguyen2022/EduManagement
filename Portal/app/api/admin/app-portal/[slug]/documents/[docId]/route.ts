import { isAdminAuthenticated } from "@/lib/auth/session";
import { removeDocument } from "@/lib/store/app-content";
import { handleApiRoute } from "@/lib/api-error";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; docId: string }> },
) {
  return handleApiRoute(async () => {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

    const { slug, docId } = await params;
    const content = await removeDocument(slug, docId);

    if (!content) {
      return Response.json({ error: "Không tìm thấy tài liệu." }, { status: 404 });
    }

    return Response.json({ content });
  });
}
