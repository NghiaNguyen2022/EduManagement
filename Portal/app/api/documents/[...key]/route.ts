import { getBucket } from "@/lib/storage/r2";
import { handleApiRoute } from "@/lib/api-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  return handleApiRoute(async () => {
    const { key } = await params;
    const objectKey = key.join("/");

    if (!objectKey.startsWith("documents/")) {
      return new Response("Not found", { status: 404 });
    }

    const object = await getBucket().get(objectKey);
    if (!object) {
      return new Response("Not found", { status: 404 });
    }

    const url = new URL(request.url);
    const requestedName = url.searchParams.get("name");
    const fileName = requestedName
      ? requestedName.replace(/["\r\n]/g, "").slice(0, 200)
      : "tai-lieu";

    return new Response(await object.arrayBuffer(), {
      headers: {
        "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  });
}
