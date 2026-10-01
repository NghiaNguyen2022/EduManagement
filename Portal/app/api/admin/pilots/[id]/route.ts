import { isAdminAuthenticated } from "@/lib/auth/session";
import { pilotStatuses, type PilotStatus } from "@/lib/pilot-validation";
import { updatePilot } from "@/lib/store/pilots";
import { hasSameOrigin } from "@/lib/request-origin";
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasSameOrigin(request))
    return Response.json(
      { error: "Nguồn yêu cầu không hợp lệ." },
      { status: 403 },
    );
  try {
    if (!(await isAdminAuthenticated()))
      return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });
    const { id } = await params;
    if (!/^[a-f\d-]{36}$/i.test(id))
      return Response.json({ error: "Mã không hợp lệ." }, { status: 400 });
    let data: { status?: PilotStatus };
    try {
      data = await request.json();
    } catch {
      return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }
    if (!data || !pilotStatuses.includes(data.status as PilotStatus))
      return Response.json(
        { error: "Trạng thái không hợp lệ." },
        { status: 400 },
      );
    const updated = await updatePilot(id, data.status as PilotStatus);
    return Response.json(
      updated ? { ok: true } : { error: "Không tìm thấy đăng ký." },
      { status: updated ? 200 : 404 },
    );
  } catch {
    return Response.json(
      { error: "Không thể cập nhật. Vui lòng thử lại." },
      { status: 503 },
    );
  }
}
