import {
  countChuaDoc,
  listChuaHienThi,
  listThongBaoSuKienByNguoiDung,
  markDaDoc,
  markHienThi,
  markTatCaDaDoc,
  createThongBaoSuKienNhieuNguoi,
} from "../db/thongBaoSuKien.repository.js";
import { listNguoiDungTheoQuyen } from "../db/user.repository.js";

type SuKienInput = {
  donViId: number;
  loaiSuKien: string;
  tieuDe: string;
  noiDung: string;
  duongDan?: string | null;
};

/**
 * Báo cho tất cả nhân viên đang giữ 1 quyền cụ thể trong đơn vị (VD: ai có
 * `tai_chinh.duyet` khi có khoản chi mới cần duyệt) — loại người thực hiện
 * hành động ra khỏi danh sách nhận (không cần tự báo cho chính mình).
 */
export async function notifyTheoQuyen(
  input: SuKienInput & { maQuyen: string; loaiTruNguoiDungId: number },
) {
  const nguoiNhan = await listNguoiDungTheoQuyen(input.donViId, input.maQuyen);
  const nguoiNhanIds = nguoiNhan
    .map((item) => item.id)
    .filter((id) => id !== input.loaiTruNguoiDungId);

  if (nguoiNhanIds.length === 0) {
    return;
  }

  await createThongBaoSuKienNhieuNguoi(
    nguoiNhanIds.map((nguoiNhanId) => ({
      donViId: input.donViId,
      nguoiNhanId,
      loaiSuKien: input.loaiSuKien,
      tieuDe: input.tieuDe,
      noiDung: input.noiDung,
      duongDan: input.duongDan ?? null,
    })),
  );
}

/** Báo cho đúng 1 người — dùng khi báo kết quả duyệt lại cho người đã tạo. */
export async function notifyNguoiDung(
  input: SuKienInput & { nguoiNhanId: number },
) {
  await createThongBaoSuKienNhieuNguoi([
    {
      donViId: input.donViId,
      nguoiNhanId: input.nguoiNhanId,
      loaiSuKien: input.loaiSuKien,
      tieuDe: input.tieuDe,
      noiDung: input.noiDung,
      duongDan: input.duongDan ?? null,
    },
  ]);
}

export async function listThongBaoSuKien(donViId: number, nguoiDungId: number) {
  const [items, soChuaDoc] = await Promise.all([
    listThongBaoSuKienByNguoiDung(donViId, nguoiDungId),
    countChuaDoc(donViId, nguoiDungId),
  ]);

  return { items, soChuaDoc };
}

export async function getThongBaoSuKienMoi(donViId: number, nguoiDungId: number) {
  const items = await listChuaHienThi(donViId, nguoiDungId);

  if (items.length > 0) {
    await markHienThi(items.map((item) => item.id));
  }

  return items;
}

export async function danhDauDaDoc(id: number, nguoiDungId: number) {
  await markDaDoc(id, nguoiDungId);
}

export async function danhDauTatCaDaDoc(donViId: number, nguoiDungId: number) {
  await markTatCaDaDoc(donViId, nguoiDungId);
}
