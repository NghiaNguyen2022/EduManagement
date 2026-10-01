import { isAdminAuthenticated } from "@/lib/auth/session";
import { getAppBySlug } from "@/lib/store/apps";
import { setDemoVideoUrl } from "@/lib/store/app-content";
import { isValidHttpUrl } from "@/lib/video";
import { handleApiRoute } from "@/lib/api-error";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handleApiRoute(async () => {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

    const { slug } = await params;
    if (!(await getAppBySlug(slug, "vi"))) {
      return Response.json({ error: "Không tìm thấy ứng dụng." }, { status: 404 });
    }

    let payload: { url?: string };
    try {
      payload = await request.json();
    } catch {
      return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const url = payload.url?.trim() ?? "";

    if (url && !isValidHttpUrl(url)) {
      return Response.json({ error: "Link video không hợp lệ." }, { status: 400 });
    }

    const content = await setDemoVideoUrl(slug, url || null);
    return Response.json({ content });
  });
}
