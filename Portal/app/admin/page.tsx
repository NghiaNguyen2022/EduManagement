import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listAllPosts } from "@/lib/store/posts";
import LogoutButton from "./LogoutButton";
import DeletePostButton from "./DeletePostButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const posts = await listAllPosts();

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <h1>Quản trị nội dung</h1>
        <div className="admin-topbar-actions">
          <Link className="button-ghost" href="/admin/tools">Tools · Drive & thanh toán</Link>
          <Link className="button-ghost" href="/admin/pilots">Đăng ký pilot</Link>
          <Link className="button-ghost" href="/admin/app-portal">
            App Portal
          </Link>
          <Link className="button-ghost" href="/admin/reviews">
            Đánh giá &amp; bình luận
          </Link>
          <Link className="button-ghost" href="/feed" target="_blank">
            Xem /feed ↗
          </Link>
          <Link className="button-submit" href="/admin/posts/new">
            + Bài viết mới
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="admin-card">
        {posts.length === 0 ? (
          <p className="admin-empty">
            Chưa có bài viết nào. Bắt đầu bằng cách tạo bài viết mới.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Tag</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td>{post.tags.join(", ") || "—"}</td>
                  <td>
                    <span className={`status-pill ${post.published ? "published" : "draft"}`}>
                      {post.published ? "Đã xuất bản" : "Bản nháp"}
                    </span>
                  </td>
                  <td>{new Date(post.updatedAt).toLocaleDateString("vi-VN")}</td>
                  <td className="actions">
                    <Link className="button-ghost" href={`/admin/posts/${post.id}/edit`}>
                      Sửa
                    </Link>
                    <DeletePostButton postId={post.id} title={post.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
