import assert from "node:assert/strict";
import test from "node:test";

import {
  hasAnyPermission,
  hasAnyPermissionOrRole,
} from "../server/domain/access-control.js";

test("chỉ quyền của đơn vị hiện tại được dùng để cấp phép", () => {
  assert.equal(
    hasAnyPermission({
      grantedPermissions: ["hoc_sinh.xem"],
      requiredPermissions: ["tai_chinh.quan_ly"],
    }),
    false,
  );
  assert.equal(
    hasAnyPermission({
      grantedPermissions: ["tai_chinh.quan_ly"],
      requiredPermissions: ["tai_chinh.quan_ly"],
    }),
    true,
  );
});

test("quản trị hệ thống được phép qua mọi yêu cầu quyền", () => {
  assert.equal(
    hasAnyPermission({
      grantedPermissions: ["he_thong.quan_tri"],
      requiredPermissions: ["tai_chinh.duyet"],
    }),
    true,
  );
});

test("vai trò phụ huynh chỉ bypass tại endpoint cho phép rõ ràng", () => {
  assert.equal(
    hasAnyPermissionOrRole({
      grantedPermissions: [],
      grantedRoles: ["phu_huynh"],
      requiredPermissions: ["hoc_sinh.xem"],
      requiredRoles: ["phu_huynh"],
    }),
    true,
  );
  assert.equal(
    hasAnyPermission({
      grantedPermissions: [],
      requiredPermissions: ["hoc_sinh.xem"],
    }),
    false,
  );
});
