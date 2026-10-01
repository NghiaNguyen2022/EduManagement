import assert from "node:assert/strict";
import test from "node:test";

import {
  BUSINESS_TIME_ZONE,
  toDatabaseDateTime,
  todayInBusinessTimeZone,
} from "../server/utils/dateTime.js";

test("ghi datetime theo Asia/Ho_Chi_Minh thay vì UTC của máy chạy", () => {
  const instant = new Date("2026-07-25T18:30:45.000Z");

  assert.equal(BUSINESS_TIME_ZONE, "Asia/Ho_Chi_Minh");
  assert.equal(toDatabaseDateTime(instant), "2026-07-26 01:30:45");
  assert.equal(todayInBusinessTimeZone(instant), "2026-07-26");
});
