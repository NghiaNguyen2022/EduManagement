import { findHocSinhById } from "../db/hocSinh.repository.js";

export async function getHocSinhDetail(
  donViId: number,
  hocSinhId: number
) {
  if (!Number.isInteger(donViId) || donViId <= 0) {
    throw new Error("Đơn vị làm việc không hợp lệ.");
  }

  if (!Number.isInteger(hocSinhId) || hocSinhId <= 0) {
    throw new Error("Mã định danh học sinh không hợp lệ.");
  }

  const hocSinh = await findHocSinhById(donViId, hocSinhId);

  if (!hocSinh) {
    throw new Error("Không tìm thấy học sinh trong đơn vị hiện tại.");
  }

  return hocSinh;
}
