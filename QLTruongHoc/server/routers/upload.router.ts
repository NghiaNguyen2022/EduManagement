import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { uploadSingleFile } from "../middleware/upload.middleware.js";

export const uploadRouter = Router();

uploadRouter.use(requireAuth);

/**
 * Tải lên 1 tệp dùng chung (ảnh đơn vị, giấy phép, ảnh đại diện) — chỉ trả
 * về đường dẫn tệp, không gắn với bản ghi nào; nơi gọi tự lưu URL vào đúng
 * trường của mình (donVi.hinhAnhUrl, nguoiDung.hinhAnhUrl...) ở bước sau.
 */
uploadRouter.post("/", (req, res) => {
  uploadSingleFile(req, res, (error) => {
    if (error) {
      res.status(400).json({
        ok: false,
        error: error instanceof Error ? error.message : "Không thể tải lên tệp.",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        ok: false,
        error: "Vui lòng chọn tệp để tải lên.",
      });
      return;
    }

    res.status(201).json({
      ok: true,
      data: { url: `/uploads/${req.file.filename}` },
    });
  });
});
