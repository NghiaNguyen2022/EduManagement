import { createHash, randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2";
import { execute, queryRows } from "../db/mysql";
import type { parsePilot, PilotStatus } from "../pilot-validation";
export type Pilot = RowDataPacket & {
  id: string;
  app_slug: string;
  name: string;
  organization: string;
  contact: string;
  need: string;
  status: PilotStatus;
  created_at: Date | string;
};
export async function createPilot(input: ReturnType<typeof parsePilot>) {
  // One request per contact and app per ten-minute window; enforced across processes.
  const dedupe = createHash("sha256")
    .update(
      `${input.appSlug}:${input.contact.toLowerCase()}:${Math.floor(Date.now() / 600000)}`,
    )
    .digest("hex");
  await execute(
    "INSERT INTO pilot_requests (id, app_slug, name, organization, contact, need, status, consent_at, created_at, updated_at, dedupe_key) VALUES (?, ?, ?, ?, ?, ?, 'new', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3), UTC_TIMESTAMP(3), ?)",
    [
      randomUUID(),
      input.appSlug,
      input.name,
      input.organization,
      input.contact,
      input.need,
      dedupe,
    ],
  );
}
export async function listPilots() {
  return queryRows<Pilot[]>(
    "SELECT id, app_slug, name, organization, contact, need, status, created_at FROM pilot_requests ORDER BY created_at DESC LIMIT 500",
  );
}
export async function updatePilot(id: string, status: PilotStatus) {
  return (
    (
      await execute(
        "UPDATE pilot_requests SET status = ?, updated_at = UTC_TIMESTAMP(3) WHERE id = ?",
        [status, id],
      )
    ).affectedRows > 0
  );
}
