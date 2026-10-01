import assert from "node:assert/strict";
import test from "node:test";

import {
  buildTeacherUsername,
  tachHoTenChoUsername,
} from "../server/domain/teacher-account.js";

test("tên đăng nhập giáo viên được sinh theo mẫu gv_ten.ho", () => {
  assert.equal(buildTeacherUsername("Nguyễn Văn An"), "gv_an.nguyen");
});

test("tên đăng nhập trùng được bổ sung số sau phần tên", () => {
  assert.equal(buildTeacherUsername("Nguyễn Văn An", 1), "gv_an1.nguyen");
});

test("không tạo tài khoản khi giáo viên chưa có họ tên hợp lệ", () => {
  assert.throws(
    () => tachHoTenChoUsername(" --- "),
    /Không thể sinh tên đăng nhập từ họ tên giáo viên/,
  );
});
