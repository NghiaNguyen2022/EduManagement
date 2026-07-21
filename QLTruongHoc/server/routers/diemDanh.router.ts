import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";
import {
  requireCurrentOrganization,
  requirePermission,
} from "../middleware/permission.middleware.js";
import {
  getDiemDanhRoster,
  luuDiemDanh,
} from "../services/diemDanh.service.js";

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

export const diemDanhRouter = Router();

diemDanhRouter.use(
  requireAuth,
  requireCurrentOrganization,
);

diemDanhRouter.get(
  "/buoi-hoc/:buoiHocId",
  requirePermission("diem_danh.xem"),
  async (req, res) => {
    try {
      const roster = await getDiemDanhRoster(
        req.auth!.currentOrganization!.id,
        Number(req.params.buoiHocId),
      );

      res.json({ ok: true, data: roster });
    } catch (error) {
      handleError(res, error, "Không thể tải danh sách điểm danh.");
    }
  },
);

diemDanhRouter.post(
  "/buoi-hoc/:buoiHocId",
  requirePermission("diem_danh.thuc_hien"),
  async (req, res) => {
    try {
      const danhSach = Array.isArray(req.body?.danhSach)
        ? req.body.danhSach.map((item: Record<string, unknown>) => ({
            hocSinhId: Number(item?.hocSinhId),
            trangThai: String(item?.trangThai ?? ""),
            ghiChu: item?.ghiChu ? String(item.ghiChu) : null,
            nhanXet: item?.nhanXet ? String(item.nhanXet) : null,
          }))
        : [];

      const roster = await luuDiemDanh({
        donViId: req.auth!.currentOrganization!.id,
        buoiHocId: Number(req.params.buoiHocId),
        danhSach,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: roster });
    } catch (error) {
      handleError(res, error, "Không thể lưu điểm danh.");
    }
  },
);
