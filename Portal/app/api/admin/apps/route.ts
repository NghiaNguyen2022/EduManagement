import { isAdminAuthenticated } from "@/lib/auth/session";
import { createApp, getAppRecord, type AppRecordInput } from "@/lib/store/apps";
import { handleApiRoute } from "@/lib/api-error";

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

    let payload: AppRecordInput;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const slug = payload.slug?.trim() ?? "";
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return Response.json(
        { error: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang." },
        { status: 400 },
      );
    }
    if (!payload.titleVi?.trim() || !payload.descriptionVi?.trim() || !payload.href?.trim()) {
      return Response.json({ error: "Thiếu tiêu đề, mô tả hoặc đường dẫn." }, { status: 400 });
    }
    if (await getAppRecord(slug)) {
      return Response.json({ error: "Slug đã tồn tại." }, { status: 409 });
    }

    const record = await createApp({ ...payload, slug });
    return Response.json({ app: record }, { status: 201 });
  });
}
