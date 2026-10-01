import { isAdminAuthenticated } from "@/lib/auth/session";
import { getAppBySlug } from "@/lib/store/apps";
import { addDocument } from "@/lib/store/app-content";
import { getBucket } from "@/lib/storage/r2";
import { handleApiRoute } from "@/lib/api-error";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handleApiRoute(async () => {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

    const { slug } = await params;
    if (!(await getAppBySlug(slug, "vi"))) {
      return Response.json({ error: "Không tìm thấy ứng dụng." }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "Thiếu file tài liệu." }, { status: 400 });
    }

    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return Response.json(
        { error: "Chỉ hỗ trợ file PDF, Word hoặc PowerPoint." },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return Response.json({ error: "Tài liệu vượt quá 15MB." }, { status: 400 });
    }

    const fileKey = `documents/${crypto.randomUUID()}.${extension}`;
    await getBucket().put(fileKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    const content = await addDocument(slug, {
      id: crypto.randomUUID(),
      name: file.name.slice(0, 200) || "tai-lieu",
      fileKey,
      contentType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    });

    return Response.json({ content }, { status: 201 });
  });
}
