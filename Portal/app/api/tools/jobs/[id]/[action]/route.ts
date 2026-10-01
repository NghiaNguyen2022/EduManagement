import { handle } from '@/server/tools/api.cjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string; action: string }> };
async function route(request: Request, context: Context) { const { id, action } = await context.params; return handle(request, id, action); }
export { route as GET, route as POST, route as PUT };
