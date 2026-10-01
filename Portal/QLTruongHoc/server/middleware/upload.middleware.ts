import fs from "node:fs";
import path from "node:path";

import multer from "multer";

export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    cb(null, uniqueName);
  },
});

export const uploadSingleFile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Định dạng tệp không được hỗ trợ. Chỉ nhận ảnh (jpg/png/webp/gif) hoặc PDF."));
      return;
    }

    cb(null, true);
  },
}).single("file");

// Nhiều ảnh/1 lần — dùng cho album hoạt động lớp học. Middleware riêng, không
// sửa `uploadSingleFile` đang chạy cho ảnh đại diện/tệp đơn.
export const uploadMultipleFiles = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Định dạng tệp không được hỗ trợ. Chỉ nhận ảnh (jpg/png/webp/gif) hoặc PDF."));
      return;
    }

    cb(null, true);
  },
}).array("files", 10);
