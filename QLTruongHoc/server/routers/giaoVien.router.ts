import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";
import {
  requireCurrentOrganization,
  requirePermission,
} from "../middleware/permission.middleware.js";
import {
  createGiaoVienMoi,
  getGiaoVienDetail,
  listGiaoVien,
  setGiaoVienStatus,
  updateGiaoVienThongTin,
} from "../services/giaoVien.service.js";

export const giaoVienRouter = Router();

giaoVienRouter.use(
  requireAuth,
  requireCurrentOrganization,
);

giaoVienRouter.get(
  "/",
  requirePermission("lop_hoc.xem"),
  async (req, res) => {
    const rows = await listGiaoVien(
      req.auth!.currentOrganization!.id,
      req.auth!.currentOrganization!.loaiDonVi,
    );

    res.json({ ok: true, data: rows });
  },
);

giaoVienRouter.get(
  "/:id",
  requirePermission("lop_hoc.xem"),
  async (req, res) => {
    try {
      const detail = await getGiaoVienDetail(
        req.auth!.currentOrganization!.id,
        Number(req.params.id),
      );

      res.json({ ok: true, data: detail });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể tải chi tiết giáo viên.",
      });
    }
  },
);

giaoVienRouter.post(
  "/",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const created = await createGiaoVienMoi({
        donViId: req.auth!.currentOrganization!.id,
        hoTen: String(req.body?.hoTen ?? ""),
        dienThoai: req.body?.dienThoai
          ? String(req.body.dienThoai)
          : null,
        email: req.body?.email ? String(req.body.email) : null,
        chuyenMon: req.body?.chuyenMon
          ? String(req.body.chuyenMon)
          : null,
        trinhDo: req.body?.trinhDo
          ? String(req.body.trinhDo)
          : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể tạo giáo viên.",
      });
    }
  },
);

giaoVienRouter.patch(
  "/:id",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const updated = await updateGiaoVienThongTin({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        hoTen: String(req.body?.hoTen ?? ""),
        dienThoai: req.body?.dienThoai
          ? String(req.body.dienThoai)
          : null,
        email: req.body?.email ? String(req.body.email) : null,
        chuyenMon: req.body?.chuyenMon
          ? String(req.body.chuyenMon)
          : null,
        trinhDo: req.body?.trinhDo
          ? String(req.body.trinhDo)
          : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật giáo viên.",
      });
    }
  },
);

giaoVienRouter.patch(
  "/:id/trang-thai",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const updated = await setGiaoVienStatus({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        trangThai: String(req.body?.trangThai ?? ""),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật trạng thái.",
      });
    }
  },
);
