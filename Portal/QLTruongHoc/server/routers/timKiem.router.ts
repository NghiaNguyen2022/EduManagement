import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { requireCurrentOrganization, requirePermission } from "../middleware/permission.middleware.js";
import { searchAllDonVi } from "../services/timKiem.service.js";

export const timKiemRouter = Router();

timKiemRouter.use(requireAuth, requireCurrentOrganization);

timKiemRouter.get(
  "/",
  requirePermission("he_thong.quan_tri"),
  async (req, res) => {
    try {
      const result = await searchAllDonVi(String(req.query.q ?? ""));

      res.json({
        ok: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: error instanceof Error ? error.message : "Không thể tìm kiếm.",
      });
    }
  },
);
