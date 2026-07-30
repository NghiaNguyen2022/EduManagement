-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: SchoolCenter
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
  `buoiHocId` bigint unsigned NOT NULL,
  `noiDungBaiHoc` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `baiTap` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ghiChu` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actorUserId` bigint unsigned DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_BaoGiang_buoiHocId` (`buoiHocId`),
  KEY `FK_BaoGiang_NguoiDung` (`actorUserId`),
  CONSTRAINT `FK_BaoGiang_BuoiHoc` FOREIGN KEY (`buoiHocId`) REFERENCES `buoihoc` (`id`),
  CONSTRAINT `FK_BaoGiang_NguoiDung` FOREIGN KEY (`actorUserId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `baogiang`
--

/*!40000 ALTER TABLE `baogiang` DISABLE KEYS */;
/*!40000 ALTER TABLE `baogiang` ENABLE KEYS */;

--
-- Table structure for table `buoihoc`
--

DROP TABLE IF EXISTS `buoihoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buoihoc` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `lopHocId` bigint unsigned NOT NULL,
  `lichHocId` bigint unsigned DEFAULT NULL,
  `ngayHoc` date NOT NULL,
  `gioBatDau` time NOT NULL,
  `gioKetThuc` time NOT NULL,
  `phongHoc` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `giaoVienId` bigint unsigned DEFAULT NULL,
  `loaiBuoi` enum('thuong','bu') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'thuong',
  `trangThai` enum('du_kien','dang_hoc','da_hoc','nghi','huy') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'du_kien',
  `ghiChu` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_BuoiHoc_lopHocId_ngayHoc` (`lopHocId`,`ngayHoc`),
  KEY `IX_BuoiHoc_lichHocId` (`lichHocId`),
  KEY `IX_BuoiHoc_giaoVienId_ngayHoc` (`giaoVienId`,`ngayHoc`),
  KEY `IX_BuoiHoc_ngayHoc_trangThai` (`ngayHoc`,`trangThai`),
  CONSTRAINT `FK_BuoiHoc_GiaoVien` FOREIGN KEY (`giaoVienId`) REFERENCES `giaovien` (`id`),
  CONSTRAINT `FK_BuoiHoc_LichHoc` FOREIGN KEY (`lichHocId`) REFERENCES `lichhoc` (`id`),
  CONSTRAINT `FK_BuoiHoc_LopHoc` FOREIGN KEY (`lopHocId`) REFERENCES `lophoc` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buoihoc`
--

/*!40000 ALTER TABLE `buoihoc` DISABLE KEYS */;
INSERT INTO `buoihoc` VALUES (89,10,34,'2026-08-03','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(90,10,34,'2026-08-10','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(91,10,34,'2026-08-17','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(92,10,34,'2026-08-24','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(93,10,35,'2026-07-28','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(94,10,35,'2026-08-04','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(95,10,35,'2026-08-11','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(96,10,35,'2026-08-18','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(97,10,35,'2026-08-25','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(98,10,36,'2026-07-29','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(99,10,36,'2026-08-05','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(100,10,36,'2026-08-12','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(101,10,36,'2026-08-19','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(102,10,37,'2026-07-30','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(103,10,37,'2026-08-06','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(104,10,37,'2026-08-13','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(105,10,37,'2026-08-20','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(106,10,38,'2026-07-31','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(107,10,38,'2026-08-07','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(108,10,38,'2026-08-14','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(109,10,38,'2026-08-21','07:30:00','16:30:00','Phòng Lá Test',8,'thuong','du_kien',NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(110,11,39,'2026-08-03','18:00:00','19:30:00','Phòng NN Test',9,'thuong','du_kien',NULL,'2026-07-28 15:24:49','2026-07-28 15:24:49'),(111,11,39,'2026-08-10','18:00:00','19:30:00','Phòng NN Test',9,'thuong','du_kien',NULL,'2026-07-28 15:24:49','2026-07-28 15:24:49'),(112,11,39,'2026-08-17','18:00:00','19:30:00','Phòng NN Test',9,'thuong','du_kien',NULL,'2026-07-28 15:24:49','2026-07-28 15:24:49'),(113,11,39,'2026-08-24','18:00:00','19:30:00','Phòng NN Test',9,'thuong','du_kien',NULL,'2026-07-28 15:24:49','2026-07-28 15:24:49'),(114,11,40,'2026-07-29','18:00:00','19:30:00','Phòng NN Test',9,'thuong','du_kien',NULL,'2026-07-28 15:24:49','2026-07-28 15:24:49'),(115,11,40,'2026-08-05','18:00:00','19:30:00','Phòng NN Test',9,'thuong','du_kien',NULL,'2026-07-28 15:24:49','2026-07-28 15:24:49'),(116,11,40,'2026-08-12','18:00:00','19:30:00','Phòng NN Test',9,'thuong','du_kien',NULL,'2026-07-28 15:24:49','2026-07-28 15:24:49'),(117,11,40,'2026-08-19','18:00:00','19:30:00','Phòng NN Test',9,'thuong','du_kien',NULL,'2026-07-28 15:24:49','2026-07-28 15:24:49'),(118,11,41,'2026-07-31','18:00:00','19:30:00','Phòng NN Test',9,'thuong','du_kien',NULL,'2026-07-28 15:24:49','2026-07-28 15:24:49'),(119,11,41,'2026-08-07','18:00:00','19:30:00','Phòng NN Test',9,'thuong','du_kien',NULL,'2026-07-28 15:24:49','2026-07-28 15:24:49'),(120,11,41,'2026-08-14','18:00:00','19:30:00','Phòng NN Test',9,'thuong','du_kien',NULL,'2026-07-28 15:24:49','2026-07-28 15:24:49'),(121,11,41,'2026-08-21','18:00:00','19:30:00','Phòng NN Test',9,'thuong','du_kien',NULL,'2026-07-28 15:24:49','2026-07-28 15:24:49');
/*!40000 ALTER TABLE `buoihoc` ENABLE KEYS */;

--
-- Table structure for table `cauhinhhethong`
--

DROP TABLE IF EXISTS `cauhinhhethong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cauhinhhethong` (
  `id` tinyint unsigned NOT NULL,
  `soLanDangNhapSaiToiDa` int unsigned NOT NULL DEFAULT '5',
  `soPhutKhoaDangNhap` int unsigned NOT NULL DEFAULT '15',
  `doDaiMatKhauToiThieu` int unsigned NOT NULL DEFAULT '8',
  `capNhatBoiId` bigint unsigned DEFAULT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_CauHinhHeThong_NguoiDung` (`capNhatBoiId`),
  CONSTRAINT `FK_CauHinhHeThong_NguoiDung` FOREIGN KEY (`capNhatBoiId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cauhinhhethong`
--

/*!40000 ALTER TABLE `cauhinhhethong` DISABLE KEYS */;
INSERT INTO `cauhinhhethong` VALUES (1,5,15,8,1,'2026-07-23 09:15:47');
/*!40000 ALTER TABLE `cauhinhhethong` ENABLE KEYS */;

--
-- Table structure for table `cauhinhmauin`
--

DROP TABLE IF EXISTS `cauhinhmauin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cauhinhmauin` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `hienThiLogo` tinyint(1) NOT NULL DEFAULT '1',
  `ghiChuFooter` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nhanKyNguoiLap` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Người lập phiếu',
  `nhanKyNguoiNop` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Phụ huynh / Người nộp',
  `nhanKyDaiDienDonVi` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Đại diện đơn vị',
  `capNhatBoiId` bigint unsigned DEFAULT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_CauHinhMauIn_donViId` (`donViId`),
  KEY `FK_CauHinhMauIn_NguoiDung` (`capNhatBoiId`),
  CONSTRAINT `FK_CauHinhMauIn_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `FK_CauHinhMauIn_NguoiDung` FOREIGN KEY (`capNhatBoiId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cauhinhmauin`
--

/*!40000 ALTER TABLE `cauhinhmauin` DISABLE KEYS */;
/*!40000 ALTER TABLE `cauhinhmauin` ENABLE KEYS */;

--
-- Table structure for table `cauhinhtaichinhdonvi`
--

DROP TABLE IF EXISTS `cauhinhtaichinhdonvi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cauhinhtaichinhdonvi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `duyetDanhMucChiPhi` tinyint(1) NOT NULL DEFAULT '1',
  `duyetChiDinhKy` tinyint(1) NOT NULL DEFAULT '1',
  `duyetChiDotXuat` tinyint(1) NOT NULL DEFAULT '1',
  `capNhatBoiId` bigint unsigned DEFAULT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_CauHinhTaiChinhDonVi_donViId` (`donViId`),
  KEY `FK_CauHinhTaiChinhDonVi_NguoiDung` (`capNhatBoiId`),
  CONSTRAINT `FK_CauHinhTaiChinhDonVi_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `FK_CauHinhTaiChinhDonVi_NguoiDung` FOREIGN KEY (`capNhatBoiId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cauhinhtaichinhdonvi`
--

/*!40000 ALTER TABLE `cauhinhtaichinhdonvi` DISABLE KEYS */;
/*!40000 ALTER TABLE `cauhinhtaichinhdonvi` ENABLE KEYS */;

--
-- Table structure for table `chiphi`
--

DROP TABLE IF EXISTS `chiphi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chiphi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `danhMucChiPhiId` bigint unsigned NOT NULL,
  `soTien` decimal(18,2) NOT NULL,
  `ngayChi` date NOT NULL,
  `moTa` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loaiDeXuat` enum('dinh_ky','dot_xuat') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dinh_ky',
  `trangThai` enum('cho_duyet','da_duyet','tu_choi') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cho_duyet',
  `nguoiTaoId` bigint unsigned NOT NULL,
  `nguoiDuyetId` bigint unsigned DEFAULT NULL,
  `ghiChuDuyet` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `duyetAt` datetime DEFAULT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_ChiPhi_donViId_ngayChi` (`donViId`,`ngayChi`),
  KEY `IX_ChiPhi_danhMucChiPhiId` (`danhMucChiPhiId`),
  KEY `IX_ChiPhi_donViId_trangThai` (`donViId`,`trangThai`),
  KEY `FK_ChiPhi_NguoiDuyet` (`nguoiDuyetId`),
  CONSTRAINT `FK_ChiPhi_NguoiDuyet` FOREIGN KEY (`nguoiDuyetId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chiphi`
--

/*!40000 ALTER TABLE `chiphi` DISABLE KEYS */;
/*!40000 ALTER TABLE `chiphi` ENABLE KEYS */;

--
-- Table structure for table `chuongtrinhdaotao`
--

DROP TABLE IF EXISTS `chuongtrinhdaotao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chuongtrinhdaotao` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `maChuongTrinh` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenChuongTrinh` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capDo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tongSoBuoi` int DEFAULT NULL,
  `tongSoGio` decimal(10,2) DEFAULT NULL,
  `moTa` text COLLATE utf8mb4_unicode_ci,
  `coTestDauVao` tinyint(1) NOT NULL DEFAULT '0',
  `trangThai` enum('hoat_dong','ngung_hoat_dong') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_ChuongTrinhDaoTao_donViId_ma` (`donViId`,`maChuongTrinh`),
  KEY `IX_ChuongTrinhDaoTao_donViId` (`donViId`),
  CONSTRAINT `FK_ChuongTrinhDaoTao_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chuongtrinhdaotao`
--

/*!40000 ALTER TABLE `chuongtrinhdaotao` DISABLE KEYS */;
INSERT INTO `chuongtrinhdaotao` VALUES (10,3,'CT001','Chương trình test giáo viên mầm non','Lớp Lá 5-6 tuổi',NULL,NULL,'Dữ liệu chuyên dùng để test đầy đủ portal giáo viên mầm non.',0,'hoat_dong','2026-07-28 15:24:46','2026-07-28 15:24:46'),(11,2,'CT001','Chương trình test giáo viên tiếng Anh','A2',NULL,NULL,'Dữ liệu chuyên dùng để test portal giáo viên trung tâm tiếng Anh.',0,'hoat_dong','2026-07-28 15:24:49','2026-07-28 15:24:49');
/*!40000 ALTER TABLE `chuongtrinhdaotao` ENABLE KEYS */;

--
-- Table structure for table `danhmucchiphi`
--

DROP TABLE IF EXISTS `danhmucchiphi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `danhmucchiphi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `maChiPhi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenChiPhi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loaiChiPhi` enum('luong','mat_bang','dien_nuoc','vat_tu','marketing','khac') COLLATE utf8mb4_unicode_ci NOT NULL,
  `trangThai` enum('hoat_dong','ngung_ap_dung') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  `trangThaiDuyet` enum('khong_can_duyet','cho_duyet','da_duyet','tu_choi') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'khong_can_duyet',
  `nguoiTaoId` bigint unsigned DEFAULT NULL,
  `nguoiDuyetId` bigint unsigned DEFAULT NULL,
  `ghiChuDuyet` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duyetAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_DanhMucChiPhi_donViId_ma` (`donViId`,`maChiPhi`),
  KEY `IX_DanhMucChiPhi_donViId` (`donViId`),
  KEY `IX_DanhMucChiPhi_donViId_trangThaiDuyet` (`donViId`,`trangThaiDuyet`),
  KEY `FK_DanhMucChiPhi_NguoiTao` (`nguoiTaoId`),
  KEY `FK_DanhMucChiPhi_NguoiDuyet` (`nguoiDuyetId`),
  CONSTRAINT `FK_DanhMucChiPhi_NguoiDuyet` FOREIGN KEY (`nguoiDuyetId`) REFERENCES `nguoidung` (`id`),
  CONSTRAINT `FK_DanhMucChiPhi_NguoiTao` FOREIGN KEY (`nguoiTaoId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `danhmucchiphi`
--

/*!40000 ALTER TABLE `danhmucchiphi` DISABLE KEYS */;
/*!40000 ALTER TABLE `danhmucchiphi` ENABLE KEYS */;

--
-- Table structure for table `danhmuckhoanthu`
--

DROP TABLE IF EXISTS `danhmuckhoanthu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `danhmuckhoanthu` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `maKhoanThu` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenKhoanThu` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loaiKhoanThu` enum('hoc_phi','tien_an','dich_vu','tai_lieu','khac') COLLATE utf8mb4_unicode_ci NOT NULL,
  `soTienMacDinh` decimal(18,2) DEFAULT NULL,
  `batBuoc` enum('co','khong') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'co',
  `trangThai` enum('hoat_dong','ngung_ap_dung') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_DanhMucKhoanThu_donViId_ma` (`donViId`,`maKhoanThu`),
  KEY `IX_DanhMucKhoanThu_donViId` (`donViId`),
  CONSTRAINT `FK_DanhMucKhoanThu_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `danhmuckhoanthu`
--

/*!40000 ALTER TABLE `danhmuckhoanthu` DISABLE KEYS */;
INSERT INTO `danhmuckhoanthu` VALUES (12,3,'KT001','Học phí mầm non test','hoc_phi',3000000.00,'co','hoat_dong','2026-07-28 22:24:47','2026-07-28 22:24:47'),(13,3,'KT002','Tiền ăn mầm non test','tien_an',1000000.00,'co','hoat_dong','2026-07-28 22:24:47','2026-07-28 22:24:47'),(14,3,'KT003','Phí dịch vụ test','dich_vu',200000.00,'co','hoat_dong','2026-07-28 22:24:47','2026-07-28 22:24:47'),(15,2,'KT001','Học phí khóa A2 test','hoc_phi',2000000.00,'co','hoat_dong','2026-07-28 22:24:49','2026-07-28 22:24:49'),(16,2,'KT002','Giáo trình A2 test','tai_lieu',300000.00,'co','hoat_dong','2026-07-28 22:24:49','2026-07-28 22:24:49');
/*!40000 ALTER TABLE `danhmuckhoanthu` ENABLE KEYS */;

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
  `trangThai` enum('co_mat','vang_co_phep','vang_khong_phep','di_tre','ve_som') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ghiChu` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nhanXet` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actorUserId` bigint unsigned DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_DiemDanh_buoiHocId_hocSinhId` (`buoiHocId`,`hocSinhId`),
  KEY `IX_DiemDanh_buoiHocId` (`buoiHocId`),
  KEY `IX_DiemDanh_hocSinhId` (`hocSinhId`),
  KEY `FK_DiemDanh_NguoiDung` (`actorUserId`),
  CONSTRAINT `FK_DiemDanh_BuoiHoc` FOREIGN KEY (`buoiHocId`) REFERENCES `buoihoc` (`id`),
  CONSTRAINT `FK_DiemDanh_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `FK_DiemDanh_NguoiDung` FOREIGN KEY (`actorUserId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diemdanh`
--

/*!40000 ALTER TABLE `diemdanh` DISABLE KEYS */;
/*!40000 ALTER TABLE `diemdanh` ENABLE KEYS */;

--
-- Table structure for table `dieuchinhkhoanphaithu`
--

DROP TABLE IF EXISTS `dieuchinhkhoanphaithu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dieuchinhkhoanphaithu` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `khoanPhaiThuId` bigint unsigned NOT NULL,
  `khoanPhaiThuDichId` bigint unsigned DEFAULT NULL,
  `loaiDieuChinh` enum('hoan_phi','chuyen_phi','bao_luu') COLLATE utf8mb4_unicode_ci NOT NULL,
  `soTien` decimal(18,2) NOT NULL DEFAULT '0.00',
  `lyDo` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trangThai` enum('cho_duyet','da_duyet','tu_choi') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cho_duyet',
  `nguoiTaoId` bigint unsigned NOT NULL,
  `nguoiDuyetId` bigint unsigned DEFAULT NULL,
  `ghiChuDuyet` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `duyetAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_DieuChinhKhoanPhaiThu_khoanPhaiThuId` (`khoanPhaiThuId`),
  KEY `IX_DieuChinhKhoanPhaiThu_donViId_trangThai` (`donViId`,`trangThai`),
  KEY `FK_DieuChinhKhoanPhaiThu_KhoanPhaiThuDich` (`khoanPhaiThuDichId`),
  KEY `FK_DieuChinhKhoanPhaiThu_NguoiTao` (`nguoiTaoId`),
  KEY `FK_DieuChinhKhoanPhaiThu_NguoiDuyet` (`nguoiDuyetId`),
  CONSTRAINT `FK_DieuChinhKhoanPhaiThu_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `FK_DieuChinhKhoanPhaiThu_KhoanPhaiThu` FOREIGN KEY (`khoanPhaiThuId`) REFERENCES `khoanphaithu` (`id`),
  CONSTRAINT `FK_DieuChinhKhoanPhaiThu_KhoanPhaiThuDich` FOREIGN KEY (`khoanPhaiThuDichId`) REFERENCES `khoanphaithu` (`id`),
  CONSTRAINT `FK_DieuChinhKhoanPhaiThu_NguoiDuyet` FOREIGN KEY (`nguoiDuyetId`) REFERENCES `nguoidung` (`id`),
  CONSTRAINT `FK_DieuChinhKhoanPhaiThu_NguoiTao` FOREIGN KEY (`nguoiTaoId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dieuchinhkhoanphaithu`
--

/*!40000 ALTER TABLE `dieuchinhkhoanphaithu` DISABLE KEYS */;
/*!40000 ALTER TABLE `dieuchinhkhoanphaithu` ENABLE KEYS */;

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
  `hinhAnhUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nguoiDaiDien` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maSoThue` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maGiayPhep` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `giayPhepUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` enum('hoat_dong','tam_ngung','ngung_hoat_dong') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_DonVi_maDonVi` (`maDonVi`),
  KEY `IX_DonVi_donViChaId` (`donViChaId`),
  KEY `IX_DonVi_loaiDonVi` (`loaiDonVi`),
  KEY `IX_DonVi_trangThai` (`trangThai`),
  CONSTRAINT `FK_DonVi_donViCha` FOREIGN KEY (`donViChaId`) REFERENCES `donvi` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donvi`
--

/*!40000 ALTER TABLE `donvi` DISABLE KEYS */;
INSERT INTO `donvi` VALUES (1,NULL,'SYSTEM','Hệ thống quản lý giáo dục','he_thong','khac',NULL,NULL,NULL,'/uploads/1785023165745-268516043.png',NULL,NULL,NULL,NULL,'hoat_dong','2026-07-20 15:06:10','2026-07-25 23:46:06'),(2,1,'TTNN-Q8','Trung tâm Ngoại ngữ Quận 8','trung_tam','ngoai_ngu',NULL,NULL,NULL,'/uploads/1785023065527-694683146.png',NULL,NULL,NULL,NULL,'hoat_dong','2026-07-20 15:06:10','2026-07-25 23:44:26'),(3,1,'MN-HOA-NANG','Trường Mầm non Hoa Nắng','truong','mam_non',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'hoat_dong','2026-07-20 15:06:10','2026-07-20 15:20:36');
/*!40000 ALTER TABLE `donvi` ENABLE KEYS */;

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
  `lopHocId` bigint unsigned NOT NULL,
  `tuNgay` date NOT NULL,
  `denNgay` date NOT NULL,
  `lyDo` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trangThai` enum('cho_duyet','da_duyet','tu_choi') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cho_duyet',
  `nguoiTaoId` bigint unsigned NOT NULL,
  `nguoiDuyetId` bigint unsigned DEFAULT NULL,
  `ghiChuDuyet` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `duyetAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_DonXinPhep_hocSinhId` (`hocSinhId`),
  KEY `IX_DonXinPhep_donViId_trangThai` (`donViId`,`trangThai`),
  KEY `FK_DonXinPhep_NguoiTao` (`nguoiTaoId`),
  KEY `FK_DonXinPhep_NguoiDuyet` (`nguoiDuyetId`),
  KEY `IX_DonXinPhep_lopHocId` (`lopHocId`),
  CONSTRAINT `FK_DonXinPhep_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `FK_DonXinPhep_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `FK_DonXinPhep_LopHoc` FOREIGN KEY (`lopHocId`) REFERENCES `lophoc` (`id`),
  CONSTRAINT `FK_DonXinPhep_NguoiDuyet` FOREIGN KEY (`nguoiDuyetId`) REFERENCES `nguoidung` (`id`),
  CONSTRAINT `FK_DonXinPhep_NguoiTao` FOREIGN KEY (`nguoiTaoId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donxinphep`
--

/*!40000 ALTER TABLE `donxinphep` DISABLE KEYS */;
/*!40000 ALTER TABLE `donxinphep` ENABLE KEYS */;

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
  `maGiaoVien` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hoTen` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dienThoai` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chuyenMon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trinhDo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` enum('hoat_dong','ngung_hoat_dong') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_GiaoVien_donViId_ma` (`donViId`,`maGiaoVien`),
  KEY `IX_GiaoVien_donViId` (`donViId`),
  KEY `FK_GiaoVien_NguoiDung` (`nguoiDungId`),
  CONSTRAINT `FK_GiaoVien_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `FK_GiaoVien_NguoiDung` FOREIGN KEY (`nguoiDungId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `giaovien`
--

/*!40000 ALTER TABLE `giaovien` DISABLE KEYS */;
INSERT INTO `giaovien` VALUES (8,3,37,'GV000001','Giáo viên Test Mầm non','0977001001',NULL,'Chăm sóc và giáo dục trẻ 5-6 tuổi','Cử nhân Giáo dục Mầm non','hoat_dong','2026-07-28 15:24:46','2026-07-28 15:24:46'),(9,2,42,'GV000001','Giáo viên Test Tiếng Anh','0977002001',NULL,'Tiếng Anh giao tiếp A2','Cử nhân Sư phạm Anh','hoat_dong','2026-07-28 15:24:49','2026-07-28 15:24:49'),(10,2,48,'GV000002','Demo GV Tiếng Anh','09090909019',NULL,NULL,NULL,'hoat_dong','2026-07-30 03:49:56','2026-07-30 03:50:00'),(11,3,49,'GV000002','Nguyễn Văn Phúc','0977001099','gv.phuc.huongdan@example.test','Giáo dục mầm non','Cử nhân','hoat_dong','2026-07-30 04:49:16','2026-07-30 04:49:36'),(12,2,50,'GV000003','Trần Văn Linh','09090909090',NULL,'Anh Ngữ',NULL,'hoat_dong','2026-07-30 05:03:55','2026-07-30 05:04:01');
/*!40000 ALTER TABLE `giaovien` ENABLE KEYS */;

--
-- Table structure for table `hocsinh`
--

DROP TABLE IF EXISTS `hocsinh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hocsinh` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `maHocSinh` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hoTen` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenThuongGoi` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hinhAnhUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngaySinh` date DEFAULT NULL,
  `gioiTinh` enum('nam','nu','khac') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `soDinhDanh` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `noiSinh` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `danToc` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quocTich` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diaChi` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `truongLopTruocDo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayNhapHoc` date DEFAULT NULL,
  `dienChinhSach` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chieuCaoCm` decimal(5,1) DEFAULT NULL,
  `canNangKg` decimal(5,1) DEFAULT NULL,
  `diUngBenhNen` text COLLATE utf8mb4_unicode_ci,
  `lienHeKhanCapHoTen` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lienHeKhanCapSdt` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nguyenVongLop` text COLLATE utf8mb4_unicode_ci,
  `ketQuaTestDauVao` text COLLATE utf8mb4_unicode_ci,
  `trangThai` enum('tiep_nhan','dang_hoc','bao_luu','ngung_hoc','hoan_thanh') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tiep_nhan',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_HocSinh_donViId_maHocSinh` (`donViId`,`maHocSinh`),
  KEY `IX_HocSinh_donViId` (`donViId`),
  KEY `IX_HocSinh_trangThai` (`trangThai`),
  CONSTRAINT `FK_HocSinh_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hocsinh`
--

/*!40000 ALTER TABLE `hocsinh` DISABLE KEYS */;
INSERT INTO `hocsinh` VALUES (37,3,'HS20260001','Test Bé An','An',NULL,'2021-03-12','nam',NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'dang_hoc','2026-07-28 15:24:46','2026-07-28 15:24:46'),(38,3,'HS20260002','Test Bé Bình','Bình',NULL,'2021-06-08','nam',NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'dang_hoc','2026-07-28 15:24:46','2026-07-28 15:24:47'),(39,3,'HS20260003','Test Bé Chi','Chi',NULL,'2021-09-21','nu',NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'dang_hoc','2026-07-28 15:24:47','2026-07-28 15:24:47'),(40,3,'HS20260004','Test Bé Dương','Dương',NULL,'2021-11-02','nu',NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'dang_hoc','2026-07-28 15:24:47','2026-07-28 15:24:47'),(41,3,'HS20260005','Test Bé Gia Hân','Hân',NULL,'2022-01-15','nu',NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'dang_hoc','2026-07-28 15:24:47','2026-07-28 15:24:47'),(42,2,'HS20260001','Test Học viên Minh','Minh',NULL,'2012-03-12','nam',NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'dang_hoc','2026-07-28 15:24:49','2026-07-28 15:24:49'),(43,2,'HS20260002','Test Học viên Ngọc','Ngọc',NULL,'2013-06-08','nu',NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'dang_hoc','2026-07-28 15:24:49','2026-07-28 15:24:49'),(44,2,'HS20260003','Test Học viên Phúc','Phúc',NULL,'2011-09-21','nam',NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'hoan_thanh','2026-07-28 15:24:49','2026-07-30 04:02:35'),(45,2,'HS20260004','Test Học viên Trang','Trang',NULL,'2014-11-02','nu',NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'dang_hoc','2026-07-28 15:24:49','2026-07-28 15:24:49'),(46,2,'HS20260005','Trần Linh Huyền',NULL,NULL,'2020-09-20','nu',NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-30',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'tiep_nhan','2026-07-30 04:03:11','2026-07-30 04:03:11');
/*!40000 ALTER TABLE `hocsinh` ENABLE KEYS */;

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
  `trangThai` enum('dang_hoc','bao_luu','chuyen_lop','ngung_hoc','hoan_thanh') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dang_hoc',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_HocSinhLopHoc_hocSinhId_trangThai` (`hocSinhId`,`trangThai`),
  KEY `IX_HocSinhLopHoc_lopHocId_trangThai` (`lopHocId`,`trangThai`),
  CONSTRAINT `FK_HocSinhLopHoc_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `FK_HocSinhLopHoc_LopHoc` FOREIGN KEY (`lopHocId`) REFERENCES `lophoc` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hocsinhlophoc`
--

/*!40000 ALTER TABLE `hocsinhlophoc` DISABLE KEYS */;
INSERT INTO `hocsinhlophoc` VALUES (27,37,10,'2026-07-28',NULL,NULL,'dang_hoc','2026-07-28 15:24:46','2026-07-28 15:24:46'),(28,38,10,'2026-07-28',NULL,NULL,'dang_hoc','2026-07-28 15:24:47','2026-07-28 15:24:47'),(29,39,10,'2026-07-28',NULL,NULL,'dang_hoc','2026-07-28 15:24:47','2026-07-28 15:24:47'),(30,40,10,'2026-07-28',NULL,NULL,'dang_hoc','2026-07-28 15:24:47','2026-07-28 15:24:47'),(31,41,10,'2026-07-28',NULL,NULL,'dang_hoc','2026-07-28 15:24:47','2026-07-28 15:24:47'),(32,42,11,'2026-07-28',NULL,NULL,'dang_hoc','2026-07-28 15:24:49','2026-07-28 15:24:49'),(33,43,11,'2026-07-28',NULL,NULL,'dang_hoc','2026-07-28 15:24:49','2026-07-28 15:24:49'),(34,44,11,'2026-07-28','2026-07-30',NULL,'hoan_thanh','2026-07-28 15:24:49','2026-07-30 04:02:35'),(35,45,11,'2026-07-28',NULL,NULL,'dang_hoc','2026-07-28 15:24:49','2026-07-28 15:24:49'),(36,46,11,'2026-07-30',NULL,NULL,'dang_hoc','2026-07-30 04:03:16','2026-07-30 04:03:16');
/*!40000 ALTER TABLE `hocsinhlophoc` ENABLE KEYS */;

--
-- Table structure for table `hocsinhlophocdanhgia`
--

DROP TABLE IF EXISTS `hocsinhlophocdanhgia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hocsinhlophocdanhgia` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `enrollmentId` bigint unsigned NOT NULL,
  `loaiDanhGia` enum('giua_ky','cuoi_ky','khac','theo_thang','theo_quy','theo_nam') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'khac',
  `linhVucPhatTrien` enum('the_chat','nhan_thuc','ngon_ngu','tinh_cam_ky_nang_xa_hoi','tham_my') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diemSo` decimal(5,1) DEFAULT NULL,
  `xepLoai` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nhanXet` text COLLATE utf8mb4_unicode_ci,
  `ngayDanhGia` date NOT NULL,
  `actorUserId` bigint unsigned DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_HocSinhLopHocDanhGia_enrollmentId` (`enrollmentId`),
  CONSTRAINT `FK_HocSinhLopHocDanhGia_Enrollment` FOREIGN KEY (`enrollmentId`) REFERENCES `hocsinhlophoc` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hocsinhlophocdanhgia`
--

/*!40000 ALTER TABLE `hocsinhlophocdanhgia` DISABLE KEYS */;
INSERT INTO `hocsinhlophocdanhgia` VALUES (8,27,'theo_thang','ngon_ngu',NULL,'Tiến bộ tốt','Trẻ diễn đạt rõ ý, biết lắng nghe và tự tin trao đổi cùng cô và các bạn.','2026-07-28',37,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(9,32,'theo_thang',NULL,8.5,'Đạt','Học viên chủ động giao tiếp và hoàn thành tốt hoạt động trên lớp.','2026-07-28',42,'2026-07-28 15:24:49','2026-07-28 15:24:49');
/*!40000 ALTER TABLE `hocsinhlophocdanhgia` ENABLE KEYS */;

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
  `moiQuanHe` enum('cha','me','ong','ba','nguoi_giam_ho','khac') COLLATE utf8mb4_unicode_ci NOT NULL,
  `laLienHeChinh` tinyint(1) NOT NULL DEFAULT '0',
  `duocDonTre` tinyint(1) NOT NULL DEFAULT '1',
  `nhanThongBao` tinyint(1) NOT NULL DEFAULT '1',
  `nhanThongTinHocPhi` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_HocSinhPhuHuynh` (`hocSinhId`,`phuHuynhId`),
  KEY `IX_HocSinhPhuHuynh_hocSinhId` (`hocSinhId`),
  KEY `IX_HocSinhPhuHuynh_phuHuynhId` (`phuHuynhId`),
  CONSTRAINT `FK_HocSinhPhuHuynh_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `FK_HocSinhPhuHuynh_PhuHuynh` FOREIGN KEY (`phuHuynhId`) REFERENCES `phuhuynh` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hocsinhphuhuynh`
--

/*!40000 ALTER TABLE `hocsinhphuhuynh` DISABLE KEYS */;
INSERT INTO `hocsinhphuhuynh` VALUES (31,37,26,'me',1,1,1,1,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(32,42,26,'me',1,1,1,1,'2026-07-28 15:24:49','2026-07-28 15:24:49');
/*!40000 ALTER TABLE `hocsinhphuhuynh` ENABLE KEYS */;

--
-- Table structure for table `hocsinhthanhtich`
--

DROP TABLE IF EXISTS `hocsinhthanhtich`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hocsinhthanhtich` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `hocSinhId` bigint unsigned NOT NULL,
  `tenThanhTich` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ketQua` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayDat` date DEFAULT NULL,
  `noiCap` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tepMinhChungUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ghiChu` text COLLATE utf8mb4_unicode_ci,
  `actorUserId` bigint unsigned DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_HocSinhThanhTich_hocSinhId` (`hocSinhId`),
  CONSTRAINT `FK_HocSinhThanhTich_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hocsinhthanhtich`
--

/*!40000 ALTER TABLE `hocsinhthanhtich` DISABLE KEYS */;
/*!40000 ALTER TABLE `hocsinhthanhtich` ENABLE KEYS */;

--
-- Table structure for table `hocsinhtrangthailichsu`
--

DROP TABLE IF EXISTS `hocsinhtrangthailichsu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hocsinhtrangthailichsu` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `hocSinhId` bigint unsigned NOT NULL,
  `trangThaiCu` enum('tiep_nhan','dang_hoc','bao_luu','ngung_hoc','hoan_thanh') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThaiMoi` enum('tiep_nhan','dang_hoc','bao_luu','ngung_hoc','hoan_thanh') COLLATE utf8mb4_unicode_ci NOT NULL,
  `lyDo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayHieuLuc` date NOT NULL,
  `actorUserId` bigint unsigned DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_HocSinhTrangThaiLichSu_hocSinhId` (`hocSinhId`),
  KEY `FK_HocSinhTrangThaiLichSu_NguoiDung` (`actorUserId`),
  CONSTRAINT `FK_HocSinhTrangThaiLichSu_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `FK_HocSinhTrangThaiLichSu_NguoiDung` FOREIGN KEY (`actorUserId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hocsinhtrangthailichsu`
--

/*!40000 ALTER TABLE `hocsinhtrangthailichsu` DISABLE KEYS */;
INSERT INTO `hocsinhtrangthailichsu` VALUES (36,37,NULL,'tiep_nhan',NULL,'2026-07-28',1,'2026-07-28 15:24:46'),(37,37,'tiep_nhan','dang_hoc','Kích hoạt dữ liệu test giáo viên mầm non.','2026-07-28',1,'2026-07-28 15:24:46'),(38,38,NULL,'tiep_nhan',NULL,'2026-07-28',1,'2026-07-28 15:24:46'),(39,38,'tiep_nhan','dang_hoc','Kích hoạt dữ liệu test giáo viên mầm non.','2026-07-28',1,'2026-07-28 15:24:47'),(40,39,NULL,'tiep_nhan',NULL,'2026-07-28',1,'2026-07-28 15:24:47'),(41,39,'tiep_nhan','dang_hoc','Kích hoạt dữ liệu test giáo viên mầm non.','2026-07-28',1,'2026-07-28 15:24:47'),(42,40,NULL,'tiep_nhan',NULL,'2026-07-28',1,'2026-07-28 15:24:47'),(43,40,'tiep_nhan','dang_hoc','Kích hoạt dữ liệu test giáo viên mầm non.','2026-07-28',1,'2026-07-28 15:24:47'),(44,41,NULL,'tiep_nhan',NULL,'2026-07-28',1,'2026-07-28 15:24:47'),(45,41,'tiep_nhan','dang_hoc','Kích hoạt dữ liệu test giáo viên mầm non.','2026-07-28',1,'2026-07-28 15:24:47'),(46,42,NULL,'tiep_nhan',NULL,'2026-07-28',1,'2026-07-28 15:24:49'),(47,42,'tiep_nhan','dang_hoc','Kích hoạt dữ liệu test giáo viên trung tâm tiếng Anh.','2026-07-28',1,'2026-07-28 15:24:49'),(48,43,NULL,'tiep_nhan',NULL,'2026-07-28',1,'2026-07-28 15:24:49'),(49,43,'tiep_nhan','dang_hoc','Kích hoạt dữ liệu test giáo viên trung tâm tiếng Anh.','2026-07-28',1,'2026-07-28 15:24:49'),(50,44,NULL,'tiep_nhan',NULL,'2026-07-28',1,'2026-07-28 15:24:49'),(51,44,'tiep_nhan','dang_hoc','Kích hoạt dữ liệu test giáo viên trung tâm tiếng Anh.','2026-07-28',1,'2026-07-28 15:24:49'),(52,45,NULL,'tiep_nhan',NULL,'2026-07-28',1,'2026-07-28 15:24:49'),(53,45,'tiep_nhan','dang_hoc','Kích hoạt dữ liệu test giáo viên trung tâm tiếng Anh.','2026-07-28',1,'2026-07-28 15:24:49'),(54,44,'dang_hoc','hoan_thanh','Tự động đồng bộ khi lượt xếp lớp cuối cùng kết thúc.','2026-07-30',1,'2026-07-30 04:02:35'),(55,46,NULL,'tiep_nhan',NULL,'2026-07-30',1,'2026-07-30 04:03:11');
/*!40000 ALTER TABLE `hocsinhtrangthailichsu` ENABLE KEYS */;

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
  `lopHocId` bigint unsigned DEFAULT NULL,
  `tongTien` decimal(18,2) NOT NULL,
  `giamTru` decimal(18,2) NOT NULL DEFAULT '0.00',
  `daThu` decimal(18,2) NOT NULL DEFAULT '0.00',
  `trangThai` enum('chua_thu','thu_mot_phan','da_thu_du') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'chua_thu',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_KhoanPhaiThu_kyThuId_hocSinhId_lopHocId` (`kyThuId`,`hocSinhId`,`lopHocId`),
  KEY `IX_KhoanPhaiThu_donViId_trangThai` (`donViId`,`trangThai`),
  KEY `IX_KhoanPhaiThu_hocSinhId` (`hocSinhId`),
  KEY `FK_KhoanPhaiThu_LopHoc` (`lopHocId`),
  CONSTRAINT `FK_KhoanPhaiThu_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `FK_KhoanPhaiThu_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `FK_KhoanPhaiThu_KyThu` FOREIGN KEY (`kyThuId`) REFERENCES `kythu` (`id`),
  CONSTRAINT `FK_KhoanPhaiThu_LopHoc` FOREIGN KEY (`lopHocId`) REFERENCES `lophoc` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khoanphaithu`
--

/*!40000 ALTER TABLE `khoanphaithu` DISABLE KEYS */;
INSERT INTO `khoanphaithu` VALUES (20,3,9,37,10,4200000.00,0.00,500000.00,'thu_mot_phan','2026-07-28 22:24:47','2026-07-28 22:24:47'),(21,3,9,38,10,4200000.00,0.00,4200000.00,'da_thu_du','2026-07-28 22:24:47','2026-07-28 22:24:47'),(22,3,9,39,10,4200000.00,0.00,0.00,'chua_thu','2026-07-28 22:24:47','2026-07-28 22:24:47'),(23,3,9,40,10,4200000.00,0.00,0.00,'chua_thu','2026-07-28 22:24:47','2026-07-28 22:24:47'),(24,3,9,41,10,4200000.00,0.00,0.00,'chua_thu','2026-07-28 22:24:47','2026-07-28 22:24:47'),(25,2,10,42,11,2300000.00,0.00,2300000.00,'da_thu_du','2026-07-28 22:24:49','2026-07-30 11:04:19'),(26,2,10,43,11,2300000.00,0.00,2300000.00,'da_thu_du','2026-07-28 22:24:49','2026-07-28 22:24:49'),(27,2,10,44,11,2300000.00,0.00,2300000.00,'da_thu_du','2026-07-28 22:24:49','2026-07-30 12:00:10'),(28,2,10,45,11,2300000.00,0.00,0.00,'chua_thu','2026-07-28 22:24:49','2026-07-28 22:24:49');
/*!40000 ALTER TABLE `khoanphaithu` ENABLE KEYS */;

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
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_KhoanPhaiThuChiTiet_kpt_danhMuc` (`khoanPhaiThuId`,`danhMucKhoanThuId`),
  KEY `IX_KhoanPhaiThuChiTiet_khoanPhaiThuId` (`khoanPhaiThuId`),
  KEY `FK_KPTCT_DanhMuc` (`danhMucKhoanThuId`),
  CONSTRAINT `FK_KPTCT_DanhMuc` FOREIGN KEY (`danhMucKhoanThuId`) REFERENCES `danhmuckhoanthu` (`id`),
  CONSTRAINT `FK_KPTCT_KhoanPhaiThu` FOREIGN KEY (`khoanPhaiThuId`) REFERENCES `khoanphaithu` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khoanphaithuchitiet`
--

/*!40000 ALTER TABLE `khoanphaithuchitiet` DISABLE KEYS */;
INSERT INTO `khoanphaithuchitiet` VALUES (38,20,12,3000000.00,'2026-07-28 22:24:47'),(39,20,14,200000.00,'2026-07-28 22:24:47'),(40,20,13,1000000.00,'2026-07-28 22:24:47'),(41,21,12,3000000.00,'2026-07-28 22:24:47'),(42,21,14,200000.00,'2026-07-28 22:24:47'),(43,21,13,1000000.00,'2026-07-28 22:24:47'),(44,22,12,3000000.00,'2026-07-28 22:24:47'),(45,22,14,200000.00,'2026-07-28 22:24:47'),(46,22,13,1000000.00,'2026-07-28 22:24:47'),(47,23,12,3000000.00,'2026-07-28 22:24:47'),(48,23,14,200000.00,'2026-07-28 22:24:47'),(49,23,13,1000000.00,'2026-07-28 22:24:47'),(50,24,12,3000000.00,'2026-07-28 22:24:47'),(51,24,14,200000.00,'2026-07-28 22:24:47'),(52,24,13,1000000.00,'2026-07-28 22:24:47'),(53,25,16,300000.00,'2026-07-28 22:24:49'),(54,25,15,2000000.00,'2026-07-28 22:24:49'),(55,26,16,300000.00,'2026-07-28 22:24:49'),(56,26,15,2000000.00,'2026-07-28 22:24:49'),(57,27,16,300000.00,'2026-07-28 22:24:49'),(58,27,15,2000000.00,'2026-07-28 22:24:49'),(59,28,16,300000.00,'2026-07-28 22:24:49'),(60,28,15,2000000.00,'2026-07-28 22:24:49');
/*!40000 ALTER TABLE `khoanphaithuchitiet` ENABLE KEYS */;

--
-- Table structure for table `kythu`
--

DROP TABLE IF EXISTS `kythu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kythu` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `maKyThu` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenKyThu` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loaiKy` enum('thang','khoa_hoc','hoc_ky','dot') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tuNgay` date NOT NULL,
  `denNgay` date NOT NULL,
  `hanThanhToan` date DEFAULT NULL,
  `trangThai` enum('nhap','da_mo','da_dong') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'nhap',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_KyThu_donViId_ma` (`donViId`,`maKyThu`),
  KEY `IX_KyThu_donViId` (`donViId`),
  CONSTRAINT `FK_KyThu_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kythu`
--

/*!40000 ALTER TABLE `kythu` DISABLE KEYS */;
INSERT INTO `kythu` VALUES (9,3,'KY20260001','Kỳ thu test mầm non 2026-07','thang','2026-07-28','2026-08-27','2026-08-07','da_mo','2026-07-28 22:24:47','2026-07-28 22:24:47'),(10,2,'KY20260001','Kỳ thu test khóa tiếng Anh 2026-07','khoa_hoc','2026-07-28','2026-08-27','2026-08-07','da_mo','2026-07-28 22:24:49','2026-07-28 22:24:49');
/*!40000 ALTER TABLE `kythu` ENABLE KEYS */;

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
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_KyThuKhoanThu_kyThuId_danhMucId` (`kyThuId`,`danhMucKhoanThuId`),
  KEY `IX_KyThuKhoanThu_kyThuId` (`kyThuId`),
  KEY `FK_KyThuKhoanThu_DanhMuc` (`danhMucKhoanThuId`),
  CONSTRAINT `FK_KyThuKhoanThu_DanhMuc` FOREIGN KEY (`danhMucKhoanThuId`) REFERENCES `danhmuckhoanthu` (`id`),
  CONSTRAINT `FK_KyThuKhoanThu_KyThu` FOREIGN KEY (`kyThuId`) REFERENCES `kythu` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kythukhoanthu`
--

/*!40000 ALTER TABLE `kythukhoanthu` DISABLE KEYS */;
INSERT INTO `kythukhoanthu` VALUES (12,9,12,3000000.00,NULL,'2026-07-28 22:24:47','2026-07-28 22:24:47'),(13,9,13,1000000.00,NULL,'2026-07-28 22:24:47','2026-07-28 22:24:47'),(14,9,14,200000.00,NULL,'2026-07-28 22:24:47','2026-07-28 22:24:47'),(15,10,15,2000000.00,NULL,'2026-07-28 22:24:49','2026-07-28 22:24:49'),(16,10,16,300000.00,NULL,'2026-07-28 22:24:49','2026-07-28 22:24:49');
/*!40000 ALTER TABLE `kythukhoanthu` ENABLE KEYS */;

--
-- Table structure for table `lead`
--

DROP TABLE IF EXISTS `lead`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lead` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `maLead` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hoTen` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soDienThoai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nguon` enum('gioi_thieu','facebook','website','walk_in','khac') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'khac',
  `doTuoiHoacTrinhDo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nhuCau` text COLLATE utf8mb4_unicode_ci,
  `tuVanVienId` bigint unsigned DEFAULT NULL,
  `trangThai` enum('moi','dang_cham_soc','da_hen_lich','da_hoc_thu','da_dang_ky','khong_tiep_tuc') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'moi',
  `lyDoKhongTiepTuc` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hocSinhId` bigint unsigned DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_Lead_donViId_maLead` (`donViId`,`maLead`),
  KEY `IX_Lead_donViId` (`donViId`),
  KEY `IX_Lead_donViId_trangThai` (`donViId`,`trangThai`),
  KEY `IX_Lead_tuVanVienId` (`tuVanVienId`),
  KEY `FK_Lead_HocSinh` (`hocSinhId`),
  CONSTRAINT `FK_Lead_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `FK_Lead_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `FK_Lead_TuVanVien` FOREIGN KEY (`tuVanVienId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lead`
--

/*!40000 ALTER TABLE `lead` DISABLE KEYS */;
/*!40000 ALTER TABLE `lead` ENABLE KEYS */;

--
-- Table structure for table `leadhoatdong`
--

DROP TABLE IF EXISTS `leadhoatdong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leadhoatdong` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `leadId` bigint unsigned NOT NULL,
  `loaiHoatDong` enum('goi_dien','gap_truc_tiep','nhan_tin','hen_lich','hoc_thu','khac') COLLATE utf8mb4_unicode_ci NOT NULL,
  `noiDung` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ketQua` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nguoiThucHienId` bigint unsigned NOT NULL,
  `thoiGian` datetime NOT NULL,
  `trangThai` enum('cho_xu_ly','da_xu_ly','da_huy') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'da_xu_ly',
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_LeadHoatDong_leadId` (`leadId`),
  KEY `IX_LeadHoatDong_leadId_thoiGian` (`leadId`,`thoiGian`),
  KEY `FK_LeadHoatDong_NguoiThucHien` (`nguoiThucHienId`),
  KEY `IX_LeadHoatDong_trangThai_thoiGian` (`trangThai`,`thoiGian`),
  CONSTRAINT `FK_LeadHoatDong_Lead` FOREIGN KEY (`leadId`) REFERENCES `lead` (`id`),
  CONSTRAINT `FK_LeadHoatDong_NguoiThucHien` FOREIGN KEY (`nguoiThucHienId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leadhoatdong`
--

/*!40000 ALTER TABLE `leadhoatdong` DISABLE KEYS */;
/*!40000 ALTER TABLE `leadhoatdong` ENABLE KEYS */;

--
-- Table structure for table `lichhoc`
--

DROP TABLE IF EXISTS `lichhoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lichhoc` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `lopHocId` bigint unsigned NOT NULL,
  `thuTrongTuan` int NOT NULL,
  `gioBatDau` time NOT NULL,
  `gioKetThuc` time NOT NULL,
  `phongHoc` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `giaoVienId` bigint unsigned DEFAULT NULL,
  `ngayApDungTu` date NOT NULL,
  `ngayApDungDen` date DEFAULT NULL,
  `trangThai` enum('hoat_dong','ngung_hoat_dong') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_LichHoc_lopHocId` (`lopHocId`),
  KEY `IX_LichHoc_lopHocId_trangThai` (`lopHocId`,`trangThai`),
  KEY `FK_LichHoc_GiaoVien` (`giaoVienId`),
  CONSTRAINT `FK_LichHoc_GiaoVien` FOREIGN KEY (`giaoVienId`) REFERENCES `giaovien` (`id`),
  CONSTRAINT `FK_LichHoc_LopHoc` FOREIGN KEY (`lopHocId`) REFERENCES `lophoc` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lichhoc`
--

/*!40000 ALTER TABLE `lichhoc` DISABLE KEYS */;
INSERT INTO `lichhoc` VALUES (34,10,2,'07:30:00','16:30:00','Phòng Lá Test',8,'2026-07-28',NULL,'hoat_dong','2026-07-28 15:24:47','2026-07-28 15:24:47'),(35,10,3,'07:30:00','16:30:00','Phòng Lá Test',8,'2026-07-28',NULL,'hoat_dong','2026-07-28 15:24:47','2026-07-28 15:24:47'),(36,10,4,'07:30:00','16:30:00','Phòng Lá Test',8,'2026-07-28',NULL,'hoat_dong','2026-07-28 15:24:47','2026-07-28 15:24:47'),(37,10,5,'07:30:00','16:30:00','Phòng Lá Test',8,'2026-07-28',NULL,'hoat_dong','2026-07-28 15:24:47','2026-07-28 15:24:47'),(38,10,6,'07:30:00','16:30:00','Phòng Lá Test',8,'2026-07-28',NULL,'hoat_dong','2026-07-28 15:24:47','2026-07-28 15:24:47'),(39,11,2,'18:00:00','19:30:00','Phòng NN Test',9,'2026-07-28',NULL,'hoat_dong','2026-07-28 15:24:49','2026-07-28 15:24:49'),(40,11,4,'18:00:00','19:30:00','Phòng NN Test',9,'2026-07-28',NULL,'hoat_dong','2026-07-28 15:24:49','2026-07-28 15:24:49'),(41,11,6,'18:00:00','19:30:00','Phòng NN Test',9,'2026-07-28',NULL,'hoat_dong','2026-07-28 15:24:49','2026-07-28 15:24:49');
/*!40000 ALTER TABLE `lichhoc` ENABLE KEYS */;

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
  `maLop` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenLop` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capDo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayBatDau` date DEFAULT NULL,
  `ngayKetThuc` date DEFAULT NULL,
  `siSoToiDa` int DEFAULT NULL,
  `phongHoc` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` enum('chuan_bi','dang_hoc','tam_dung','ket_thuc','huy') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'chuan_bi',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_LopHoc_donViId_ma` (`donViId`,`maLop`),
  KEY `IX_LopHoc_donViId` (`donViId`),
  KEY `IX_LopHoc_donViId_trangThai` (`donViId`,`trangThai`),
  KEY `FK_LopHoc_ChuongTrinhDaoTao` (`chuongTrinhDaoTaoId`),
  CONSTRAINT `FK_LopHoc_ChuongTrinhDaoTao` FOREIGN KEY (`chuongTrinhDaoTaoId`) REFERENCES `chuongtrinhdaotao` (`id`),
  CONSTRAINT `FK_LopHoc_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lophoc`
--

/*!40000 ALTER TABLE `lophoc` DISABLE KEYS */;
INSERT INTO `lophoc` VALUES (10,3,10,'LOP0001','Lá Test Full','5-6 tuổi','2026-07-28','2026-10-26',20,'Phòng Lá Test','dang_hoc','2026-07-28 15:24:46','2026-07-28 15:24:46'),(11,2,11,'LOP0001','English A2 Test Full','A2','2026-07-28','2026-10-26',20,'Phòng NN Test','dang_hoc','2026-07-28 15:24:49','2026-07-28 15:24:49');
/*!40000 ALTER TABLE `lophoc` ENABLE KEYS */;

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
  `vaiTro` enum('giao_vien_chinh','ho_tro','chu_nhiem') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'giao_vien_chinh',
  `tuNgay` date NOT NULL,
  `denNgay` date DEFAULT NULL,
  `trangThai` enum('hoat_dong','ngung_hoat_dong') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_LopHocGiaoVien_lopHocId` (`lopHocId`),
  KEY `IX_LopHocGiaoVien_giaoVienId` (`giaoVienId`),
  CONSTRAINT `FK_LopHocGiaoVien_GiaoVien` FOREIGN KEY (`giaoVienId`) REFERENCES `giaovien` (`id`),
  CONSTRAINT `FK_LopHocGiaoVien_LopHoc` FOREIGN KEY (`lopHocId`) REFERENCES `lophoc` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lophocgiaovien`
--

/*!40000 ALTER TABLE `lophocgiaovien` DISABLE KEYS */;
INSERT INTO `lophocgiaovien` VALUES (8,10,8,'chu_nhiem','2026-07-28',NULL,'hoat_dong','2026-07-28 15:24:46','2026-07-28 15:24:46'),(9,11,9,'giao_vien_chinh','2026-07-28',NULL,'hoat_dong','2026-07-28 15:24:49','2026-07-28 15:24:49');
/*!40000 ALTER TABLE `lophocgiaovien` ENABLE KEYS */;

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
  `hinhAnhUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `soDienThoai` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` enum('hoat_dong','tam_khoa','ngung') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  `batBuocDoiMatKhau` tinyint(1) NOT NULL DEFAULT '1',
  `soLanDangNhapSaiLienTiep` int unsigned NOT NULL DEFAULT '0',
  `khoaDangNhapDenLuc` datetime DEFAULT NULL,
  `lanDangNhapCuoi` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_NguoiDung_tenDangNhap` (`tenDangNhap`),
  UNIQUE KEY `UQ_NguoiDung_email` (`email`),
  KEY `IX_NguoiDung_trangThai` (`trangThai`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nguoidung`
--

/*!40000 ALTER TABLE `nguoidung` DISABLE KEYS */;
INSERT INTO `nguoidung` VALUES (1,'admin','$2b$12$oxocZEcZcpUhRvyxFfev6OCxbPQ4ElAnAnq0sGWD60OU.PY7Kt1pW','Quản trị hệ thống',NULL,NULL,NULL,'hoat_dong',0,0,NULL,'2026-07-30 10:48:37','2026-07-20 08:06:31','2026-07-30 10:48:37'),(37,'demo_giaovien_mn','$2b$12$XZYSi.U3utImak3vF7TGJe50eNeFp2Vy2WR17bu7tSsO3iBgDWcMu','Giáo viên Test Mầm non',NULL,NULL,NULL,'hoat_dong',0,0,NULL,'2026-07-28 22:30:04','2026-07-28 15:24:46','2026-07-28 22:55:25'),(38,'demo_hocvu_mn','$2b$12$XZYSi.U3utImak3vF7TGJe50eNeFp2Vy2WR17bu7tSsO3iBgDWcMu','Học vụ Test Mầm non',NULL,NULL,NULL,'hoat_dong',0,0,NULL,NULL,'2026-07-28 15:24:46','2026-07-28 22:55:25'),(39,'demo_ketoan_mn','$2b$12$XZYSi.U3utImak3vF7TGJe50eNeFp2Vy2WR17bu7tSsO3iBgDWcMu','Kế toán Test Mầm non',NULL,NULL,NULL,'hoat_dong',0,0,NULL,'2026-07-28 22:30:33','2026-07-28 15:24:46','2026-07-28 22:55:25'),(40,'demo_quanly_mn','$2b$12$XZYSi.U3utImak3vF7TGJe50eNeFp2Vy2WR17bu7tSsO3iBgDWcMu','Quản lý Test Mầm non',NULL,NULL,NULL,'hoat_dong',0,0,NULL,'2026-07-28 22:55:49','2026-07-28 15:24:46','2026-07-28 22:55:49'),(41,'0988002026','$2b$12$T3s8KPAjsCVOTyJLD9azPOvJfUhrV2F/W4.Ya1pve9k4fYx9o93EO','Nguyễn Minh Anh','phuhuynh.demo@example.com',NULL,'0988002026','hoat_dong',0,0,NULL,'2026-07-28 22:28:07','2026-07-28 15:24:47','2026-07-28 22:55:27'),(42,'demo_giaovien_nn','$2b$12$T3s8KPAjsCVOTyJLD9azPOvJfUhrV2F/W4.Ya1pve9k4fYx9o93EO','Giáo viên Test Tiếng Anh',NULL,NULL,NULL,'hoat_dong',0,0,NULL,NULL,'2026-07-28 15:24:49','2026-07-28 22:55:27'),(43,'demo_hocvu_nn','$2b$12$T3s8KPAjsCVOTyJLD9azPOvJfUhrV2F/W4.Ya1pve9k4fYx9o93EO','Học vụ Test Ngoại ngữ',NULL,NULL,NULL,'hoat_dong',0,0,NULL,'2026-07-30 11:53:46','2026-07-28 15:24:49','2026-07-30 11:53:46'),(44,'demo_ketoan_nn','$2b$12$T3s8KPAjsCVOTyJLD9azPOvJfUhrV2F/W4.Ya1pve9k4fYx9o93EO','Kế toán Test Ngoại ngữ',NULL,NULL,NULL,'hoat_dong',0,0,NULL,NULL,'2026-07-28 15:24:49','2026-07-28 22:55:27'),(45,'demo_quanly_nn','$2b$12$SVOT7QQobFV12sgq4Sq2XONBZE/0vddC3vg66.G29DIn4gXGyoL/.','Quản lý Test Ngoại ngữ',NULL,NULL,NULL,'hoat_dong',0,2,NULL,'2026-07-30 10:49:14','2026-07-28 15:24:49','2026-07-30 11:53:33'),(46,'demo_tuyensinh_mn','$2b$12$XZYSi.U3utImak3vF7TGJe50eNeFp2Vy2WR17bu7tSsO3iBgDWcMu','Tuyển sinh Test Mầm non',NULL,NULL,NULL,'hoat_dong',0,0,NULL,NULL,'2026-07-28 15:55:25','2026-07-28 22:55:25'),(47,'demo_tuyensinh_nn','$2b$12$T3s8KPAjsCVOTyJLD9azPOvJfUhrV2F/W4.Ya1pve9k4fYx9o93EO','Tuyển sinh Test Ngoại ngữ',NULL,NULL,NULL,'hoat_dong',0,0,NULL,NULL,'2026-07-28 15:55:27','2026-07-28 22:55:27'),(48,'09090909019','$2b$12$09XXRcOYLQaBTPcgm8SkR.ZS82D2VagaIL6ln2N2xrmywaEqc03By','Demo GV Tiếng Anh',NULL,NULL,'09090909019','hoat_dong',0,0,NULL,'2026-07-30 10:51:15','2026-07-30 03:50:00','2026-07-30 10:51:29'),(49,'gv_phuc.nguyen','$2b$12$KrYCiPGRT5csKIAzY.uKqejRsTr.gTH1dhUQqxo5SmiJbBKZQBth6','Nguyễn Văn Phúc','gv.phuc.huongdan@example.test',NULL,'0977001099','hoat_dong',1,0,NULL,NULL,'2026-07-30 04:49:36','2026-07-30 04:49:36'),(50,'gv_linh.tran','$2b$12$UQDB6GWB7M5/n0D30J.nveTiGOUywhXU961zYv7AcKz4Vy1Bk3jf.','Trần Văn Linh',NULL,NULL,'09090909090','hoat_dong',1,0,NULL,NULL,'2026-07-30 05:04:01','2026-07-30 05:04:01');
/*!40000 ALTER TABLE `nguoidung` ENABLE KEYS */;

--
-- Table structure for table `nguoidungvaitrodonvi`
--

DROP TABLE IF EXISTS `nguoidungvaitrodonvi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nguoidungvaitrodonvi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nguoiDungId` bigint unsigned NOT NULL,
  `vaiTroId` int unsigned NOT NULL,
  `donViId` bigint unsigned NOT NULL,
  `dangHoatDong` tinyint(1) NOT NULL DEFAULT '1',
  `tuNgay` datetime DEFAULT NULL,
  `denNgay` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_NguoiDungVaiTroDonVi` (`nguoiDungId`,`vaiTroId`,`donViId`),
  KEY `IX_NguoiDungVaiTroDonVi_nguoiDungId` (`nguoiDungId`),
  KEY `IX_NguoiDungVaiTroDonVi_vaiTroId` (`vaiTroId`),
  KEY `IX_NguoiDungVaiTroDonVi_donViId` (`donViId`),
  CONSTRAINT `FK_NguoiDungVaiTroDonVi_donVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_NguoiDungVaiTroDonVi_nguoiDung` FOREIGN KEY (`nguoiDungId`) REFERENCES `nguoidung` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_NguoiDungVaiTroDonVi_vaiTro` FOREIGN KEY (`vaiTroId`) REFERENCES `vaitro` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nguoidungvaitrodonvi`
--

/*!40000 ALTER TABLE `nguoidungvaitrodonvi` DISABLE KEYS */;
INSERT INTO `nguoidungvaitrodonvi` VALUES (1,1,1,1,1,NULL,NULL,'2026-07-20 08:06:31','2026-07-25 10:01:18'),(43,37,7,3,1,NULL,NULL,'2026-07-28 15:24:46','2026-07-28 15:24:46'),(44,38,5,3,1,NULL,NULL,'2026-07-28 15:24:46','2026-07-28 15:24:46'),(45,39,6,3,1,NULL,NULL,'2026-07-28 15:24:46','2026-07-28 15:24:46'),(46,40,2,3,1,NULL,NULL,'2026-07-28 15:24:46','2026-07-28 15:24:46'),(47,41,8,3,1,NULL,NULL,'2026-07-28 15:24:47','2026-07-28 15:24:47'),(48,42,7,2,1,NULL,NULL,'2026-07-28 15:24:49','2026-07-28 15:24:49'),(49,43,5,2,1,NULL,NULL,'2026-07-28 15:24:49','2026-07-28 15:24:49'),(50,44,6,2,1,NULL,NULL,'2026-07-28 15:24:49','2026-07-28 15:24:49'),(51,45,2,2,1,NULL,NULL,'2026-07-28 15:24:49','2026-07-28 15:24:49'),(52,46,3,3,1,NULL,NULL,'2026-07-28 15:55:25','2026-07-28 15:55:25'),(53,47,3,2,1,NULL,NULL,'2026-07-28 15:55:27','2026-07-28 15:55:27'),(54,48,7,2,1,NULL,NULL,'2026-07-30 03:50:00','2026-07-30 03:50:00'),(55,49,7,3,1,NULL,NULL,'2026-07-30 04:49:36','2026-07-30 04:49:36'),(56,50,7,2,1,NULL,NULL,'2026-07-30 05:04:01','2026-07-30 05:04:01');
/*!40000 ALTER TABLE `nguoidungvaitrodonvi` ENABLE KEYS */;

--
-- Table structure for table `nhatkyhethong`
--

DROP TABLE IF EXISTS `nhatkyhethong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhatkyhethong` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nguoiDungId` bigint unsigned DEFAULT NULL,
  `donViId` bigint unsigned DEFAULT NULL,
  `hanhDong` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doiTuong` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doiTuongId` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `noiDung` text COLLATE utf8mb4_unicode_ci,
  `duLieu` json DEFAULT NULL,
  `mucDo` enum('thong_tin','canh_bao','loi') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'thong_tin',
  `diaChiIp` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IX_NhatKyHeThong_nguoiDungId` (`nguoiDungId`),
  KEY `IX_NhatKyHeThong_donViId` (`donViId`),
  KEY `IX_NhatKyHeThong_hanhDong` (`hanhDong`),
  KEY `IX_NhatKyHeThong_createdAt` (`createdAt`),
  CONSTRAINT `FK_NhatKyHeThong_donVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_NhatKyHeThong_nguoiDung` FOREIGN KEY (`nguoiDungId`) REFERENCES `nguoidung` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1239 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhatkyhethong`
--

/*!40000 ALTER TABLE `nhatkyhethong` DISABLE KEYS */;
INSERT INTO `nhatkyhethong` VALUES (1104,1,NULL,'auth.login','PhienDangNhap','177','Đăng nhập thành công.',NULL,'thong_tin','127.0.0.1','2026-07-28 22:03:00'),(1105,1,1,'auth.select_organization','DonVi','1','Chọn đơn vị Hệ thống quản lý giáo dục.',NULL,'thong_tin','127.0.0.1','2026-07-28 22:03:01'),(1106,1,2,'auth.select_organization','DonVi','2','Chọn đơn vị Trung tâm Ngoại ngữ Quận 8.',NULL,'thong_tin','127.0.0.1','2026-07-28 22:22:19'),(1107,1,1,'auth.select_organization','DonVi','1','Chọn đơn vị Hệ thống quản lý giáo dục.',NULL,'thong_tin','127.0.0.1','2026-07-28 22:22:23'),(1108,1,1,'auth.select_organization','DonVi','1','Chọn đơn vị Hệ thống quản lý giáo dục.',NULL,'thong_tin','127.0.0.1','2026-07-28 22:22:23'),(1109,1,3,'chuong_trinh.create','ChuongTrinhDaoTao','10','Tạo chương trình Chương trình test giáo viên mầm non (CT001).',NULL,'thong_tin',NULL,'2026-07-28 22:24:46'),(1110,1,3,'giao_vien.create','GiaoVien','8','Tạo hồ sơ giáo viên Giáo viên Test Mầm non (GV000001).',NULL,'thong_tin',NULL,'2026-07-28 22:24:46'),(1111,1,3,'lop_hoc.create','LopHoc','10','Tạo lớp Lá Test Full (LOP0001).',NULL,'thong_tin',NULL,'2026-07-28 22:24:46'),(1112,1,3,'lop_hoc.set_status','LopHoc','10','Đổi trạng thái lớp Lá Test Full sang dang_hoc.',NULL,'thong_tin',NULL,'2026-07-28 22:24:46'),(1113,1,3,'lop_hoc.assign_teacher','LopHocGiaoVien','8','Phân công giáo viên Giáo viên Test Mầm non (GV000001) vào lớp Lá Test Full.',NULL,'thong_tin',NULL,'2026-07-28 22:24:46'),(1114,1,3,'hoc_sinh.create','HocSinh','37','Tạo hồ sơ học sinh Test Bé An (HS20260001).',NULL,'thong_tin',NULL,'2026-07-28 22:24:46'),(1115,1,3,'hoc_sinh.set_status','HocSinh','37','Đổi trạng thái học sinh Test Bé An (HS20260001) từ tiep_nhan sang dang_hoc.',NULL,'thong_tin',NULL,'2026-07-28 22:24:46'),(1116,1,3,'lop_hoc.enroll_student','HocSinhLopHoc','27','Xếp học sinh Test Bé An (HS20260001) vào lớp Lá Test Full.',NULL,'thong_tin',NULL,'2026-07-28 22:24:46'),(1117,1,3,'hoc_sinh.create','HocSinh','38','Tạo hồ sơ học sinh Test Bé Bình (HS20260002).',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1118,1,3,'hoc_sinh.set_status','HocSinh','38','Đổi trạng thái học sinh Test Bé Bình (HS20260002) từ tiep_nhan sang dang_hoc.',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1119,1,3,'lop_hoc.enroll_student','HocSinhLopHoc','28','Xếp học sinh Test Bé Bình (HS20260002) vào lớp Lá Test Full.',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1120,1,3,'hoc_sinh.create','HocSinh','39','Tạo hồ sơ học sinh Test Bé Chi (HS20260003).',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1121,1,3,'hoc_sinh.set_status','HocSinh','39','Đổi trạng thái học sinh Test Bé Chi (HS20260003) từ tiep_nhan sang dang_hoc.',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1122,1,3,'lop_hoc.enroll_student','HocSinhLopHoc','29','Xếp học sinh Test Bé Chi (HS20260003) vào lớp Lá Test Full.',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1123,1,3,'hoc_sinh.create','HocSinh','40','Tạo hồ sơ học sinh Test Bé Dương (HS20260004).',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1124,1,3,'hoc_sinh.set_status','HocSinh','40','Đổi trạng thái học sinh Test Bé Dương (HS20260004) từ tiep_nhan sang dang_hoc.',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1125,1,3,'lop_hoc.enroll_student','HocSinhLopHoc','30','Xếp học sinh Test Bé Dương (HS20260004) vào lớp Lá Test Full.',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1126,1,3,'hoc_sinh.create','HocSinh','41','Tạo hồ sơ học sinh Test Bé Gia Hân (HS20260005).',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1127,1,3,'hoc_sinh.set_status','HocSinh','41','Đổi trạng thái học sinh Test Bé Gia Hân (HS20260005) từ tiep_nhan sang dang_hoc.',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1128,1,3,'lop_hoc.enroll_student','HocSinhLopHoc','31','Xếp học sinh Test Bé Gia Hân (HS20260005) vào lớp Lá Test Full.',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1129,1,3,'hoc_sinh.add_guardian','HocSinhPhuHuynh','31','Thêm phụ huynh Nguyễn Minh Anh (PH000001) cho học sinh Test Bé An (HS20260001).',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1130,1,3,'hoc_sinh.guardian_account_create','PhuHuynh','26','Tạo tài khoản đăng nhập 0988002026 cho phụ huynh Nguyễn Minh Anh (PH000001).',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1131,37,3,'hoc_sinh.them_danh_gia','HocSinhLopHocDanhGia','8','Ghi nhận kết quả học tập (theo_thang) cho lượt xếp lớp #27.',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1132,38,3,'thong_bao.create','ThongBao','6','Tạo thông báo TB20260001 (Thông báo sinh hoạt tháng 07).',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1133,1,3,'lich_hoc.create','LichHoc',NULL,'Tạo 5 quy tắc lịch học cho lớp Lá Test Full.','\"{\\\"lopHocId\\\":10,\\\"thuTrongTuanList\\\":[2,3,4,5,6]}\"','thong_tin',NULL,'2026-07-28 22:24:47'),(1134,1,3,'lich_hoc.generate_sessions','LichHoc','34','Sinh 4 buổi học đến ngày 2026-08-25.','\"{\\\"lopHocId\\\":10,\\\"ngayHocList\\\":[\\\"2026-08-03\\\",\\\"2026-08-10\\\",\\\"2026-08-17\\\",\\\"2026-08-24\\\"]}\"','thong_tin',NULL,'2026-07-28 22:24:47'),(1135,1,3,'lich_hoc.generate_sessions','LichHoc','35','Sinh 5 buổi học đến ngày 2026-08-25.','\"{\\\"lopHocId\\\":10,\\\"ngayHocList\\\":[\\\"2026-07-28\\\",\\\"2026-08-04\\\",\\\"2026-08-11\\\",\\\"2026-08-18\\\",\\\"2026-08-25\\\"]}\"','thong_tin',NULL,'2026-07-28 22:24:47'),(1136,1,3,'lich_hoc.generate_sessions','LichHoc','36','Sinh 4 buổi học đến ngày 2026-08-25.','\"{\\\"lopHocId\\\":10,\\\"ngayHocList\\\":[\\\"2026-07-29\\\",\\\"2026-08-05\\\",\\\"2026-08-12\\\",\\\"2026-08-19\\\"]}\"','thong_tin',NULL,'2026-07-28 22:24:47'),(1137,1,3,'lich_hoc.generate_sessions','LichHoc','37','Sinh 4 buổi học đến ngày 2026-08-25.','\"{\\\"lopHocId\\\":10,\\\"ngayHocList\\\":[\\\"2026-07-30\\\",\\\"2026-08-06\\\",\\\"2026-08-13\\\",\\\"2026-08-20\\\"]}\"','thong_tin',NULL,'2026-07-28 22:24:47'),(1138,1,3,'lich_hoc.generate_sessions','LichHoc','38','Sinh 4 buổi học đến ngày 2026-08-25.','\"{\\\"lopHocId\\\":10,\\\"ngayHocList\\\":[\\\"2026-07-31\\\",\\\"2026-08-07\\\",\\\"2026-08-14\\\",\\\"2026-08-21\\\"]}\"','thong_tin',NULL,'2026-07-28 22:24:47'),(1139,39,3,'khoan_thu.create','DanhMucKhoanThu','12','Tạo khoản thu Học phí mầm non test (KT001).',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1140,39,3,'khoan_thu.create','DanhMucKhoanThu','13','Tạo khoản thu Tiền ăn mầm non test (KT002).',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1141,39,3,'khoan_thu.create','DanhMucKhoanThu','14','Tạo khoản thu Phí dịch vụ test (KT003).',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1142,39,3,'ky_thu.create','KyThu','9','Tạo kỳ thu Kỳ thu test mầm non 2026-07 (KY20260001).',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1143,39,3,'ky_thu.set_khoan_ap_dung','KyThu','9','Cập nhật 3 khoản thu áp dụng cho kỳ thu Kỳ thu test mầm non 2026-07.',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1144,39,3,'ky_thu.mo','KyThu','9','Mở kỳ thu Kỳ thu test mầm non 2026-07 (KY20260001).',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1145,39,3,'khoan_phai_thu.sinh_theo_lop','KyThu','9','Sinh khoản phải thu cho lớp Lá Test Full — kỳ thu Kỳ thu test mầm non 2026-07: tạo mới 5, bỏ qua 0 (đã có sẵn).',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1146,39,3,'phieu_thu.create','PhieuThu','12','Thu 500000.00 cho khoản phải thu #20 — phiếu PT202600001.',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1147,39,3,'phieu_thu.create','PhieuThu','13','Thu 4200000.00 cho khoản phải thu #21 — phiếu PT202600002.',NULL,'thong_tin',NULL,'2026-07-28 22:24:47'),(1148,1,2,'chuong_trinh.create','ChuongTrinhDaoTao','11','Tạo chương trình Chương trình test giáo viên tiếng Anh (CT001).',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1149,1,2,'giao_vien.create','GiaoVien','9','Tạo hồ sơ giáo viên Giáo viên Test Tiếng Anh (GV000001).',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1150,1,2,'lop_hoc.create','LopHoc','11','Tạo lớp English A2 Test Full (LOP0001).',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1151,1,2,'lop_hoc.set_status','LopHoc','11','Đổi trạng thái lớp English A2 Test Full sang dang_hoc.',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1152,1,2,'lop_hoc.assign_teacher','LopHocGiaoVien','9','Phân công giáo viên Giáo viên Test Tiếng Anh (GV000001) vào lớp English A2 Test Full.',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1153,1,2,'hoc_sinh.create','HocSinh','42','Tạo hồ sơ học sinh Test Học viên Minh (HS20260001).',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1154,1,2,'hoc_sinh.set_status','HocSinh','42','Đổi trạng thái học sinh Test Học viên Minh (HS20260001) từ tiep_nhan sang dang_hoc.',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1155,1,2,'lop_hoc.enroll_student','HocSinhLopHoc','32','Xếp học sinh Test Học viên Minh (HS20260001) vào lớp English A2 Test Full.',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1156,1,2,'hoc_sinh.create','HocSinh','43','Tạo hồ sơ học sinh Test Học viên Ngọc (HS20260002).',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1157,1,2,'hoc_sinh.set_status','HocSinh','43','Đổi trạng thái học sinh Test Học viên Ngọc (HS20260002) từ tiep_nhan sang dang_hoc.',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1158,1,2,'lop_hoc.enroll_student','HocSinhLopHoc','33','Xếp học sinh Test Học viên Ngọc (HS20260002) vào lớp English A2 Test Full.',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1159,1,2,'hoc_sinh.create','HocSinh','44','Tạo hồ sơ học sinh Test Học viên Phúc (HS20260003).',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1160,1,2,'hoc_sinh.set_status','HocSinh','44','Đổi trạng thái học sinh Test Học viên Phúc (HS20260003) từ tiep_nhan sang dang_hoc.',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1161,1,2,'lop_hoc.enroll_student','HocSinhLopHoc','34','Xếp học sinh Test Học viên Phúc (HS20260003) vào lớp English A2 Test Full.',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1162,1,2,'hoc_sinh.create','HocSinh','45','Tạo hồ sơ học sinh Test Học viên Trang (HS20260004).',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1163,1,2,'hoc_sinh.set_status','HocSinh','45','Đổi trạng thái học sinh Test Học viên Trang (HS20260004) từ tiep_nhan sang dang_hoc.',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1164,1,2,'lop_hoc.enroll_student','HocSinhLopHoc','35','Xếp học sinh Test Học viên Trang (HS20260004) vào lớp English A2 Test Full.',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1165,1,2,'hoc_sinh.add_guardian_cross_org','HocSinhPhuHuynh','32','Thêm phụ huynh Nguyễn Minh Anh (PH000001, hồ sơ gốc ở đơn vị #3) cho học sinh Test Học viên Minh (HS20260001) — đã xác nhận dùng chung hồ sơ khác đơn vị.',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1166,1,2,'hoc_sinh.guardian_account_existing','PhuHuynh','26','Phụ huynh Nguyễn Minh Anh (PH000001) đã có tài khoản, không tạo mới.',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1167,42,2,'hoc_sinh.them_danh_gia','HocSinhLopHocDanhGia','9','Ghi nhận kết quả học tập (theo_thang) cho lượt xếp lớp #32.',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1168,43,2,'thong_bao.create','ThongBao','7','Tạo thông báo TB20260001 (Thông báo lịch học tháng 07).',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1169,1,2,'lich_hoc.create','LichHoc',NULL,'Tạo 3 quy tắc lịch học cho lớp English A2 Test Full.','\"{\\\"lopHocId\\\":11,\\\"thuTrongTuanList\\\":[2,4,6]}\"','thong_tin',NULL,'2026-07-28 22:24:49'),(1170,1,2,'lich_hoc.generate_sessions','LichHoc','39','Sinh 4 buổi học đến ngày 2026-08-25.','\"{\\\"lopHocId\\\":11,\\\"ngayHocList\\\":[\\\"2026-08-03\\\",\\\"2026-08-10\\\",\\\"2026-08-17\\\",\\\"2026-08-24\\\"]}\"','thong_tin',NULL,'2026-07-28 22:24:49'),(1171,1,2,'lich_hoc.generate_sessions','LichHoc','40','Sinh 4 buổi học đến ngày 2026-08-25.','\"{\\\"lopHocId\\\":11,\\\"ngayHocList\\\":[\\\"2026-07-29\\\",\\\"2026-08-05\\\",\\\"2026-08-12\\\",\\\"2026-08-19\\\"]}\"','thong_tin',NULL,'2026-07-28 22:24:49'),(1172,1,2,'lich_hoc.generate_sessions','LichHoc','41','Sinh 4 buổi học đến ngày 2026-08-25.','\"{\\\"lopHocId\\\":11,\\\"ngayHocList\\\":[\\\"2026-07-31\\\",\\\"2026-08-07\\\",\\\"2026-08-14\\\",\\\"2026-08-21\\\"]}\"','thong_tin',NULL,'2026-07-28 22:24:49'),(1173,44,2,'khoan_thu.create','DanhMucKhoanThu','15','Tạo khoản thu Học phí khóa A2 test (KT001).',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1174,44,2,'khoan_thu.create','DanhMucKhoanThu','16','Tạo khoản thu Giáo trình A2 test (KT002).',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1175,44,2,'ky_thu.create','KyThu','10','Tạo kỳ thu Kỳ thu test khóa tiếng Anh 2026-07 (KY20260001).',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1176,44,2,'ky_thu.set_khoan_ap_dung','KyThu','10','Cập nhật 2 khoản thu áp dụng cho kỳ thu Kỳ thu test khóa tiếng Anh 2026-07.',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1177,44,2,'ky_thu.mo','KyThu','10','Mở kỳ thu Kỳ thu test khóa tiếng Anh 2026-07 (KY20260001).',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1178,44,2,'khoan_phai_thu.sinh_theo_lop','KyThu','10','Sinh khoản phải thu cho lớp English A2 Test Full — kỳ thu Kỳ thu test khóa tiếng Anh 2026-07: tạo mới 4, bỏ qua 0 (đã có sẵn).',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1179,44,2,'phieu_thu.create','PhieuThu','14','Thu 500000.00 cho khoản phải thu #25 — phiếu PT202600001.',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1180,44,2,'phieu_thu.create','PhieuThu','15','Thu 2300000.00 cho khoản phải thu #26 — phiếu PT202600002.',NULL,'thong_tin',NULL,'2026-07-28 22:24:49'),(1181,41,3,'auth.login','PhienDangNhap','178','Đăng nhập thành công.',NULL,'thong_tin','127.0.0.1','2026-07-28 22:28:07'),(1182,41,3,'auth.logout','PhienDangNhap','178','Đăng xuất.',NULL,'thong_tin','127.0.0.1','2026-07-28 22:29:58'),(1183,37,3,'auth.login','PhienDangNhap','179','Đăng nhập thành công.',NULL,'thong_tin','127.0.0.1','2026-07-28 22:30:04'),(1184,37,3,'auth.logout','PhienDangNhap','179','Đăng xuất.',NULL,'thong_tin','127.0.0.1','2026-07-28 22:30:32'),(1185,39,3,'auth.login','PhienDangNhap','180','Đăng nhập thành công.',NULL,'thong_tin','127.0.0.1','2026-07-28 22:30:33'),(1186,39,3,'auth.logout','PhienDangNhap','180','Đăng xuất.',NULL,'thong_tin','127.0.0.1','2026-07-28 22:30:43'),(1187,1,3,'hoc_sinh.guardian_account_existing','PhuHuynh','26','Phụ huynh Nguyễn Minh Anh (PH000001) đã có tài khoản, không tạo mới.',NULL,'thong_tin',NULL,'2026-07-28 22:55:25'),(1188,39,3,'khoan_phai_thu.sinh_theo_lop','KyThu','9','Sinh khoản phải thu cho lớp Lá Test Full — kỳ thu Kỳ thu test mầm non 2026-07: tạo mới 0, bỏ qua 5 (đã có sẵn).',NULL,'thong_tin',NULL,'2026-07-28 22:55:25'),(1189,1,2,'hoc_sinh.guardian_account_existing','PhuHuynh','26','Phụ huynh Nguyễn Minh Anh (PH000001) đã có tài khoản, không tạo mới.',NULL,'thong_tin',NULL,'2026-07-28 22:55:27'),(1190,44,2,'khoan_phai_thu.sinh_theo_lop','KyThu','10','Sinh khoản phải thu cho lớp English A2 Test Full — kỳ thu Kỳ thu test khóa tiếng Anh 2026-07: tạo mới 0, bỏ qua 4 (đã có sẵn).',NULL,'thong_tin',NULL,'2026-07-28 22:55:27'),(1191,1,NULL,'auth.login_failed','NguoiDung','1','Sai mật khẩu.',NULL,'canh_bao','127.0.0.1','2026-07-28 22:55:43'),(1192,40,3,'auth.login','PhienDangNhap','181','Đăng nhập thành công.',NULL,'thong_tin','127.0.0.1','2026-07-28 22:55:49'),(1193,1,3,'auth.select_organization','DonVi','3','Chọn đơn vị Trường Mầm non Hoa Nắng.',NULL,'thong_tin','127.0.0.1','2026-07-29 07:04:09'),(1194,1,3,'auth.select_organization','DonVi','3','Chọn đơn vị Trường Mầm non Hoa Nắng.',NULL,'thong_tin','127.0.0.1','2026-07-29 07:04:09'),(1195,1,1,'auth.select_organization','DonVi','1','Chọn đơn vị Hệ thống quản lý giáo dục.',NULL,'thong_tin','127.0.0.1','2026-07-29 07:04:25'),(1196,1,1,'auth.select_organization','DonVi','1','Chọn đơn vị Hệ thống quản lý giáo dục.',NULL,'thong_tin','127.0.0.1','2026-07-29 07:04:25'),(1197,1,3,'auth.select_organization','DonVi','3','Chọn đơn vị Trường Mầm non Hoa Nắng.',NULL,'thong_tin','127.0.0.1','2026-07-29 10:49:16'),(1198,1,NULL,'auth.login_failed','NguoiDung','1','Sai mật khẩu.',NULL,'canh_bao','127.0.0.1','2026-07-29 10:55:59'),(1199,1,1,'auth.select_organization','DonVi','1','Chọn đơn vị Hệ thống quản lý giáo dục.',NULL,'thong_tin','127.0.0.1','2026-07-30 10:38:25'),(1200,1,2,'auth.select_organization','DonVi','2','Chọn đơn vị Trung tâm Ngoại ngữ Quận 8.',NULL,'thong_tin','127.0.0.1','2026-07-30 10:48:08'),(1201,1,2,'auth.logout','PhienDangNhap','177','Đăng xuất.',NULL,'thong_tin','127.0.0.1','2026-07-30 10:48:29'),(1202,1,NULL,'auth.login','PhienDangNhap','182','Đăng nhập thành công.',NULL,'thong_tin','127.0.0.1','2026-07-30 10:48:37'),(1203,1,1,'auth.select_organization','DonVi','1','Chọn đơn vị Hệ thống quản lý giáo dục.',NULL,'thong_tin','127.0.0.1','2026-07-30 10:48:39'),(1204,1,2,'auth.select_organization','DonVi','2','Chọn đơn vị Trung tâm Ngoại ngữ Quận 8.',NULL,'thong_tin','127.0.0.1','2026-07-30 10:48:42'),(1205,1,2,'user.reset_password','NguoiDung','45','Đặt lại mật khẩu tài khoản demo_quanly_nn và thu hồi toàn bộ phiên đăng nhập.',NULL,'thong_tin','127.0.0.1','2026-07-30 10:48:53'),(1206,45,2,'auth.login','PhienDangNhap','183','Đăng nhập thành công.',NULL,'thong_tin','127.0.0.1','2026-07-30 10:49:14'),(1207,45,2,'auth.change_password','NguoiDung','45','Đổi mật khẩu thành công.',NULL,'thong_tin','127.0.0.1','2026-07-30 10:49:24'),(1208,45,2,'giao_vien.create','GiaoVien','10','Tạo hồ sơ giáo viên Demo GV Tiếng Anh (GV000002).',NULL,'thong_tin','127.0.0.1','2026-07-30 10:49:56'),(1209,45,2,'giao_vien.create_account','GiaoVien','10','Tạo tài khoản đăng nhập 09090909019 cho giáo viên Demo GV Tiếng Anh (GV000002).',NULL,'thong_tin','127.0.0.1','2026-07-30 10:50:00'),(1210,48,2,'auth.login','PhienDangNhap','184','Đăng nhập thành công.',NULL,'thong_tin','127.0.0.1','2026-07-30 10:51:15'),(1211,48,2,'auth.change_password','NguoiDung','48','Đổi mật khẩu thành công.',NULL,'thong_tin','127.0.0.1','2026-07-30 10:51:29'),(1212,1,2,'lop_hoc.end_enrollment','HocSinhLopHoc','34','Kết thúc xếp lớp, trạng thái hoan_thanh.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:02:35'),(1213,1,2,'hoc_sinh.create','HocSinh','46','Tạo hồ sơ học sinh Trần Linh Huyền (HS20260005).',NULL,'thong_tin','127.0.0.1','2026-07-30 11:03:11'),(1214,1,2,'lop_hoc.enroll_student','HocSinhLopHoc','36','Xếp học sinh Trần Linh Huyền (HS20260005) vào lớp English A2 Test Full.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:03:16'),(1215,1,2,'phieu_xep_lop.create','PhieuXepLop','1','Lập phiếu xếp lớp XL202600001 cho hồ sơ xếp lớp #36.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:03:22'),(1216,1,2,'phieu_nhap_hoc.create','PhieuNhapHoc','1','Lập phiếu xác nhận nhập học NH202600001 cho học sinh Trần Linh Huyền (HS20260005).',NULL,'thong_tin','127.0.0.1','2026-07-30 11:03:40'),(1217,1,2,'phieu_thu.create','PhieuThu','16','Thu 1800000.00 cho khoản phải thu #25 — phiếu PT202600003.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:04:19'),(1218,1,1,'auth.select_organization','DonVi','1','Chọn đơn vị Hệ thống quản lý giáo dục.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:06:35'),(1219,1,2,'auth.select_organization','DonVi','2','Chọn đơn vị Trung tâm Ngoại ngữ Quận 8.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:06:36'),(1220,1,2,'auth.select_organization','DonVi','2','Chọn đơn vị Trung tâm Ngoại ngữ Quận 8.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:06:37'),(1221,1,1,'auth.select_organization','DonVi','1','Chọn đơn vị Hệ thống quản lý giáo dục.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:06:40'),(1222,1,1,'auth.select_organization','DonVi','1','Chọn đơn vị Hệ thống quản lý giáo dục.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:06:40'),(1223,1,2,'auth.select_organization','DonVi','2','Chọn đơn vị Trung tâm Ngoại ngữ Quận 8.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:08:16'),(1224,1,2,'auth.select_organization','DonVi','2','Chọn đơn vị Trung tâm Ngoại ngữ Quận 8.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:08:17'),(1225,40,3,'giao_vien.create','GiaoVien','11','Tạo hồ sơ giáo viên Nguyễn Văn Phúc (GV000002).',NULL,'thong_tin','127.0.0.1','2026-07-30 11:49:16'),(1226,40,3,'giao_vien.create_account','GiaoVien','11','Tạo tài khoản đăng nhập gv_phuc.nguyen cho giáo viên Nguyễn Văn Phúc (GV000002).',NULL,'thong_tin','127.0.0.1','2026-07-30 11:49:36'),(1227,40,3,'auth.logout','PhienDangNhap','181','Đăng xuất.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:53:04'),(1228,45,NULL,'auth.login_failed','NguoiDung','45','Sai mật khẩu.',NULL,'canh_bao','127.0.0.1','2026-07-30 11:53:10'),(1229,45,NULL,'auth.login_failed','NguoiDung','45','Sai mật khẩu.',NULL,'canh_bao','127.0.0.1','2026-07-30 11:53:33'),(1230,43,2,'auth.login','PhienDangNhap','185','Đăng nhập thành công.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:53:46'),(1231,1,1,'auth.select_organization','DonVi','1','Chọn đơn vị Hệ thống quản lý giáo dục.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:59:46'),(1232,1,2,'auth.select_organization','DonVi','2','Chọn đơn vị Trung tâm Ngoại ngữ Quận 8.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:59:49'),(1233,1,3,'auth.select_organization','DonVi','3','Chọn đơn vị Trường Mầm non Hoa Nắng.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:59:50'),(1234,1,2,'auth.select_organization','DonVi','2','Chọn đơn vị Trung tâm Ngoại ngữ Quận 8.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:59:52'),(1235,1,2,'auth.select_organization','DonVi','2','Chọn đơn vị Trung tâm Ngoại ngữ Quận 8.',NULL,'thong_tin','127.0.0.1','2026-07-30 11:59:52'),(1236,1,2,'phieu_thu.create','PhieuThu','17','Thu 2300000.00 cho khoản phải thu #27 — phiếu PT202600004.',NULL,'thong_tin','127.0.0.1','2026-07-30 12:00:10'),(1237,1,2,'giao_vien.create','GiaoVien','12','Tạo hồ sơ giáo viên Trần Văn Linh (GV000003).',NULL,'thong_tin','127.0.0.1','2026-07-30 12:03:55'),(1238,1,2,'giao_vien.create_account','GiaoVien','12','Tạo tài khoản đăng nhập gv_linh.tran cho giáo viên Trần Văn Linh (GV000003).',NULL,'thong_tin','127.0.0.1','2026-07-30 12:04:01');
/*!40000 ALTER TABLE `nhatkyhethong` ENABLE KEYS */;

--
-- Table structure for table `phiendangnhap`
--

DROP TABLE IF EXISTS `phiendangnhap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phiendangnhap` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nguoiDungId` bigint unsigned NOT NULL,
  `donViHienTaiId` bigint unsigned DEFAULT NULL,
  `maPhienHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `diaChiIp` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hetHanLuc` datetime NOT NULL,
  `huyLuc` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_PhienDangNhap_maPhienHash` (`maPhienHash`),
  KEY `IX_PhienDangNhap_nguoiDungId` (`nguoiDungId`),
  KEY `IX_PhienDangNhap_donViHienTaiId` (`donViHienTaiId`),
  KEY `IX_PhienDangNhap_hetHanLuc` (`hetHanLuc`),
  CONSTRAINT `FK_PhienDangNhap_donViHienTai` FOREIGN KEY (`donViHienTaiId`) REFERENCES `donvi` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_PhienDangNhap_nguoiDung` FOREIGN KEY (`nguoiDungId`) REFERENCES `nguoidung` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=186 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phiendangnhap`
--

/*!40000 ALTER TABLE `phiendangnhap` DISABLE KEYS */;
INSERT INTO `phiendangnhap` VALUES (177,1,2,'db49378a44715d6586ffee92b75dd0c70dc5ed36c54705b6d60a64cd4fb1ab2d','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0','2026-08-04 22:03:00','2026-07-30 10:48:29','2026-07-28 22:03:00','2026-07-30 10:48:29'),(178,41,3,'1817e49c435e713d7eb8c5fd0c8f034780e6684ba2a48bd10ef28e8477ff5a71','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','2026-08-04 22:28:07','2026-07-28 22:29:58','2026-07-28 22:28:07','2026-07-28 22:29:58'),(179,37,3,'ff775403599e3577418741fc91a0c265f2574376a528e45f1929f8fdc8a1971e','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','2026-08-04 22:30:04','2026-07-28 22:30:32','2026-07-28 22:30:04','2026-07-28 22:30:32'),(180,39,3,'8c33888fc176e8d545b64f04cea71de710e9e955aada2143b8132985e92ce574','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','2026-08-04 22:30:33','2026-07-28 22:30:43','2026-07-28 22:30:33','2026-07-28 22:30:43'),(181,40,3,'ae9d3580b536f91454a62ed761356b9e102245bdc0311dbd06431baabc1e8ea9','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','2026-08-04 22:55:49','2026-07-30 11:53:04','2026-07-28 22:55:49','2026-07-30 11:53:04'),(182,1,2,'c2394c7e90dd99fa9041271ace91c5493b14c318f39b45087cc73b57c9e8ee42','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0','2026-08-06 10:48:37',NULL,'2026-07-30 10:48:37','2026-07-30 11:59:52'),(183,45,2,'e15fd52ec539d7b6fabf74d82cbc5206f50c682d88f152a9307747d9e18ed0e6','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','2026-08-06 10:49:14',NULL,'2026-07-30 10:49:14','2026-07-30 10:49:14'),(184,48,2,'831708c5e70b1872a92ff8dfc84c8347bcde9a77db5a64a68ebcba40bde486db','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','2026-08-06 10:51:15',NULL,'2026-07-30 10:51:15','2026-07-30 10:51:15'),(185,43,2,'8ea578a271f96c46f109c9050712d30efa79523905f3f4a6d467689d4b7672a0','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','2026-08-06 11:53:46',NULL,'2026-07-30 11:53:46','2026-07-30 11:53:46');
/*!40000 ALTER TABLE `phiendangnhap` ENABLE KEYS */;

--
-- Table structure for table `phieunhaphoc`
--

DROP TABLE IF EXISTS `phieunhaphoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieunhaphoc` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `hocSinhId` bigint unsigned NOT NULL,
  `soPhieu` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngayNhapHoc` date NOT NULL,
  `nguoiLapId` bigint unsigned NOT NULL,
  `ghiChu` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_PhieuNhapHoc_donViId_soPhieu` (`donViId`,`soPhieu`),
  KEY `IX_PhieuNhapHoc_hocSinhId` (`hocSinhId`),
  KEY `FK_PhieuNhapHoc_NguoiLap` (`nguoiLapId`),
  CONSTRAINT `FK_PhieuNhapHoc_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `FK_PhieuNhapHoc_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `FK_PhieuNhapHoc_NguoiLap` FOREIGN KEY (`nguoiLapId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieunhaphoc`
--

/*!40000 ALTER TABLE `phieunhaphoc` DISABLE KEYS */;
INSERT INTO `phieunhaphoc` VALUES (1,2,46,'NH202600001','2026-07-30',1,NULL,'2026-07-30 04:03:40');
/*!40000 ALTER TABLE `phieunhaphoc` ENABLE KEYS */;

--
-- Table structure for table `phieuthu`
--

DROP TABLE IF EXISTS `phieuthu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieuthu` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `khoanPhaiThuId` bigint unsigned NOT NULL,
  `hocSinhId` bigint unsigned NOT NULL,
  `soPhieu` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soTien` decimal(18,2) NOT NULL,
  `phuongThuc` enum('tien_mat','chuyen_khoan','the','khac') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ghiChu` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nguoiThuId` bigint unsigned NOT NULL,
  `ngayThu` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_PhieuThu_donViId_soPhieu` (`donViId`,`soPhieu`),
  KEY `IX_PhieuThu_khoanPhaiThuId` (`khoanPhaiThuId`),
  KEY `IX_PhieuThu_hocSinhId` (`hocSinhId`),
  KEY `FK_PhieuThu_NguoiThu` (`nguoiThuId`),
  CONSTRAINT `FK_PhieuThu_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `FK_PhieuThu_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `FK_PhieuThu_KhoanPhaiThu` FOREIGN KEY (`khoanPhaiThuId`) REFERENCES `khoanphaithu` (`id`),
  CONSTRAINT `FK_PhieuThu_NguoiThu` FOREIGN KEY (`nguoiThuId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieuthu`
--

/*!40000 ALTER TABLE `phieuthu` DISABLE KEYS */;
INSERT INTO `phieuthu` VALUES (12,3,20,37,'PT202600001',500000.00,'chuyen_khoan','Phiếu thu một phần cho dữ liệu test.',39,'2026-07-28 22:24:47','2026-07-28 22:24:47'),(13,3,21,38,'PT202600002',4200000.00,'tien_mat','Phiếu thu đủ cho dữ liệu test.',39,'2026-07-28 22:24:47','2026-07-28 22:24:47'),(14,2,25,42,'PT202600001',500000.00,'chuyen_khoan','Phiếu thu một phần cho dữ liệu test.',44,'2026-07-28 22:24:49','2026-07-28 22:24:49'),(15,2,26,43,'PT202600002',2300000.00,'tien_mat','Phiếu thu đủ cho dữ liệu test.',44,'2026-07-28 22:24:49','2026-07-28 22:24:49'),(16,2,25,42,'PT202600003',1800000.00,'tien_mat',NULL,1,'2026-07-30 11:04:19','2026-07-30 11:04:19'),(17,2,27,44,'PT202600004',2300000.00,'tien_mat',NULL,1,'2026-07-30 12:00:10','2026-07-30 12:00:10');
/*!40000 ALTER TABLE `phieuthu` ENABLE KEYS */;

--
-- Table structure for table `phieuxeplop`
--

DROP TABLE IF EXISTS `phieuxeplop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieuxeplop` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `enrollmentId` bigint unsigned NOT NULL,
  `hocSinhId` bigint unsigned NOT NULL,
  `lopHocId` bigint unsigned NOT NULL,
  `soPhieu` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nguoiLapId` bigint unsigned NOT NULL,
  `ghiChu` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_PhieuXepLop_donViId_soPhieu` (`donViId`,`soPhieu`),
  KEY `IX_PhieuXepLop_enrollmentId` (`enrollmentId`),
  KEY `IX_PhieuXepLop_hocSinhId` (`hocSinhId`),
  KEY `FK_PhieuXepLop_LopHoc` (`lopHocId`),
  KEY `FK_PhieuXepLop_NguoiLap` (`nguoiLapId`),
  CONSTRAINT `FK_PhieuXepLop_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `FK_PhieuXepLop_Enrollment` FOREIGN KEY (`enrollmentId`) REFERENCES `hocsinhlophoc` (`id`),
  CONSTRAINT `FK_PhieuXepLop_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `FK_PhieuXepLop_LopHoc` FOREIGN KEY (`lopHocId`) REFERENCES `lophoc` (`id`),
  CONSTRAINT `FK_PhieuXepLop_NguoiLap` FOREIGN KEY (`nguoiLapId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieuxeplop`
--

/*!40000 ALTER TABLE `phieuxeplop` DISABLE KEYS */;
INSERT INTO `phieuxeplop` VALUES (1,2,36,46,11,'XL202600001',1,NULL,'2026-07-30 04:03:22');
/*!40000 ALTER TABLE `phieuxeplop` ENABLE KEYS */;

--
-- Table structure for table `phuhuynh`
--

DROP TABLE IF EXISTS `phuhuynh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phuhuynh` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `nguoiDungId` bigint unsigned DEFAULT NULL,
  `maPhuHuynh` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hoTen` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngaySinh` date DEFAULT NULL,
  `gioiTinh` enum('nam','nu','khac') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dienThoai` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngheNghiep` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diaChi` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` enum('hoat_dong','ngung_hoat_dong') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_PhuHuynh_donViId_maPhuHuynh` (`donViId`,`maPhuHuynh`),
  KEY `IX_PhuHuynh_donViId` (`donViId`),
  KEY `IX_PhuHuynh_donViId_dienThoai` (`donViId`,`dienThoai`),
  KEY `FK_PhuHuynh_NguoiDung` (`nguoiDungId`),
  CONSTRAINT `FK_PhuHuynh_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `FK_PhuHuynh_NguoiDung` FOREIGN KEY (`nguoiDungId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phuhuynh`
--

/*!40000 ALTER TABLE `phuhuynh` DISABLE KEYS */;
INSERT INTO `phuhuynh` VALUES (26,3,41,'PH000001','Nguyễn Minh Anh',NULL,NULL,'0988002026','phuhuynh.demo@example.com','Nhân viên văn phòng','Quận 8, Thành phố Hồ Chí Minh','hoat_dong','2026-07-28 15:24:47','2026-07-28 15:24:47');
/*!40000 ALTER TABLE `phuhuynh` ENABLE KEYS */;

--
-- Table structure for table `quyen`
--

DROP TABLE IF EXISTS `quyen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quyen` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `maQuyen` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenQuyen` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nhomQuyen` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moTa` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dangHoatDong` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_Quyen_maQuyen` (`maQuyen`),
  KEY `IX_Quyen_nhomQuyen` (`nhomQuyen`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quyen`
--

/*!40000 ALTER TABLE `quyen` DISABLE KEYS */;
INSERT INTO `quyen` VALUES (1,'he_thong.quan_tri','Quản trị hệ thống','Hệ thống',NULL,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(2,'don_vi.xem','Xem đơn vị','Đơn vị',NULL,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(3,'don_vi.quan_ly','Quản lý đơn vị','Đơn vị',NULL,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(4,'nguoi_dung.xem','Xem người dùng','Người dùng',NULL,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(5,'nguoi_dung.quan_ly','Quản lý người dùng','Người dùng',NULL,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(6,'phan_quyen.xem','Xem phân quyền','Phân quyền',NULL,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(7,'phan_quyen.quan_ly','Quản lý phân quyền','Phân quyền',NULL,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(8,'tuyen_sinh.xem','Xem tuyển sinh','Tuyển sinh',NULL,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(9,'tuyen_sinh.quan_ly','Quản lý tuyển sinh','Tuyển sinh',NULL,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(10,'hoc_sinh.xem','Xem học sinh','Học sinh',NULL,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(11,'hoc_sinh.quan_ly','Quản lý học sinh','Học sinh',NULL,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(12,'lop_hoc.xem','Xem lớp học','Lớp học',NULL,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(13,'lop_hoc.quan_ly','Quản lý lớp học','Lớp học',NULL,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(14,'diem_danh.xem','Xem điểm danh','Điểm danh',NULL,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(15,'diem_danh.thuc_hien','Thực hiện điểm danh','Điểm danh',NULL,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(16,'tai_chinh.xem','Xem tài chính','Tài chính',NULL,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(17,'tai_chinh.quan_ly','Quản lý tài chính','Tài chính',NULL,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(18,'hoc_tap.xem','Xem báo giảng','Học tập',NULL,1,'2026-07-21 21:09:05','2026-07-21 21:09:05'),(19,'hoc_tap.ghi_nhan','Ghi nhận báo giảng','Học tập',NULL,1,'2026-07-21 21:09:05','2026-07-21 21:09:05'),(20,'tai_chinh.duyet','Duyệt điều chỉnh tài chính','Tài chính',NULL,1,'2026-07-22 21:21:13','2026-07-22 21:21:13');
/*!40000 ALTER TABLE `quyen` ENABLE KEYS */;

--
-- Table structure for table `thongbao`
--

DROP TABLE IF EXISTS `thongbao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thongbao` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `maThongBao` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tieuDe` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `noiDung` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tepDinhKemTen` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tepDinhKemUrl` text COLLATE utf8mb4_unicode_ci,
  `phamVi` enum('toan_truong','theo_lop','ca_nhan') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'toan_truong',
  `lopHocId` bigint unsigned DEFAULT NULL,
  `hocSinhId` bigint unsigned DEFAULT NULL,
  `doiTuong` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nguoiTaoId` bigint unsigned NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_ThongBao_donViId_maThongBao` (`donViId`,`maThongBao`),
  KEY `IX_ThongBao_donViId` (`donViId`),
  KEY `IX_ThongBao_donViId_phamVi` (`donViId`,`phamVi`),
  KEY `IX_ThongBao_nguoiTaoId` (`nguoiTaoId`),
  KEY `IX_ThongBao_lopHocId` (`lopHocId`),
  KEY `IX_ThongBao_hocSinhId` (`hocSinhId`),
  CONSTRAINT `FK_ThongBao_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `FK_ThongBao_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `FK_ThongBao_LopHoc` FOREIGN KEY (`lopHocId`) REFERENCES `lophoc` (`id`),
  CONSTRAINT `FK_ThongBao_NguoiTao` FOREIGN KEY (`nguoiTaoId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thongbao`
--

/*!40000 ALTER TABLE `thongbao` DISABLE KEYS */;
INSERT INTO `thongbao` VALUES (6,3,'TB20260001','Thông báo sinh hoạt tháng 07','Nhà trường thông báo kế hoạch chăm sóc, giáo dục và hoạt động trải nghiệm trong tháng. Phụ huynh vui lòng theo dõi trên Portal.',NULL,NULL,'toan_truong',NULL,NULL,NULL,38,'2026-07-28 22:24:47','2026-07-28 22:24:47'),(7,2,'TB20260001','Thông báo lịch học tháng 07','Trung tâm thông báo lịch học và hoạt động bổ trợ trong tháng. Phụ huynh vui lòng theo dõi lịch trên Portal.',NULL,NULL,'toan_truong',NULL,NULL,NULL,43,'2026-07-28 22:24:49','2026-07-28 22:24:49');
/*!40000 ALTER TABLE `thongbao` ENABLE KEYS */;

--
-- Table structure for table `thongbaodadoc`
--

DROP TABLE IF EXISTS `thongbaodadoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thongbaodadoc` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `thongBaoId` bigint unsigned NOT NULL,
  `nguoiDungId` bigint unsigned NOT NULL,
  `daDocAt` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_ThongBaoDaDoc_thongBaoId_nguoiDungId` (`thongBaoId`,`nguoiDungId`),
  KEY `IX_ThongBaoDaDoc_thongBaoId` (`thongBaoId`),
  KEY `IX_ThongBaoDaDoc_nguoiDungId` (`nguoiDungId`),
  CONSTRAINT `FK_ThongBaoDaDoc_NguoiDung` FOREIGN KEY (`nguoiDungId`) REFERENCES `nguoidung` (`id`),
  CONSTRAINT `FK_ThongBaoDaDoc_ThongBao` FOREIGN KEY (`thongBaoId`) REFERENCES `thongbao` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thongbaodadoc`
--

/*!40000 ALTER TABLE `thongbaodadoc` DISABLE KEYS */;
/*!40000 ALTER TABLE `thongbaodadoc` ENABLE KEYS */;

--
-- Table structure for table `thongbaosukien`
--

DROP TABLE IF EXISTS `thongbaosukien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thongbaosukien` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `nguoiNhanId` bigint unsigned NOT NULL,
  `loaiSuKien` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tieuDe` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `noiDung` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `duongDan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `daHienThi` tinyint(1) NOT NULL DEFAULT '0',
  `daHienThiAt` datetime DEFAULT NULL,
  `daDoc` tinyint(1) NOT NULL DEFAULT '0',
  `daDocAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_ThongBaoSuKien_donViId_nguoiNhanId_daHienThi` (`donViId`,`nguoiNhanId`,`daHienThi`),
  KEY `IX_ThongBaoSuKien_donViId_nguoiNhanId_daDoc` (`donViId`,`nguoiNhanId`,`daDoc`),
  KEY `FK_ThongBaoSuKien_NguoiNhan` (`nguoiNhanId`),
  CONSTRAINT `FK_ThongBaoSuKien_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `FK_ThongBaoSuKien_NguoiNhan` FOREIGN KEY (`nguoiNhanId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thongbaosukien`
--

/*!40000 ALTER TABLE `thongbaosukien` DISABLE KEYS */;
/*!40000 ALTER TABLE `thongbaosukien` ENABLE KEYS */;

--
-- Table structure for table `traodoihocsinh`
--

DROP TABLE IF EXISTS `traodoihocsinh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `traodoihocsinh` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donViId` bigint unsigned NOT NULL,
  `hocSinhId` bigint unsigned NOT NULL,
  `lopHocId` bigint unsigned DEFAULT NULL,
  `nguoiGuiVaiTro` enum('giao_vien','phu_huynh','hoc_vu','khac') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoc_vu',
  `kenhLienLac` enum('truc_tiep','dien_thoai','nhan_tin','email','khac') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'truc_tiep',
  `noiDung` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ketQua` text COLLATE utf8mb4_unicode_ci,
  `nguoiTaoId` bigint unsigned NOT NULL,
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_TraoDoiHocSinh_donViId` (`donViId`),
  KEY `IX_TraoDoiHocSinh_hocSinhId` (`hocSinhId`),
  KEY `IX_TraoDoiHocSinh_lopHocId` (`lopHocId`),
  KEY `IX_TraoDoiHocSinh_createdAt` (`createdAt`),
  KEY `FK_TraoDoiHocSinh_NguoiDung` (`nguoiTaoId`),
  CONSTRAINT `FK_TraoDoiHocSinh_DonVi` FOREIGN KEY (`donViId`) REFERENCES `donvi` (`id`),
  CONSTRAINT `FK_TraoDoiHocSinh_HocSinh` FOREIGN KEY (`hocSinhId`) REFERENCES `hocsinh` (`id`),
  CONSTRAINT `FK_TraoDoiHocSinh_LopHoc` FOREIGN KEY (`lopHocId`) REFERENCES `lophoc` (`id`),
  CONSTRAINT `FK_TraoDoiHocSinh_NguoiDung` FOREIGN KEY (`nguoiTaoId`) REFERENCES `nguoidung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `traodoihocsinh`
--

/*!40000 ALTER TABLE `traodoihocsinh` DISABLE KEYS */;
/*!40000 ALTER TABLE `traodoihocsinh` ENABLE KEYS */;

--
-- Table structure for table `vaitro`
--

DROP TABLE IF EXISTS `vaitro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaitro` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `maVaiTro` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenVaiTro` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moTa` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phamVi` enum('he_thong','don_vi','cong_thong_tin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'don_vi',
  `laVaiTroHeThong` tinyint(1) NOT NULL DEFAULT '1',
  `dangHoatDong` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_VaiTro_maVaiTro` (`maVaiTro`),
  KEY `IX_VaiTro_phamVi` (`phamVi`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vaitro`
--

/*!40000 ALTER TABLE `vaitro` DISABLE KEYS */;
INSERT INTO `vaitro` VALUES (1,'quan_tri_he_thong','Quản trị hệ thống','Quản trị toàn bộ nền tảng','he_thong',1,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(2,'quan_ly_don_vi','Quản lý đơn vị','Quản lý một trường hoặc trung tâm','don_vi',1,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(3,'tuyen_sinh','Nhân viên tuyển sinh','Tiếp nhận và quản lý hồ sơ tuyển sinh','don_vi',1,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(4,'tu_van','Nhân viên tư vấn','Tư vấn chương trình và khóa học','don_vi',1,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(5,'hoc_vu','Nhân viên học vụ','Quản lý lớp học, lịch học và tiến độ đào tạo','don_vi',1,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(6,'ke_toan','Kế toán','Quản lý học phí, công nợ và phiếu thu','don_vi',1,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(7,'giao_vien','Giáo viên','Giảng dạy, điểm danh và đánh giá học tập','don_vi',1,1,'2026-07-20 15:06:10','2026-07-20 15:20:36'),(8,'phu_huynh','Phụ huynh','Truy cập cổng thông tin phụ huynh','cong_thong_tin',1,1,'2026-07-20 15:06:10','2026-07-20 15:20:36');
/*!40000 ALTER TABLE `vaitro` ENABLE KEYS */;

--
-- Table structure for table `vaitroquyen`
--

DROP TABLE IF EXISTS `vaitroquyen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaitroquyen` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `vaiTroId` int unsigned NOT NULL,
  `quyenId` int unsigned NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_VaiTroQuyen` (`vaiTroId`,`quyenId`),
  KEY `IX_VaiTroQuyen_vaiTroId` (`vaiTroId`),
  KEY `IX_VaiTroQuyen_quyenId` (`quyenId`),
  CONSTRAINT `FK_VaiTroQuyen_quyen` FOREIGN KEY (`quyenId`) REFERENCES `quyen` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_VaiTroQuyen_vaiTro` FOREIGN KEY (`vaiTroId`) REFERENCES `vaitro` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=187 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vaitroquyen`
--

/*!40000 ALTER TABLE `vaitroquyen` DISABLE KEYS */;
INSERT INTO `vaitroquyen` VALUES (64,1,1,'2026-07-25 10:01:18'),(65,1,2,'2026-07-25 10:01:18'),(66,1,3,'2026-07-25 10:01:18'),(67,1,4,'2026-07-25 10:01:18'),(68,1,5,'2026-07-25 10:01:18'),(69,1,6,'2026-07-25 10:01:18'),(70,1,7,'2026-07-25 10:01:18'),(71,1,8,'2026-07-25 10:01:18'),(72,1,9,'2026-07-25 10:01:18'),(73,1,10,'2026-07-25 10:01:18'),(74,1,11,'2026-07-25 10:01:18'),(75,1,12,'2026-07-25 10:01:18'),(76,1,13,'2026-07-25 10:01:18'),(77,1,14,'2026-07-25 10:01:18'),(78,1,15,'2026-07-25 10:01:18'),(79,1,16,'2026-07-25 10:01:18'),(80,1,17,'2026-07-25 10:01:18'),(95,2,2,'2026-07-20 22:20:58'),(96,2,3,'2026-07-20 22:20:58'),(97,2,4,'2026-07-20 22:20:58'),(98,2,5,'2026-07-20 22:20:58'),(99,2,6,'2026-07-20 22:20:58'),(100,2,8,'2026-07-20 22:20:58'),(101,2,9,'2026-07-20 22:20:58'),(102,2,10,'2026-07-20 22:20:58'),(103,2,11,'2026-07-20 22:20:58'),(104,2,12,'2026-07-20 22:20:58'),(105,2,13,'2026-07-20 22:20:58'),(106,2,14,'2026-07-20 22:20:58'),(107,2,15,'2026-07-20 22:20:58'),(108,2,16,'2026-07-20 22:20:58'),(109,2,17,'2026-07-20 22:20:58'),(110,3,10,'2026-07-20 22:20:58'),(111,3,9,'2026-07-20 22:20:58'),(112,3,8,'2026-07-20 22:20:58'),(113,4,10,'2026-07-20 22:20:58'),(114,4,8,'2026-07-20 22:20:58'),(116,5,14,'2026-07-20 22:20:58'),(117,5,11,'2026-07-20 22:20:58'),(118,5,10,'2026-07-20 22:20:58'),(119,5,13,'2026-07-20 22:20:58'),(120,5,12,'2026-07-20 22:20:58'),(123,6,10,'2026-07-20 22:20:58'),(124,6,17,'2026-07-20 22:20:58'),(125,6,16,'2026-07-20 22:20:58'),(126,7,15,'2026-07-20 22:20:58'),(127,7,14,'2026-07-20 22:20:58'),(128,7,10,'2026-07-20 22:20:58'),(129,7,12,'2026-07-20 22:20:58'),(136,4,9,'2026-07-21 09:24:13'),(137,2,18,'2026-07-21 21:09:05'),(138,2,19,'2026-07-21 21:09:05'),(139,7,18,'2026-07-21 21:09:05'),(140,7,19,'2026-07-21 21:09:05'),(144,5,18,'2026-07-21 21:09:05'),(160,1,18,'2026-07-25 10:01:18'),(161,1,19,'2026-07-25 10:01:18'),(164,1,20,'2026-07-25 10:01:18'),(185,2,20,'2026-07-25 10:01:18'),(186,3,12,'2026-07-27 06:51:14');
/*!40000 ALTER TABLE `vaitroquyen` ENABLE KEYS */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-30 14:06:22
