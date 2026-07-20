import { hash } from "bcryptjs";
import { randomBytes } from "node:crypto";
import { createAuditLog } from "../db/audit.repository.js";
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

const normalizeUsername = (value: string) => value.trim().toLowerCase();
const createTemporaryPassword = () =>
  `Edu@${randomBytes(4).toString("hex").slice(0, 6)}A1`;

export const getUsers = (organizationId: number) =>
  listUsersByOrganization(organizationId);

export const getRoles = () => listAssignableRoles();

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
  const username = normalizeUsername(input.username);
  const fullName = input.fullName.trim();

  if (username.length < 3) throw new Error("Tên đăng nhập phải có ít nhất 3 ký tự.");
  if (!/^[a-z0-9._-]+$/.test(username)) {
    throw new Error("Tên đăng nhập chỉ dùng chữ thường, số, dấu chấm, gạch ngang hoặc gạch dưới.");
  }
  if (!fullName) throw new Error("Vui lòng nhập họ tên.");

  const role = await findAssignableRoleById(input.roleId);
  if (!role) throw new Error("Vai trò không tồn tại hoặc không được phép gán.");
  if (await findUserByUsername(username)) throw new Error("Tên đăng nhập đã tồn tại.");

  const temporaryPassword = createTemporaryPassword();
  const created = await createUserWithRole({
    username,
    passwordHash: await hash(temporaryPassword, 12),
    fullName,
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    roleId: input.roleId,
    organizationId: input.organizationId,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.organizationId,
    action: "user.create",
    objectType: "NguoiDung",
    objectId: String(created.id),
    content: `Tạo tài khoản ${username} với vai trò ${role.tenVaiTro}.`,
    ipAddress: input.ipAddress,
  });

  return { user: created, temporaryPassword };
}

export async function changeUserStatus(input: {
  targetUserId: number;
  status: "hoat_dong" | "tam_khoa";
  actorUserId: number;
  organizationId: number;
  ipAddress?: string;
}) {
  if (input.targetUserId === input.actorUserId) {
    throw new Error("Không thể tự khóa tài khoản đang đăng nhập.");
  }
  const target = await findUserById(input.targetUserId);
  if (!target) throw new Error("Không tìm thấy tài khoản.");

  await updateUserStatus({ userId: target.id, status: input.status });
  if (input.status === "tam_khoa") await revokeAllUserSessions(target.id);

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.organizationId,
    action: input.status === "hoat_dong" ? "user.unlock" : "user.lock",
    objectType: "NguoiDung",
    objectId: String(target.id),
    content: input.status === "hoat_dong"
      ? `Mở khóa tài khoản ${target.tenDangNhap}.`
      : `Khóa tài khoản ${target.tenDangNhap} và thu hồi toàn bộ phiên.`,
    ipAddress: input.ipAddress,
  });
}

export async function resetPassword(input: {
  targetUserId: number;
  actorUserId: number;
  organizationId: number;
  ipAddress?: string;
}) {
  const target = await findUserById(input.targetUserId);
  if (!target) throw new Error("Không tìm thấy tài khoản.");

  const temporaryPassword = createTemporaryPassword();
  await resetUserPassword({
    userId: target.id,
    passwordHash: await hash(temporaryPassword, 12),
  });
  await revokeAllUserSessions(target.id);

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.organizationId,
    action: "user.reset_password",
    objectType: "NguoiDung",
    objectId: String(target.id),
    content: `Reset mật khẩu ${target.tenDangNhap} và thu hồi toàn bộ phiên.`,
    ipAddress: input.ipAddress,
  });

  return { temporaryPassword };
}
