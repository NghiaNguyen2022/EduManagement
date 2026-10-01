import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import {
  requireAnyPermissionOrRole,
  requireCurrentOrganization,
} from "../middleware/permission.middleware.js";
import {
  listTinNhanForGuardian,
  listTinNhanForStaff,
  listTinNhanThreadsForGuardian,
  listTinNhanThreadsForStaff,
  sendTinNhanFromGuardian,
  sendTinNhanFromStaff,
} from "../services/tinNhan.service.js";

export const tinNhanRouter = Router();

// Nhắn tin 2 chiều — nhân viên dùng đúng quyền xem/ghi lớp học như Trao đổi
// phụ huynh (I04); phụ huynh không có permission code, dùng role check +
// ownership trong service (mẫu xinPhep.router.ts).
const TIN_NHAN_STAFF_QUYEN = ["lop_hoc.xem", "lop_hoc.quan_ly", "hoc_tap.ghi_nhan"];

tinNhanRouter.use(requireAuth, requireCurrentOrganization);

function handleError(res: import("express").Response, error: unknown, fallback: string) {
  res.status(400).json({
    ok: false,
    error: error instanceof Error ? error.message : fallback,
  });
}

// Hộp thư tổng hợp — mỗi học sinh/con 1 dòng (tin mới nhất). Nhân viên xem
// theo đơn vị đang chọn; phụ huynh xem theo mọi con của tài khoản.
tinNhanRouter.get(
  "/threads",
  requireAnyPermissionOrRole(TIN_NHAN_STAFF_QUYEN, ["phu_huynh"]),
  async (req, res) => {
    try {
      const isGuardian = req.auth!.currentOrganization!.vaiTro.includes("phu_huynh");

      const rows = isGuardian
        ? await listTinNhanThreadsForGuardian(req.auth!.user.id)
        : await listTinNhanThreadsForStaff(
            req.auth!.currentOrganization!.id,
            req.auth!.user.id,
          );

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải hộp thư.");
    }
  },
);

tinNhanRouter.get(
  "/",
  requireAnyPermissionOrRole(TIN_NHAN_STAFF_QUYEN, ["phu_huynh"]),
  async (req, res) => {
    try {
      const hocSinhId = Number(req.query.hocSinhId);
      const isGuardian = req.auth!.currentOrganization!.vaiTro.includes("phu_huynh");

      const rows = isGuardian
        ? await listTinNhanForGuardian(req.auth!.user.id, hocSinhId)
        : await listTinNhanForStaff(req.auth!.currentOrganization!.id, hocSinhId);

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải tin nhắn.");
    }
  },
);

tinNhanRouter.post(
  "/",
  requireAnyPermissionOrRole(TIN_NHAN_STAFF_QUYEN, ["phu_huynh"]),
  async (req, res) => {
    try {
      const hocSinhId = Number(req.body?.hocSinhId);
      const noiDung = String(req.body?.noiDung ?? "");
      const isGuardian = req.auth!.currentOrganization!.vaiTro.includes("phu_huynh");

      const created = isGuardian
        ? await sendTinNhanFromGuardian({
            hocSinhId,
            noiDung,
            actorUserId: req.auth!.user.id,
          })
        : await sendTinNhanFromStaff({
            donViId: req.auth!.currentOrganization!.id,
            hocSinhId,
            lopHocId:
              req.body?.lopHocId === null ||
              req.body?.lopHocId === undefined ||
              req.body?.lopHocId === ""
                ? null
                : Number(req.body.lopHocId),
            noiDung,
            actorUserId: req.auth!.user.id,
          });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      handleError(res, error, "Không thể gửi tin nhắn.");
    }
  },
);
