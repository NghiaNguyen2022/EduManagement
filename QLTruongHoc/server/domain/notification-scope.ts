export type NotificationScope = "toan_truong" | "theo_lop" | "ca_nhan";

/**
 * Target lớp/cá nhân hiện vẫn được lưu bằng văn bản tự do. Chỉ thông báo toàn
 * trường có thể được xác thực chắc chắn cho phụ huynh cho tới khi schema lưu
 * ID lớp/học sinh.
 */
export function canGuardianAccessNotification(input: {
  organizationId: number;
  guardianOrganizationIds: readonly number[];
  scope: NotificationScope;
  classId?: number | null;
  studentId?: number | null;
  guardianClassIds?: readonly number[];
  guardianStudentIds?: readonly number[];
}) {
  if (!input.guardianOrganizationIds.includes(input.organizationId)) {
    return false;
  }

  if (input.scope === "toan_truong") {
    return true;
  }

  if (input.scope === "theo_lop") {
    return (
      input.classId != null &&
      (input.guardianClassIds ?? []).includes(input.classId)
    );
  }

  return (
    input.studentId != null &&
    (input.guardianStudentIds ?? []).includes(input.studentId)
  );
}
