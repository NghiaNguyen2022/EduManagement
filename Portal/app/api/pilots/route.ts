import { parsePilot } from "@/lib/pilot-validation";
import { createPilot } from "@/lib/store/pilots";
import { hasSameOrigin } from "@/lib/request-origin";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!hasSameOrigin(request))
    return Response.json(
      { error: "Nguồn yêu cầu không hợp lệ." },
      { status: 403 },
    );
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return Response.json({ error: "Yêu cầu JSON." }, { status: 415 });
  let payload: ReturnType<typeof parsePilot>;
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Thiếu dữ liệu.");
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 16384) {
        await reader.cancel();
        return Response.json({ error: "Nội dung quá dài." }, { status: 413 });
      }
      chunks.push(value);
    }
    const bytes = Buffer.concat(chunks);
    payload = parsePilot(JSON.parse(bytes.toString("utf8")));
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof SyntaxError
            ? "JSON không hợp lệ."
            : error instanceof Error
              ? error.message
              : "Dữ liệu không hợp lệ.",
      },
      { status: 400 },
    );
  }
  try {
    await createPilot(payload);
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY")
      return Response.json(
        {
          error:
            "Đăng ký này đã được ghi nhận gần đây. Vui lòng đợi 10 phút trước khi gửi lại.",
        },
        { status: 409 },
      );
    console.error(
      "Pilot request storage failed",
      (error as { code?: string }).code || "storage_error",
    );
    return Response.json(
      {
        error:
          "Chưa thể lưu đăng ký. Vui lòng thử lại hoặc liên hệ Vireon qua trang Liên hệ.",
      },
      { status: 503 },
    );
  }
}
