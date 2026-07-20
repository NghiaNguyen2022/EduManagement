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
  addUserAssignment,
  getUserAssignments,
  removeUserAssignment,
} from "../services/user-assignment.service.js";

export const userAssignmentRouter =
  Router();

userAssignmentRouter.use(
  requireAuth,
  requireCurrentOrganization,
);

userAssignmentRouter.get(
  "/:id/assignments",
  requirePermission(
    "nguoi_dung.xem",
  ),
  async (req, res) => {
    try {
      const items =
        await getUserAssignments(
          Number(req.params.id),
        );

      res.json({
        ok: true,
        data: items,
      });
    } catch (error) {
      res.status(404).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể tải phân công.",
      });
    }
  },
);

userAssignmentRouter.post(
  "/:id/assignments",
  requirePermission(
    "nguoi_dung.quan_ly",
  ),
  async (req, res) => {
    try {
      const created =
        await addUserAssignment({
          targetUserId:
            Number(req.params.id),
          roleId:
            Number(req.body?.roleId),
          organizationId:
            Number(
              req.body
                ?.organizationId,
            ),
          actorUserId:
            req.auth!.user.id,
          actorOrganizationId:
            req.auth!
              .currentOrganization!.id,
          ipAddress:
            req.ip,
        });

      res.status(201).json({
        ok: true,
        data: created,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể thêm phân công.",
      });
    }
  },
);

userAssignmentRouter.delete(
  "/:id/assignments/:assignmentId",
  requirePermission(
    "nguoi_dung.quan_ly",
  ),
  async (req, res) => {
    try {
      await removeUserAssignment({
        assignmentId:
          Number(
            req.params.assignmentId,
          ),
        actorUserId:
          req.auth!.user.id,
        actorOrganizationId:
          req.auth!
            .currentOrganization!.id,
        ipAddress:
          req.ip,
      });

      res.json({
        ok: true,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể xóa phân công.",
      });
    }
  },
);
