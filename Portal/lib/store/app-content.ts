import type { RowDataPacket } from "mysql2";
import { execute, getPool, queryRows } from "../db/mysql";
import { getBucket } from "../storage/r2";

export type AppDocument = {
  id: string;
  name: string;
  fileKey: string;
  contentType: string;
  size: number;
  uploadedAt: string;
};
export type AppContent = {
  slug: string;
  demoVideoUrl: string | null;
  documents: AppDocument[];
};

type ContentRow = RowDataPacket & { slug: string; demo_video_url: string | null };
type DocumentRow = RowDataPacket & {
  id: string;
  name: string;
  file_key: string;
  content_type: string;
  size: number | string;
  uploaded_at: Date;
};

export async function getAppContent(slug: string): Promise<AppContent> {
  const contentRows = await queryRows<ContentRow[]>(
    "SELECT slug, demo_video_url FROM app_content WHERE slug = ? LIMIT 1",
    [slug],
  );
  const documentRows = await queryRows<DocumentRow[]>(
    "SELECT id, name, file_key, content_type, size, uploaded_at FROM app_documents WHERE app_slug = ? ORDER BY uploaded_at ASC",
    [slug],
  );
  return {
    slug,
    demoVideoUrl: contentRows[0]?.demo_video_url ?? null,
    documents: documentRows.map((row) => ({
      id: row.id,
      name: row.name,
      fileKey: row.file_key,
      contentType: row.content_type,
      size: Number(row.size),
      uploadedAt: row.uploaded_at.toISOString(),
    })),
  };
}

export async function setDemoVideoUrl(
  slug: string,
  url: string | null,
): Promise<AppContent> {
  await execute(
    "INSERT INTO app_content (slug, demo_video_url) VALUES (?, ?) ON DUPLICATE KEY UPDATE demo_video_url = VALUES(demo_video_url)",
    [slug, url],
  );
  return getAppContent(slug);
}

export async function addDocument(
  slug: string,
  document: AppDocument,
): Promise<AppContent> {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      "INSERT INTO app_content (slug, demo_video_url) VALUES (?, NULL) ON DUPLICATE KEY UPDATE slug = VALUES(slug)",
      [slug],
    );
    await connection.execute(
      "INSERT INTO app_documents (id, app_slug, name, file_key, content_type, size, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        document.id,
        slug,
        document.name,
        document.fileKey,
        document.contentType,
        document.size,
        new Date(document.uploadedAt),
      ],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return getAppContent(slug);
}

export async function removeDocument(
  slug: string,
  documentId: string,
): Promise<AppContent | null> {
  const rows = await queryRows<(DocumentRow & { app_slug: string })[]>(
    "SELECT id, app_slug, name, file_key, content_type, size, uploaded_at FROM app_documents WHERE id = ? AND app_slug = ? LIMIT 1",
    [documentId, slug],
  );
  const document = rows[0];
  if (!document) return null;
  await getBucket().delete(document.file_key);
  await execute("DELETE FROM app_documents WHERE id = ? AND app_slug = ?", [documentId, slug]);
  return getAppContent(slug);
}
