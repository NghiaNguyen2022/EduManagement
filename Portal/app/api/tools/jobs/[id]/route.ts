import { handle } from '@/server/tools/api.cjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) { return handle(request, (await context.params).id); }
export async function DELETE(request: Request, context: Context) { return handle(request, (await context.params).id); }
