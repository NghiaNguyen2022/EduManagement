import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";
import {
  requireCurrentOrganization,
  requirePermission,
} from "../middleware/permission.middleware.js";
import {
  createChuongTrinhMoi,
  listChuongTrinh,
  setChuongTrinhStatus,
  updateChuongTrinhThongTin,
} from "../services/chuongTrinh.service.js";

export const chuongTrinhRouter = Router();

chuongTrinhRouter.use(
  requireAuth,
  requireCurrentOrganization,
);

chuongTrinhRouter.get(
  "/",
  requirePermission("lop_hoc.xem"),
  async (req, res) => {
    const rows = await listChuongTrinh(
      req.auth!.currentOrganization!.id,
    );

    res.json({ ok: true, data: rows });
  },
);

chuongTrinhRouter.post(
  "/",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const created = await createChuongTrinhMoi({
        donViId: req.auth!.currentOrganization!.id,
        maChuongTrinh: String(req.body?.maChuongTrinh ?? ""),
        tenChuongTrinh: String(req.body?.tenChuongTrinh ?? ""),
        capDo: req.body?.capDo ? String(req.body.capDo) : null,
        tongSoBuoi: req.body?.tongSoBuoi
          ? Number(req.body.tongSoBuoi)
          : null,
        tongSoGio: req.body?.tongSoGio
          ? String(req.body.tongSoGio)
          : null,
        moTa: req.body?.moTa ? String(req.body.moTa) : null,
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
            : "Không thể tạo chương trình.",
      });
    }
  },
);

chuongTrinhRouter.patch(
  "/:id",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const updated = await updateChuongTrinhThongTin({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        tenChuongTrinh: String(req.body?.tenChuongTrinh ?? ""),
        capDo: req.body?.capDo ? String(req.body.capDo) : null,
        tongSoBuoi: req.body?.tongSoBuoi
          ? Number(req.body.tongSoBuoi)
          : null,
        tongSoGio: req.body?.tongSoGio
          ? String(req.body.tongSoGio)
          : null,
        moTa: req.body?.moTa ? String(req.body.moTa) : null,
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
            : "Không thể cập nhật chương trình.",
      });
    }
  },
);

chuongTrinhRouter.patch(
  "/:id/trang-thai",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const updated = await setChuongTrinhStatus({
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
