import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import {
  requireAnyPermission,
  requireCurrentOrganization,
  requirePermission,
} from "../middleware/permission.middleware.js";
import { addDanhGia, listDanhGia, removeDanhGia } from "../services/danhGia.service.js";
import {
  createHocSinhMoi,
  getHocSinhChoXepLop,
  getHocSinhDetail,
  ghiNhanHoSoHocSinh,
  ghiNhanKetQuaTestDauVao,
  listHocSinh,
  setHocSinhTrangThai,
  updateHocSinhInfo,
} from "../services/hocSinh.service.js";
import {
  addGuardianToStudent,
  createGuardianAccount,
  CrossOrgGuardianConfirmError,
  removeGuardianLink,
  updateGuardianLinkInfo,
} from "../services/phuHuynh.service.js";
import { addThanhTich, listThanhTich, removeThanhTich } from "../services/thanhTich.service.js";

export const hocSinhRouter = Router();

hocSinhRouter.use(requireAuth, requireCurrentOrganization);

hocSinhRouter.get("/", requirePermission("hoc_sinh.xem"), async (req, res) => {
  const rows = await listHocSinh(
    req.auth!.currentOrganization!.id,
    req.auth!.currentOrganization!.loaiDonVi,
  );

  res.json({ ok: true, data: rows });
});

hocSinhRouter.post("/", requirePermission("hoc_sinh.quan_ly"), async (req, res) => {
  try {
    const created = await createHocSinhMoi({
      donViId: req.auth!.currentOrganization!.id,
      hoTen: String(req.body?.hoTen ?? ""),
      tenThuongGoi: req.body?.tenThuongGoi ? String(req.body.tenThuongGoi) : null,
      ngaySinh: String(req.body?.ngaySinh ?? ""),
      gioiTinh: req.body?.gioiTinh ? String(req.body.gioiTinh) : null,
      diaChi: req.body?.diaChi ? String(req.body.diaChi) : null,
      ngayNhapHoc: req.body?.ngayNhapHoc ? String(req.body.ngayNhapHoc) : null,
      actorUserId: req.auth!.user.id,
      ipAddress: req.ip,
    });

    res.status(201).json({ ok: true, data: created });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Không thể tạo học sinh.",
    });
  }
});

hocSinhRouter.get(
  "/cho-xep-lop",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    const rows = await getHocSinhChoXepLop(req.auth!.currentOrganization!.id);

    res.json({ ok: true, data: rows });
  },
);

// Ghi danh trực tiếp — dùng cho mầm non (không qua Lead). Gác bằng quyền
// tuyển sinh (không phải hoc_sinh.quan_ly) vì đây là hành động của tuyển
// sinh, giống cách confirmLeadRegistration cũng tạo HocSinh qua quyền
// tuyen_sinh.quan_ly. Xem docs/analysis/TUYEN_SINH_THEO_LOAI_HINH.md.
hocSinhRouter.post(
  "/ghi-danh",
  requirePermission("tuyen_sinh.quan_ly"),
  async (req, res) => {
    try {
      const created = await ghiNhanHoSoHocSinh({
        donViId: req.auth!.currentOrganization!.id,
        hoTenHocVien: String(req.body?.hoTenHocVien ?? ""),
        ngaySinh: String(req.body?.ngaySinh ?? ""),
        gioiTinh: req.body?.gioiTinh ? String(req.body.gioiTinh) : null,
        diaChiHocVien: req.body?.diaChiHocVien ? String(req.body.diaChiHocVien) : null,
        ngayNhapHoc: req.body?.ngayNhapHoc ? String(req.body.ngayNhapHoc) : null,
        hoTenNguoiLienHe: String(req.body?.hoTenNguoiLienHe ?? ""),
        soDienThoaiNguoiLienHe: String(req.body?.soDienThoaiNguoiLienHe ?? ""),
        emailNguoiLienHe: req.body?.emailNguoiLienHe ? String(req.body.emailNguoiLienHe) : null,
        moiQuanHe: String(req.body?.moiQuanHe ?? ""),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: error instanceof Error ? error.message : "Không thể ghi danh học sinh.",
      });
    }
  },
);

// Học vụ ghi kết quả test đầu vào ngay lúc xếp lớp — cùng quyền đang gác
// "chờ xếp lớp" (lop_hoc.quan_ly), không cần quyền mới.
hocSinhRouter.patch(
  "/:id/ket-qua-test",
  requirePermission("lop_hoc.quan_ly"),
  async (req, res) => {
    try {
      const updated = await ghiNhanKetQuaTestDauVao({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        ketQuaTestDauVao: req.body?.ketQuaTestDauVao
          ? String(req.body.ketQuaTestDauVao)
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
            : "Không thể ghi nhận kết quả test đầu vào.",
      });
    }
  },
);

hocSinhRouter.get("/:id", requirePermission("hoc_sinh.xem"), async (req, res) => {
  try {
    const detail = await getHocSinhDetail(req.auth!.currentOrganization!.id, Number(req.params.id));

    res.json({ ok: true, data: detail });
  } catch (error) {
    res.status(404).json({
      ok: false,
      error: error instanceof Error ? error.message : "Không thể tải học sinh.",
    });
  }
});

hocSinhRouter.patch("/:id", requirePermission("hoc_sinh.quan_ly"), async (req, res) => {
  try {
    const updated = await updateHocSinhInfo({
      donViId: req.auth!.currentOrganization!.id,
      id: Number(req.params.id),
      hoTen: String(req.body?.hoTen ?? ""),
      tenThuongGoi: req.body?.tenThuongGoi ? String(req.body.tenThuongGoi) : null,
      hinhAnhUrl: req.body?.hinhAnhUrl ? String(req.body.hinhAnhUrl) : null,
      ngaySinh: String(req.body?.ngaySinh ?? ""),
      gioiTinh: req.body?.gioiTinh ? String(req.body.gioiTinh) : null,
      soDinhDanh: req.body?.soDinhDanh ? String(req.body.soDinhDanh) : null,
      noiSinh: req.body?.noiSinh ? String(req.body.noiSinh) : null,
      danToc: req.body?.danToc ? String(req.body.danToc) : null,
      quocTich: req.body?.quocTich ? String(req.body.quocTich) : null,
      diaChi: req.body?.diaChi ? String(req.body.diaChi) : null,
      truongLopTruocDo: req.body?.truongLopTruocDo
        ? String(req.body.truongLopTruocDo)
        : null,
      ngayNhapHoc: req.body?.ngayNhapHoc ? String(req.body.ngayNhapHoc) : null,
      dienChinhSach: req.body?.dienChinhSach ? String(req.body.dienChinhSach) : null,
      chieuCaoCm: req.body?.chieuCaoCm ? String(req.body.chieuCaoCm) : null,
      canNangKg: req.body?.canNangKg ? String(req.body.canNangKg) : null,
      diUngBenhNen: req.body?.diUngBenhNen ? String(req.body.diUngBenhNen) : null,
      lienHeKhanCapHoTen: req.body?.lienHeKhanCapHoTen
        ? String(req.body.lienHeKhanCapHoTen)
        : null,
      lienHeKhanCapSdt: req.body?.lienHeKhanCapSdt
        ? String(req.body.lienHeKhanCapSdt)
        : null,
      actorUserId: req.auth!.user.id,
      ipAddress: req.ip,
    });

    res.json({ ok: true, data: updated });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Không thể cập nhật học sinh.",
    });
  }
});

hocSinhRouter.patch("/:id/trang-thai", requirePermission("hoc_sinh.quan_ly"), async (req, res) => {
  try {
    const updated = await setHocSinhTrangThai({
      donViId: req.auth!.currentOrganization!.id,
      id: Number(req.params.id),
      trangThai: String(req.body?.trangThai ?? ""),
      lyDo: req.body?.lyDo ? String(req.body.lyDo) : null,
      ngayHieuLuc: req.body?.ngayHieuLuc ? String(req.body.ngayHieuLuc) : null,
      actorUserId: req.auth!.user.id,
      ipAddress: req.ip,
    });

    res.json({ ok: true, data: updated });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Không thể cập nhật trạng thái học sinh.",
    });
  }
});

// Chứng chỉ/thành tích — dùng quyền hoc_tap.xem/hoc_tap.ghi_nhan sẵn có
// (giáo viên + học vụ), không cần quyền mới. Không có workflow duyệt.
hocSinhRouter.get(
  "/:id/thanh-tich",
  requirePermission("hoc_tap.xem"),
  async (req, res) => {
    try {
      const rows = await listThanhTich(
        req.auth!.currentOrganization!.id,
        Number(req.params.id),
      );

      res.json({ ok: true, data: rows });
    } catch (error) {
      res.status(404).json({
        ok: false,
        error: error instanceof Error ? error.message : "Không thể tải thành tích.",
      });
    }
  },
);

hocSinhRouter.post(
  "/:id/thanh-tich",
  requirePermission("hoc_tap.ghi_nhan"),
  async (req, res) => {
    try {
      const created = await addThanhTich({
        donViId: req.auth!.currentOrganization!.id,
        hocSinhId: Number(req.params.id),
        tenThanhTich: String(req.body?.tenThanhTich ?? ""),
        ketQua: req.body?.ketQua ? String(req.body.ketQua) : null,
        ngayDat: req.body?.ngayDat ? String(req.body.ngayDat) : null,
        noiCap: req.body?.noiCap ? String(req.body.noiCap) : null,
        tepMinhChungUrl: req.body?.tepMinhChungUrl
          ? String(req.body.tepMinhChungUrl)
          : null,
        ghiChu: req.body?.ghiChu ? String(req.body.ghiChu) : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: error instanceof Error ? error.message : "Không thể ghi nhận thành tích.",
      });
    }
  },
);

hocSinhRouter.delete(
  "/thanh-tich/:thanhTichId",
  requirePermission("hoc_tap.ghi_nhan"),
  async (req, res) => {
    try {
      await removeThanhTich({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.thanhTichId),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: error instanceof Error ? error.message : "Không thể xoá thành tích.",
      });
    }
  },
);

// Kết quả học tập theo lượt xếp lớp — cùng quyền hoc_tap.xem/hoc_tap.ghi_nhan.
hocSinhRouter.get(
  "/:id/danh-gia",
  requirePermission("hoc_tap.xem"),
  async (req, res) => {
    try {
      const rows = await listDanhGia(
        req.auth!.currentOrganization!.id,
        Number(req.params.id),
      );

      res.json({ ok: true, data: rows });
    } catch (error) {
      res.status(404).json({
        ok: false,
        error: error instanceof Error ? error.message : "Không thể tải kết quả học tập.",
      });
    }
  },
);

hocSinhRouter.post(
  "/:id/danh-gia",
  requirePermission("hoc_tap.ghi_nhan"),
  async (req, res) => {
    try {
      const created = await addDanhGia({
        donViId: req.auth!.currentOrganization!.id,
        hocSinhId: Number(req.params.id),
        enrollmentId: Number(req.body?.enrollmentId),
        loaiDanhGia: String(req.body?.loaiDanhGia ?? ""),
        linhVucPhatTrien: req.body?.linhVucPhatTrien
          ? String(req.body.linhVucPhatTrien)
          : null,
        diemSo: req.body?.diemSo ? String(req.body.diemSo) : null,
        xepLoai: req.body?.xepLoai ? String(req.body.xepLoai) : null,
        nhanXet: req.body?.nhanXet ? String(req.body.nhanXet) : null,
        ngayDanhGia: String(req.body?.ngayDanhGia ?? ""),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: error instanceof Error ? error.message : "Không thể ghi nhận kết quả học tập.",
      });
    }
  },
);

hocSinhRouter.delete(
  "/danh-gia/:danhGiaId",
  requirePermission("hoc_tap.ghi_nhan"),
  async (req, res) => {
    try {
      await removeDanhGia({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.danhGiaId),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: error instanceof Error ? error.message : "Không thể xoá kết quả học tập.",
      });
    }
  },
);

hocSinhRouter.post("/:id/phu-huynh", requirePermission("hoc_sinh.quan_ly"), async (req, res) => {
  try {
    const result = await addGuardianToStudent({
      donViId: req.auth!.currentOrganization!.id,
      hocSinhId: Number(req.params.id),
      dienThoai: String(req.body?.dienThoai ?? ""),
      hoTen: req.body?.hoTen ? String(req.body.hoTen) : undefined,
      ngaySinh: req.body?.ngaySinh ? String(req.body.ngaySinh) : null,
      gioiTinh: req.body?.gioiTinh ? String(req.body.gioiTinh) : null,
      email: req.body?.email ? String(req.body.email) : null,
      ngheNghiep: req.body?.ngheNghiep ? String(req.body.ngheNghiep) : null,
      diaChi: req.body?.diaChi ? String(req.body.diaChi) : null,
      moiQuanHe: String(req.body?.moiQuanHe ?? ""),
      laLienHeChinh: Boolean(req.body?.laLienHeChinh),
      duocDonTre: req.body?.duocDonTre !== false,
      nhanThongBao: req.body?.nhanThongBao !== false,
      nhanThongTinHocPhi: req.body?.nhanThongTinHocPhi !== false,
      confirmCrossOrgReuse: Boolean(req.body?.confirmCrossOrgReuse),
      actorUserId: req.auth!.user.id,
      ipAddress: req.ip,
    });

    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof CrossOrgGuardianConfirmError) {
      res.status(409).json({
        ok: false,
        needsConfirmation: true,
        guardianInfo: error.guardianInfo,
        error: error.message,
      });
      return;
    }

    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Không thể thêm phụ huynh.",
    });
  }
});

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
        nhanThongTinHocPhi: req.body?.nhanThongTinHocPhi !== false,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: error instanceof Error ? error.message : "Không thể cập nhật liên kết phụ huynh.",
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
        error: error instanceof Error ? error.message : "Không thể gỡ liên kết phụ huynh.",
      });
    }
  },
);

hocSinhRouter.post(
  "/:id/phu-huynh/:linkId/tai-khoan",
  requireAnyPermission(["hoc_sinh.quan_ly", "tuyen_sinh.quan_ly"]),
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
        error: error instanceof Error ? error.message : "Không thể tạo tài khoản đăng nhập.",
      });
    }
  },
);
