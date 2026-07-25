import assert from "node:assert/strict";
import test from "node:test";

import { normalizeTeacherUsername } from "../server/domain/teacher-account.js";

test("tên đăng nhập giáo viên được chuẩn hóa từ số điện thoại", () => {
  assert.equal(normalizeTeacherUsername("090 123-4567"), "0901234567");
});

test("không tạo tài khoản khi giáo viên chưa có số điện thoại hợp lệ", () => {
  assert.throws(
    () => normalizeTeacherUsername(" --- "),
    /cập nhật số điện thoại giáo viên/,
  );
});
