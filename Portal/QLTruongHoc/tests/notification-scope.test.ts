import assert from "node:assert/strict";
import test from "node:test";

import { canGuardianAccessNotification } from "../server/domain/notification-scope.js";

test("phụ huynh chỉ xem thông báo toàn trường thuộc đơn vị của con", () => {
  assert.equal(
    canGuardianAccessNotification({
      organizationId: 12,
      guardianOrganizationIds: [12, 15],
      scope: "toan_truong",
    }),
    true,
  );
});

test("phụ huynh không xem thông báo của đơn vị khác", () => {
  assert.equal(
    canGuardianAccessNotification({
      organizationId: 99,
      guardianOrganizationIds: [12, 15],
      scope: "toan_truong",
    }),
    false,
  );
});

test("phụ huynh không xem phạm vi lớp/cá nhân khi đối tượng chưa có ID cấu trúc", () => {
  for (const scope of ["theo_lop", "ca_nhan"] as const) {
    assert.equal(
      canGuardianAccessNotification({
        organizationId: 12,
        guardianOrganizationIds: [12],
        scope,
      }),
      false,
    );
  }
});

test("phụ huynh xem thông báo đúng lớp của con", () => {
  assert.equal(
    canGuardianAccessNotification({
      organizationId: 12,
      guardianOrganizationIds: [12],
      scope: "theo_lop",
      classId: 101,
      guardianClassIds: [101, 102],
    }),
    true,
  );
  assert.equal(
    canGuardianAccessNotification({
      organizationId: 12,
      guardianOrganizationIds: [12],
      scope: "theo_lop",
      classId: 999,
      guardianClassIds: [101, 102],
    }),
    false,
  );
});

test("phụ huynh xem thông báo cá nhân đúng con", () => {
  assert.equal(
    canGuardianAccessNotification({
      organizationId: 12,
      guardianOrganizationIds: [12],
      scope: "ca_nhan",
      studentId: 201,
      guardianStudentIds: [201, 202],
    }),
    true,
  );
  assert.equal(
    canGuardianAccessNotification({
      organizationId: 12,
      guardianOrganizationIds: [12],
      scope: "ca_nhan",
      studentId: 999,
      guardianStudentIds: [201, 202],
    }),
    false,
  );
});
