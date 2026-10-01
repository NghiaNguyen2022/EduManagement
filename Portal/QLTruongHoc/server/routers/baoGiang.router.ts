import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";
import {
  requireCurrentOrganization,
  requirePermission,
} from "../middleware/permission.middleware.js";
import {
  getBaoGiang,
  luuBaoGiang,
} from "../services/baoGiang.service.js";

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

export const baoGiangRouter = Router();

baoGiangRouter.use(
  requireAuth,
  requireCurrentOrganization,
);

baoGiangRouter.get(
  "/buoi-hoc/:buoiHocId",
  requirePermission("hoc_tap.xem"),
  async (req, res) => {
    try {
      const data = await getBaoGiang(
        req.auth!.currentOrganization!.id,
        Number(req.params.buoiHocId),
      );

      res.json({ ok: true, data });
    } catch (error) {
      handleError(res, error, "Không thể tải báo giảng.");
    }
  },
);

baoGiangRouter.put(
  "/buoi-hoc/:buoiHocId",
  requirePermission("hoc_tap.ghi_nhan"),
  async (req, res) => {
    try {
      const data = await luuBaoGiang({
        donViId: req.auth!.currentOrganization!.id,
        buoiHocId: Number(req.params.buoiHocId),
        noiDungBaiHoc: req.body?.noiDungBaiHoc
          ? String(req.body.noiDungBaiHoc)
          : null,
        baiTap: req.body?.baiTap ? String(req.body.baiTap) : null,
        ghiChu: req.body?.ghiChu ? String(req.body.ghiChu) : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data });
    } catch (error) {
      handleError(res, error, "Không thể lưu báo giảng.");
    }
  },
);
