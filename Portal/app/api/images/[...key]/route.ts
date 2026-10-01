import { getBucket } from "@/lib/storage/r2";
import { handleApiRoute } from "@/lib/api-error";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  return handleApiRoute(async () => {
    const { key } = await params;
    const objectKey = key.join("/");

    if (!objectKey.startsWith("images/")) {
      return new Response("Not found", { status: 404 });
    }

    const object = await getBucket().get(objectKey);
    if (!object) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(await object.arrayBuffer(), {
      headers: {
        "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  });
}
