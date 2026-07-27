import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import {
  requireAnyPermission,
  requireCurrentOrganization,
} from "../middleware/permission.middleware.js";
import { createTraoDoiMoi, listTraoDoi } from "../services/traoDoi.service.js";

export const traoDoiRouter = Router();

// Trao đổi phụ huynh gắn với lớp/học sinh trong lớp — chỉ vai trò thấy được
// lớp (giáo viên, học vụ, quản lý đơn vị) mới nên thấy/ghi mục này. Trước
// đây dùng `hoc_sinh.xem`/`tuyen_sinh.quan_ly` khiến kế toán/tuyển sinh/tư
// vấn cũng thấy menu dù trang cần `lop_hoc.xem` để tải danh sách lớp (sẽ vỡ
// khi họ mở) — đồng thời quyền GHI cũ chỉ gồm các mã "quan_ly" khiến giáo
// viên (chỉ có `lop_hoc.xem`) không ghi được dù đây là tính năng làm riêng
// cho giáo viên (xem `docs/analysis/TRAO_DOI_PHU_HUYNH_QUYEN.md`).
const TRAO_DOI_XEM_QUYEN = ["lop_hoc.xem", "lop_hoc.quan_ly"];
const TRAO_DOI_GHI_QUYEN = ["lop_hoc.quan_ly", "hoc_tap.ghi_nhan"];

traoDoiRouter.use(requireAuth, requireCurrentOrganization);

function handleError(res: import("express").Response, error: unknown, fallback: string) {
  res.status(400).json({
    ok: false,
    error: error instanceof Error ? error.message : fallback,
  });
}

// ---------------------------------------------------------------
// Trao đổi phụ huynh - giáo viên
// ---------------------------------------------------------------

traoDoiRouter.get("/", requireAnyPermission(TRAO_DOI_XEM_QUYEN), async (req, res) => {
  try {
    const rows = await listTraoDoi(
      req.auth!.currentOrganization!.id,
      req.auth!.currentOrganization!.loaiDonVi,
      {
        hocSinhId: req.query.hocSinhId ? Number(req.query.hocSinhId) : undefined,
        lopHocId: req.query.lopHocId ? Number(req.query.lopHocId) : undefined,
      },
    );

    res.json({ ok: true, data: rows });
  } catch (error) {
    handleError(res, error, "Không thể tải trao đổi.");
  }
});

traoDoiRouter.post(
  "/",
  requireAnyPermission(TRAO_DOI_GHI_QUYEN),
  async (req, res) => {
    try {
      const created = await createTraoDoiMoi({
        donViId: req.auth!.currentOrganization!.id,
        hocSinhId: Number(req.body?.hocSinhId),
        lopHocId:
          req.body?.lopHocId === null ||
          req.body?.lopHocId === undefined ||
          req.body?.lopHocId === ""
            ? null
            : Number(req.body.lopHocId),
        nguoiGuiVaiTro: String(req.body?.nguoiGuiVaiTro ?? ""),
        kenhLienLac: String(req.body?.kenhLienLac ?? ""),
        noiDung: String(req.body?.noiDung ?? ""),
        ketQua: req.body?.ketQua ? String(req.body.ketQua) : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      handleError(res, error, "Không thể tạo trao đổi.");
    }
  },
);
