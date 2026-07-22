import { Router } from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";
import {
  requireCurrentOrganization,
  requirePermission,
} from "../middleware/permission.middleware.js";
import {
  createDonViUnit,
  getDonViDetail,
  getDonViTree,
  setDonViStatus,
  updateDonViUnit,
} from "../services/donVi.service.js";

export const donViRouter = Router();

donViRouter.use(
  requireAuth,
  requireCurrentOrganization,
);

donViRouter.get(
  "/",
  requirePermission("don_vi.xem"),
  async (req, res) => {
    const permissions = req.auth!.currentOrganization!.quyen;
    const isSystemAdmin = permissions.includes("he_thong.quan_tri");

    const tree = await getDonViTree({
      isSystemAdmin,
      actorOrganizationIds: req.auth!.organizations.map(
        (item) => item.id,
      ),
    });

    res.json({
      ok: true,
      data: tree,
    });
  },
);

donViRouter.get(
  "/:id",
  requirePermission("don_vi.xem"),
  async (req, res) => {
    try {
      const detail = await getDonViDetail(Number(req.params.id));

      res.json({
        ok: true,
        data: detail,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể tải chi tiết đơn vị.",
      });
    }
  },
);

donViRouter.post(
  "/",
  requirePermission("he_thong.quan_tri"),
  async (req, res) => {
    try {
      const created = await createDonViUnit({
        donViChaId: req.body?.donViChaId
          ? Number(req.body.donViChaId)
          : null,
        maDonVi: String(req.body?.maDonVi ?? ""),
        tenDonVi: String(req.body?.tenDonVi ?? ""),
        loaiDonVi: String(req.body?.loaiDonVi ?? ""),
        loaiHinhDaoTao: req.body?.loaiHinhDaoTao
          ? String(req.body.loaiHinhDaoTao)
          : null,
        diaChi: req.body?.diaChi ? String(req.body.diaChi) : null,
        soDienThoai: req.body?.soDienThoai
          ? String(req.body.soDienThoai)
          : null,
        email: req.body?.email ? String(req.body.email) : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({
        ok: true,
        data: created,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể tạo đơn vị.",
      });
    }
  },
);

donViRouter.patch(
  "/:id",
  requirePermission("he_thong.quan_tri"),
  async (req, res) => {
    try {
      const updated = await updateDonViUnit({
        id: Number(req.params.id),
        tenDonVi: String(req.body?.tenDonVi ?? ""),
        loaiDonVi: String(req.body?.loaiDonVi ?? ""),
        loaiHinhDaoTao: req.body?.loaiHinhDaoTao
          ? String(req.body.loaiHinhDaoTao)
          : null,
        diaChi: req.body?.diaChi ? String(req.body.diaChi) : null,
        soDienThoai: req.body?.soDienThoai
          ? String(req.body.soDienThoai)
          : null,
        email: req.body?.email ? String(req.body.email) : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({
        ok: true,
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật đơn vị.",
      });
    }
  },
);

donViRouter.patch(
  "/:id/status",
  requirePermission("he_thong.quan_tri"),
  async (req, res) => {
    try {
      const updated = await setDonViStatus({
        id: Number(req.params.id),
        trangThai: String(req.body?.trangThai ?? ""),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({
        ok: true,
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật trạng thái đơn vị.",
      });
    }
  },
);
