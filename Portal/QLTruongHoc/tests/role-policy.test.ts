import assert from "node:assert/strict";
import test from "node:test";

import {
  canAssignRoleAtOrganization,
  describeRoleScope,
} from "../server/domain/role-policy.js";

test("đơn vị hệ thống chỉ nhận vai trò tổng hợp/quản trị phù hợp", () => {
  assert.equal(
    canAssignRoleAtOrganization({
      roleCode: "ke_toan",
      organizationLevel: "he_thong",
      educationType: null,
      channel: "staff_ui",
    }),
    true,
  );
  for (const roleCode of ["giao_vien", "hoc_vu", "tu_van", "tuyen_sinh"]) {
    assert.equal(
      canAssignRoleAtOrganization({
        roleCode,
        organizationLevel: "he_thong",
        educationType: null,
        channel: "staff_ui",
      }),
      false,
    );
  }
});

test("quản trị hệ thống chỉ được tạo qua seed, phụ huynh chỉ qua hồ sơ con", () => {
  assert.equal(
    canAssignRoleAtOrganization({
      roleCode: "quan_tri_he_thong",
      organizationLevel: "he_thong",
      educationType: null,
      channel: "staff_ui",
    }),
    false,
  );
  assert.equal(
    canAssignRoleAtOrganization({
      roleCode: "phu_huynh",
      organizationLevel: "truong",
      educationType: "mam_non",
      channel: "guardian_flow",
    }),
    true,
  );
});

test("mô tả phạm vi phân biệt kế toán tổng và giáo viên theo loại hình", () => {
  assert.match(
    describeRoleScope({
      roleCode: "ke_toan",
      organizationLevel: "he_thong",
      educationType: null,
    }),
    /tổng hợp/i,
  );
  assert.match(
    describeRoleScope({
      roleCode: "giao_vien",
      organizationLevel: "truong",
      educationType: "mam_non",
    }),
    /đón trả/i,
  );
  assert.match(
    describeRoleScope({
      roleCode: "giao_vien",
      organizationLevel: "trung_tam",
      educationType: "ngoai_ngu",
    }),
    /nghe\/nói\/đọc\/viết/i,
  );
});
