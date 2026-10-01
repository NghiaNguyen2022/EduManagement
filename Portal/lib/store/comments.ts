import type { RowDataPacket } from "mysql2";
import { execute, queryRows } from "../db/mysql";

export type Comment = {
  id: string;
  postId: string;
  name: string;
  comment: string;
  createdAt: string;
};
export type CommentInput = Omit<Comment, "id" | "createdAt">;

type CommentRow = RowDataPacket & {
  id: string;
  post_id: string;
  name: string;
  comment: string;
  created_at: Date;
};

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    name: row.name,
    comment: row.comment,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listComments(postId: string): Promise<Comment[]> {
  return (
    await queryRows<CommentRow[]>(
      "SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC",
      [postId],
    )
  ).map(mapComment);
}

export async function createComment(input: CommentInput): Promise<Comment> {
  const item: Comment = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
  };
  await execute(
    "INSERT INTO comments (id, post_id, name, comment, created_at) VALUES (?, ?, ?, ?, ?)",
    [item.id, item.postId, item.name, item.comment, new Date(item.createdAt)],
  );
  return item;
}
