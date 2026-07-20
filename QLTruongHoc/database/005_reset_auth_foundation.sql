-- ============================================================
-- QLTruongHoc
-- Sprint 0B.1 - Reset & Create Auth Foundation
-- MySQL 8+
--
-- CANH BAO:
-- Script nay se xoa va tao lai cac bang nen tang dang nhap,
-- phan quyen va don vi.
-- Chi dung cho development khi chua co du lieu nghiep vu that.
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+07:00';
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS SchoolCenter
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE SchoolCenter;

DROP TABLE IF EXISTS NhatKyHeThong;
DROP TABLE IF EXISTS PhienDangNhap;
DROP TABLE IF EXISTS NguoiDungVaiTroDonVi;
DROP TABLE IF EXISTS VaiTroQuyen;
DROP TABLE IF EXISTS Quyen;
DROP TABLE IF EXISTS VaiTro;
DROP TABLE IF EXISTS NguoiDung;
DROP TABLE IF EXISTS DonVi;

CREATE TABLE DonVi (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    donViChaId BIGINT UNSIGNED NULL,
    maDonVi VARCHAR(50) NOT NULL,
    tenDonVi VARCHAR(255) NOT NULL,
    loaiDonVi ENUM(
        'he_thong',
        'truong',
        'trung_tam',
        'co_so'
    ) NOT NULL,
    loaiHinhDaoTao ENUM(
        'mam_non',
        'ngoai_ngu',
        'tin_hoc',
        'khac'
    ) NULL,
    diaChi VARCHAR(500) NULL,
    soDienThoai VARCHAR(30) NULL,
    email VARCHAR(255) NULL,
    trangThai ENUM(
        'hoat_dong',
        'tam_ngung',
        'ngung_hoat_dong'
    ) NOT NULL DEFAULT 'hoat_dong',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY UQ_DonVi_maDonVi (maDonVi),
    KEY IX_DonVi_donViChaId (donViChaId),
    KEY IX_DonVi_loaiDonVi (loaiDonVi),
    KEY IX_DonVi_trangThai (trangThai),
    CONSTRAINT FK_DonVi_donViCha
        FOREIGN KEY (donViChaId)
        REFERENCES DonVi(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE NguoiDung (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    tenDangNhap VARCHAR(100) NOT NULL,
    matKhauHash VARCHAR(255) NOT NULL,
    hoTen VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    soDienThoai VARCHAR(30) NULL,
    trangThai ENUM(
        'hoat_dong',
        'tam_khoa',
        'ngung'
    ) NOT NULL DEFAULT 'hoat_dong',
    batBuocDoiMatKhau TINYINT(1) NOT NULL DEFAULT 1,
    lanDangNhapCuoi DATETIME NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY UQ_NguoiDung_tenDangNhap (tenDangNhap),
    UNIQUE KEY UQ_NguoiDung_email (email),
    KEY IX_NguoiDung_trangThai (trangThai)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE VaiTro (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    maVaiTro VARCHAR(60) NOT NULL,
    tenVaiTro VARCHAR(150) NOT NULL,
    moTa VARCHAR(500) NULL,
    phamVi ENUM(
        'he_thong',
        'don_vi',
        'cong_thong_tin'
    ) NOT NULL DEFAULT 'don_vi',
    laVaiTroHeThong TINYINT(1) NOT NULL DEFAULT 1,
    dangHoatDong TINYINT(1) NOT NULL DEFAULT 1,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY UQ_VaiTro_maVaiTro (maVaiTro),
    KEY IX_VaiTro_phamVi (phamVi)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Quyen (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    maQuyen VARCHAR(100) NOT NULL,
    tenQuyen VARCHAR(180) NOT NULL,
    nhomQuyen VARCHAR(100) NOT NULL,
    moTa VARCHAR(500) NULL,
    dangHoatDong TINYINT(1) NOT NULL DEFAULT 1,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY UQ_Quyen_maQuyen (maQuyen),
    KEY IX_Quyen_nhomQuyen (nhomQuyen)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE VaiTroQuyen (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    vaiTroId INT UNSIGNED NOT NULL,
    quyenId INT UNSIGNED NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY UQ_VaiTroQuyen (vaiTroId, quyenId),
    KEY IX_VaiTroQuyen_vaiTroId (vaiTroId),
    KEY IX_VaiTroQuyen_quyenId (quyenId),
    CONSTRAINT FK_VaiTroQuyen_vaiTro
        FOREIGN KEY (vaiTroId)
        REFERENCES VaiTro(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT FK_VaiTroQuyen_quyen
        FOREIGN KEY (quyenId)
        REFERENCES Quyen(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE NguoiDungVaiTroDonVi (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nguoiDungId BIGINT UNSIGNED NOT NULL,
    vaiTroId INT UNSIGNED NOT NULL,
    donViId BIGINT UNSIGNED NOT NULL,
    dangHoatDong TINYINT(1) NOT NULL DEFAULT 1,
    tuNgay DATETIME NULL,
    denNgay DATETIME NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY UQ_NguoiDungVaiTroDonVi (
        nguoiDungId,
        vaiTroId,
        donViId
    ),
    KEY IX_NguoiDungVaiTroDonVi_nguoiDungId (nguoiDungId),
    KEY IX_NguoiDungVaiTroDonVi_vaiTroId (vaiTroId),
    KEY IX_NguoiDungVaiTroDonVi_donViId (donViId),
    CONSTRAINT FK_NguoiDungVaiTroDonVi_nguoiDung
        FOREIGN KEY (nguoiDungId)
        REFERENCES NguoiDung(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT FK_NguoiDungVaiTroDonVi_vaiTro
        FOREIGN KEY (vaiTroId)
        REFERENCES VaiTro(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT FK_NguoiDungVaiTroDonVi_donVi
        FOREIGN KEY (donViId)
        REFERENCES DonVi(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE PhienDangNhap (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nguoiDungId BIGINT UNSIGNED NOT NULL,
    donViHienTaiId BIGINT UNSIGNED NULL,
    maPhienHash VARCHAR(255) NOT NULL,
    diaChiIp VARCHAR(80) NULL,
    userAgent VARCHAR(500) NULL,
    hetHanLuc DATETIME NOT NULL,
    huyLuc DATETIME NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY UQ_PhienDangNhap_maPhienHash (maPhienHash),
    KEY IX_PhienDangNhap_nguoiDungId (nguoiDungId),
    KEY IX_PhienDangNhap_donViHienTaiId (donViHienTaiId),
    KEY IX_PhienDangNhap_hetHanLuc (hetHanLuc),
    CONSTRAINT FK_PhienDangNhap_nguoiDung
        FOREIGN KEY (nguoiDungId)
        REFERENCES NguoiDung(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT FK_PhienDangNhap_donViHienTai
        FOREIGN KEY (donViHienTaiId)
        REFERENCES DonVi(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE NhatKyHeThong (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nguoiDungId BIGINT UNSIGNED NULL,
    donViId BIGINT UNSIGNED NULL,
    hanhDong VARCHAR(120) NOT NULL,
    doiTuong VARCHAR(120) NULL,
    doiTuongId VARCHAR(80) NULL,
    noiDung TEXT NULL,
    duLieu JSON NULL,
    mucDo ENUM(
        'thong_tin',
        'canh_bao',
        'loi'
    ) NOT NULL DEFAULT 'thong_tin',
    diaChiIp VARCHAR(80) NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY IX_NhatKyHeThong_nguoiDungId (nguoiDungId),
    KEY IX_NhatKyHeThong_donViId (donViId),
    KEY IX_NhatKyHeThong_hanhDong (hanhDong),
    KEY IX_NhatKyHeThong_createdAt (createdAt),
    CONSTRAINT FK_NhatKyHeThong_nguoiDung
        FOREIGN KEY (nguoiDungId)
        REFERENCES NguoiDung(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT FK_NhatKyHeThong_donVi
        FOREIGN KEY (donViId)
        REFERENCES DonVi(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO DonVi (
    id,
    donViChaId,
    maDonVi,
    tenDonVi,
    loaiDonVi,
    loaiHinhDaoTao,
    trangThai
)
VALUES
    (
        1,
        NULL,
        'SYSTEM',
        'Hệ thống quản lý giáo dục',
        'he_thong',
        'khac',
        'hoat_dong'
    ),
    (
        2,
        1,
        'TTNN-Q8',
        'Trung tâm Ngoại ngữ Quận 8',
        'trung_tam',
        'ngoai_ngu',
        'hoat_dong'
    ),
    (
        3,
        1,
        'MN-HOA-NANG',
        'Trường Mầm non Hoa Nắng',
        'truong',
        'mam_non',
        'hoat_dong'
    );

INSERT INTO VaiTro (
    id,
    maVaiTro,
    tenVaiTro,
    moTa,
    phamVi,
    laVaiTroHeThong,
    dangHoatDong
)
VALUES
    (1, 'quan_tri_he_thong', 'Quản trị hệ thống', 'Quản trị toàn bộ nền tảng', 'he_thong', 1, 1),
    (2, 'quan_ly_don_vi', 'Quản lý đơn vị', 'Quản lý một trường hoặc trung tâm', 'don_vi', 1, 1),
    (3, 'tuyen_sinh', 'Nhân viên tuyển sinh', 'Tiếp nhận và quản lý hồ sơ tuyển sinh', 'don_vi', 1, 1),
    (4, 'tu_van', 'Nhân viên tư vấn', 'Tư vấn chương trình và khóa học', 'don_vi', 1, 1),
    (5, 'hoc_vu', 'Nhân viên học vụ', 'Quản lý lớp học, lịch học và tiến độ đào tạo', 'don_vi', 1, 1),
    (6, 'ke_toan', 'Kế toán', 'Quản lý học phí, công nợ và phiếu thu', 'don_vi', 1, 1),
    (7, 'giao_vien', 'Giáo viên', 'Giảng dạy, điểm danh và đánh giá học tập', 'don_vi', 1, 1),
    (8, 'phu_huynh', 'Phụ huynh', 'Truy cập cổng thông tin phụ huynh', 'cong_thong_tin', 1, 1);

INSERT INTO Quyen (
    id,
    maQuyen,
    tenQuyen,
    nhomQuyen,
    moTa,
    dangHoatDong
)
VALUES
    (1,  'he_thong.quan_tri',      'Quản trị hệ thống',       'Hệ thống',    NULL, 1),
    (2,  'don_vi.xem',             'Xem đơn vị',              'Đơn vị',      NULL, 1),
    (3,  'don_vi.quan_ly',         'Quản lý đơn vị',          'Đơn vị',      NULL, 1),
    (4,  'nguoi_dung.xem',         'Xem người dùng',          'Người dùng',  NULL, 1),
    (5,  'nguoi_dung.quan_ly',     'Quản lý người dùng',      'Người dùng',  NULL, 1),
    (6,  'phan_quyen.xem',         'Xem phân quyền',          'Phân quyền',  NULL, 1),
    (7,  'phan_quyen.quan_ly',     'Quản lý phân quyền',      'Phân quyền',  NULL, 1),
    (8,  'tuyen_sinh.xem',         'Xem tuyển sinh',          'Tuyển sinh',  NULL, 1),
    (9,  'tuyen_sinh.quan_ly',     'Quản lý tuyển sinh',      'Tuyển sinh',  NULL, 1),
    (10, 'hoc_sinh.xem',           'Xem học sinh',            'Học sinh',    NULL, 1),
    (11, 'hoc_sinh.quan_ly',       'Quản lý học sinh',        'Học sinh',    NULL, 1),
    (12, 'lop_hoc.xem',            'Xem lớp học',             'Lớp học',     NULL, 1),
    (13, 'lop_hoc.quan_ly',        'Quản lý lớp học',         'Lớp học',     NULL, 1),
    (14, 'diem_danh.xem',          'Xem điểm danh',           'Điểm danh',   NULL, 1),
    (15, 'diem_danh.thuc_hien',    'Thực hiện điểm danh',     'Điểm danh',   NULL, 1),
    (16, 'tai_chinh.xem',          'Xem tài chính',           'Tài chính',   NULL, 1),
    (17, 'tai_chinh.quan_ly',      'Quản lý tài chính',       'Tài chính',   NULL, 1);

INSERT INTO VaiTroQuyen (vaiTroId, quyenId)
SELECT 1, id
FROM Quyen;

INSERT INTO VaiTroQuyen (vaiTroId, quyenId)
SELECT 2, id
FROM Quyen
WHERE maQuyen IN (
    'don_vi.xem',
    'don_vi.quan_ly',
    'nguoi_dung.xem',
    'nguoi_dung.quan_ly',
    'phan_quyen.xem',
    'tuyen_sinh.xem',
    'tuyen_sinh.quan_ly',
    'hoc_sinh.xem',
    'hoc_sinh.quan_ly',
    'lop_hoc.xem',
    'lop_hoc.quan_ly',
    'diem_danh.xem',
    'diem_danh.thuc_hien',
    'tai_chinh.xem',
    'tai_chinh.quan_ly'
);

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'DonVi' AS bang, COUNT(*) AS soLuong FROM DonVi
UNION ALL
SELECT 'NguoiDung', COUNT(*) FROM NguoiDung
UNION ALL
SELECT 'VaiTro', COUNT(*) FROM VaiTro
UNION ALL
SELECT 'Quyen', COUNT(*) FROM Quyen
UNION ALL
SELECT 'VaiTroQuyen', COUNT(*) FROM VaiTroQuyen
UNION ALL
SELECT 'NguoiDungVaiTroDonVi', COUNT(*) FROM NguoiDungVaiTroDonVi
UNION ALL
SELECT 'PhienDangNhap', COUNT(*) FROM PhienDangNhap
UNION ALL
SELECT 'NhatKyHeThong', COUNT(*) FROM NhatKyHeThong;
