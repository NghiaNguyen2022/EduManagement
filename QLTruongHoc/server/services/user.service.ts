import {
  hash,
} from "bcryptjs";

import {
  createAuditLog,
} from "../db/audit.repository.js";
import {
  createUserWithRole,
  findAssignableRoleById,
  findUserById,
  findUserByUsername,
  listAssignableRoles,
  listUsersByOrganization,
  resetUserPassword,
  revokeAllUserSessions,
  updateUserStatus,
} from "../db/user.repository.js";

function normalizeUsername(
  value: string,
) {
  return value
    .trim()
    .toLowerCase();
}

/**
 * Mật khẩu tạm cố định cho tài khoản mới tạo (nhân viên và phụ huynh).
 * Bắt buộc đổi mật khẩu ngay lần đăng nhập đầu tiên (batBuocDoiMatKhau = true)
 * nên việc dùng giá trị cố định vẫn an toàn ở mức chấp nhận được cho MVP.
 */
export function createTemporaryPassword() {
  return "Edu@123Qaz";
}

export async function getUsers(
  organizationId: number,
) {
  const rows =
    await listUsersByOrganization(
      organizationId,
    );

  const users = new Map<
    number,
    {
      id: number;
      tenDangNhap: string;
      hoTen: string;
      email: string | null;
      soDienThoai: string | null;
      trangThai:
        | "hoat_dong"
        | "tam_khoa"
        | "ngung";
      batBuocDoiMatKhau: boolean;
      roles: Array<{
        id: number;
        maVaiTro: string;
        tenVaiTro: string;
      }>;
    }
  >();

  for (const row of rows) {
    let user =
      users.get(row.id);

    if (!user) {
      user = {
        id: row.id,
        tenDangNhap:
          row.tenDangNhap,
        hoTen: row.hoTen,
        email: row.email,
        soDienThoai:
          row.soDienThoai,
        trangThai:
          row.trangThai,
        batBuocDoiMatKhau:
          Boolean(
            row.batBuocDoiMatKhau,
          ),
        roles: [],
      };

      users.set(
        row.id,
        user,
      );
    }

    if (
      !user.roles.some(
        (role) =>
          role.id === row.roleId,
      )
    ) {
      user.roles.push({
        id: row.roleId,
        maVaiTro:
          row.maVaiTro,
        tenVaiTro:
          row.tenVaiTro,
      });
    }
  }

  return Array.from(
    users.values(),
  );
}

export async function getRoles() {
  return listAssignableRoles();
}

export async function createUser(input: {
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  roleId: number;
  organizationId: number;
  actorUserId: number;
  ipAddress?: string;
}) {
  const username =
    normalizeUsername(
      input.username,
    );
  const fullName =
    input.fullName.trim();

  if (
    !username ||
    username.length < 3
  ) {
    throw new Error(
      "Tên đăng nhập phải có ít nhất 3 ký tự.",
    );
  }

  if (
    !/^[a-z0-9._-]+$/.test(
      username,
    )
  ) {
    throw new Error(
      "Tên đăng nhập chỉ dùng chữ thường, số, dấu chấm, gạch ngang hoặc gạch dưới.",
    );
  }

  if (!fullName) {
    throw new Error(
      "Vui lòng nhập họ tên.",
    );
  }

  const role =
    await findAssignableRoleById(
      input.roleId,
    );

  if (!role) {
    throw new Error(
      "Vai trò không tồn tại hoặc không được phép gán.",
    );
  }

  const existed =
    await findUserByUsername(
      username,
    );

  if (existed) {
    throw new Error(
      "Tên đăng nhập đã tồn tại.",
    );
  }

  const temporaryPassword =
    createTemporaryPassword();
  const passwordHash =
    await hash(
      temporaryPassword,
      12,
    );

  const created =
    await createUserWithRole({
      username,
      passwordHash,
      fullName,
      email:
        input.email?.trim() ||
        null,
      phone:
        input.phone?.trim() ||
        null,
      roleId:
        input.roleId,
      organizationId:
        input.organizationId,
    });

  await createAuditLog({
    userId:
      input.actorUserId,
    organizationId:
      input.organizationId,
    action:
      "user.create",
    objectType:
      "NguoiDung",
    objectId:
      String(created.id),
    content:
      `Tạo tài khoản ${username} với vai trò ${role.tenVaiTro}.`,
    ipAddress:
      input.ipAddress,
  });

  return {
    user: created,
    temporaryPassword,
  };
}

export async function changeUserStatus(input: {
  targetUserId: number;
  status:
    | "hoat_dong"
    | "tam_khoa";
  actorUserId: number;
  organizationId: number;
  ipAddress?: string;
}) {
  if (
    input.targetUserId ===
    input.actorUserId
  ) {
    throw new Error(
      "Không thể tự khóa tài khoản đang đăng nhập.",
    );
  }

  const target =
    await findUserById(
      input.targetUserId,
    );

  if (!target) {
    throw new Error(
      "Không tìm thấy tài khoản.",
    );
  }

  await updateUserStatus({
    userId: target.id,
    status: input.status,
  });

  if (
    input.status ===
    "tam_khoa"
  ) {
    await revokeAllUserSessions(
      target.id,
    );
  }

  await createAuditLog({
    userId:
      input.actorUserId,
    organizationId:
      input.organizationId,
    action:
      input.status ===
      "hoat_dong"
        ? "user.unlock"
        : "user.lock",
    objectType:
      "NguoiDung",
    objectId:
      String(target.id),
    content:
      input.status ===
      "hoat_dong"
        ? `Mở khóa tài khoản ${target.tenDangNhap}.`
        : `Khóa tài khoản ${target.tenDangNhap} và thu hồi toàn bộ phiên đăng nhập.`,
    ipAddress:
      input.ipAddress,
  });
}

export async function resetPassword(input: {
  targetUserId: number;
  actorUserId: number;
  organizationId: number;
  ipAddress?: string;
}) {
  const target =
    await findUserById(
      input.targetUserId,
    );

  if (!target) {
    throw new Error(
      "Không tìm thấy tài khoản.",
    );
  }

  const temporaryPassword =
    createTemporaryPassword();
  const passwordHash =
    await hash(
      temporaryPassword,
      12,
    );

  await resetUserPassword({
    userId: target.id,
    passwordHash,
  });

  await revokeAllUserSessions(
    target.id,
  );

  await createAuditLog({
    userId:
      input.actorUserId,
    organizationId:
      input.organizationId,
    action:
      "user.reset_password",
    objectType:
      "NguoiDung",
    objectId:
      String(target.id),
    content:
      `Đặt lại mật khẩu tài khoản ${target.tenDangNhap} và thu hồi toàn bộ phiên đăng nhập.`,
    ipAddress:
      input.ipAddress,
  });

  return {
    temporaryPassword,
  };
}
