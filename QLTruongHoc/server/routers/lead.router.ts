import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";
import {
  requireCurrentOrganization,
  requirePermission,
} from "../middleware/permission.middleware.js";
import {
  addLeadHoatDongMoi,
  assignLeadTuVanVien,
  confirmLeadRegistration,
  createLeadMoi,
  getLeadDetail,
  listLead,
  markLeadKhongTiepTuc,
  reopenLead,
  updateLeadThongTin,
} from "../services/lead.service.js";

export const leadRouter = Router();

leadRouter.use(
  requireAuth,
  requireCurrentOrganization,
);

function handleError(res: import("express").Response, error: unknown, fallback: string) {
  res.status(400).json({
    ok: false,
    error: error instanceof Error ? error.message : fallback,
  });
}

leadRouter.get(
  "/",
  requirePermission("tuyen_sinh.xem"),
  async (req, res) => {
    const rows = await listLead(
      req.auth!.currentOrganization!.id,
    );

    res.json({ ok: true, data: rows });
  },
);

leadRouter.post(
  "/",
  requirePermission("tuyen_sinh.quan_ly"),
  async (req, res) => {
    try {
      const created = await createLeadMoi({
        donViId: req.auth!.currentOrganization!.id,
        hoTen: String(req.body?.hoTen ?? ""),
        soDienThoai: String(req.body?.soDienThoai ?? ""),
        email: req.body?.email ? String(req.body.email) : null,
        nguon: req.body?.nguon ? String(req.body.nguon) : undefined,
        doTuoiHoacTrinhDo: req.body?.doTuoiHoacTrinhDo
          ? String(req.body.doTuoiHoacTrinhDo)
          : null,
        nhuCau: req.body?.nhuCau ? String(req.body.nhuCau) : null,
        tuVanVienId: req.body?.tuVanVienId
          ? Number(req.body.tuVanVienId)
          : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      handleError(res, error, "Không thể tạo lead.");
    }
  },
);

leadRouter.get(
  "/:id",
  requirePermission("tuyen_sinh.xem"),
  async (req, res) => {
    try {
      const detail = await getLeadDetail(
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
            : "Không thể tải lead.",
      });
    }
  },
);

leadRouter.patch(
  "/:id",
  requirePermission("tuyen_sinh.quan_ly"),
  async (req, res) => {
    try {
      const updated = await updateLeadThongTin({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        hoTen: String(req.body?.hoTen ?? ""),
        soDienThoai: String(req.body?.soDienThoai ?? ""),
        email: req.body?.email ? String(req.body.email) : null,
        nguon: req.body?.nguon ? String(req.body.nguon) : undefined,
        doTuoiHoacTrinhDo: req.body?.doTuoiHoacTrinhDo
          ? String(req.body.doTuoiHoacTrinhDo)
          : null,
        nhuCau: req.body?.nhuCau ? String(req.body.nhuCau) : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể cập nhật lead.");
    }
  },
);

leadRouter.patch(
  "/:id/tu-van-vien",
  requirePermission("tuyen_sinh.quan_ly"),
  async (req, res) => {
    try {
      const updated = await assignLeadTuVanVien({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        tuVanVienId: req.body?.tuVanVienId
          ? Number(req.body.tuVanVienId)
          : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể phân công tư vấn viên.");
    }
  },
);

leadRouter.post(
  "/:id/hoat-dong",
  requirePermission("tuyen_sinh.quan_ly"),
  async (req, res) => {
    try {
      const result = await addLeadHoatDongMoi({
        donViId: req.auth!.currentOrganization!.id,
        leadId: Number(req.params.id),
        loaiHoatDong: String(req.body?.loaiHoatDong ?? ""),
        noiDung: String(req.body?.noiDung ?? ""),
        ketQua: req.body?.ketQua ? String(req.body.ketQua) : null,
        thoiGian: req.body?.thoiGian
          ? String(req.body.thoiGian)
          : null,
        trangThaiMoi: req.body?.trangThaiMoi
          ? String(req.body.trangThaiMoi)
          : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: result });
    } catch (error) {
      handleError(res, error, "Không thể ghi nhận hoạt động.");
    }
  },
);

leadRouter.post(
  "/:id/khong-tiep-tuc",
  requirePermission("tuyen_sinh.quan_ly"),
  async (req, res) => {
    try {
      const updated = await markLeadKhongTiepTuc({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        lyDo: String(req.body?.lyDo ?? ""),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể đánh dấu không tiếp tục.");
    }
  },
);

leadRouter.post(
  "/:id/mo-lai",
  requirePermission("tuyen_sinh.quan_ly"),
  async (req, res) => {
    try {
      const updated = await reopenLead({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể mở lại lead.");
    }
  },
);

leadRouter.post(
  "/:id/xac-nhan-dang-ky",
  requirePermission("tuyen_sinh.quan_ly"),
  async (req, res) => {
    try {
      const result = await confirmLeadRegistration({
        donViId: req.auth!.currentOrganization!.id,
        leadId: Number(req.params.id),
        hoTenHocVien: String(req.body?.hoTenHocVien ?? ""),
        ngaySinh: String(req.body?.ngaySinh ?? ""),
        gioiTinh: req.body?.gioiTinh
          ? String(req.body.gioiTinh)
          : null,
        diaChiHocVien: req.body?.diaChiHocVien
          ? String(req.body.diaChiHocVien)
          : null,
        ngayNhapHoc: req.body?.ngayNhapHoc
          ? String(req.body.ngayNhapHoc)
          : null,
        moiQuanHe: String(req.body?.moiQuanHe ?? ""),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: result });
    } catch (error) {
      handleError(res, error, "Không thể xác nhận đăng ký.");
    }
  },
);
