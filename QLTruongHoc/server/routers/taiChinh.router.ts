import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";
import {
  requireCurrentOrganization,
  requirePermission,
} from "../middleware/permission.middleware.js";
import {
  capNhatKhoanApDungKyThu,
  createDanhMucKhoanThuMoi,
  createKyThuMoi,
  dongKyThu,
  getKyThuDetail,
  listDanhMucKhoanThu,
  listKyThu,
  moKyThu,
  setDanhMucKhoanThuStatus,
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
