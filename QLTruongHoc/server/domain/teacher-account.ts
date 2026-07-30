/**
 * Bỏ dấu tiếng Việt bằng cách tách tổ hợp NFD rồi lọc theo mã điểm Unicode
 * của dải dấu kết hợp (U+0300–U+036F), thay vì nhúng trực tiếp ký tự dấu kết
 * hợp (vô hình, dễ hỏng khi copy/paste hoặc đổi encoding) vào biểu thức
 * chính quy trong mã nguồn.
 */
function boDauTiengViet(value: string): string {
  const withoutDiacritics = Array.from(value.normalize("NFD"))
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code < 0x0300 || code > 0x036f;
    })
    .join("");

  return withoutDiacritics.replace(/đ/g, "d").replace(/Đ/g, "D");
}

function chuanHoaPhanTen(value: string): string {
  return boDauTiengViet(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Tách "họ" (từ đầu tiên) và "tên" (từ cuối cùng) từ họ tên đầy đủ tiếng
 * Việt, bỏ dấu — dùng để sinh username giáo viên dạng `gv_ten.ho`. KHÔNG
 * dùng số điện thoại (số điện thoại chỉ dùng để sinh username tài khoản
 * phụ huynh): 1 người có thể vừa là giáo viên vừa là phụ huynh cùng SĐT,
 * nếu cả hai vai trò đều sinh username từ SĐT sẽ trùng `tenDangNhap` (unique
 * toàn cục trên bảng NguoiDung).
 */
export function tachHoTenChoUsername(hoTen: string) {
  const tuList = hoTen.trim().split(/\s+/).filter(Boolean);

  if (tuList.length === 0) {
    throw new Error("Vui lòng cập nhật họ tên giáo viên trước khi tạo tài khoản.");
  }

  const ten = chuanHoaPhanTen(tuList[tuList.length - 1]);
  const ho = chuanHoaPhanTen(tuList[0]);

  if (!ten || !ho) {
    throw new Error("Không thể sinh tên đăng nhập từ họ tên giáo viên.");
  }

  return { ten, ho };
}

/**
 * `soThuTu` = 0 → `gv_ten.ho`; trùng thì gọi lại với 1, 2... →
 * `gv_ten1.ho`, `gv_ten2.ho` (số chèn ngay sau phần "tên", không nối cuối
 * chuỗi như cách sinh username phụ huynh theo SĐT).
 */
export function buildTeacherUsername(hoTen: string, soThuTu = 0): string {
  const { ten, ho } = tachHoTenChoUsername(hoTen);
  const hauTo = soThuTu > 0 ? String(soThuTu) : "";

  return `gv_${ten}${hauTo}.${ho}`;
}
