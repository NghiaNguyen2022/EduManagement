import assert from "node:assert/strict";
import test from "node:test";

import {
      canAccessPortalRole,
      getDefaultLandingPath,
      getDefaultPortalSlug,
} from "../client/src/config/portal.js";

test("tư vấn và tuyển sinh cùng vào đúng Portal tuyển sinh", () => {
      assert.equal(getDefaultPortalSlug(["tu_van"]), "admissions");
      assert.equal(getDefaultPortalSlug(["tuyen_sinh"]), "admissions");
      assert.equal(canAccessPortalRole("admissions", ["tu_van"]), true);
});

test("không mở được Portal của vai trò khác", () => {
      assert.equal(canAccessPortalRole("accountant", ["giao_vien"]), false);
      assert.equal(canAccessPortalRole("teacher", ["ke_toan"]), false);
});

test("vai trò nghiệp vụ vào đúng Portal theo slug mới", () => {
      assert.equal(getDefaultLandingPath(["ke_toan"]), "/portal/accountant");
      assert.equal(getDefaultLandingPath(["hoc_vu"]), "/portal/academic-affairs");
      assert.equal(getDefaultLandingPath(["quan_ly_don_vi"]), "/portal/unit-manager");
      assert.equal(getDefaultLandingPath(["quan_tri_he_thong"]), "/dashboard");
});
