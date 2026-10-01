import { requireAdmin } from "@/lib/auth/session";
import PostForm from "../../PostForm";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  await requireAdmin();

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <h1>Bài viết mới</h1>
      </div>
      <div className="admin-card">
        <PostForm mode="create" />
      </div>
    </div>
  );
}
