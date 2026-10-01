import { verifyAdminCredentials } from "@/lib/store/users";
import { startAdminSession } from "@/lib/auth/session";
import { handleApiRoute } from "@/lib/api-error";

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    let payload: { username?: string; password?: string };
    try {
      payload = await request.json();
    } catch {
      return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const username = payload.username?.trim() ?? "";
    const password = payload.password ?? "";

    const valid = username && password && (await verifyAdminCredentials(username, password));
    if (!valid) {
      return Response.json({ error: "Sai tên đăng nhập hoặc mật khẩu." }, { status: 401 });
    }

    const cookie = await startAdminSession();
    return Response.json({ ok: true }, { status: 200, headers: { "Set-Cookie": cookie } });
  });
}
