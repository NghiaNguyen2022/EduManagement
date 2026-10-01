import { isAdminAuthenticated } from "@/lib/auth/session";
import { getBucket } from "@/lib/storage/r2";
import { handleApiRoute } from "@/lib/api-error";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "Thiếu file ảnh." }, { status: 400 });
    }

    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return Response.json(
        { error: "Chỉ hỗ trợ ảnh JPEG, PNG, WEBP hoặc GIF." },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return Response.json({ error: "Ảnh vượt quá 4MB." }, { status: 400 });
    }

    const key = `images/${crypto.randomUUID()}.${extension}`;
    await getBucket().put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    return Response.json({ key }, { status: 201 });
  });
}
