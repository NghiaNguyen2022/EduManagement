import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import {
  requireAnyPermission,
  requireCurrentOrganization,
} from "../middleware/permission.middleware.js";
import { getCauHinhMauInHienTai, updateCauHinhMauIn } from "../services/mauIn.service.js";

export const mauInRouter = Router();

mauInRouter.use(requireAuth, requireCurrentOrganization);

// Không gác quyền riêng cho GET — mọi nhân viên lập/in phiếu (học vụ, kế
// toán...) đều cần đọc được thiết lập này để hiển thị đúng header/footer,
// không chỉ người có quyền quản lý đơn vị.
mauInRouter.get("/", async (req, res) => {
  try {
    const cauHinh = await getCauHinhMauInHienTai(req.auth!.currentOrganization!.id);

    res.json({ ok: true, data: cauHinh });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Không thể tải thiết lập mẫu in.",
    });
  }
});

mauInRouter.patch(
  "/",
  requireAnyPermission(["he_thong.quan_tri", "don_vi.quan_ly"]),
  async (req, res) => {
    try {
      const updated = await updateCauHinhMauIn({
        donViId: req.auth!.currentOrganization!.id,
        hienThiLogo: Boolean(req.body?.hienThiLogo),
        ghiChuFooter: req.body?.ghiChuFooter ? String(req.body.ghiChuFooter) : null,
        nhanKyNguoiLap: String(req.body?.nhanKyNguoiLap ?? "Người lập phiếu"),
        nhanKyNguoiNop: String(req.body?.nhanKyNguoiNop ?? "Phụ huynh / Người nộp"),
        nhanKyDaiDienDonVi: String(req.body?.nhanKyDaiDienDonVi ?? "Đại diện đơn vị"),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: error instanceof Error ? error.message : "Không thể cập nhật thiết lập mẫu in.",
      });
    }
  },
);
