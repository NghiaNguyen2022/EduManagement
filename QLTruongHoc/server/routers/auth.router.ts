import { Router } from "express";

import {
  AUTH_COOKIE_NAME,
  AUTH_SESSION_DAYS,
} from "../auth/auth.constants.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  changePassword,
  login,
  logout,
  updateOwnProfile,
} from "../services/auth.service.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  try {
    const result = await login({
      username: String(req.body?.username ?? ""),
      password: String(req.body?.password ?? ""),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.cookie(AUTH_COOKIE_NAME, result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge:
        AUTH_SESSION_DAYS * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({
      ok: true,
      data: result.context,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Đăng nhập thất bại.";

    res.status(400).json({
      ok: false,
      error: message,
    });
  }
});

authRouter.post("/logout", async (req, res) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME] as
    | string
    | undefined;

  await logout({
    token,
    ipAddress: req.ip,
  });

  res.clearCookie(AUTH_COOKIE_NAME, {
    path: "/",
  });

  res.json({
    ok: true,
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  res.json({
    ok: true,
    data: req.auth,
  });
});

authRouter.patch("/me", requireAuth, async (req, res) => {
  try {
    const token = req.cookies?.[
      AUTH_COOKIE_NAME
    ] as string | undefined;

    const context = await updateOwnProfile({
      token,
      hoTen: String(req.body?.hoTen ?? ""),
      email: req.body?.email ? String(req.body.email) : null,
      soDienThoai: req.body?.soDienThoai
        ? String(req.body.soDienThoai)
        : null,
      hinhAnhUrl: req.body?.hinhAnhUrl
        ? String(req.body.hinhAnhUrl)
        : null,
      ipAddress: req.ip,
    });

    res.json({
      ok: true,
      data: context,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Không thể cập nhật thông tin cá nhân.";

    res.status(400).json({
      ok: false,
      error: message,
    });
  }
});

authRouter.post(
  "/change-password",
  requireAuth,
  async (req, res) => {
    try {
      const token = req.cookies?.[
        AUTH_COOKIE_NAME
      ] as string | undefined;

      const context = await changePassword({
        token,
        currentPassword: String(
          req.body?.currentPassword ?? "",
        ),
        newPassword: String(
          req.body?.newPassword ?? "",
        ),
        confirmPassword: String(
          req.body?.confirmPassword ?? "",
        ),
        ipAddress: req.ip,
      });

      res.json({
        ok: true,
        data: context,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể đổi mật khẩu.";

      res.status(400).json({
        ok: false,
        error: message,
      });
    }
  },
);
