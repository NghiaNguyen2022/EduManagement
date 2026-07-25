export type OrganizationLevel = "he_thong" | "truong" | "trung_tam" | "co_so";
export type EducationType = "mam_non" | "ngoai_ngu" | "tin_hoc" | "khac" | null;
export type RoleAssignmentChannel = "staff_ui" | "guardian_flow" | "seed";

const SYSTEM_ROLES = new Set([
  "quan_tri_he_thong",
  "quan_ly_don_vi",
  "ke_toan",
]);

const OPERATING_UNIT_ROLES = new Set([
  "quan_ly_don_vi",
  "ke_toan",
  "tu_van",
  "tuyen_sinh",
  "hoc_vu",
  "giao_vien",
]);

export function canAssignRoleAtOrganization(input: {
  roleCode: string;
  organizationLevel: OrganizationLevel;
  educationType: EducationType;
  channel: RoleAssignmentChannel;
}) {
  if (input.roleCode === "phu_huynh") {
    return input.channel === "guardian_flow" && input.organizationLevel !== "he_thong";
  }

  if (input.roleCode === "quan_tri_he_thong") {
    return input.channel === "seed" && input.organizationLevel === "he_thong";
  }

  if (input.organizationLevel === "he_thong") {
    return SYSTEM_ROLES.has(input.roleCode);
  }

  return OPERATING_UNIT_ROLES.has(input.roleCode);
}

export function describeRoleScope(input: {
  roleCode: string;
  organizationLevel: OrganizationLevel;
  educationType: EducationType;
}) {
  if (input.roleCode === "ke_toan" && input.organizationLevel === "he_thong") {
    return "Tài chính tổng hợp: xem gộp công nợ, khoản thu, kỳ thu và báo cáo toàn hệ thống; không lập nghiệp vụ tại đơn vị hệ thống.";
  }

  if (input.roleCode === "ke_toan") {
    return "Tài chính đơn vị: lập kỳ thu, khoản phải thu, phiếu thu, điều chỉnh và báo cáo trong đơn vị.";
  }

  if (input.roleCode === "giao_vien" && input.educationType === "mam_non") {
    return "Giáo viên mầm non: lớp được phân công, lịch, điểm danh, nhận xét và báo giảng; hồ sơ sức khỏe/đón trả/đánh giá phát triển là module chuyên biệt tiếp theo.";
  }

  if (input.roleCode === "giao_vien" && input.educationType === "ngoai_ngu") {
    return "Giáo viên ngoại ngữ: lớp được phân công, lịch dạy, điểm danh, báo giảng; điểm kỹ năng nghe/nói/đọc/viết là module chuyên biệt tiếp theo.";
  }

  return "Phạm vi nghiệp vụ theo quyền được gán tại đơn vị hiện tại.";
}
