import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AUTH_COOKIE_NAME } from "../auth/auth.constants.js";
import type { AuthContextData } from "../auth/auth.types.js";
import { getAuthContext } from "../services/auth.service.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContextData;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.[AUTH_COOKIE_NAME] as
    | string
    | undefined;

  const context = await getAuthContext(token);

  if (!context) {
    res.status(401).json({
      ok: false,
      error: "Bạn chưa đăng nhập hoặc phiên đã hết hạn.",
    });
    return;
  }

  req.auth = context;
  next();
}
