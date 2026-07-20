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
  changeUserStatus,
  createUser,
  getRoles,
  getUsers,
  resetPassword,
} from "../services/user.service.js";

export const userRouter = Router();

userRouter.use(
  requireAuth,
  requireCurrentOrganization,
);

userRouter.get(
  "/",
  requirePermission("nguoi_dung.xem"),
  async (req, res) => {
    const organizationId =
      req.auth!.currentOrganization!.id;

    const users = await getUsers(
      organizationId,
    );

    res.json({
      ok: true,
      data: users,
    });
  },
);

userRouter.get(
  "/roles",
  requirePermission("nguoi_dung.quan_ly"),
  async (_req, res) => {
    const roles = await getRoles();

    res.json({
      ok: true,
      data: roles,
    });
  },
);

userRouter.post(
  "/",
  requirePermission("nguoi_dung.quan_ly"),
  async (req, res) => {
    try {
      const organizationId =
        req.auth!.currentOrganization!.id;

      const result = await createUser({
        username: String(
          req.body?.username ?? "",
        ),
        fullName: String(
          req.body?.fullName ?? "",
        ),
        email: String(
          req.body?.email ?? "",
        ),
        phone: String(
          req.body?.phone ?? "",
        ),
        roleId: Number(
          req.body?.roleId,
        ),
        organizationId,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({
        ok: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể tạo tài khoản.",
      });
    }
  },
);

userRouter.patch(
  "/:id/status",
  requirePermission("nguoi_dung.quan_ly"),
  async (req, res) => {
    try {
      const targetUserId = Number(
        req.params.id,
      );
      const status = String(
        req.body?.status ?? "",
      );

      if (
        status !== "hoat_dong" &&
        status !== "tam_khoa"
      ) {
        throw new Error(
          "Trạng thái không hợp lệ.",
        );
      }

      await changeUserStatus({
        targetUserId,
        status,
        actorUserId: req.auth!.user.id,
        organizationId:
          req.auth!.currentOrganization!.id,
        ipAddress: req.ip,
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
            : "Không thể cập nhật trạng thái.",
      });
    }
  },
);

userRouter.post(
  "/:id/reset-password",
  requirePermission("nguoi_dung.quan_ly"),
  async (req, res) => {
    try {
      const result = await resetPassword({
        targetUserId: Number(req.params.id),
        actorUserId: req.auth!.user.id,
        organizationId:
          req.auth!.currentOrganization!.id,
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
            : "Không thể đặt lại mật khẩu.",
      });
    }
  },
);
