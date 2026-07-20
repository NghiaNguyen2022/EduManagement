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
  getPermissions,
  getRolePermissions,
  getRoles,
  updateRolePermissions,
} from "../services/role.service.js";

export const roleRouter = Router();

roleRouter.use(
  requireAuth,
  requireCurrentOrganization,
);

roleRouter.get(
  "/",
  requirePermission("phan_quyen.xem"),
  async (_req, res) => {
    const roles = await getRoles();

    res.json({
      ok: true,
      data: roles,
    });
  },
);

roleRouter.get(
  "/permissions",
  requirePermission("phan_quyen.xem"),
  async (_req, res) => {
    const permissions =
      await getPermissions();

    res.json({
      ok: true,
      data: permissions,
    });
  },
);

roleRouter.get(
  "/:id/permissions",
  requirePermission("phan_quyen.xem"),
  async (req, res) => {
    try {
      const roleId = Number(req.params.id);

      const result =
        await getRolePermissions(roleId);

      res.json({
        ok: true,
        data: result,
      });
    } catch (error) {
      res.status(404).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể tải phân quyền.",
      });
    }
  },
);

roleRouter.put(
  "/:id/permissions",
  requirePermission(
    "phan_quyen.quan_ly",
  ),
  async (req, res) => {
    try {
      const roleId = Number(req.params.id);
      const permissionIds = Array.isArray(
        req.body?.permissionIds,
      )
        ? req.body.permissionIds.map(Number)
        : [];

      const result =
        await updateRolePermissions({
          roleId,
          permissionIds,
          actorUserId: req.auth!.user.id,
          organizationId:
            req.auth!.currentOrganization!.id,
          actorPermissions:
            req.auth!.currentOrganization!.quyen,
          ipAddress: req.ip,
        });

      res.json({
        ok: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật phân quyền.",
      });
    }
  },
);
