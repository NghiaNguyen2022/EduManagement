import { Router } from "express";

import { AUTH_COOKIE_NAME } from "../auth/auth.constants.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { selectOrganization } from "../services/auth.service.js";

export const organizationRouter = Router();

organizationRouter.get(
  "/my",
  requireAuth,
  async (req, res) => {
    res.json({
      ok: true,
      data: {
        organizations: req.auth?.organizations ?? [],
        currentOrganization:
          req.auth?.currentOrganization ?? null,
      },
    });
  },
);

organizationRouter.post(
  "/select",
  requireAuth,
  async (req, res) => {
    try {
      const organizationId = Number(
        req.body?.organizationId,
      );

      if (
        !Number.isInteger(organizationId) ||
        organizationId <= 0
      ) {
        res.status(400).json({
          ok: false,
          error: "Đơn vị không hợp lệ.",
        });
        return;
      }

      const token = req.cookies?.[
        AUTH_COOKIE_NAME
      ] as string | undefined;

      const context = await selectOrganization(
        token,
        organizationId,
        req.ip,
      );

      res.json({
        ok: true,
        data: context,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể chọn đơn vị.";

      res.status(403).json({
        ok: false,
        error: message,
      });
    }
  },
);
