import {
  createAuditLog,
} from "../db/audit.repository.js";
import {
  findPermissionsByIds,
  findRoleById,
  listPermissionIdsByRole,
  listPermissions,
  listRoles,
  replaceRolePermissions,
} from "../db/role.repository.js";

export async function getRoles() {
  return listRoles();
}

export async function getPermissions() {
  return listPermissions();
}

export async function getRolePermissions(
  roleId: number,
) {
  const role = await findRoleById(roleId);

  if (!role) {
    throw new Error("Không tìm thấy vai trò.");
  }

  const permissionIds =
    await listPermissionIdsByRole(roleId);

  return {
    role,
    permissionIds,
  };
}

export async function updateRolePermissions(input: {
  roleId: number;
  permissionIds: number[];
  actorUserId: number;
  organizationId: number;
  actorPermissions: string[];
  ipAddress?: string;
}) {
  const role = await findRoleById(input.roleId);

  if (!role) {
    throw new Error("Không tìm thấy vai trò.");
  }

  const isSystemAdmin =
    input.actorPermissions.includes(
      "he_thong.quan_tri",
    );

  if (
    role.phamVi === "he_thong" &&
    !isSystemAdmin
  ) {
    throw new Error(
      "Chỉ quản trị hệ thống mới được chỉnh vai trò này.",
    );
  }

  if (
    !Array.isArray(input.permissionIds) ||
    input.permissionIds.some(
      (id) =>
        !Number.isInteger(id) || id <= 0,
    )
  ) {
    throw new Error(
      "Danh sách quyền không hợp lệ.",
    );
  }

  const uniquePermissionIds = Array.from(
    new Set(input.permissionIds),
  );

  const existingPermissions =
    await findPermissionsByIds(
      uniquePermissionIds,
    );

  if (
    existingPermissions.length !==
    uniquePermissionIds.length
  ) {
    throw new Error(
      "Có quyền không tồn tại hoặc không còn hoạt động.",
    );
  }

  await replaceRolePermissions({
    roleId: role.id,
    permissionIds: uniquePermissionIds,
  });

  await createAuditLog({
    userId: input.actorUserId,
    organizationId: input.organizationId,
    action: "role.update_permissions",
    objectType: "VaiTro",
    objectId: String(role.id),
    content:
      `Cập nhật ${uniquePermissionIds.length} quyền cho vai trò ${role.tenVaiTro}.`,
    data: {
      roleCode: role.maVaiTro,
      permissionIds: uniquePermissionIds,
    },
    ipAddress: input.ipAddress,
  });

  return {
    roleId: role.id,
    permissionIds: uniquePermissionIds,
  };
}
