import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { requireCurrentOrganization } from "../middleware/permission.middleware.js";
import { getParentPortalOverview } from "../services/portal.service.js";

export const portalRouter = Router();

portalRouter.use(requireAuth, requireCurrentOrganization);

portalRouter.get("/parent", async (req, res) => {
  try {
    if (!req.auth?.currentOrganization?.vaiTro.includes("phu_huynh")) {
      res.status(403).json({
        ok: false,
        error: "Trang portal phụ huynh chỉ dành cho vai trò phụ huynh.",
      });
      return;
    }

    const data = await getParentPortalOverview({
      userId: req.auth.user.id,
    });

    res.json({ ok: true, data });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Không thể tải portal phụ huynh.",
    });
  }
});
