-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: SchoolCenter
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `baogiang`
--

DROP TABLE IF EXISTS `baogiang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `baogiang` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `buoiHocId` bigint unsigned NOT NULL,
  `giaoVienId` bigint unsigned NOT NULL,
  `chuDe` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `noiDung` text COLLATE utf8mb4_unicode_ci,
  `mucTieu` text COLLATE utf8mb4_unicode_ci,
  `baiTap` text COLLATE utf8mb4_unicode_ci,
  `nhanXetChung` text COLLATE utf8mb4_unicode_ci,
  `trangThai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'nhap',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_BaoGiang_buoi_giaoVien` (`buoiHocId`,`giaoVienId`),
  KEY `fk_BaoGiang_DonVi` (`donViId`),
  KEY `fk_BaoGiang_GiaoVien` (`giaoVienId`),
  CONSTRAINT `fk_BaoGiang_BuoiHoc` FOREIGN KEY (`buoiHocId`) REFERENCES `buoihoc` (`id`),
  CONSTRAINT `fk_BaoGiang_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `fk_BaoGiang_GiaoVien` FOREIGN KEY (`giaoVienId`) REFERENCES `giaovien` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `baogiang`
--

LOCK TABLES `baogiang` WRITE;
/*!40000 ALTER TABLE `baogiang` DISABLE KEYS */;
/*!40000 ALTER TABLE `baogiang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `buoihoc`
--

DROP TABLE IF EXISTS `buoihoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buoihoc` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `lopHocId` bigint unsigned NOT NULL,
  `lichHocId` bigint unsigned DEFAULT NULL,
  `ngayHoc` date NOT NULL,
  `gioBatDau` time NOT NULL,
  `gioKetThuc` time NOT NULL,
  `phongHoc` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loaiBuoi` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoc_chinh',
  `trangThai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'du_kien',
  `lyDoThayDoi` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_BuoiHoc_lop_ngay_gio` (`lopHocId`,`ngayHoc`,`gioBatDau`),
  KEY `fk_BuoiHoc_DonVi` (`donViId`),
  KEY `fk_BuoiHoc_LichHoc` (`lichHocId`),
  CONSTRAINT `fk_BuoiHoc_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `fk_BuoiHoc_LichHoc` FOREIGN KEY (`lichHocId`) REFERENCES `lichhoc` (`id`),
  CONSTRAINT `fk_BuoiHoc_LopHoc` FOREIGN KEY (`lopHocId`) REFERENCES `lophoc` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buoihoc`
--

LOCK TABLES `buoihoc` WRITE;
/*!40000 ALTER TABLE `buoihoc` DISABLE KEYS */;
/*!40000 ALTER TABLE `buoihoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chuongtrinhdaotao`
--

DROP TABLE IF EXISTS `chuongtrinhdaotao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chuongtrinhdaotao` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `maChuongTrinh` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenChuongTrinh` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loaiHinhDaoTao` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capDo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tongSoBuoi` int DEFAULT NULL,
  `tongSoGio` decimal(10,2) DEFAULT NULL,
  `moTa` text COLLATE utf8mb4_unicode_ci,
  `trangThai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_CTDT_donVi_ma` (`donViId`,`maChuongTrinh`),
  CONSTRAINT `fk_CTDT_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chuongtrinhdaotao`
--

LOCK TABLES `chuongtrinhdaotao` WRITE;
/*!40000 ALTER TABLE `chuongtrinhdaotao` DISABLE KEYS */;
/*!40000 ALTER TABLE `chuongtrinhdaotao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `danhgiahoctap`
--

DROP TABLE IF EXISTS `danhgiahoctap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `danhgiahoctap` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `hocSinhId` bigint unsigned NOT NULL,
  `lopHocId` bigint unsigned NOT NULL,
  `buoiHocId` bigint unsigned DEFAULT NULL,
  `loaiDanhGia` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tieuChi` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `diemSo` decimal(6,2) DEFAULT NULL,
  `mucDanhGia` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nhanXet` text COLLATE utf8mb4_unicode_ci,
  `giaoVienId` bigint unsigned NOT NULL,
  `ngayDanhGia` date NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_DGHT_hocSinh_ngay` (`hocSinhId`,`ngayDanhGia`),
  KEY `fk_DGHT_DonVi` (`donViId`),
  KEY `fk_DGHT_LopHoc` (`lopHocId`),
  KEY `fk_DGHT_BuoiHoc` (`buoiHocId`),
  KEY `fk_DGHT_GiaoVien` (`giaoVienId`),
  CONSTRAINT `fk_DGHT_BuoiHoc` FOREIGN KEY (`buoiHocId`) REFERENCES `buoihoc` (`id`),
  CONSTRAINT `fk_DGHT_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `fk_DGHT_GiaoVien` FOREIGN KEY (`giaoVienId`) REFERENCES `giaovien` (`id`),
  CONSTRAINT `fk_DGHT_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `fk_DGHT_LopHoc` FOREIGN KEY (`lopHocId`) REFERENCES `lophoc` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `danhgiahoctap`
--

LOCK TABLES `danhgiahoctap` WRITE;
/*!40000 ALTER TABLE `danhgiahoctap` DISABLE KEYS */;
/*!40000 ALTER TABLE `danhgiahoctap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `danhmuckhoanthu`
--

DROP TABLE IF EXISTS `danhmuckhoanthu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `danhmuckhoanthu` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `maKhoanThu` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenKhoanThu` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loaiKhoanThu` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'hoc_phi, tien_an, dich_vu, tai_lieu, khac',
  `soTienMacDinh` decimal(18,2) DEFAULT NULL,
  `batBuoc` tinyint(1) NOT NULL DEFAULT '1',
  `trangThai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_DMKThu_donVi_ma` (`donViId`,`maKhoanThu`),
  CONSTRAINT `fk_DMKThu_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `danhmuckhoanthu`
--

LOCK TABLES `danhmuckhoanthu` WRITE;
/*!40000 ALTER TABLE `danhmuckhoanthu` DISABLE KEYS */;
/*!40000 ALTER TABLE `danhmuckhoanthu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diemdanh`
--

DROP TABLE IF EXISTS `diemdanh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diemdanh` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `buoiHocId` bigint unsigned NOT NULL,
  `hocSinhId` bigint unsigned NOT NULL,
  `trangThai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'co_mat, vang_co_phep, vang_khong_phep, di_tre, ve_som',
  `gioDen` time DEFAULT NULL,
  `gioVe` time DEFAULT NULL,
  `ghiChu` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nguoiDiemDanhId` bigint unsigned DEFAULT NULL,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_DiemDanh_buoi_hocSinh` (`buoiHocId`,`hocSinhId`),
  KEY `fk_DiemDanh_HocSinh` (`hocSinhId`),
  KEY `fk_DiemDanh_NguoiDung` (`nguoiDiemDanhId`),
  CONSTRAINT `fk_DiemDanh_BuoiHoc` FOREIGN KEY (`buoiHocId`) REFERENCES `buoihoc` (`id`),
  CONSTRAINT `fk_DiemDanh_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `fk_DiemDanh_NguoiDung` FOREIGN KEY (`nguoiDiemDanhId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diemdanh`
--

LOCK TABLES `diemdanh` WRITE;
/*!40000 ALTER TABLE `diemdanh` DISABLE KEYS */;
/*!40000 ALTER TABLE `diemdanh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donvi`
--

DROP TABLE IF EXISTS `donvi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donvi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViChaId` bigint unsigned DEFAULT NULL,
  `maDonVi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenDonVi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loaiDonVi` enum('he_thong','truong','trung_tam','co_so') COLLATE utf8mb4_unicode_ci NOT NULL,
  `loaiHinhDaoTao` enum('mam_non','ngoai_ngu','tin_hoc','khac') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diaChi` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `soDienThoai` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` enum('hoat_dong','tam_ngung','ngung_hoat_dong') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_DonVi_maDonVi` (`maDonVi`),
  KEY `IX_DonVi_donViChaId` (`donViChaId`),
  KEY `IX_DonVi_loaiDonVi` (`loaiDonVi`),
  KEY `IX_DonVi_trangThai` (`trangThai`),
  CONSTRAINT `FK_DonVi_donViCha` FOREIGN KEY (`donViChaId`) REFERENCES `donvi` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donvi`
--

LOCK TABLES `donvi` WRITE;
/*!40000 ALTER TABLE `donvi` DISABLE KEYS */;
/*!40000 ALTER TABLE `donvi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donxinphep`
--

DROP TABLE IF EXISTS `donxinphep`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donxinphep` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `hocSinhId` bigint unsigned NOT NULL,
  `phuHuynhId` bigint unsigned NOT NULL,
  `tuNgay` date NOT NULL,
  `denNgay` date NOT NULL,
  `lyDo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `trangThai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cho_tiep_nhan',
  `nguoiXuLyId` bigint unsigned DEFAULT NULL,
  `yKienXuLy` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_DonXinPhep_DonVi` (`donViId`),
  KEY `fk_DonXinPhep_HocSinh` (`hocSinhId`),
  KEY `fk_DonXinPhep_PhuHuynh` (`phuHuynhId`),
  KEY `fk_DonXinPhep_NguoiXuLy` (`nguoiXuLyId`),
  CONSTRAINT `fk_DonXinPhep_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `fk_DonXinPhep_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `fk_DonXinPhep_NguoiXuLy` FOREIGN KEY (`nguoiXuLyId`) REFERENCES `nguoidung` (`id`),
  CONSTRAINT `fk_DonXinPhep_PhuHuynh` FOREIGN KEY (`phuHuynhId`) REFERENCES `phuhuynh` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donxinphep`
--

LOCK TABLES `donxinphep` WRITE;
/*!40000 ALTER TABLE `donxinphep` DISABLE KEYS */;
/*!40000 ALTER TABLE `donxinphep` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `giaovien`
--

DROP TABLE IF EXISTS `giaovien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `giaovien` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `nguoiDungId` bigint unsigned DEFAULT NULL,
  `maGiaoVien` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hoTen` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dienThoai` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chuyenMon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trinhDo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_GiaoVien_donVi_ma` (`donViId`,`maGiaoVien`),
  KEY `fk_GiaoVien_NguoiDung` (`nguoiDungId`),
  CONSTRAINT `fk_GiaoVien_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `fk_GiaoVien_NguoiDung` FOREIGN KEY (`nguoiDungId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `giaovien`
--

LOCK TABLES `giaovien` WRITE;
/*!40000 ALTER TABLE `giaovien` DISABLE KEYS */;
/*!40000 ALTER TABLE `giaovien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hocsinh`
--

DROP TABLE IF EXISTS `hocsinh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hocsinh` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `maHocSinh` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hoTen` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenThuongGoi` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngaySinh` date NOT NULL,
  `gioiTinh` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `noiSinh` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diaChi` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayNhapHoc` date DEFAULT NULL,
  `loaiHinhDaoTao` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trangThai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dang_hoc',
  `ghiChu` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_HocSinh_donVi_ma` (`donViId`,`maHocSinh`),
  KEY `ix_HocSinh_donVi_trangThai` (`donViId`,`trangThai`),
  CONSTRAINT `fk_HocSinh_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hocsinh`
--

LOCK TABLES `hocsinh` WRITE;
/*!40000 ALTER TABLE `hocsinh` DISABLE KEYS */;
/*!40000 ALTER TABLE `hocsinh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hocsinhlophoc`
--

DROP TABLE IF EXISTS `hocsinhlophoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hocsinhlophoc` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `hocSinhId` bigint unsigned NOT NULL,
  `lopHocId` bigint unsigned NOT NULL,
  `ngayVaoLop` date NOT NULL,
  `ngayRoiLop` date DEFAULT NULL,
  `lyDoRoiLop` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dang_hoc',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_HSLH_hocSinh_trangThai` (`hocSinhId`,`trangThai`),
  KEY `ix_HSLH_lop_trangThai` (`lopHocId`,`trangThai`),
  CONSTRAINT `fk_HSLH_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `fk_HSLH_LopHoc` FOREIGN KEY (`lopHocId`) REFERENCES `lophoc` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hocsinhlophoc`
--

LOCK TABLES `hocsinhlophoc` WRITE;
/*!40000 ALTER TABLE `hocsinhlophoc` DISABLE KEYS */;
/*!40000 ALTER TABLE `hocsinhlophoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hocsinhphuhuynh`
--

DROP TABLE IF EXISTS `hocsinhphuhuynh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hocsinhphuhuynh` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `hocSinhId` bigint unsigned NOT NULL,
  `phuHuynhId` bigint unsigned NOT NULL,
  `moiQuanHe` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'cha, me, ong, ba, nguoi_giam_ho, khac',
  `laLienHeChinh` tinyint(1) NOT NULL DEFAULT '0',
  `duocDonTre` tinyint(1) NOT NULL DEFAULT '1',
  `nhanThongBao` tinyint(1) NOT NULL DEFAULT '1',
  `nhanThongTinHocPhi` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_HocSinh_PhuHuynh` (`hocSinhId`,`phuHuynhId`),
  KEY `fk_HSPH_PhuHuynh` (`phuHuynhId`),
  CONSTRAINT `fk_HSPH_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `fk_HSPH_PhuHuynh` FOREIGN KEY (`phuHuynhId`) REFERENCES `phuhuynh` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hocsinhphuhuynh`
--

LOCK TABLES `hocsinhphuhuynh` WRITE;
/*!40000 ALTER TABLE `hocsinhphuhuynh` DISABLE KEYS */;
/*!40000 ALTER TABLE `hocsinhphuhuynh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `khoanphaithu`
--

DROP TABLE IF EXISTS `khoanphaithu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `khoanphaithu` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `kyThuId` bigint unsigned NOT NULL,
  `hocSinhId` bigint unsigned NOT NULL,
  `tongTien` decimal(18,2) NOT NULL DEFAULT '0.00',
  `giamTru` decimal(18,2) NOT NULL DEFAULT '0.00',
  `daThu` decimal(18,2) NOT NULL DEFAULT '0.00',
  `conLai` decimal(18,2) GENERATED ALWAYS AS (((`tongTien` - `giamTru`) - `daThu`)) STORED,
  `trangThai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'chua_thu',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_KPT_ky_hocSinh` (`kyThuId`,`hocSinhId`),
  KEY `ix_KPT_donVi_trangThai` (`donViId`,`trangThai`),
  KEY `fk_KPT_HocSinh` (`hocSinhId`),
  CONSTRAINT `fk_KPT_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `fk_KPT_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `fk_KPT_KyThu` FOREIGN KEY (`kyThuId`) REFERENCES `kythu` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khoanphaithu`
--

LOCK TABLES `khoanphaithu` WRITE;
/*!40000 ALTER TABLE `khoanphaithu` DISABLE KEYS */;
/*!40000 ALTER TABLE `khoanphaithu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `khoanphaithuchitiet`
--

DROP TABLE IF EXISTS `khoanphaithuchitiet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `khoanphaithuchitiet` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `khoanPhaiThuId` bigint unsigned NOT NULL,
  `danhMucKhoanThuId` bigint unsigned NOT NULL,
  `soTien` decimal(18,2) NOT NULL,
  `giamTru` decimal(18,2) NOT NULL DEFAULT '0.00',
  `ghiChu` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_KPTCT_kpt_danhMuc` (`khoanPhaiThuId`,`danhMucKhoanThuId`),
  KEY `fk_KPTCT_DanhMuc` (`danhMucKhoanThuId`),
  CONSTRAINT `fk_KPTCT_DanhMuc` FOREIGN KEY (`danhMucKhoanThuId`) REFERENCES `danhmuckhoanthu` (`id`),
  CONSTRAINT `fk_KPTCT_KhoanPhaiThu` FOREIGN KEY (`khoanPhaiThuId`) REFERENCES `khoanphaithu` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khoanphaithuchitiet`
--

LOCK TABLES `khoanphaithuchitiet` WRITE;
/*!40000 ALTER TABLE `khoanphaithuchitiet` DISABLE KEYS */;
/*!40000 ALTER TABLE `khoanphaithuchitiet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kythu`
--

DROP TABLE IF EXISTS `kythu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kythu` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `maKyThu` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenKyThu` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loaiKy` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'thang, khoa_hoc, hoc_ky, dot',
  `tuNgay` date NOT NULL,
  `denNgay` date NOT NULL,
  `hanThanhToan` date DEFAULT NULL,
  `trangThai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'nhap',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_KyThu_donVi_ma` (`donViId`,`maKyThu`),
  CONSTRAINT `fk_KyThu_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kythu`
--

LOCK TABLES `kythu` WRITE;
/*!40000 ALTER TABLE `kythu` DISABLE KEYS */;
/*!40000 ALTER TABLE `kythu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kythukhoanthu`
--

DROP TABLE IF EXISTS `kythukhoanthu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kythukhoanthu` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kyThuId` bigint unsigned NOT NULL,
  `danhMucKhoanThuId` bigint unsigned NOT NULL,
  `soTien` decimal(18,2) NOT NULL,
  `ghiChu` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_KyThu_KhoanThu` (`kyThuId`,`danhMucKhoanThuId`),
  KEY `fk_KTKT_DanhMuc` (`danhMucKhoanThuId`),
  CONSTRAINT `fk_KTKT_DanhMuc` FOREIGN KEY (`danhMucKhoanThuId`) REFERENCES `danhmuckhoanthu` (`id`),
  CONSTRAINT `fk_KTKT_KyThu` FOREIGN KEY (`kyThuId`) REFERENCES `kythu` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kythukhoanthu`
--

LOCK TABLES `kythukhoanthu` WRITE;
/*!40000 ALTER TABLE `kythukhoanthu` DISABLE KEYS */;
/*!40000 ALTER TABLE `kythukhoanthu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lichhoc`
--

DROP TABLE IF EXISTS `lichhoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lichhoc` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `lopHocId` bigint unsigned NOT NULL,
  `thuTrongTuan` tinyint DEFAULT NULL COMMENT '1=Thu Hai ... 7=Chu Nhat',
  `ngayCuThe` date DEFAULT NULL,
  `gioBatDau` time NOT NULL,
  `gioKetThuc` time NOT NULL,
  `phongHoc` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lapLaiHangTuan` tinyint(1) NOT NULL DEFAULT '1',
  `tuNgay` date NOT NULL,
  `denNgay` date DEFAULT NULL,
  `trangThai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_LichHoc_lop_tuNgay` (`lopHocId`,`tuNgay`),
  KEY `fk_LichHoc_DonVi` (`donViId`),
  CONSTRAINT `fk_LichHoc_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `fk_LichHoc_LopHoc` FOREIGN KEY (`lopHocId`) REFERENCES `lophoc` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lichhoc`
--

LOCK TABLES `lichhoc` WRITE;
/*!40000 ALTER TABLE `lichhoc` DISABLE KEYS */;
/*!40000 ALTER TABLE `lichhoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lophoc`
--

DROP TABLE IF EXISTS `lophoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lophoc` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `chuongTrinhDaoTaoId` bigint unsigned DEFAULT NULL,
  `maLop` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenLop` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loaiHinhDaoTao` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngayBatDau` date DEFAULT NULL,
  `ngayKetThuc` date DEFAULT NULL,
  `siSoToiDa` int DEFAULT NULL,
  `phongHoc` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'chuan_bi',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_LopHoc_donVi_ma` (`donViId`,`maLop`),
  KEY `ix_LopHoc_donVi_trangThai` (`donViId`,`trangThai`),
  KEY `fk_LopHoc_CTDT` (`chuongTrinhDaoTaoId`),
  CONSTRAINT `fk_LopHoc_CTDT` FOREIGN KEY (`chuongTrinhDaoTaoId`) REFERENCES `chuongtrinhdaotao` (`id`),
  CONSTRAINT `fk_LopHoc_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lophoc`
--

LOCK TABLES `lophoc` WRITE;
/*!40000 ALTER TABLE `lophoc` DISABLE KEYS */;
/*!40000 ALTER TABLE `lophoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lophocgiaovien`
--

DROP TABLE IF EXISTS `lophocgiaovien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lophocgiaovien` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `lopHocId` bigint unsigned NOT NULL,
  `giaoVienId` bigint unsigned NOT NULL,
  `vaiTro` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'giao_vien_chinh',
  `tuNgay` date DEFAULT NULL,
  `denNgay` date DEFAULT NULL,
  `trangThai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_LHGV_lop_gv_tuNgay` (`lopHocId`,`giaoVienId`,`tuNgay`),
  KEY `fk_LHGV_GiaoVien` (`giaoVienId`),
  CONSTRAINT `fk_LHGV_GiaoVien` FOREIGN KEY (`giaoVienId`) REFERENCES `giaovien` (`id`),
  CONSTRAINT `fk_LHGV_LopHoc` FOREIGN KEY (`lopHocId`) REFERENCES `lophoc` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lophocgiaovien`
--

LOCK TABLES `lophocgiaovien` WRITE;
/*!40000 ALTER TABLE `lophocgiaovien` DISABLE KEYS */;
/*!40000 ALTER TABLE `lophocgiaovien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nguoidung`
--

DROP TABLE IF EXISTS `nguoidung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nguoidung` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenDangNhap` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matKhauHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hoTen` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `soDienThoai` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` enum('hoat_dong','tam_khoa','ngung') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  `batBuocDoiMatKhau` tinyint(1) NOT NULL DEFAULT '1',
  `lanDangNhapCuoi` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_NguoiDung_tenDangNhap` (`tenDangNhap`),
  UNIQUE KEY `UQ_NguoiDung_email` (`email`),
  KEY `IX_NguoiDung_trangThai` (`trangThai`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nguoidung`
--

LOCK TABLES `nguoidung` WRITE;
/*!40000 ALTER TABLE `nguoidung` DISABLE KEYS */;
/*!40000 ALTER TABLE `nguoidung` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phieuthu`
--

DROP TABLE IF EXISTS `phieuthu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieuthu` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `soPhieu` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hocSinhId` bigint unsigned NOT NULL,
  `phuHuynhId` bigint unsigned DEFAULT NULL,
  `ngayThu` datetime NOT NULL,
  `tongTien` decimal(18,2) NOT NULL,
  `phuongThuc` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'tien_mat, chuyen_khoan, the, khac',
  `nguoiThuId` bigint unsigned NOT NULL,
  `noiDung` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'da_thu',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_PhieuThu_donVi_soPhieu` (`donViId`,`soPhieu`),
  KEY `fk_PhieuThu_HocSinh` (`hocSinhId`),
  KEY `fk_PhieuThu_PhuHuynh` (`phuHuynhId`),
  KEY `fk_PhieuThu_NguoiThu` (`nguoiThuId`),
  CONSTRAINT `fk_PhieuThu_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `fk_PhieuThu_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `fk_PhieuThu_NguoiThu` FOREIGN KEY (`nguoiThuId`) REFERENCES `nguoidung` (`id`),
  CONSTRAINT `fk_PhieuThu_PhuHuynh` FOREIGN KEY (`phuHuynhId`) REFERENCES `phuhuynh` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieuthu`
--

LOCK TABLES `phieuthu` WRITE;
/*!40000 ALTER TABLE `phieuthu` DISABLE KEYS */;
/*!40000 ALTER TABLE `phieuthu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phieuthuchitiet`
--

DROP TABLE IF EXISTS `phieuthuchitiet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieuthuchitiet` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `phieuThuId` bigint unsigned NOT NULL,
  `khoanPhaiThuId` bigint unsigned NOT NULL,
  `soTien` decimal(18,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_PTCT_PhieuThu` (`phieuThuId`),
  KEY `fk_PTCT_KhoanPhaiThu` (`khoanPhaiThuId`),
  CONSTRAINT `fk_PTCT_KhoanPhaiThu` FOREIGN KEY (`khoanPhaiThuId`) REFERENCES `khoanphaithu` (`id`),
  CONSTRAINT `fk_PTCT_PhieuThu` FOREIGN KEY (`phieuThuId`) REFERENCES `phieuthu` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieuthuchitiet`
--

LOCK TABLES `phieuthuchitiet` WRITE;
/*!40000 ALTER TABLE `phieuthuchitiet` DISABLE KEYS */;
/*!40000 ALTER TABLE `phieuthuchitiet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phuhuynh`
--

DROP TABLE IF EXISTS `phuhuynh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phuhuynh` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `maPhuHuynh` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nguoiDungId` bigint unsigned DEFAULT NULL,
  `hoTen` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngaySinh` date DEFAULT NULL,
  `gioiTinh` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dienThoai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngheNghiep` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diaChi` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_PhuHuynh_donVi_ma` (`donViId`,`maPhuHuynh`),
  KEY `ix_PhuHuynh_dienThoai` (`dienThoai`),
  KEY `fk_PhuHuynh_NguoiDung` (`nguoiDungId`),
  CONSTRAINT `fk_PhuHuynh_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `fk_PhuHuynh_NguoiDung` FOREIGN KEY (`nguoiDungId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phuhuynh`
--

LOCK TABLES `phuhuynh` WRITE;
/*!40000 ALTER TABLE `phuhuynh` DISABLE KEYS */;
/*!40000 ALTER TABLE `phuhuynh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'SchoolCenter'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-20 15:05:50
