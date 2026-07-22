import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import {
  requireAnyPermission,
  requireCurrentOrganization,
} from "../middleware/permission.middleware.js";
import {
  confirmThongBaoDaDoc,
  createThongBaoMoi,
  listThongBao,
} from "../services/thongBao.service.js";

export const thongBaoRouter = Router();

const THONG_BAO_QUYEN = [
  "don_vi.quan_ly",
  "tuyen_sinh.quan_ly",
  "hoc_sinh.quan_ly",
  "lop_hoc.quan_ly",
  "tai_chinh.quan_ly",
];

thongBaoRouter.use(requireAuth, requireCurrentOrganization);

function handleError(res: import("express").Response, error: unknown, fallback: string) {
  res.status(400).json({
    ok: false,
    error: error instanceof Error ? error.message : fallback,
  });
}

// ---------------------------------------------------------------
// Danh sách và xác nhận đọc thông báo
// ---------------------------------------------------------------

thongBaoRouter.get("/", requireAnyPermission(THONG_BAO_QUYEN), async (req, res) => {
  try {
    const rows = await listThongBao(
      req.auth!.currentOrganization!.id,
      req.auth!.currentOrganization!.loaiDonVi,
      req.auth!.user.id,
    );

    res.json({ ok: true, data: rows });
  } catch (error) {
    handleError(res, error, "Không thể tải danh sách thông báo.");
  }
});

thongBaoRouter.post("/:id/da-doc", requireAnyPermission(THONG_BAO_QUYEN), async (req, res) => {
  try {
    const result = await confirmThongBaoDaDoc({
      donViId: req.auth!.currentOrganization!.id,
      thongBaoId: Number(req.params.id),
      actorUserId: req.auth!.user.id,
      ipAddress: req.ip,
    });

    res.json({ ok: true, data: result });
  } catch (error) {
    handleError(res, error, "Không thể xác nhận thông báo đã đọc.");
  }
});

// ---------------------------------------------------------------
// Tạo thông báo
// ---------------------------------------------------------------

thongBaoRouter.post("/", requireAnyPermission(THONG_BAO_QUYEN), async (req, res) => {
  try {
    const created = await createThongBaoMoi({
      donViId: req.auth!.currentOrganization!.id,
      tieuDe: String(req.body?.tieuDe ?? ""),
      noiDung: String(req.body?.noiDung ?? ""),
      tepDinhKemTen: req.body?.tepDinhKemTen ? String(req.body.tepDinhKemTen) : null,
      tepDinhKemUrl: req.body?.tepDinhKemUrl ? String(req.body.tepDinhKemUrl) : null,
      phamVi: String(req.body?.phamVi ?? ""),
      doiTuong: req.body?.doiTuong ? String(req.body.doiTuong) : null,
      actorUserId: req.auth!.user.id,
      ipAddress: req.ip,
    });

    res.status(201).json({ ok: true, data: created });
  } catch (error) {
    handleError(res, error, "Không thể tạo thông báo.");
  }
});
