import { searchGiaoVienAllDonVi } from "../db/giaoVien.repository.js";
import { searchHocSinhAllDonVi } from "../db/hocSinh.repository.js";
import { searchLopHocAllDonVi } from "../db/lopHoc.repository.js";

/**
 * Tìm kiếm xuyên đơn vị — chỉ dùng cho quản trị hệ thống, gộp kết quả từ
 * Học sinh/Giáo viên/Lớp học trong một lần gọi, thay vì phải vào từng trang
 * "xem gộp" rồi tự lọc như hiện tại.
 */
export async function searchAllDonVi(keyword: string) {
  const tuKhoa = keyword.trim();

  if (tuKhoa.length < 2) {
    throw new Error("Vui lòng nhập ít nhất 2 ký tự để tìm kiếm.");
  }

  const [hocSinh, giaoVien, lopHoc] = await Promise.all([
    searchHocSinhAllDonVi(tuKhoa),
    searchGiaoVienAllDonVi(tuKhoa),
    searchLopHocAllDonVi(tuKhoa),
  ]);

  return { hocSinh, giaoVien, lopHoc };
}
