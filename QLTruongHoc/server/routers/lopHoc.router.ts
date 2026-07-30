import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";
import {
  requireCurrentOrganization,
  requirePermission,
} from "../middleware/permission.middleware.js";
import {
  assignGiaoVienVaoLop,
  chuyenLopHocSinh,
  createLopHocMoi,
  endGiaoVienAssignment,
  getLopHocDetail,
  getPhieuXepLopDetail,
  ketThucXepLop,
  lapPhieuXepLop,
  listLopHoc,
  setLopHocStatus,
  updateLopHocThongTin,
  xepHocSinhVaoLopVaLapPhieu,
} from "../services/lopHoc.service.js";

export const lopHocRouter = Router();

lopHocRouter.use(
  requireAuth,
  requireCurrentOrganization,
);

function handleError(
  res: import("express").Response,
  error: unknown,
  fallback: string,
) {
  res.status(400).json({
    ok: false,
    error: error instanceof Error ? error.message : fallback,
  });
}

lopHocRouter.get(
  "/",
  requirePermission("lop_hoc.xem"),
  async (req, res) => {
    const rows = await listLopHoc(
      req.auth!.currentOrganization!.id,
      req.auth!.currentOrganization!.loaiDonVi,
    );

    res.json({ ok: true, data: rows });
  },
);

lopHocRouter.post(
  "/",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const created = await createLopHocMoi({
        donViId: req.auth!.currentOrganization!.id,
        chuongTrinhDaoTaoId: req.body?.chuongTrinhDaoTaoId
          ? Number(req.body.chuongTrinhDaoTaoId)
          : null,
        tenLop: String(req.body?.tenLop ?? ""),
        capDo: req.body?.capDo ? String(req.body.capDo) : null,
        ngayBatDau: req.body?.ngayBatDau
          ? String(req.body.ngayBatDau)
          : null,
        ngayKetThuc: req.body?.ngayKetThuc
          ? String(req.body.ngayKetThuc)
          : null,
        siSoToiDa: req.body?.siSoToiDa
          ? Number(req.body.siSoToiDa)
          : null,
        phongHoc: req.body?.phongHoc
          ? String(req.body.phongHoc)
          : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      handleError(res, error, "Không thể tạo lớp học.");
    }
  },
);

lopHocRouter.get(
  "/:id",
  requirePermission("lop_hoc.xem"),
  async (req, res) => {
    try {
      const detail = await getLopHocDetail(
        req.auth!.currentOrganization!.id,
        Number(req.params.id),
      );

      res.json({ ok: true, data: detail });
    } catch (error) {
      res.status(404).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể tải lớp học.",
      });
    }
  },
);

lopHocRouter.patch(
  "/:id",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const updated = await updateLopHocThongTin({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        chuongTrinhDaoTaoId: req.body?.chuongTrinhDaoTaoId
          ? Number(req.body.chuongTrinhDaoTaoId)
          : null,
        tenLop: String(req.body?.tenLop ?? ""),
        capDo: req.body?.capDo ? String(req.body.capDo) : null,
        ngayBatDau: req.body?.ngayBatDau
          ? String(req.body.ngayBatDau)
          : null,
        ngayKetThuc: req.body?.ngayKetThuc
          ? String(req.body.ngayKetThuc)
          : null,
        siSoToiDa: req.body?.siSoToiDa
          ? Number(req.body.siSoToiDa)
          : null,
        phongHoc: req.body?.phongHoc
          ? String(req.body.phongHoc)
          : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể cập nhật lớp học.");
    }
  },
);

lopHocRouter.patch(
  "/:id/trang-thai",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const updated = await setLopHocStatus({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        trangThai: String(req.body?.trangThai ?? ""),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể cập nhật trạng thái lớp.");
    }
  },
);

lopHocRouter.post(
  "/:id/giao-vien",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const created = await assignGiaoVienVaoLop({
        donViId: req.auth!.currentOrganization!.id,
        lopHocId: Number(req.params.id),
        giaoVienId: Number(req.body?.giaoVienId),
        vaiTro: String(req.body?.vaiTro ?? ""),
        tuNgay: String(req.body?.tuNgay ?? ""),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      handleError(res, error, "Không thể phân công giáo viên.");
    }
  },
);

lopHocRouter.patch(
  "/:id/giao-vien/:phanCongId/ket-thuc",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      await endGiaoVienAssignment({
        donViId: req.auth!.currentOrganization!.id,
        phanCongId: Number(req.params.phanCongId),
        denNgay: String(req.body?.denNgay ?? ""),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true });
    } catch (error) {
      handleError(res, error, "Không thể kết thúc phân công.");
    }
  },
);

// BPD 7.2: "Không vượt sĩ số nếu không có quyền phê duyệt" — chỉ quản lý
// đơn vị/quản trị hệ thống mới vượt được, không mở cho học vụ/giáo vụ
// thường dù họ có `lop_hoc.quan_ly` (quyền thao tác xếp lớp hằng ngày).
function coQuyenVuotSiSo(req: import("express").Request) {
  const permissions = req.auth!.currentOrganization!.quyen;
  return (
    permissions.includes("he_thong.quan_tri") || permissions.includes("don_vi.quan_ly")
  );
}

lopHocRouter.post(
  "/:id/hoc-sinh",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const created = await xepHocSinhVaoLopVaLapPhieu({
        donViId: req.auth!.currentOrganization!.id,
        lopHocId: Number(req.params.id),
        hocSinhId: Number(req.body?.hocSinhId),
        ngayVaoLop: String(req.body?.ngayVaoLop ?? ""),
        ghiChuPhieu: req.body?.ghiChuPhieu ? String(req.body.ghiChuPhieu) : null,
        kemPhieuNhapHoc: Boolean(req.body?.kemPhieuNhapHoc),
        ngayNhapHoc: req.body?.ngayNhapHoc ? String(req.body.ngayNhapHoc) : null,
        coQuyenVuotSiSo: coQuyenVuotSiSo(req),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      handleError(res, error, "Không thể xếp học sinh vào lớp.");
    }
  },
);

lopHocRouter.post(
  "/hoc-sinh/:enrollmentId/chuyen-lop",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const created = await chuyenLopHocSinh({
        donViId: req.auth!.currentOrganization!.id,
        enrollmentId: Number(req.params.enrollmentId),
        lopHocIdMoi: Number(req.body?.lopHocIdMoi),
        ngayChuyen: String(req.body?.ngayChuyen ?? ""),
        lyDo: req.body?.lyDo ? String(req.body.lyDo) : null,
        coQuyenVuotSiSo: coQuyenVuotSiSo(req),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      handleError(res, error, "Không thể chuyển lớp.");
    }
  },
);

lopHocRouter.post(
  "/hoc-sinh/:enrollmentId/ket-thuc",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      await ketThucXepLop({
        donViId: req.auth!.currentOrganization!.id,
        enrollmentId: Number(req.params.enrollmentId),
        ngayRoiLop: String(req.body?.ngayRoiLop ?? ""),
        lyDoRoiLop: req.body?.lyDoRoiLop
          ? String(req.body.lyDoRoiLop)
          : null,
        trangThai: String(req.body?.trangThai ?? ""),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true });
    } catch (error) {
      handleError(res, error, "Không thể kết thúc xếp lớp.");
    }
  },
);

lopHocRouter.post(
  "/hoc-sinh/:enrollmentId/phieu-xep-lop",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const created = await lapPhieuXepLop({
        donViId: req.auth!.currentOrganization!.id,
        enrollmentId: Number(req.params.enrollmentId),
        ghiChu: req.body?.ghiChu ? String(req.body.ghiChu) : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      handleError(res, error, "Không thể lập phiếu xếp lớp.");
    }
  },
);

lopHocRouter.get(
  "/phieu-xep-lop/:id",
  requirePermission("lop_hoc.xem"),
  async (req, res) => {
    try {
      const detail = await getPhieuXepLopDetail(
        req.auth!.currentOrganization!.id,
        Number(req.params.id),
      );

      res.json({ ok: true, data: detail });
    } catch (error) {
      handleError(res, error, "Không thể tải phiếu xếp lớp.");
    }
  },
);
