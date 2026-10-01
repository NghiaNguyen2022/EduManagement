import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { requireCurrentOrganization, requirePermission } from "../middleware/permission.middleware.js";
import { getCauHinhHeThong, updateCauHinh } from "../services/cauHinh.service.js";

export const cauHinhRouter = Router();

cauHinhRouter.use(requireAuth, requireCurrentOrganization);

cauHinhRouter.get(
  "/",
  requirePermission("he_thong.quan_tri"),
  async (req, res) => {
    try {
      const config = await getCauHinhHeThong();

      res.json({
        ok: true,
        data: config,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: error instanceof Error ? error.message : "Không thể tải cấu hình hệ thống.",
      });
    }
  },
);

cauHinhRouter.patch(
  "/",
  requirePermission("he_thong.quan_tri"),
  async (req, res) => {
    try {
      const updated = await updateCauHinh({
        soLanDangNhapSaiToiDa: Number(req.body?.soLanDangNhapSaiToiDa),
        soPhutKhoaDangNhap: Number(req.body?.soPhutKhoaDangNhap),
        doDaiMatKhauToiThieu: Number(req.body?.doDaiMatKhauToiThieu),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({
        ok: true,
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: error instanceof Error ? error.message : "Không thể cập nhật cấu hình hệ thống.",
      });
    }
  },
);
