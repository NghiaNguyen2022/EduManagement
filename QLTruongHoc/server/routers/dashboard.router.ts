import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { requireCurrentOrganization } from "../middleware/permission.middleware.js";
import { getDashboardSummary } from "../services/dashboard.service.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth, requireCurrentOrganization);

dashboardRouter.get("/summary", async (req, res) => {
  try {
    const data = await getDashboardSummary(
      req.auth!.currentOrganization!.id,
      req.auth!.currentOrganization!.loaiDonVi,
    );

    res.json({ ok: true, data });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Không thể tải số liệu tổng quan.",
    });
  }
});
