import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";
import {
  requireCurrentOrganization,
  requirePermission,
} from "../middleware/permission.middleware.js";
import {
  capNhatTrangThaiBuoiHoc,
  listBuoiHocLop,
  listLichHoc,
  listThoiKhoaBieu,
  ngungQuyTacLichHoc,
  sinhBuoiHoc,
  suaBuoiHoc,
  taoBuoiHocBu,
  taoQuyTacLichHoc,
} from "../services/lichHoc.service.js";

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

export const lichHocRouter = Router();

lichHocRouter.use(
  requireAuth,
  requireCurrentOrganization,
);

lichHocRouter.get(
  "/:id/lich-hoc",
  requirePermission("lop_hoc.xem"),
  async (req, res) => {
    try {
      const rows = await listLichHoc(
        req.auth!.currentOrganization!.id,
        Number(req.params.id),
      );

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải lịch học.");
    }
  },
);

lichHocRouter.post(
  "/:id/lich-hoc",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const thuTrongTuanList = Array.isArray(req.body?.thuTrongTuanList)
        ? req.body.thuTrongTuanList.map(Number)
        : [];

      const created = await taoQuyTacLichHoc({
        donViId: req.auth!.currentOrganization!.id,
        lopHocId: Number(req.params.id),
        thuTrongTuanList,
        gioBatDau: String(req.body?.gioBatDau ?? ""),
        gioKetThuc: String(req.body?.gioKetThuc ?? ""),
        phongHoc: req.body?.phongHoc ? String(req.body.phongHoc) : null,
        giaoVienId: req.body?.giaoVienId
          ? Number(req.body.giaoVienId)
          : null,
        ngayApDungTu: String(req.body?.ngayApDungTu ?? ""),
        ngayApDungDen: req.body?.ngayApDungDen
          ? String(req.body.ngayApDungDen)
          : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      handleError(res, error, "Không thể tạo quy tắc lịch học.");
    }
  },
);

lichHocRouter.patch(
  "/lich-hoc/:lichHocId/ngung",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const updated = await ngungQuyTacLichHoc({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.lichHocId),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể ngừng quy tắc lịch học.");
    }
  },
);

lichHocRouter.post(
  "/lich-hoc/:lichHocId/sinh-buoi-hoc",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const result = await sinhBuoiHoc({
        donViId: req.auth!.currentOrganization!.id,
        lichHocId: Number(req.params.lichHocId),
        denNgay: String(req.body?.denNgay ?? ""),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: result });
    } catch (error) {
      handleError(res, error, "Không thể sinh buổi học.");
    }
  },
);

lichHocRouter.get(
  "/:id/buoi-hoc",
  requirePermission("lop_hoc.xem"),
  async (req, res) => {
    try {
      const rows = await listBuoiHocLop({
        donViId: req.auth!.currentOrganization!.id,
        lopHocId: Number(req.params.id),
        tuNgay: req.query.tuNgay ? String(req.query.tuNgay) : undefined,
        denNgay: req.query.denNgay ? String(req.query.denNgay) : undefined,
      });

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải buổi học.");
    }
  },
);

lichHocRouter.post(
  "/:id/buoi-hoc/bu",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      await taoBuoiHocBu({
        donViId: req.auth!.currentOrganization!.id,
        lopHocId: Number(req.params.id),
        ngayHoc: String(req.body?.ngayHoc ?? ""),
        gioBatDau: String(req.body?.gioBatDau ?? ""),
        gioKetThuc: String(req.body?.gioKetThuc ?? ""),
        phongHoc: req.body?.phongHoc ? String(req.body.phongHoc) : null,
        giaoVienId: req.body?.giaoVienId
          ? Number(req.body.giaoVienId)
          : null,
        ghiChu: req.body?.ghiChu ? String(req.body.ghiChu) : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true });
    } catch (error) {
      handleError(res, error, "Không thể tạo buổi học bù.");
    }
  },
);

lichHocRouter.patch(
  "/buoi-hoc/:buoiHocId/trang-thai",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const updated = await capNhatTrangThaiBuoiHoc({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.buoiHocId),
        trangThai: String(req.body?.trangThai ?? "") as
          | "du_kien"
          | "nghi"
          | "huy",
        ghiChu: req.body?.ghiChu ? String(req.body.ghiChu) : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể cập nhật trạng thái buổi học.");
    }
  },
);

lichHocRouter.patch(
  "/buoi-hoc/:buoiHocId",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      await suaBuoiHoc({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.buoiHocId),
        gioBatDau: String(req.body?.gioBatDau ?? ""),
        gioKetThuc: String(req.body?.gioKetThuc ?? ""),
        phongHoc: req.body?.phongHoc ? String(req.body.phongHoc) : null,
        giaoVienId: req.body?.giaoVienId
          ? Number(req.body.giaoVienId)
          : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true });
    } catch (error) {
      handleError(res, error, "Không thể sửa buổi học.");
    }
  },
);

export const thoiKhoaBieuRouter = Router();

thoiKhoaBieuRouter.use(
  requireAuth,
  requireCurrentOrganization,
);

thoiKhoaBieuRouter.get(
  "/",
  requirePermission("lop_hoc.xem"),
  async (req, res) => {
    try {
      const rows = await listThoiKhoaBieu({
        donViId: req.auth!.currentOrganization!.id,
        tuNgay: String(req.query.tuNgay ?? ""),
        denNgay: String(req.query.denNgay ?? ""),
        giaoVienId: req.query.giaoVienId
          ? Number(req.query.giaoVienId)
          : undefined,
      });

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải thời khóa biểu.");
    }
  },
);
