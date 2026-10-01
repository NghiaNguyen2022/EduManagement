import { isAdminAuthenticated, getAdminSessionToken } from '@/lib/auth/session';
import { hasSameOrigin } from '@/lib/request-origin';
import { handle } from '@/server/tools/admin.cjs';
import { hash } from '@/server/tools/secrets.cjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ action: string }> };
async function route(request: Request, { params }: Context) {
  const headers = { 'Cache-Control': 'private, no-store' };
  if (request.method !== 'GET' && !hasSameOrigin(request)) return Response.json({ error: 'Nguồn yêu cầu không hợp lệ.' }, { status: 403, headers });
  if (!await isAdminAuthenticated()) return Response.json({ error: 'Vui lòng đăng nhập admin.' }, { status: 401, headers });
  return handle(request, (await params).action, hash(await getAdminSessionToken()));
}
export { route as GET, route as POST };
