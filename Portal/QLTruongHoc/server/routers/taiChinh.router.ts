import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import {
  requireAnyPermission,
  requireCurrentOrganization,
  requirePermission,
} from "../middleware/permission.middleware.js";
import {
  createDanhMucChiPhiMoi,
  duyetChiPhi,
  duyetDanhMucChiPhi,
  getCountDanhMucChiPhiChoDuyet,
  getDanhMucChiPhiChoDuyet,
  ghiNhanChiPhi,
  listChiPhi,
  listDanhMucChiPhi,
  setDanhMucChiPhiStatus,
} from "../services/chiPhi.service.js";
import {
  capNhatGiamTru,
  capNhatKhoanApDungKyThu,
  createDanhMucKhoanThuMoi,
  createKyThuMoi,
  dongKyThu,
  duyetDieuChinh,
  getCauHinhTaiChinh,
  getKyThuDetail,
  getBaoCaoTaiChinh,
  ghiNhanThuTien,
  listCongNoToanDonVi,
  listDanhMucKhoanThu,
  listDieuChinhTheoKhoanPhaiThu,
  listKhoanPhaiThuTheoKyThu,
  listKyThu,
  listPhieuThuTheoKhoanPhaiThu,
  listYeuCauDieuChinh,
  moKyThu,
  getPhieuThuDetail,
  setDanhMucKhoanThuStatus,
  sinhKhoanPhaiThuChoLop,
  taoYeuCauDieuChinh,
  updateCauHinhTaiChinh,
  updateDanhMucKhoanThuThongTin,
  updateKyThuThongTin,
} from "../services/taiChinh.service.js";

function handleError(res: import("express").Response, error: unknown, fallback: string) {
  res.status(400).json({
    ok: false,
    error: error instanceof Error ? error.message : fallback,
  });
}

export const taiChinhRouter = Router();

taiChinhRouter.use(requireAuth, requireCurrentOrganization);

// ---------------------------------------------------------------
// Danh mục khoản thu
// ---------------------------------------------------------------

taiChinhRouter.get("/khoan-thu", requirePermission("tai_chinh.xem"), async (req, res) => {
  try {
    const rows = await listDanhMucKhoanThu(
      req.auth!.currentOrganization!.id,
      req.auth!.currentOrganization!.loaiDonVi,
    );

    res.json({ ok: true, data: rows });
  } catch (error) {
    handleError(res, error, "Không thể tải danh mục khoản thu.");
  }
});

taiChinhRouter.post("/khoan-thu", requirePermission("tai_chinh.quan_ly"), async (req, res) => {
  try {
    const created = await createDanhMucKhoanThuMoi({
      donViId: req.auth!.currentOrganization!.id,
      tenKhoanThu: String(req.body?.tenKhoanThu ?? ""),
      loaiKhoanThu: String(req.body?.loaiKhoanThu ?? ""),
      soTienMacDinh:
        req.body?.soTienMacDinh === null ||
        req.body?.soTienMacDinh === undefined ||
        req.body?.soTienMacDinh === ""
          ? null
          : Number(req.body.soTienMacDinh),
      batBuoc: Boolean(req.body?.batBuoc),
      actorUserId: req.auth!.user.id,
      ipAddress: req.ip,
    });

    res.status(201).json({ ok: true, data: created });
  } catch (error) {
    handleError(res, error, "Không thể tạo khoản thu.");
  }
});

taiChinhRouter.patch("/khoan-thu/:id", requirePermission("tai_chinh.quan_ly"), async (req, res) => {
  try {
    const updated = await updateDanhMucKhoanThuThongTin({
      donViId: req.auth!.currentOrganization!.id,
      id: Number(req.params.id),
      tenKhoanThu: String(req.body?.tenKhoanThu ?? ""),
      loaiKhoanThu: String(req.body?.loaiKhoanThu ?? ""),
      soTienMacDinh:
        req.body?.soTienMacDinh === null ||
        req.body?.soTienMacDinh === undefined ||
        req.body?.soTienMacDinh === ""
          ? null
          : Number(req.body.soTienMacDinh),
      batBuoc: Boolean(req.body?.batBuoc),
      actorUserId: req.auth!.user.id,
      ipAddress: req.ip,
    });

    res.json({ ok: true, data: updated });
  } catch (error) {
    handleError(res, error, "Không thể cập nhật khoản thu.");
  }
});

taiChinhRouter.patch(
  "/khoan-thu/:id/trang-thai",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const updated = await setDanhMucKhoanThuStatus({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        trangThai: String(req.body?.trangThai ?? ""),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể cập nhật trạng thái.");
    }
  },
);

// ---------------------------------------------------------------
// Kỳ thu
// ---------------------------------------------------------------

taiChinhRouter.get("/ky-thu", requirePermission("tai_chinh.xem"), async (req, res) => {
  try {
    const rows = await listKyThu(
      req.auth!.currentOrganization!.id,
      req.auth!.currentOrganization!.loaiDonVi,
    );

    res.json({ ok: true, data: rows });
  } catch (error) {
    handleError(res, error, "Không thể tải danh sách kỳ thu.");
  }
});

taiChinhRouter.get("/ky-thu/:id", requirePermission("tai_chinh.xem"), async (req, res) => {
  try {
    const detail = await getKyThuDetail(req.auth!.currentOrganization!.id, Number(req.params.id));

    res.json({ ok: true, data: detail });
  } catch (error) {
    handleError(res, error, "Không thể tải chi tiết kỳ thu.");
  }
});

taiChinhRouter.post("/ky-thu", requirePermission("tai_chinh.quan_ly"), async (req, res) => {
  try {
    const created = await createKyThuMoi({
      donViId: req.auth!.currentOrganization!.id,
      tenKyThu: String(req.body?.tenKyThu ?? ""),
      loaiKy: String(req.body?.loaiKy ?? ""),
      tuNgay: String(req.body?.tuNgay ?? ""),
      denNgay: String(req.body?.denNgay ?? ""),
      hanThanhToan: req.body?.hanThanhToan ? String(req.body.hanThanhToan) : null,
      actorUserId: req.auth!.user.id,
      ipAddress: req.ip,
    });

    res.status(201).json({ ok: true, data: created });
  } catch (error) {
    handleError(res, error, "Không thể tạo kỳ thu.");
  }
});

taiChinhRouter.patch("/ky-thu/:id", requirePermission("tai_chinh.quan_ly"), async (req, res) => {
  try {
    const updated = await updateKyThuThongTin({
      donViId: req.auth!.currentOrganization!.id,
      id: Number(req.params.id),
      tenKyThu: String(req.body?.tenKyThu ?? ""),
      loaiKy: String(req.body?.loaiKy ?? ""),
      tuNgay: String(req.body?.tuNgay ?? ""),
      denNgay: String(req.body?.denNgay ?? ""),
      hanThanhToan: req.body?.hanThanhToan ? String(req.body.hanThanhToan) : null,
      actorUserId: req.auth!.user.id,
      ipAddress: req.ip,
    });

    res.json({ ok: true, data: updated });
  } catch (error) {
    handleError(res, error, "Không thể cập nhật kỳ thu.");
  }
});

taiChinhRouter.put(
  "/ky-thu/:id/khoan-thu",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const danhSach = Array.isArray(req.body?.danhSach)
        ? req.body.danhSach.map((item: Record<string, unknown>) => ({
            danhMucKhoanThuId: Number(item?.danhMucKhoanThuId),
            soTien: Number(item?.soTien),
            ghiChu: item?.ghiChu ? String(item.ghiChu) : null,
          }))
        : [];

      const detail = await capNhatKhoanApDungKyThu({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        danhSach,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: detail });
    } catch (error) {
      handleError(res, error, "Không thể cập nhật khoản thu áp dụng.");
    }
  },
);

taiChinhRouter.patch("/ky-thu/:id/mo", requirePermission("tai_chinh.quan_ly"), async (req, res) => {
  try {
    const updated = await moKyThu({
      donViId: req.auth!.currentOrganization!.id,
      id: Number(req.params.id),
      actorUserId: req.auth!.user.id,
      ipAddress: req.ip,
    });

    res.json({ ok: true, data: updated });
  } catch (error) {
    handleError(res, error, "Không thể mở kỳ thu.");
  }
});

taiChinhRouter.patch(
  "/ky-thu/:id/dong",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const updated = await dongKyThu({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể đóng kỳ thu.");
    }
  },
);

// ---------------------------------------------------------------
// Khoản phải thu, thu tiền, công nợ
// ---------------------------------------------------------------

taiChinhRouter.post(
  "/ky-thu/:id/sinh-khoan-phai-thu",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const result = await sinhKhoanPhaiThuChoLop({
        donViId: req.auth!.currentOrganization!.id,
        kyThuId: Number(req.params.id),
        lopHocId: Number(req.body?.lopHocId),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: result });
    } catch (error) {
      handleError(res, error, "Không thể sinh khoản phải thu.");
    }
  },
);

taiChinhRouter.get(
  "/ky-thu/:id/khoan-phai-thu",
  requirePermission("tai_chinh.xem"),
  async (req, res) => {
    try {
      const rows = await listKhoanPhaiThuTheoKyThu(
        req.auth!.currentOrganization!.id,
        Number(req.params.id),
      );

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải danh sách khoản phải thu.");
    }
  },
);

taiChinhRouter.patch(
  "/khoan-phai-thu/:id/giam-tru",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const updated = await capNhatGiamTru({
        donViId: req.auth!.currentOrganization!.id,
        khoanPhaiThuId: Number(req.params.id),
        giamTru: Number(req.body?.giamTru ?? 0),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể cập nhật giảm trừ.");
    }
  },
);

taiChinhRouter.post(
  "/khoan-phai-thu/:id/thu-tien",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const result = await ghiNhanThuTien({
        donViId: req.auth!.currentOrganization!.id,
        khoanPhaiThuId: Number(req.params.id),
        soTien: Number(req.body?.soTien),
        phuongThuc: String(req.body?.phuongThuc ?? ""),
        ghiChu: req.body?.ghiChu ? String(req.body.ghiChu) : null,
        ngayThu: req.body?.ngayThu ? String(req.body.ngayThu) : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: result });
    } catch (error) {
      handleError(res, error, "Không thể ghi nhận thu tiền.");
    }
  },
);

taiChinhRouter.get(
  "/khoan-phai-thu/:id/phieu-thu",
  requirePermission("tai_chinh.xem"),
  async (req, res) => {
    try {
      const rows = await listPhieuThuTheoKhoanPhaiThu(
        req.auth!.currentOrganization!.id,
        Number(req.params.id),
      );

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải danh sách phiếu thu.");
    }
  },
);

taiChinhRouter.get("/dieu-chinh", requirePermission("tai_chinh.xem"), async (req, res) => {
  try {
    const trangThai = ["cho_duyet", "da_duyet", "tu_choi"].includes(String(req.query.trangThai))
      ? (req.query.trangThai as "cho_duyet" | "da_duyet" | "tu_choi")
      : undefined;

    const rows = await listYeuCauDieuChinh({
      donViId: req.auth!.currentOrganization!.id,
      loaiDonVi: req.auth!.currentOrganization!.loaiDonVi,
      trangThai,
    });

    res.json({ ok: true, data: rows });
  } catch (error) {
    handleError(res, error, "Không thể tải danh sách yêu cầu điều chỉnh.");
  }
});

taiChinhRouter.post(
  "/khoan-phai-thu/:id/dieu-chinh",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const created = await taoYeuCauDieuChinh({
        donViId: req.auth!.currentOrganization!.id,
        khoanPhaiThuId: Number(req.params.id),
        khoanPhaiThuDichId: req.body?.khoanPhaiThuDichId
          ? Number(req.body.khoanPhaiThuDichId)
          : null,
        loaiDieuChinh: String(req.body?.loaiDieuChinh ?? ""),
        soTien:
          req.body?.soTien !== undefined && req.body?.soTien !== null
            ? Number(req.body.soTien)
            : null,
        lyDo: String(req.body?.lyDo ?? ""),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      handleError(res, error, "Không thể tạo yêu cầu điều chỉnh.");
    }
  },
);

taiChinhRouter.get(
  "/khoan-phai-thu/:id/dieu-chinh",
  requirePermission("tai_chinh.xem"),
  async (req, res) => {
    try {
      const rows = await listDieuChinhTheoKhoanPhaiThu(
        req.auth!.currentOrganization!.id,
        Number(req.params.id),
      );

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải lịch sử điều chỉnh.");
    }
  },
);

taiChinhRouter.post(
  "/dieu-chinh/:id/duyet",
  requirePermission("tai_chinh.duyet"),
  async (req, res) => {
    try {
      const quyetDinh = req.body?.quyetDinh === "tu_choi" ? "tu_choi" : "duyet";

      const updated = await duyetDieuChinh({
        donViId: req.auth!.currentOrganization!.id,
        dieuChinhId: Number(req.params.id),
        quyetDinh,
        ghiChuDuyet: req.body?.ghiChuDuyet ? String(req.body.ghiChuDuyet) : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể duyệt yêu cầu điều chỉnh.");
    }
  },
);

taiChinhRouter.get("/cong-no", requirePermission("tai_chinh.xem"), async (req, res) => {
  try {
    const rows = await listCongNoToanDonVi(req.auth!.currentOrganization!.id);

    res.json({ ok: true, data: rows });
  } catch (error) {
    handleError(res, error, "Không thể tải danh sách công nợ.");
  }
});

taiChinhRouter.get("/bao-cao", requirePermission("tai_chinh.xem"), async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const firstDayOfMonth = `${today.slice(0, 7)}-01`;

    const data = await getBaoCaoTaiChinh({
      donViId: req.auth!.currentOrganization!.id,
      loaiDonVi: req.auth!.currentOrganization!.loaiDonVi,
      tuNgay: req.query.tuNgay ? String(req.query.tuNgay) : firstDayOfMonth,
      denNgay: req.query.denNgay ? String(req.query.denNgay) : today,
    });

    res.json({ ok: true, data });
  } catch (error) {
    handleError(res, error, "Không thể tải báo cáo tài chính.");
  }
});

taiChinhRouter.get("/phieu-thu/:id", requirePermission("tai_chinh.xem"), async (req, res) => {
  try {
    const detail = await getPhieuThuDetail(
      req.auth!.currentOrganization!.id,
      Number(req.params.id),
    );

    res.json({ ok: true, data: detail });
  } catch (error) {
    handleError(res, error, "Không thể tải chi tiết phiếu thu.");
  }
});

// ---------------------------------------------------------------
// Cấu hình duyệt chi theo đơn vị
// ---------------------------------------------------------------

taiChinhRouter.get(
  "/cau-hinh-don-vi",
  requirePermission("tai_chinh.xem"),
  async (req, res) => {
    try {
      const cauHinh = await getCauHinhTaiChinh(req.auth!.currentOrganization!.id);

      res.json({ ok: true, data: cauHinh });
    } catch (error) {
      handleError(res, error, "Không thể tải cấu hình duyệt chi.");
    }
  },
);

taiChinhRouter.patch(
  "/cau-hinh-don-vi",
  requireAnyPermission(["he_thong.quan_tri", "don_vi.quan_ly"]),
  async (req, res) => {
    try {
      const updated = await updateCauHinhTaiChinh({
        donViId: req.auth!.currentOrganization!.id,
        duyetDanhMucChiPhi: Boolean(req.body?.duyetDanhMucChiPhi),
        duyetChiDinhKy: Boolean(req.body?.duyetChiDinhKy),
        duyetChiDotXuat: Boolean(req.body?.duyetChiDotXuat),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể cập nhật cấu hình duyệt chi.");
    }
  },
);

// ---------------------------------------------------------------
// Chi phí
// ---------------------------------------------------------------

taiChinhRouter.get(
  "/danh-muc-chi-phi",
  requirePermission("tai_chinh.xem"),
  async (req, res) => {
    try {
      const rows = await listDanhMucChiPhi(req.auth!.currentOrganization!.id);

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải danh mục chi phí.");
    }
  },
);

taiChinhRouter.post(
  "/danh-muc-chi-phi",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const created = await createDanhMucChiPhiMoi({
        donViId: req.auth!.currentOrganization!.id,
        tenChiPhi: String(req.body?.tenChiPhi ?? ""),
        loaiChiPhi: String(req.body?.loaiChiPhi ?? ""),
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      handleError(res, error, "Không thể tạo danh mục chi phí.");
    }
  },
);

taiChinhRouter.post(
  "/danh-muc-chi-phi/:id/trang-thai",
  requirePermission("tai_chinh.quan_ly"),
  async (req, res) => {
    try {
      const trangThai = req.body?.trangThai === "ngung_ap_dung" ? "ngung_ap_dung" : "hoat_dong";

      const updated = await setDanhMucChiPhiStatus({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        trangThai,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể đổi trạng thái danh mục chi phí.");
    }
  },
);

taiChinhRouter.get(
  "/danh-muc-chi-phi/cho-duyet",
  requirePermission("tai_chinh.duyet"),
  async (req, res) => {
    try {
      const rows = await getDanhMucChiPhiChoDuyet(req.auth!.currentOrganization!.id);

      res.json({ ok: true, data: rows });
    } catch (error) {
      handleError(res, error, "Không thể tải danh mục chi phí chờ duyệt.");
    }
  },
);

taiChinhRouter.post(
  "/danh-muc-chi-phi/:id/duyet",
  requirePermission("tai_chinh.duyet"),
  async (req, res) => {
    try {
      const quyetDinh = req.body?.quyetDinh === "tu_choi" ? "tu_choi" : "duyet";

      const updated = await duyetDanhMucChiPhi({
        donViId: req.auth!.currentOrganization!.id,
        id: Number(req.params.id),
        quyetDinh,
        ghiChuDuyet: req.body?.ghiChuDuyet ? String(req.body.ghiChuDuyet) : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể duyệt danh mục chi phí.");
    }
  },
);

taiChinhRouter.get("/chi-phi", requirePermission("tai_chinh.xem"), async (req, res) => {
  try {
    const trangThai = ["cho_duyet", "da_duyet", "tu_choi"].includes(String(req.query.trangThai))
      ? (req.query.trangThai as "cho_duyet" | "da_duyet" | "tu_choi")
      : undefined;

    const rows = await listChiPhi({
      donViId: req.auth!.currentOrganization!.id,
      loaiDonVi: req.auth!.currentOrganization!.loaiDonVi,
      tuNgay: req.query.tuNgay ? String(req.query.tuNgay) : undefined,
      denNgay: req.query.denNgay ? String(req.query.denNgay) : undefined,
      trangThai,
    });

    res.json({ ok: true, data: rows });
  } catch (error) {
    handleError(res, error, "Không thể tải danh sách chi phí.");
  }
});

taiChinhRouter.post("/chi-phi", requirePermission("tai_chinh.quan_ly"), async (req, res) => {
  try {
    const created = await ghiNhanChiPhi({
      donViId: req.auth!.currentOrganization!.id,
      danhMucChiPhiId: Number(req.body?.danhMucChiPhiId),
      soTien: Number(req.body?.soTien),
      ngayChi: String(req.body?.ngayChi ?? ""),
      moTa: req.body?.moTa ? String(req.body.moTa) : null,
      loaiDeXuat: req.body?.loaiDeXuat ? String(req.body.loaiDeXuat) : null,
      actorUserId: req.auth!.user.id,
      ipAddress: req.ip,
    });

    res.status(201).json({ ok: true, data: created });
  } catch (error) {
    handleError(res, error, "Không thể tạo đề xuất chi.");
  }
});

taiChinhRouter.post(
  "/chi-phi/:id/duyet",
  requirePermission("tai_chinh.duyet"),
  async (req, res) => {
    try {
      const quyetDinh = req.body?.quyetDinh === "tu_choi" ? "tu_choi" : "duyet";

      const updated = await duyetChiPhi({
        donViId: req.auth!.currentOrganization!.id,
        chiPhiId: Number(req.params.id),
        quyetDinh,
        ghiChuDuyet: req.body?.ghiChuDuyet ? String(req.body.ghiChuDuyet) : null,
        actorUserId: req.auth!.user.id,
        ipAddress: req.ip,
      });

      res.json({ ok: true, data: updated });
    } catch (error) {
      handleError(res, error, "Không thể duyệt đề xuất chi.");
    }
  },
);
