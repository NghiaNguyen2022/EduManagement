import { adminExists, createAdminUser } from "@/lib/store/users";
import { startAdminSession } from "@/lib/auth/session";
import { handleApiRoute } from "@/lib/api-error";

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    if (await adminExists()) {
      return Response.json({ error: "Tài khoản admin đã được khởi tạo." }, { status: 409 });
    }

    let payload: { username?: string; password?: string };
    try {
      payload = await request.json();
    } catch {
      return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const username = payload.username?.trim() ?? "";
    const password = payload.password ?? "";

    if (username.length < 3) {
      return Response.json(
        { error: "Tên đăng nhập cần tối thiểu 3 ký tự." },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return Response.json({ error: "Mật khẩu cần tối thiểu 8 ký tự." }, { status: 400 });
    }

    await createAdminUser(username, password);
    const cookie = await startAdminSession();

    return Response.json(
      { ok: true },
      { status: 201, headers: { "Set-Cookie": cookie } },
    );
  });
}
