import assert from "node:assert/strict";
import test from "node:test";

import { collectGuardianOrganizationIds } from "../server/domain/guardian-scope.js";

test("phạm vi phụ huynh lấy từ đơn vị của từng con, không phải hồ sơ phụ huynh", () => {
  assert.deepEqual(
    collectGuardianOrganizationIds([
      { hocSinh: { donViId: 10 }, lienKet: { nhanThongBao: true } },
      { hocSinh: { donViId: 20 }, lienKet: { nhanThongBao: true } },
      { hocSinh: { donViId: 20 }, lienKet: { nhanThongBao: true } },
      { hocSinh: { donViId: 30 }, lienKet: { nhanThongBao: true } },
    ]),
    [10, 20, 30],
  );
});

test("tôn trọng cấu hình nhận thông báo trên từng liên kết phụ huynh–học sinh", () => {
  assert.deepEqual(
    collectGuardianOrganizationIds([
      { hocSinh: { donViId: 10 }, lienKet: { nhanThongBao: false } },
      { hocSinh: { donViId: 20 }, lienKet: { nhanThongBao: true } },
    ]),
    [20],
  );
});
