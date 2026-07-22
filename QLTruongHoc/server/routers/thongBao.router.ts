import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import {
  requireAnyPermission,
  requireAnyPermissionOrRole,
  requireCurrentOrganization,
} from "../middleware/permission.middleware.js";
import { getGuardianDonViIds } from "../services/phuHuynh.service.js";
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

/**
 * Phụ huynh không có mã quyền quản lý nào ở trên, nhưng vẫn cần xem/xác nhận
 * đã đọc thông báo trong đơn vị con đang học (BPD 7.7: "Nhận thông báo chung,
 * theo lớp hoặc riêng học viên"). Chỉ áp dụng cho xem/xác nhận đọc — tạo
 * thông báo vẫn chỉ dành cho các vai trò quản lý ở trên.
 * Giới hạn hiện tại: chưa lọc thông báo theo đúng lớp/con của phụ huynh (I05
 * chưa làm) — phụ huynh tạm thời thấy toàn bộ thông báo của đơn vị, giống
 * như các vai trò quản lý.
 */
const THONG_BAO_VAI_TRO_XEM = ["phu_huynh"];

thongBaoRouter.use(requireAuth, requireCurrentOrganization);

function handleError(res: import("express").Response, error: unknown, fallback: string) {
  res.status(400).json({
    ok: false,
    error: error instanceof Error ? error.message : fallback,
  });
}

/**
 * Chỉ phụ huynh KHÔNG có sẵn quyền quản lý nào (đúng trường hợp bypass qua
 * `THONG_BAO_VAI_TRO_XEM`) mới cần gộp theo đơn vị con — quản lý hệ thống/đơn
 * vị vẫn giữ nguyên hành vi xem theo đơn vị đang chọn như trước.
 */
async function resolveGuardianDonViIds(req: import("express").Request) {
  const organization = req.auth?.currentOrganization;

  if (!organization) return undefined;

  const isManager =
    organization.quyen.includes("he_thong.quan_tri") ||
    THONG_BAO_QUYEN.some((code) => organization.quyen.includes(code));

  if (isManager || !organization.vaiTro.includes("phu_huynh")) {
    return undefined;
  }

  return getGuardianDonViIds(req.auth!.user.id);
}

// ---------------------------------------------------------------
// Danh sách và xác nhận đọc thông báo
// ---------------------------------------------------------------

thongBaoRouter.get(
  "/",
  requireAnyPermissionOrRole(THONG_BAO_QUYEN, THONG_BAO_VAI_TRO_XEM),
  async (req, res) => {
    try {
      const guardianDonViIds = await resolveGuardianDonViIds(req);

      const rows = await listThongBao(
        req.auth!.currentOrganization!.id,
        req.auth!.currentOrganization!.loaiDonVi,
        req.auth!.user.id,
        guardianDonViIds,
      );

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải danh sách thông báo.");
    }
  },
);

thongBaoRouter.post(
  "/:id/da-doc",
  requireAnyPermissionOrRole(THONG_BAO_QUYEN, THONG_BAO_VAI_TRO_XEM),
  async (req, res) => {
    try {
      const guardianDonViIds = await resolveGuardianDonViIds(req);

      const result = await confirmThongBaoDaDoc({
        donViId: req.auth!.currentOrganization!.id,
        thongBaoId: Number(req.params.id),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
        guardianDonViIds,
      });

      res.json({ ok: true, data: result });
    } catch (error) {
      handleError(res, error, "Không thể xác nhận thông báo đã đọc.");
    }
  },
);

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
