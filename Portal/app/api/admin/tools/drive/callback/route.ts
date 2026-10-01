import { isAdminAuthenticated, getAdminSessionToken } from '@/lib/auth/session';
import { finish, callback } from '@/server/tools/drive.cjs';
import { hash } from '@/server/tools/secrets.cjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  let result = 'error';
  try {
    if (await isAdminAuthenticated()) {
      const p = new URL(request.url).searchParams;
      if (!p.has('error')) { await finish(hash(await getAdminSessionToken()), p.get('state'), p.get('code')); result = 'connected'; }
    }
  } catch { /* Never expose authorization codes, tokens or upstream errors. */ }
  return new Response(null, { status: 303, headers: { Location: new URL('/admin/tools?drive=' + result, callback()).href, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
}
