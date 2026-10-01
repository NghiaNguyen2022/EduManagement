import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getPostById } from "@/lib/store/posts";
import PostForm from "../../../PostForm";
import DeletePostButton from "../../../DeletePostButton";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) notFound();

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <h1>Chỉnh sửa bài viết</h1>
        <DeletePostButton postId={post.id} title={post.title} redirectTo="/admin" />
      </div>
      <div className="admin-card">
        <PostForm mode="edit" postId={post.id} initialPost={post} />
      </div>
    </div>
  );
}
