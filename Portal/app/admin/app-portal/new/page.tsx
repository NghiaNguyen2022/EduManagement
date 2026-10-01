import { requireAdmin } from "@/lib/auth/session";
import AppForm from "../AppForm";

export const dynamic = "force-dynamic";

export default async function NewAppPage() {
  await requireAdmin();

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <h1>Ứng dụng mới</h1>
      </div>
      <div className="admin-card">
        <AppForm mode="create" />
      </div>
    </div>
  );
}
