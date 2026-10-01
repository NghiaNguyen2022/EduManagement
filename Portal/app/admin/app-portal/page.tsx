import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listAppRecords } from "@/lib/store/apps";
import DeleteAppButton from "./DeleteAppButton";

export const dynamic = "force-dynamic";

export default async function AdminAppPortalPage() {
  await requireAdmin();
  const apps = await listAppRecords();

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <h1>App Portal — Ứng dụng</h1>
        <div className="admin-topbar-actions">
          <Link className="button-submit" href="/admin/app-portal/new">
            + Thêm ứng dụng mới
          </Link>
          <Link className="button-ghost" href="/admin">
            ← Bảng điều khiển
          </Link>
        </div>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ứng dụng</th>
              <th>Slug</th>
              <th>Trang chi tiết</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr key={app.slug}>
                <td>{app.titleVi}</td>
                <td>{app.slug}</td>
                <td>{app.hasDetailPage ? "Có" : "Không"}</td>
                <td className="actions">
                  <Link className="button-ghost" href={`/admin/app-portal/${app.slug}`}>
                    Chỉnh sửa
                  </Link>
                  <DeleteAppButton slug={app.slug} title={app.titleVi} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
