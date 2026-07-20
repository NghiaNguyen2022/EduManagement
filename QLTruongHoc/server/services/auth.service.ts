import {
  compare,
  hash,
} from "bcryptjs";

import {
  AUTH_LOCKOUT_MINUTES,
  AUTH_MAX_FAILED_ATTEMPTS,
  AUTH_SESSION_DAYS,
} from "../auth/auth.constants.js";
import {
  createSessionToken,
  hashSessionToken,
} from "../auth/auth.crypto.js";
import type {
  AuthContextData,
  AuthOrganization,
} from "../auth/auth.types.js";
import {
  createAuditLog,
} from "../db/audit.repository.js";
import {
  createSession,
  findActiveSessionByHash,
  findUserById,
  findUserByUsername,
  getOrganizationsForUser,
  resetFailedLoginState,
  revokeOtherSessions,
  revokeSessionByHash,
  setFailedLoginState,
  updateCurrentOrganization,
  updateLastLogin,
  updatePassword,
} from "../db/auth.repository.js";

function toDateTimeString(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function validateNewPassword(password: string) {
  if (password.length < 8) {
    throw new Error("Mật khẩu mới phải có ít nhất 8 ký tự.");
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error("Mật khẩu mới cần có ít nhất một chữ hoa.");
  }

  if (!/[a-z]/.test(password)) {
    throw new Error("Mật khẩu mới cần có ít nhất một chữ thường.");
  }

  if (!/[0-9]/.test(password)) {
    throw new Error("Mật khẩu mới cần có ít nhất một chữ số.");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new Error("Mật khẩu mới cần có ít nhất một ký tự đặc biệt.");
  }
}

export async function login(input: {
  username: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const username = input.username.trim();
  const user = await findUserByUsername(username);

  if (!username || !input.password || !user) {
    await createAuditLog({
      action: "auth.login_failed",
      objectType: "NguoiDung",
      objectId: username || null,
      content: "Đăng nhập thất bại.",
      level: "canh_bao",
      ipAddress: input.ipAddress,
    });

    throw new Error("Tên đăng nhập hoặc mật khẩu không đúng.");
  }

  if (user.trangThai !== "hoat_dong") {
    await createAuditLog({
      userId: user.id,
      action: "auth.login_blocked",
      objectType: "NguoiDung",
      objectId: String(user.id),
      content: "Tài khoản không ở trạng thái hoạt động.",
      level: "canh_bao",
      ipAddress: input.ipAddress,
    });

    throw new Error("Tài khoản đang bị khóa hoặc đã ngừng hoạt động.");
  }

  let failedAttempts = user.soLanDangNhapSaiLienTiep;
  const lockUntil = user.khoaDangNhapDenLuc;

  if (lockUntil && lockUntil > toDateTimeString(new Date())) {
    await createAuditLog({
      userId: user.id,
      action: "auth.login_locked",
      objectType: "NguoiDung",
      objectId: String(user.id),
      content: `Tài khoản đang tạm khóa đến ${lockUntil} do đăng nhập sai nhiều lần.`,
      level: "canh_bao",
      ipAddress: input.ipAddress,
    });

    throw new Error(
      `Tài khoản đang tạm khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau ${AUTH_LOCKOUT_MINUTES} phút.`,
    );
  }

  if (lockUntil) {
    failedAttempts = 0;
  }

  const passwordValid = await compare(
    input.password,
    user.matKhauHash,
  );

  if (!passwordValid) {
    const nextAttempts = failedAttempts + 1;
    const shouldLock = nextAttempts >= AUTH_MAX_FAILED_ATTEMPTS;

    await setFailedLoginState({
      userId: user.id,
      attempts: shouldLock ? 0 : nextAttempts,
      lockUntil: shouldLock
        ? toDateTimeString(
            new Date(
              Date.now() + AUTH_LOCKOUT_MINUTES * 60 * 1000,
            ),
          )
        : null,
    });

    await createAuditLog({
      userId: user.id,
      action: shouldLock ? "auth.login_locked" : "auth.login_failed",
      objectType: "NguoiDung",
      objectId: String(user.id),
      content: shouldLock
        ? `Tài khoản bị tạm khóa ${AUTH_LOCKOUT_MINUTES} phút do đăng nhập sai ${AUTH_MAX_FAILED_ATTEMPTS} lần liên tiếp.`
        : "Sai mật khẩu.",
      level: "canh_bao",
      ipAddress: input.ipAddress,
    });

    throw new Error(
      shouldLock
        ? `Tài khoản tạm khóa ${AUTH_LOCKOUT_MINUTES} phút do đăng nhập sai quá nhiều lần.`
        : "Tên đăng nhập hoặc mật khẩu không đúng.",
    );
  }

  if (failedAttempts > 0 || user.khoaDangNhapDenLuc) {
    await resetFailedLoginState(user.id);
  }

  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(
    Date.now() + AUTH_SESSION_DAYS * 24 * 60 * 60 * 1000,
  );

  const session = await createSession({
    userId: user.id,
    tokenHash,
    expiresAt: toDateTimeString(expiresAt),
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  await updateLastLogin(user.id);

  const organizations = await getOrganizationsForUser(user.id);

  if (organizations.length === 1 && session) {
    await updateCurrentOrganization(
      session.id,
      organizations[0].id,
    );

    session.donViHienTaiId = organizations[0].id;
  }

  await createAuditLog({
    userId: user.id,
    organizationId: session?.donViHienTaiId ?? null,
    action: "auth.login",
    objectType: "PhienDangNhap",
    objectId: session ? String(session.id) : null,
    content: "Đăng nhập thành công.",
    ipAddress: input.ipAddress,
  });

  return {
    token,
    expiresAt,
    context: buildAuthContext(
      session?.id ?? 0,
      user,
      organizations,
      session?.donViHienTaiId ?? null,
    ),
  };
}

export async function logout(input: {
  token?: string;
  ipAddress?: string;
}) {
  if (!input.token) {
    return;
  }

  const active = await findActiveSessionByHash(
    hashSessionToken(input.token),
  );

  if (active) {
    await createAuditLog({
      userId: active.user.id,
      organizationId:
        active.session.donViHienTaiId ?? null,
      action: "auth.logout",
      objectType: "PhienDangNhap",
      objectId: String(active.session.id),
      content: "Đăng xuất.",
      ipAddress: input.ipAddress,
    });
  }

  await revokeSessionByHash(
    hashSessionToken(input.token),
  );
}

export async function getAuthContext(
  token: string | undefined,
): Promise<AuthContextData | null> {
  if (!token) {
    return null;
  }

  const active = await findActiveSessionByHash(
    hashSessionToken(token),
  );

  if (!active || active.user.trangThai !== "hoat_dong") {
    return null;
  }

  const organizations = await getOrganizationsForUser(
    active.user.id,
  );

  return buildAuthContext(
    active.session.id,
    active.user,
    organizations,
    active.session.donViHienTaiId ?? null,
  );
}

export async function selectOrganization(
  token: string | undefined,
  organizationId: number,
  ipAddress?: string,
) {
  const context = await getAuthContext(token);

  if (!context) {
    throw new Error("Phiên đăng nhập không hợp lệ.");
  }

  const organization = context.organizations.find(
    (item) => item.id === organizationId,
  );

  if (!organization) {
    throw new Error("Bạn không có quyền truy cập đơn vị này.");
  }

  await updateCurrentOrganization(
    context.sessionId,
    organizationId,
  );

  await createAuditLog({
    userId: context.user.id,
    organizationId,
    action: "auth.select_organization",
    objectType: "DonVi",
    objectId: String(organizationId),
    content: `Chọn đơn vị ${organization.tenDonVi}.`,
    ipAddress,
  });

  return {
    ...context,
    currentOrganization: organization,
  };
}

export async function changePassword(input: {
  token: string | undefined;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  ipAddress?: string;
}) {
  const context = await getAuthContext(input.token);

  if (!context) {
    throw new Error("Phiên đăng nhập không hợp lệ.");
  }

  if (input.newPassword !== input.confirmPassword) {
    throw new Error("Mật khẩu xác nhận không khớp.");
  }

  validateNewPassword(input.newPassword);

  if (input.currentPassword === input.newPassword) {
    throw new Error("Mật khẩu mới phải khác mật khẩu hiện tại.");
  }

  const user = await findUserById(context.user.id);

  if (!user) {
    throw new Error("Không tìm thấy tài khoản.");
  }

  const currentPasswordValid = await compare(
    input.currentPassword,
    user.matKhauHash,
  );

  if (!currentPasswordValid) {
    throw new Error("Mật khẩu hiện tại không đúng.");
  }

  const passwordHash = await hash(input.newPassword, 12);

  await updatePassword({
    userId: user.id,
    passwordHash,
  });

  await revokeOtherSessions({
    userId: user.id,
    currentSessionId: context.sessionId,
  });

  await createAuditLog({
    userId: user.id,
    organizationId:
      context.currentOrganization?.id ?? null,
    action: "auth.change_password",
    objectType: "NguoiDung",
    objectId: String(user.id),
    content: "Đổi mật khẩu thành công.",
    ipAddress: input.ipAddress,
  });

  const refreshedUser = await findUserById(user.id);

  if (!refreshedUser) {
    throw new Error("Không thể tải lại tài khoản.");
  }

  return buildAuthContext(
    context.sessionId,
    refreshedUser,
    context.organizations,
    context.currentOrganization?.id ?? null,
  );
}

function buildAuthContext(
  sessionId: number,
  user: {
    id: number;
    tenDangNhap: string;
    hoTen: string;
    email: string | null;
    soDienThoai: string | null;
    batBuocDoiMatKhau: boolean;
  },
  organizations: AuthOrganization[],
  currentOrganizationId: number | null,
): AuthContextData {
  return {
    sessionId,
    user: {
      id: user.id,
      tenDangNhap: user.tenDangNhap,
      hoTen: user.hoTen,
      email: user.email,
      soDienThoai: user.soDienThoai,
      batBuocDoiMatKhau:
        Boolean(user.batBuocDoiMatKhau),
    },
    organizations,
    currentOrganization:
      organizations.find(
        (item) => item.id === currentOrganizationId,
      ) ?? null,
  };
}
