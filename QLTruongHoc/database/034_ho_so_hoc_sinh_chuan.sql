-- ============================================================
-- QLTruongHoc
-- Mo rong ho so hoc sinh cho du thong tin chuan giao duc: anh
-- chan dung, dinh danh (CCCD/khai sinh, noi sinh, dan toc, quoc
-- tich), dien chinh sach/uu tien, suc khoe + lien he khan cap,
-- va truong/lop hoc truoc do (neu chuyen den). Tat ca deu NULL
-- (tuy chon) - ghi danh ban dau van gon nhu cu, hoc vu bo sung
-- sau trong ho so.
-- MySQL 8+
-- ============================================================

SET NAMES utf8mb4;
USE SchoolCenter;

ALTER TABLE HocSinh
  ADD COLUMN hinhAnhUrl VARCHAR(500) NULL AFTER tenThuongGoi,
  ADD COLUMN soDinhDanh VARCHAR(50) NULL AFTER gioiTinh,
  ADD COLUMN noiSinh VARCHAR(255) NULL AFTER soDinhDanh,
  ADD COLUMN danToc VARCHAR(100) NULL AFTER noiSinh,
  ADD COLUMN quocTich VARCHAR(100) NULL AFTER danToc,
  ADD COLUMN truongLopTruocDo VARCHAR(255) NULL AFTER diaChi,
  ADD COLUMN dienChinhSach VARCHAR(255) NULL AFTER ngayNhapHoc,
  ADD COLUMN chieuCaoCm DECIMAL(5,1) NULL AFTER dienChinhSach,
  ADD COLUMN canNangKg DECIMAL(5,1) NULL AFTER chieuCaoCm,
  ADD COLUMN diUngBenhNen TEXT NULL AFTER canNangKg,
  ADD COLUMN lienHeKhanCapHoTen VARCHAR(255) NULL AFTER diUngBenhNen,
  ADD COLUMN lienHeKhanCapSdt VARCHAR(30) NULL AFTER lienHeKhanCapHoTen;
