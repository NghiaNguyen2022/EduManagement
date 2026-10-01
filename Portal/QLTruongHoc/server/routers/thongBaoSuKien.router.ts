import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { requireCurrentOrganization } from "../middleware/permission.middleware.js";
import {
  danhDauDaDoc,
  danhDauTatCaDaDoc,
  getThongBaoSuKienMoi,
  listThongBaoSuKien,
} from "../services/thongBaoSuKien.service.js";

export const thongBaoSuKienRouter = Router();

thongBaoSuKienRouter.use(requireAuth, requireCurrentOrganization);

function handleError(res: import("express").Response, error: unknown, fallback: string) {
  res.status(400).json({
    ok: false,
    error: error instanceof Error ? error.message : fallback,
  });
}

// Danh sách gần đây (mục chuông) + số chưa đọc — chỉ thấy thông báo của
// chính mình, không cần thêm quyền gì (đã được resolve theo quyền lúc tạo).
thongBaoSuKienRouter.get("/", async (req, res) => {
  try {
    const result = await listThongBaoSuKien(
      req.auth!.currentOrganization!.id,
      req.auth!.user.id,
    );

    res.json({ ok: true, data: result });
  } catch (error) {
    handleError(res, error, "Không thể tải thông báo.");
  }
});

// Sự kiện chưa từng hiện popup — client poll để lấy toast mới, đồng thời
// đánh dấu đã hiện thị (chỉ pop-up đúng 1 lần).
thongBaoSuKienRouter.get("/moi", async (req, res) => {
  try {
    const items = await getThongBaoSuKienMoi(
      req.auth!.currentOrganization!.id,
      req.auth!.user.id,
    );

    res.json({ ok: true, data: items });
  } catch (error) {
    handleError(res, error, "Không thể tải thông báo mới.");
  }
});

thongBaoSuKienRouter.post("/:id/danh-dau-da-doc", async (req, res) => {
  try {
    await danhDauDaDoc(Number(req.params.id), req.auth!.user.id);

    res.json({ ok: true });
  } catch (error) {
    handleError(res, error, "Không thể đánh dấu đã đọc.");
  }
});

thongBaoSuKienRouter.post("/danh-dau-tat-ca-da-doc", async (req, res) => {
  try {
    await danhDauTatCaDaDoc(req.auth!.currentOrganization!.id, req.auth!.user.id);

    res.json({ ok: true });
  } catch (error) {
    handleError(res, error, "Không thể đánh dấu tất cả đã đọc.");
  }
});
