import { endAdminSession } from "@/lib/auth/session";
import { handleApiRoute } from "@/lib/api-error";

export async function POST() {
  return handleApiRoute(async () => {
    const cookie = await endAdminSession();
    return Response.json({ ok: true }, { status: 200, headers: { "Set-Cookie": cookie } });
  });
}
