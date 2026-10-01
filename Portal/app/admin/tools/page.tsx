import { requireAdmin } from '@/lib/auth/session';
import ToolsAdmin from './tools-admin';
export const dynamic = 'force-dynamic';
export default async function Page() { await requireAdmin(); return <ToolsAdmin />; }
