import type { RowDataPacket } from "mysql2";
import { execute, queryRows } from "../db/mysql";
import { getBucket } from "../storage/r2";

export type Post = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  coverImageKey: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PostInput = Omit<Post, "id" | "createdAt" | "updatedAt">;

type PostRow = RowDataPacket & {
  id: string;
  title: string;
  body: string;
  tags: string | string[];
  cover_image_key: string | null;
  published: number | boolean;
  created_at: Date;
  updated_at: Date;
};

function mapPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
    coverImageKey: row.cover_image_key,
    published: Boolean(row.published),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listAllPosts(): Promise<Post[]> {
  return (
    await queryRows<PostRow[]>("SELECT * FROM posts ORDER BY created_at DESC")
  ).map(mapPost);
}

export async function listPublishedPosts(tag?: string): Promise<Post[]> {
  const posts = (
    await queryRows<PostRow[]>("SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC")
  ).map(mapPost);
  return tag ? posts.filter((post) => post.tags.includes(tag)) : posts;
}

export async function listAllTags(): Promise<string[]> {
  const tags = new Set((await listPublishedPosts()).flatMap((post) => post.tags));
  return [...tags].sort((a, b) => a.localeCompare(b));
}

export async function getPostById(id: string): Promise<Post | null> {
  const rows = await queryRows<PostRow[]>("SELECT * FROM posts WHERE id = ? LIMIT 1", [id]);
  return rows[0] ? mapPost(rows[0]) : null;
}

export async function createPost(input: PostInput): Promise<Post> {
  const post: Post = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await execute(
    "INSERT INTO posts (id, title, body, tags, cover_image_key, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      post.id,
      post.title,
      post.body,
      JSON.stringify(post.tags),
      post.coverImageKey,
      post.published,
      new Date(post.createdAt),
      new Date(post.updatedAt),
    ],
  );
  return post;
}

export async function updatePost(id: string, input: PostInput): Promise<Post | null> {
  const existing = await getPostById(id);
  if (!existing) return null;
  if (existing.coverImageKey && existing.coverImageKey !== input.coverImageKey) {
    await getBucket().delete(existing.coverImageKey);
  }
  const updatedAt = new Date();
  await execute(
    "UPDATE posts SET title=?, body=?, tags=?, cover_image_key=?, published=?, updated_at=? WHERE id=?",
    [
      input.title,
      input.body,
      JSON.stringify(input.tags),
      input.coverImageKey,
      input.published,
      updatedAt,
      id,
    ],
  );
  return { ...existing, ...input, updatedAt: updatedAt.toISOString() };
}

export async function deletePost(id: string): Promise<boolean> {
  const existing = await getPostById(id);
  if (!existing) return false;
  if (existing.coverImageKey) await getBucket().delete(existing.coverImageKey);
  return (await execute("DELETE FROM posts WHERE id = ?", [id])).affectedRows > 0;
}
