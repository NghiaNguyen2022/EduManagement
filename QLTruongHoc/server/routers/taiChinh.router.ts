import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";
import {
  requireCurrentOrganization,
  requirePermission,
} from "../middleware/permission.middleware.js";
import {
  capNhatGiamTru,
  capNhatKhoanApDungKyThu,
  createDanhMucKhoanThuMoi,
  createKyThuMoi,
  dongKyThu,
  getKyThuDetail,
  getBaoCaoTaiChinh,
  ghiNhanThuTien,
  listCongNoToanDonVi,
  listDanhMucKhoanThu,
  listKhoanPhaiThuTheoKyThu,
  listKyThu,
  listPhieuThuTheoKhoanPhaiThu,
  moKyThu,
  getPhieuThuDetail,
  setDanhMucKhoanThuStatus,
  sinhKhoanPhaiThuChoLop,
  updateDanhMucKhoanThuThongTin,
  updateKyThuThongTin,
} from "../services/taiChinh.service.js";

function handleError(
  res: import("express").Response,
  error: unknown,
  fallback: string,
) {
  res.status(400).json({
    ok: false,
    error: error instanceof Error ? error.message : fallback,
  });
}

export const taiChinhRouter = Router();

taiChinhRouter.use(
  requireAuth,
  requireCurrentOrganization,
);

// ---------------------------------------------------------------
// Danh mục khoản thu
// ---------------------------------------------------------------

taiChinhRouter.get(
  "/khoan-thu",
  requirePermission("tai_chinh.xem"),
  async (req, res) => {
    try {
      const rows = await listDanhMucKhoanThu(
        req.auth!.currentOrganization!.id,
        req.auth!.currentOrganization!.loaiDonVi,
      );

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải danh mục khoản thu.");
    }
  },
);

taiChinhRouter.post(
  "/khoan-thu",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const created = await createDanhMucKhoanThuMoi({
        donViId: req.auth!.currentOrganization!.id,
        maKhoanThu: String(req.body?.maKhoanThu ?? ""),
        tenKhoanThu: String(req.body?.tenKhoanThu ?? ""),
        loaiKhoanThu: String(req.body?.loaiKhoanThu ?? ""),
        soTienMacDinh:
          req.body?.soTienMacDinh === null ||
          req.body?.soTienMacDinh === undefined ||
          req.body?.soTienMacDinh === ""
            ? null
            : Number(req.body.soTienMacDinh),
        batBuoc: Boolean(req.body?.batBuoc),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      handleError(res, error, "Không thể tạo khoản thu.");
    }
  },
);

taiChinhRouter.patch(
  "/khoan-thu/:id",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const updated = await updateDanhMucKhoanThuThongTin({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        tenKhoanThu: String(req.body?.tenKhoanThu ?? ""),
        loaiKhoanThu: String(req.body?.loaiKhoanThu ?? ""),
        soTienMacDinh:
          req.body?.soTienMacDinh === null ||
          req.body?.soTienMacDinh === undefined ||
          req.body?.soTienMacDinh === ""
            ? null
            : Number(req.body.soTienMacDinh),
        batBuoc: Boolean(req.body?.batBuoc),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể cập nhật khoản thu.");
    }
  },
);

taiChinhRouter.patch(
  "/khoan-thu/:id/trang-thai",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const updated = await setDanhMucKhoanThuStatus({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        trangThai: String(req.body?.trangThai ?? ""),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể cập nhật trạng thái.");
    }
  },
);

// ---------------------------------------------------------------
// Kỳ thu
// ---------------------------------------------------------------

taiChinhRouter.get(
  "/ky-thu",
  requirePermission("tai_chinh.xem"),
  async (req, res) => {
    try {
      const rows = await listKyThu(
        req.auth!.currentOrganization!.id,
        req.auth!.currentOrganization!.loaiDonVi,
      );

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải danh sách kỳ thu.");
    }
  },
);

taiChinhRouter.get(
  "/ky-thu/:id",
  requirePermission("tai_chinh.xem"),
  async (req, res) => {
    try {
      const detail = await getKyThuDetail(
        req.auth!.currentOrganization!.id,
        Number(req.params.id),
      );

      res.json({ ok: true, data: detail });
    } catch (error) {
      handleError(res, error, "Không thể tải chi tiết kỳ thu.");
    }
  },
);

taiChinhRouter.post(
  "/ky-thu",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const created = await createKyThuMoi({
        donViId: req.auth!.currentOrganization!.id,
        maKyThu: String(req.body?.maKyThu ?? ""),
        tenKyThu: String(req.body?.tenKyThu ?? ""),
        loaiKy: String(req.body?.loaiKy ?? ""),
        tuNgay: String(req.body?.tuNgay ?? ""),
        denNgay: String(req.body?.denNgay ?? ""),
        hanThanhToan: req.body?.hanThanhToan
          ? String(req.body.hanThanhToan)
          : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      handleError(res, error, "Không thể tạo kỳ thu.");
    }
  },
);

taiChinhRouter.patch(
  "/ky-thu/:id",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const updated = await updateKyThuThongTin({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        tenKyThu: String(req.body?.tenKyThu ?? ""),
        loaiKy: String(req.body?.loaiKy ?? ""),
        tuNgay: String(req.body?.tuNgay ?? ""),
        denNgay: String(req.body?.denNgay ?? ""),
        hanThanhToan: req.body?.hanThanhToan
          ? String(req.body.hanThanhToan)
          : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể cập nhật kỳ thu.");
    }
  },
);

taiChinhRouter.put(
  "/ky-thu/:id/khoan-thu",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const danhSach = Array.isArray(req.body?.danhSach)
        ? req.body.danhSach.map((item: Record<string, unknown>) => ({
            danhMucKhoanThuId: Number(item?.danhMucKhoanThuId),
            soTien: Number(item?.soTien),
            ghiChu: item?.ghiChu ? String(item.ghiChu) : null,
          }))
        : [];

      const detail = await capNhatKhoanApDungKyThu({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        danhSach,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: detail });
    } catch (error) {
      handleError(res, error, "Không thể cập nhật khoản thu áp dụng.");
    }
  },
);

taiChinhRouter.patch(
  "/ky-thu/:id/mo",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const updated = await moKyThu({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể mở kỳ thu.");
    }
  },
);

taiChinhRouter.patch(
  "/ky-thu/:id/dong",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const updated = await dongKyThu({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể đóng kỳ thu.");
    }
  },
);

// ---------------------------------------------------------------
// Khoản phải thu, thu tiền, công nợ
// ---------------------------------------------------------------

taiChinhRouter.post(
  "/ky-thu/:id/sinh-khoan-phai-thu",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const result = await sinhKhoanPhaiThuChoLop({
        donViId: req.auth!.currentOrganization!.id,
        kyThuId: Number(req.params.id),
        lopHocId: Number(req.body?.lopHocId),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: result });
    } catch (error) {
      handleError(res, error, "Không thể sinh khoản phải thu.");
    }
  },
);

taiChinhRouter.get(
  "/ky-thu/:id/khoan-phai-thu",
  requirePermission("tai_chinh.xem"),
  async (req, res) => {
    try {
      const rows = await listKhoanPhaiThuTheoKyThu(
        req.auth!.currentOrganization!.id,
        Number(req.params.id),
      );

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải danh sách khoản phải thu.");
    }
  },
);

taiChinhRouter.patch(
  "/khoan-phai-thu/:id/giam-tru",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const updated = await capNhatGiamTru({
        donViId: req.auth!.currentOrganization!.id,
        khoanPhaiThuId: Number(req.params.id),
        giamTru: Number(req.body?.giamTru ?? 0),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể cập nhật giảm trừ.");
    }
  },
);

taiChinhRouter.post(
  "/khoan-phai-thu/:id/thu-tien",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const result = await ghiNhanThuTien({
        donViId: req.auth!.currentOrganization!.id,
        khoanPhaiThuId: Number(req.params.id),
        soTien: Number(req.body?.soTien),
        phuongThuc: String(req.body?.phuongThuc ?? ""),
        ghiChu: req.body?.ghiChu ? String(req.body.ghiChu) : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: result });
    } catch (error) {
      handleError(res, error, "Không thể ghi nhận thu tiền.");
    }
  },
);

taiChinhRouter.get(
  "/khoan-phai-thu/:id/phieu-thu",
  requirePermission("tai_chinh.xem"),
  async (req, res) => {
    try {
      const rows = await listPhieuThuTheoKhoanPhaiThu(
        req.auth!.currentOrganization!.id,
        Number(req.params.id),
      );

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải danh sách phiếu thu.");
    }
  },
);

taiChinhRouter.get(
  "/cong-no",
  requirePermission("tai_chinh.xem"),
  async (req, res) => {
    try {
      const rows = await listCongNoToanDonVi(
        req.auth!.currentOrganization!.id,
      );

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải danh sách công nợ.");
    }
  },
);

taiChinhRouter.get(
  "/bao-cao",
  requirePermission("tai_chinh.xem"),
  async (req, res) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const firstDayOfMonth = `${today.slice(0, 7)}-01`;

      const data = await getBaoCaoTaiChinh({
        donViId: req.auth!.currentOrganization!.id,
        loaiDonVi: req.auth!.currentOrganization!.loaiDonVi,
        tuNgay: req.query.tuNgay
          ? String(req.query.tuNgay)
          : firstDayOfMonth,
        denNgay: req.query.denNgay ? String(req.query.denNgay) : today,
      });

      res.json({ ok: true, data });
    } catch (error) {
      handleError(res, error, "Không thể tải báo cáo tài chính.");
    }
  },
);

taiChinhRouter.get(
  "/phieu-thu/:id",
  requirePermission("tai_chinh.xem"),
  async (req, res) => {
    try {
      const detail = await getPhieuThuDetail(
        req.auth!.currentOrganization!.id,
        Number(req.params.id),
      );

      res.json({ ok: true, data: detail });
    } catch (error) {
      handleError(res, error, "Không thể tải chi tiết phiếu thu.");
    }
  },
);
