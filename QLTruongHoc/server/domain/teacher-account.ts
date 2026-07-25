export function normalizeTeacherUsername(phone: string | null | undefined) {
  const username = (phone ?? "").replace(/[^0-9]/g, "");

  if (!username) {
    throw new Error(
      "Vui lòng cập nhật số điện thoại giáo viên trước khi tạo tài khoản.",
    );
  }

  return username;
}
