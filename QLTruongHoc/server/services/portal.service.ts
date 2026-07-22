import { findDonViById } from "../db/donVi.repository.js";
import { listEnrollmentsByHocSinh } from "../db/lopHoc.repository.js";
import { listPhuHuynhByNguoiDungId, listHocSinhByPhuHuynhId } from "../db/phuHuynh.repository.js";
import { listThoiKhoaBieu } from "./lichHoc.service.js";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Tổng quan Portal phụ huynh. Không gắn với một đơn vị "đang chọn" cụ thể —
 * một phụ huynh có thể có con học ở nhiều đơn vị, nên trang tổng quan hiển
 * thị thông tin chung (không thiên vị đơn vị nào), còn việc quản lý chi tiết
 * theo từng đơn vị nằm trong `organizations` (xem `ParentPortalOrganizationGroup`
 * ở client).
 */
export async function getParentPortalOverview(input: { userId: number }) {
  /**
   * Chủ đích: một phụ huynh có thể có con học ở nhiều đơn vị, hồ sơ được
   * dùng chung qua số điện thoại (xem `CrossOrgGuardianConfirmError` ở
   * `phuHuynh.service.ts`). Vì vậy Portal gộp dữ liệu từ MỌI hồ sơ
   * `PhuHuynh` gắn với tài khoản này, không chỉ đơn vị đang chọn/đơn vị
   * "đăng nhập mặc định" (thường là một đơn vị neo chung, ví dụ đơn vị hệ
   * thống — không mang ý nghĩa nghiệp vụ cho phụ huynh).
   *
   * Không cần kiểm thêm một lượt phân quyền theo từng đơn vị ở đây: mỗi
   * dòng `PhuHuynh.nguoiDungId` chỉ được gán bởi nhân viên có quyền
   * `hoc_sinh.quan_ly` qua `createGuardianAccount`, và mỗi liên kết học
   * sinh-phụ huynh khác đơn vị đã bắt buộc xác nhận rõ ràng qua
   * `CrossOrgGuardianConfirmError` (`addGuardianToStudent`) trước khi tạo.
   * Đó mới là điểm chốt quyền thực sự — "đơn vị đang chọn" của phụ huynh
   * chỉ là chỗ neo phiên đăng nhập, không phải căn cứ để lọc dữ liệu con.
   */
  const guardians = await listPhuHuynhByNguoiDungId(input.userId);

  if (guardians.length === 0) {
    throw new Error("Không tìm thấy hồ sơ phụ huynh trong hệ thống.");
  }

  const children = (
    await Promise.all(
      guardians.map(async (guardian) => {
        const parentOrganization = await findDonViById(guardian.donViId);
        const childRows = await listHocSinhByPhuHuynhId(guardian.id);

        const tuNgay = todayIso();
        const denNgay = addDaysIso(tuNgay, 14);

        const timetable = await listThoiKhoaBieu({
          donViId: guardian.donViId,
          tuNgay,
          denNgay,
        });

        return Promise.all(
          childRows.map(async (row) => {
            const childOrganization =
              row.hocSinh.donViId === guardian.donViId
                ? parentOrganization
                : await findDonViById(row.hocSinh.donViId);

            const enrollments = await listEnrollmentsByHocSinh(row.hocSinh.id);

            const activeEnrollments = enrollments.filter(
              (enrollment) =>
                enrollment.enrollment.trangThai === "dang_hoc" ||
                enrollment.enrollment.trangThai === "bao_luu",
            );

            const lopHocIds = activeEnrollments.map((enrollment) => enrollment.lopHoc.id);

            const activeClasses = activeEnrollments.map((enrollment) => ({
              enrollmentId: enrollment.enrollment.id,
              ngayVaoLop: enrollment.enrollment.ngayVaoLop,
              ngayRoiLop: enrollment.enrollment.ngayRoiLop,
              trangThai: enrollment.enrollment.trangThai,
              lopHoc: {
                id: enrollment.lopHoc.id,
                maLop: enrollment.lopHoc.maLop,
                tenLop: enrollment.lopHoc.tenLop,
                phongHoc: enrollment.lopHoc.phongHoc,
              },
            }));

            const schedules = timetable
              .filter((item) => lopHocIds.includes(item.buoiHoc.lopHocId))
              .sort((left, right) =>
                `${left.buoiHoc.ngayHoc} ${left.buoiHoc.gioBatDau}`.localeCompare(
                  `${right.buoiHoc.ngayHoc} ${right.buoiHoc.gioBatDau}`,
                ),
              )
              .slice(0, 8);

            return {
              lienKet: row.lienKet,
              hocSinh: {
                ...row.hocSinh,
                donVi: childOrganization
                  ? {
                      id: childOrganization.id,
                      maDonVi: childOrganization.maDonVi,
                      tenDonVi: childOrganization.tenDonVi,
                    }
                  : undefined,
              },
              donVi: childOrganization
                ? {
                    id: childOrganization.id,
                    maDonVi: childOrganization.maDonVi,
                    tenDonVi: childOrganization.tenDonVi,
                  }
                : {
                    id: row.hocSinh.donViId,
                    maDonVi: `DV-${row.hocSinh.donViId}`,
                    tenDonVi: "Đơn vị chưa xác định",
                  },
              activeClasses,
              schedules,
              scores: {
                available: false,
                title: "Điểm số chưa có nguồn dữ liệu",
                detail: "Hệ thống hiện chưa có bảng/endpoint điểm số để phụ huynh xem trực tiếp.",
              },
            };
          }),
        );
      }),
    )
  ).flat();

  const upcomingSessions = children
    .flatMap((child) =>
      child.schedules.map((session) => ({
        childName: child.hocSinh.hoTen,
        childCode: child.hocSinh.maHocSinh,
        childOrganization: child.donVi,
        session,
      })),
    )
    .sort((left, right) =>
      `${left.session.buoiHoc.ngayHoc} ${left.session.buoiHoc.gioBatDau}`.localeCompare(
        `${right.session.buoiHoc.ngayHoc} ${right.session.buoiHoc.gioBatDau}`,
      ),
    );

  // Nhóm quản lý chi tiết theo từng đơn vị — bao trọn cả 3 trường hợp: nhiều
  // con nhiều đơn vị (mỗi đơn vị một nhóm, có thể nhiều con trong nhóm), một
  // con nhiều đơn vị (mỗi đơn vị vẫn ra một nhóm riêng), nhiều con một đơn vị
  // (chỉ một nhóm duy nhất).
  const organizationsById = new Map<
    number,
    {
      donVi: (typeof children)[number]["donVi"];
      children: typeof children;
      upcomingSessions: typeof upcomingSessions;
    }
  >();

  for (const child of children) {
    const key = child.donVi.id;
    const group = organizationsById.get(key);

    if (group) {
      group.children.push(child);
    } else {
      organizationsById.set(key, {
        donVi: child.donVi,
        children: [child],
        upcomingSessions: [],
      });
    }
  }

  for (const session of upcomingSessions) {
    organizationsById.get(session.childOrganization.id)?.upcomingSessions.push(session);
  }

  const organizations = Array.from(organizationsById.values()).sort((left, right) =>
    left.donVi.tenDonVi.localeCompare(right.donVi.tenDonVi),
  );

  // Thông tin phụ huynh hiển thị ở đầu trang là thông tin CHUNG của cùng một
  // người (nhiều dòng `PhuHuynh` ở các đơn vị khác nhau chỉ là hồ sơ của
  // cùng một tài khoản) — không gắn với đơn vị nào, nên không cần chọn theo
  // đơn vị đang thao tác, chỉ cần một hồ sơ đại diện để hiển thị.
  const representativeGuardian = guardians[0];

  return {
    parent: {
      id: representativeGuardian.id,
      hoTen: representativeGuardian.hoTen,
      maPhuHuynh: representativeGuardian.maPhuHuynh,
      dienThoai: representativeGuardian.dienThoai,
      email: representativeGuardian.email,
      ngheNghiep: representativeGuardian.ngheNghiep,
      diaChi: representativeGuardian.diaChi,
    },
    children,
    upcomingSessions: upcomingSessions.slice(0, 8),
    organizations,
  };
}
