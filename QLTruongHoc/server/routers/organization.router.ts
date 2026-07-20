import {
  Router,
} from "express";

import {
  AUTH_COOKIE_NAME,
} from "../auth/auth.constants.js";
import {
  requireAuth,
} from "../middleware/auth.middleware.js";
import {
  requireCurrentOrganization,
  requirePermission,
} from "../middleware/permission.middleware.js";
import {
  getAuthContext,
  selectOrganization,
} from "../services/auth.service.js";

export const organizationRouter =
  Router();

organizationRouter.get(
  "/my",
  requireAuth,
  async (req, res) => {
    res.json({
      ok: true,
      data: {
        organizations:
          req.auth?.organizations ?? [],
        currentOrganization:
          req.auth
            ?.currentOrganization ?? null,
      },
    });
  },
);

organizationRouter.get(
  "/available",
  requireAuth,
  requireCurrentOrganization,
  requirePermission(
    "nguoi_dung.quan_ly",
  ),
  async (req, res) => {
    const token =
      req.cookies?.[
        AUTH_COOKIE_NAME
      ] as string | undefined;

    const context =
      await getAuthContext(token);

    res.json({
      ok: true,
      data:
        context?.organizations ?? [],
    });
  },
);

organizationRouter.post(
  "/select",
  requireAuth,
  async (req, res) => {
    try {
      const organizationId =
        Number(
          req.body
            ?.organizationId,
        );

      if (
        !Number.isInteger(
          organizationId,
        ) ||
        organizationId <= 0
      ) {
        res.status(400).json({
          ok: false,
          error:
            "Đơn vị không hợp lệ.",
        });
        return;
      }

      const token =
        req.cookies?.[
          AUTH_COOKIE_NAME
        ] as string | undefined;

      const context =
        await selectOrganization(
          token,
          organizationId,
          req.ip,
        );

      res.json({
        ok: true,
        data: context,
      });
    } catch (error) {
      res.status(403).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể chọn đơn vị.",
      });
    }
  },
);
