import {
  Router,
} from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";
import {
  requireCurrentOrganization,
  requirePermission,
} from "../middleware/permission.middleware.js";
import {
  getAuditActions,
  getAuditLogDetail,
  getAuditLogs,
} from "../services/audit-log.service.js";

export const auditLogRouter = Router();

auditLogRouter.use(
  requireAuth,
  requireCurrentOrganization,
);

auditLogRouter.get(
  "/",
  requirePermission("phan_quyen.xem"),
  async (req, res) => {
    const permissions =
      req.auth!.currentOrganization!.quyen;

    const isSystemAdmin =
      permissions.includes(
        "he_thong.quan_tri",
      );

    const organizationId =
      isSystemAdmin
        ? undefined
        : req.auth!.currentOrganization!.id;

    const result = await getAuditLogs({
      organizationId,
      search: String(
        req.query.search ?? "",
      ),
      action: String(
        req.query.action ?? "",
      ),
      level: String(
        req.query.level ?? "",
      ),
      fromDate: String(
        req.query.fromDate ?? "",
      ),
      toDate: String(
        req.query.toDate ?? "",
      ),
      page: Number(req.query.page),
      pageSize: Number(
        req.query.pageSize,
      ),
    });

    res.json({
      ok: true,
      data: result,
    });
  },
);

auditLogRouter.get(
  "/actions",
  requirePermission("phan_quyen.xem"),
  async (req, res) => {
    const permissions =
      req.auth!.currentOrganization!.quyen;

    const isSystemAdmin =
      permissions.includes(
        "he_thong.quan_tri",
      );

    const actions = await getAuditActions(
      isSystemAdmin
        ? undefined
        : req.auth!.currentOrganization!.id,
    );

    res.json({
      ok: true,
      data: actions,
    });
  },
);

auditLogRouter.get(
  "/:id",
  requirePermission("phan_quyen.xem"),
  async (req, res) => {
    try {
      const permissions =
        req.auth!.currentOrganization!.quyen;

      const isSystemAdmin =
        permissions.includes(
          "he_thong.quan_tri",
        );

      const detail =
        await getAuditLogDetail({
          logId: Number(req.params.id),
          organizationId:
            req.auth!.currentOrganization!.id,
          isSystemAdmin,
        });

      res.json({
        ok: true,
        data: detail,
      });
    } catch (error) {
      res.status(404).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể tải nhật ký.",
      });
    }
  },
);
