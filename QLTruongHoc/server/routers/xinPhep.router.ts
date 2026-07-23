import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import {
  requireAnyPermissionOrRole,
  requireCurrentOrganization,
  requirePermission,
} from "../middleware/permission.middleware.js";
import {
  createDonXinPhepByGuardian,
  duyetDonXinPhep,
  listDonXinPhepByGuardian,
  listDonXinPhepStaff,
} from "../services/xinPhep.service.js";

export const xinPhepRouter = Router();

xinPhepRouter.use(requireAuth, requireCurrentOrganization);

function handleError(res: import("express").Response, error: unknown, fallback: string) {
  res.status(400).json({
    ok: false,
    error: error instanceof Error ? error.message : fallback,
  });
}

xinPhepRouter.post(
  "/",
  requireAnyPermissionOrRole([], ["phu_huynh"]),
  async (req, res) => {
    try {
      const created = await createDonXinPhepByGuardian({
        actorUserId: req.auth!.user.id,
        hocSinhId: Number(req.body?.hocSinhId),
        lopHocId: Number(req.body?.lopHocId),
        tuNgay: String(req.body?.tuNgay ?? ""),
        denNgay: String(req.body?.denNgay ?? ""),
        lyDo: String(req.body?.lyDo ?? ""),
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      handleError(res, error, "Không thể tạo đơn xin phép.");
    }
  },
);

xinPhepRouter.get(
  "/minh",
  requireAnyPermissionOrRole([], ["phu_huynh"]),
  async (req, res) => {
    try {
      const rows = await listDonXinPhepByGuardian(req.auth!.user.id);

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải danh sách đơn xin phép.");
    }
  },
);

xinPhepRouter.get("/", requirePermission("diem_danh.xem"), async (req, res) => {
  try {
    const trangThai =
      typeof req.query.trangThai === "string" ? req.query.trangThai : undefined;

    const rows = await listDonXinPhepStaff(req.auth!.currentOrganization!.id, trangThai);

    res.json({ ok: true, data: rows });
  } catch (error) {
    handleError(res, error, "Không thể tải danh sách đơn xin phép.");
  }
});

xinPhepRouter.post(
  "/:id/duyet",
  requirePermission("diem_danh.thuc_hien"),
  async (req, res) => {
    try {
      const result = await duyetDonXinPhep({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        actorUserId: req.auth!.user.id,
        chapNhan: Boolean(req.body?.chapNhan),
        ghiChuDuyet: req.body?.ghiChuDuyet ? String(req.body.ghiChuDuyet) : null,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: result });
    } catch (error) {
      handleError(res, error, "Không thể xử lý đơn xin phép.");
    }
  },
);
