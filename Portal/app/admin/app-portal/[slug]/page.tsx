import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getAppRecord } from "@/lib/store/apps";
import { getAppContent } from "@/lib/store/app-content";
import AppForm from "../AppForm";
import DeleteAppButton from "../DeleteAppButton";
import VideoUrlForm from "../VideoUrlForm";
import DocumentManager from "../DocumentManager";

export const dynamic = "force-dynamic";

export default async function AdminAppContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const app = await getAppRecord(slug);
  if (!app) notFound();

  const content = app.hasDetailPage ? await getAppContent(slug) : null;

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <h1>{app.titleVi}</h1>
        <div className="admin-topbar-actions">
          <DeleteAppButton slug={app.slug} title={app.titleVi} redirectTo="/admin/app-portal" />
          <Link className="button-ghost" href="/admin/app-portal">
            ← Danh sách ứng dụng
          </Link>
        </div>
      </div>

      <div className="admin-stack">
        <div className="admin-card">
          <h3>Thông tin ứng dụng</h3>
          <AppForm mode="edit" initialApp={app} />
        </div>

        {content && (
          <>
            <div className="admin-card">
              <h3>Video demo</h3>
              <p className="subtitle">Dán link YouTube hoặc Vimeo. Bỏ trống để ẩn video.</p>
              <VideoUrlForm slug={slug} initialUrl={content.demoVideoUrl} />
            </div>

            <div className="admin-card">
              <h3>Tài liệu giới thiệu</h3>
              <p className="subtitle">
                Khách truy cập có thể tải về từ trang chi tiết ứng dụng.
              </p>
              <DocumentManager slug={slug} documents={content.documents} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
