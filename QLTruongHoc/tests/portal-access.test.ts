import assert from "node:assert/strict";
import test from "node:test";

import {
  canAccessPortalRole,
  getDefaultLandingPath,
  getDefaultPortalSlug,
} from "../client/src/config/portal.js";

test("tư vấn và tuyển sinh cùng vào đúng Portal tuyển sinh", () => {
  assert.equal(getDefaultPortalSlug(["tu_van"]), "tuyen-sinh");
  assert.equal(getDefaultPortalSlug(["tuyen_sinh"]), "tuyen-sinh");
  assert.equal(canAccessPortalRole("tuyen-sinh", ["tu_van"]), true);
});

test("không mở được Portal của vai trò khác", () => {
  assert.equal(canAccessPortalRole("ke-toan", ["giao_vien"]), false);
  assert.equal(canAccessPortalRole("giao-vien", ["ke_toan"]), false);
});

test("vai trò nghiệp vụ vào Portal, vai trò chưa có Portal giữ dashboard", () => {
  assert.equal(getDefaultLandingPath(["ke_toan"]), "/portal/ke-toan");
  assert.equal(getDefaultLandingPath(["hoc_vu"]), "/portal/hoc-vu");
  assert.equal(getDefaultLandingPath(["quan_ly_don_vi"]), "/dashboard");
  assert.equal(getDefaultLandingPath(["quan_tri_he_thong"]), "/dashboard");
});
