import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import {
  requireAnyPermission,
  requireAnyPermissionOrRole,
  requireCurrentOrganization,
} from "../middleware/permission.middleware.js";
import {
  addHoatDong,
  listHoatDong,
  listHoatDongForGuardian,
  removeHoatDong,
} from "../services/hoatDong.service.js";

export const hoatDongRouter = Router();

// Album ảnh hoạt động lớp — cùng nhóm quyền như Trao đổi phụ huynh (I04):
// chỉ vai trò thấy được lớp mới ghi/xem phía nhân viên; phụ huynh xem qua
// hocSinhId (không có permission code, dùng role check + ownership trong
// service — xem docs/analysis/TRAO_DOI_PHU_HUYNH_QUYEN.md).
const HOAT_DONG_XEM_QUYEN = ["lop_hoc.xem", "lop_hoc.quan_ly"];
const HOAT_DONG_GHI_QUYEN = ["lop_hoc.quan_ly", "hoc_tap.ghi_nhan"];

hoatDongRouter.use(requireAuth, requireCurrentOrganization);

function handleError(res: import("express").Response, error: unknown, fallback: string) {
  res.status(400).json({
    ok: false,
    error: error instanceof Error ? error.message : fallback,
  });
}

hoatDongRouter.get(
  "/",
  requireAnyPermissionOrRole(HOAT_DONG_XEM_QUYEN, ["phu_huynh"]),
  async (req, res) => {
    try {
      if (req.query.hocSinhId) {
        const rows = await listHoatDongForGuardian(
          req.auth!.user.id,
          Number(req.query.hocSinhId),
        );
        res.json({ ok: true, data: rows });
        return;
      }

      if (!req.query.lopHocId) {
        res.status(400).json({ ok: false, error: "Thiếu lopHocId hoặc hocSinhId." });
        return;
      }

      const rows = await listHoatDong(
        req.auth!.currentOrganization!.id,
        Number(req.query.lopHocId),
      );

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải album hoạt động.");
    }
  },
);

hoatDongRouter.post("/", requireAnyPermission(HOAT_DONG_GHI_QUYEN), async (req, res) => {
  try {
    const created = await addHoatDong({
      donViId: req.auth!.currentOrganization!.id,
      lopHocId: Number(req.body?.lopHocId),
      ngayHoatDong: String(req.body?.ngayHoatDong ?? ""),
      tieuDe: String(req.body?.tieuDe ?? ""),
      moTa: req.body?.moTa ? String(req.body.moTa) : null,
      urls: Array.isArray(req.body?.urls) ? req.body.urls.map(String) : [],
      hocSinhIds: Array.isArray(req.body?.hocSinhIds)
        ? req.body.hocSinhIds.map(Number)
        : [],
      actorUserId: req.auth!.user.id,
      ipAddress: req.ip,
    });

    res.status(201).json({ ok: true, data: created });
  } catch (error) {
    handleError(res, error, "Không thể đăng ảnh hoạt động.");
  }
});

hoatDongRouter.delete(
  "/:id",
  requireAnyPermission(HOAT_DONG_GHI_QUYEN),
  async (req, res) => {
    try {
      await removeHoatDong({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true });
    } catch (error) {
      handleError(res, error, "Không thể xoá hoạt động.");
    }
  },
);
