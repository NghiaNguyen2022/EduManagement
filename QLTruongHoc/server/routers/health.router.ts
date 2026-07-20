import { Router } from "express";

import {
  checkDbConnection,
  getDbConnectionInfo
} from "../db/connection.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  try {
    await checkDbConnection();
    const database = await getDbConnectionInfo();

    res.json({
      ok: true,
      service: "QLTruongHoc API",
      database
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể kết nối database.";

    res.status(503).json({
      ok: false,
      service: "QLTruongHoc API",
      error: message
    });
  }
});
