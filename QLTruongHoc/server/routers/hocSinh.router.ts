import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";
import {
  requireAnyPermission,
  requireCurrentOrganization,
  requirePermission,
} from "../middleware/permission.middleware.js";
import {
  createHocSinhMoi,
  getHocSinhDetail,
  listHocSinh,
  setHocSinhTrangThai,
  updateHocSinhInfo,
} from "../services/hocSinh.service.js";
import {
  addGuardianToStudent,
  createGuardianAccount,
  removeGuardianLink,
  updateGuardianLinkInfo,
} from "../services/phuHuynh.service.js";

export const hocSinhRouter = Router();

hocSinhRouter.use(
  requireAuth,
  requireCurrentOrganization,
);

hocSinhRouter.get(
  "/",
  requirePermission("hoc_sinh.xem"),
  async (req, res) => {
    const rows = await listHocSinh(
      req.auth!.currentOrganization!.id,
      req.auth!.currentOrganization!.loaiDonVi,
    );

    res.json({ ok: true, data: rows });
  },
);

hocSinhRouter.post(
  "/",
  requirePermission("hoc_sinh.quan_ly"),
  async (req, res) => {
    try {
      const created = await createHocSinhMoi({
        donViId: req.auth!.currentOrganization!.id,
        hoTen: String(req.body?.hoTen ?? ""),
        tenThuongGoi: req.body?.tenThuongGoi
          ? String(req.body.tenThuongGoi)
          : null,
        ngaySinh: String(req.body?.ngaySinh ?? ""),
        gioiTinh: req.body?.gioiTinh
          ? String(req.body.gioiTinh)
          : null,
        diaChi: req.body?.diaChi
          ? String(req.body.diaChi)
          : null,
        ngayNhapHoc: req.body?.ngayNhapHoc
          ? String(req.body.ngayNhapHoc)
          : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể tạo học sinh.",
      });
    }
  },
);

hocSinhRouter.get(
  "/:id",
  requirePermission("hoc_sinh.xem"),
  async (req, res) => {
    try {
      const detail = await getHocSinhDetail(
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
            : "Không thể tải học sinh.",
      });
    }
  },
);

hocSinhRouter.patch(
  "/:id",
  requirePermission("hoc_sinh.quan_ly"),
  async (req, res) => {
    try {
      const updated = await updateHocSinhInfo({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        hoTen: String(req.body?.hoTen ?? ""),
        tenThuongGoi: req.body?.tenThuongGoi
          ? String(req.body.tenThuongGoi)
          : null,
        ngaySinh: String(req.body?.ngaySinh ?? ""),
        gioiTinh: req.body?.gioiTinh
          ? String(req.body.gioiTinh)
          : null,
        diaChi: req.body?.diaChi
          ? String(req.body.diaChi)
          : null,
        ngayNhapHoc: req.body?.ngayNhapHoc
          ? String(req.body.ngayNhapHoc)
          : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật học sinh.",
      });
    }
  },
);

hocSinhRouter.patch(
  "/:id/trang-thai",
  requirePermission("hoc_sinh.quan_ly"),
  async (req, res) => {
    try {
      const updated = await setHocSinhTrangThai({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        trangThai: String(req.body?.trangThai ?? ""),
        lyDo: req.body?.lyDo ? String(req.body.lyDo) : null,
        ngayHieuLuc: req.body?.ngayHieuLuc
          ? String(req.body.ngayHieuLuc)
          : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật trạng thái học sinh.",
      });
    }
  },
);

hocSinhRouter.post(
  "/:id/phu-huynh",
  requirePermission("hoc_sinh.quan_ly"),
  async (req, res) => {
    try {
      const result = await addGuardianToStudent({
        donViId: req.auth!.currentOrganization!.id,
        hocSinhId: Number(req.params.id),
        dienThoai: String(req.body?.dienThoai ?? ""),
        hoTen: req.body?.hoTen
          ? String(req.body.hoTen)
          : undefined,
        ngaySinh: req.body?.ngaySinh
          ? String(req.body.ngaySinh)
          : null,
        gioiTinh: req.body?.gioiTinh
          ? String(req.body.gioiTinh)
          : null,
        email: req.body?.email
          ? String(req.body.email)
          : null,
        ngheNghiep: req.body?.ngheNghiep
          ? String(req.body.ngheNghiep)
          : null,
        diaChi: req.body?.diaChi
          ? String(req.body.diaChi)
          : null,
        moiQuanHe: String(req.body?.moiQuanHe ?? ""),
        laLienHeChinh: Boolean(req.body?.laLienHeChinh),
        duocDonTre: req.body?.duocDonTre !== false,
        nhanThongBao: req.body?.nhanThongBao !== false,
        nhanThongTinHocPhi:
          req.body?.nhanThongTinHocPhi !== false,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: result });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể thêm phụ huynh.",
      });
    }
  },
);

hocSinhRouter.patch(
  "/:id/phu-huynh/:linkId",
  requirePermission("hoc_sinh.quan_ly"),
  async (req, res) => {
    try {
      const updated = await updateGuardianLinkInfo({
        donViId: req.auth!.currentOrganization!.id,
        linkId: Number(req.params.linkId),
        moiQuanHe: String(req.body?.moiQuanHe ?? ""),
        laLienHeChinh: Boolean(req.body?.laLienHeChinh),
        duocDonTre: req.body?.duocDonTre !== false,
        nhanThongBao: req.body?.nhanThongBao !== false,
        nhanThongTinHocPhi:
          req.body?.nhanThongTinHocPhi !== false,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật liên kết phụ huynh.",
      });
    }
  },
);

hocSinhRouter.delete(
  "/:id/phu-huynh/:linkId",
  requirePermission("hoc_sinh.quan_ly"),
  async (req, res) => {
    try {
      await removeGuardianLink({
        donViId: req.auth!.currentOrganization!.id,
        linkId: Number(req.params.linkId),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể gỡ liên kết phụ huynh.",
      });
    }
  },
);

hocSinhRouter.post(
  "/:id/phu-huynh/:linkId/tai-khoan",
  requireAnyPermission([
    "hoc_sinh.quan_ly",
    "tuyen_sinh.quan_ly",
  ]),
  async (req, res) => {
    try {
      const result = await createGuardianAccount({
        donViId: req.auth!.currentOrganization!.id,
        linkId: Number(req.params.linkId),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: result });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể tạo tài khoản đăng nhập.",
      });
    }
  },
);
