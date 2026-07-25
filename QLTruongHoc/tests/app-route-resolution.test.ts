import assert from "node:assert/strict";
import test from "node:test";

import {
  findRouteAccessByPath,
  findRouteByPath,
} from "../client/src/routes/appRoutes.js";

test("nhận đúng tiêu đề cho các portal động", () => {
  assert.equal(findRouteByPath("/portal/parent").label, "Cổng phụ huynh");
  assert.equal(findRouteByPath("/portal/he-thong").label, "Cổng quản trị hệ thống");
});

test("route cụ thể được ưu tiên hơn route cha", () => {
  assert.equal(findRouteByPath("/attendance/xin-phep").id, "leave-requests");
  assert.equal(findRouteAccessByPath("/attendance/xin-phep")?.id, "leave-requests");
});

test("đường dẫn lạ dùng tiêu đề trung tính, không lấy phần tử đầu danh sách", () => {
  assert.equal(findRouteByPath("/duong-dan-khong-ton-tai").label, "Quản lý trường học");
  assert.equal(findRouteAccessByPath("/duong-dan-khong-ton-tai"), null);
});
