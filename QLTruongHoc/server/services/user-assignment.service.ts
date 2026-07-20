import {
  createAuditLog,
} from "../db/audit.repository.js";
import {
  createAssignment,
  deleteAssignment,
  findAssignment,
  findAssignmentById,
  listUserAssignments,
} from "../db/user-assignment.repository.js";
import {
  findAssignableRoleById,
  findUserById,
} from "../db/user.repository.js";

export async function getUserAssignments(
  userId: number,
) {
  const user =
    await findUserById(userId);

  if (!user) {
    throw new Error(
      "Không tìm thấy người dùng.",
    );
  }

  return listUserAssignments(userId);
}

export async function addUserAssignment(
  input: {
    targetUserId: number;
    roleId: number;
    organizationId: number;
    actorUserId: number;
    actorOrganizationId: number;
    ipAddress?: string;
  },
) {
  const user = await findUserById(
    input.targetUserId,
  );

  if (!user) {
    throw new Error(
      "Không tìm thấy người dùng.",
    );
  }

  const role =
    await findAssignableRoleById(
      input.roleId,
    );

  if (!role) {
    throw new Error(
      "Vai trò không hợp lệ.",
    );
  }

  const existed =
    await findAssignment(
      input.targetUserId,
      input.roleId,
      input.organizationId,
    );

  if (existed) {
    throw new Error(
      "Người dùng đã có vai trò này tại đơn vị đã chọn.",
    );
  }

  const created =
    await createAssignment({
      userId:
        input.targetUserId,
      roleId:
        input.roleId,
      organizationId:
        input.organizationId,
    });

  await createAuditLog({
    userId:
      input.actorUserId,
    organizationId:
      input.actorOrganizationId,
    action:
      "user.add_assignment",
    objectType:
      "NguoiDungVaiTroDonVi",
    objectId:
      created
        ? String(created.id)
        : null,
    content:
      `Gán vai trò ${role.tenVaiTro} cho tài khoản ${user.tenDangNhap}.`,
    data: {
      targetUserId:
        input.targetUserId,
      roleId:
        input.roleId,
      organizationId:
        input.organizationId,
    },
    ipAddress:
      input.ipAddress,
  });

  return created;
}

export async function removeUserAssignment(
  input: {
    assignmentId: number;
    actorUserId: number;
    actorOrganizationId: number;
    ipAddress?: string;
  },
) {
  const assignment =
    await findAssignmentById(
      input.assignmentId,
    );

  if (!assignment) {
    throw new Error(
      "Không tìm thấy phân công.",
    );
  }

  if (
    assignment.nguoiDungId ===
      input.actorUserId &&
    assignment.donViId ===
      input.actorOrganizationId
  ) {
    const assignments =
      await listUserAssignments(
        input.actorUserId,
      );

    const activeInCurrentUnit =
      assignments.filter(
        (item) =>
          item.donViId ===
            input.actorOrganizationId &&
          item.dangHoatDong,
      );

    if (
      activeInCurrentUnit.length <= 1
    ) {
      throw new Error(
        "Không thể xóa vai trò cuối cùng của tài khoản đang đăng nhập tại đơn vị hiện tại.",
      );
    }
  }

  await deleteAssignment(
    assignment.id,
  );

  await createAuditLog({
    userId:
      input.actorUserId,
    organizationId:
      input.actorOrganizationId,
    action:
      "user.remove_assignment",
    objectType:
      "NguoiDungVaiTroDonVi",
    objectId:
      String(
        assignment.id,
      ),
    content:
      "Xóa một phân công vai trò/đơn vị của người dùng.",
    data: {
      targetUserId:
        assignment.nguoiDungId,
      roleId:
        assignment.vaiTroId,
      organizationId:
        assignment.donViId,
    },
    ipAddress:
      input.ipAddress,
  });
}
