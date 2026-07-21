import path from "node:path";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import {
  checkDbConnection,
  closeDbConnection,
} from "./db/connection.js";
import { auditLogRouter } from "./routers/audit-log.router.js";
import { authRouter } from "./routers/auth.router.js";
import { baoGiangRouter } from "./routers/baoGiang.router.js";
import { chuongTrinhRouter } from "./routers/chuongTrinh.router.js";
import { diemDanhRouter } from "./routers/diemDanh.router.js";
import { donViRouter } from "./routers/donVi.router.js";
import { giaoVienRouter } from "./routers/giaoVien.router.js";
import { healthRouter } from "./routers/health.router.js";
import { hocSinhRouter } from "./routers/hocSinh.router.js";
import { leadRouter } from "./routers/lead.router.js";
import {
  lichHocRouter,
  thoiKhoaBieuRouter,
} from "./routers/lichHoc.router.js";
import { lopHocRouter } from "./routers/lopHoc.router.js";
import { organizationRouter } from "./routers/organization.router.js";
import { roleRouter } from "./routers/role.router.js";
import { taiChinhRouter } from "./routers/taiChinh.router.js";
import { userAssignmentRouter } from "./routers/user-assignment.router.js";
import { userRouter } from "./routers/user.router.js";

const app = express();

app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

if (env.nodeEnv === "development") {
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
}

app.get("/api", (_req, res) => {
  res.json({
    name: "QLTruongHoc API",
    status: "running",
  });
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/organizations", organizationRouter);
app.use("/api/don-vi", donViRouter);
app.use("/api/hoc-sinh", hocSinhRouter);
app.use("/api/leads", leadRouter);
app.use("/api/chuong-trinh", chuongTrinhRouter);
app.use("/api/giao-vien", giaoVienRouter);
app.use("/api/lop-hoc", lopHocRouter);
app.use("/api/lop-hoc", lichHocRouter);
app.use("/api/thoi-khoa-bieu", thoiKhoaBieuRouter);
app.use("/api/diem-danh", diemDanhRouter);
app.use("/api/bao-giang", baoGiangRouter);
app.use("/api/users", userRouter);
app.use("/api/users", userAssignmentRouter);
app.use("/api/roles", roleRouter);
app.use("/api/audit-logs", auditLogRouter);
app.use("/api/tai-chinh", taiChinhRouter);

if (env.nodeEnv === "production") {
  const clientDirectory = path.resolve(
    process.cwd(),
    "dist-client",
  );

  app.use(
    express.static(clientDirectory),
  );

  app.use((req, res, next) => {
    if (
      req.method !== "GET" ||
      req.path === "/api" ||
      req.path.startsWith("/api/")
    ) {
      next();
      return;
    }

    res.sendFile(
      path.join(
        clientDirectory,
        "index.html",
      ),
    );
  });
}

async function startServer(): Promise<void> {
  await checkDbConnection();

  app.listen(
    env.port,
    "0.0.0.0",
    () => {
      console.log(
        `QLTruongHoc đang chạy tại http://0.0.0.0:${env.port}`,
      );
    },
  );
}

async function shutdown(
  signal: string,
): Promise<void> {
  console.log(
    `Nhận ${signal}, đang đóng ứng dụng...`,
  );
  await closeDbConnection();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

startServer().catch((error) => {
  console.error(
    "Không thể khởi động ứng dụng:",
    error,
  );
  process.exit(1);
});
