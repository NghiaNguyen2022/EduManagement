// Wraps a route handler so any thrown error (e.g. the R2 binding not being
// provisioned yet) becomes a JSON error response instead of an unhandled
// exception. Without this, the framework's default HTML error page fails to
// parse as JSON on the client, which then misreports the failure as
// "Không thể kết nối máy chủ." instead of the real cause.
export async function handleApiRoute(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
    return Response.json({ error: message }, { status: 500 });
  }
}
