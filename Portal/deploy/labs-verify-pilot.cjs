// Exercise the real API using a short-lived test session; clean up only its own fixtures.
const path = require("node:path");
const crypto = require("node:crypto");
const { createRequire } = require("node:module");
const live = "/home/pauldigi/apps/vireon-portal";
async function main() {
  process.loadEnvFile(path.join(live, ".env"));
  const mysql = createRequire(path.join(live, "package.json"))("mysql2/promise");
  const db = await mysql.createConnection({ host: process.env.MYSQL_HOST || "localhost", port: Number(process.env.MYSQL_PORT || 3306), user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE });
  const base = process.argv[2] || "https://vireon.vn";
  const token = crypto.randomBytes(32).toString("hex");
  const contact = `qa-${crypto.randomUUID()}@example.invalid`;
  let id;
  try {
    await db.execute("INSERT INTO sessions (token, expires_at) VALUES (?, ?)", [token, Date.now() + 300000]);
    const payload = { appSlug: "nhat-ky-hien-truong", name: "Vireon deployment test", organization: "Technical QA", contact, need: "Kiểm thử kỹ thuật, sẽ được xóa tự động.", consent: "yes", website: "" };
    const response = await fetch(`${base}/api/pilots`, { method: "POST", headers: { Origin: base, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (response.status !== 201) throw new Error(`Pilot POST: ${response.status}`);
    const [rows] = await db.execute("SELECT id, status FROM pilot_requests WHERE contact = ?", [contact]);
    if (rows.length !== 1 || rows[0].status !== "new") throw new Error("Pilot not persisted as new");
    id = rows[0].id;
    const duplicate = await fetch(`${base}/api/pilots`, { method: "POST", headers: { Origin: base, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (duplicate.status !== 409) throw new Error(`Duplicate POST: ${duplicate.status}`);
    const cookie = `vireon_admin_session=${token}`;
    const page = await fetch(`${base}/admin/pilots`, { headers: { Cookie: cookie } });
    if (page.status !== 200 || !(await page.text()).includes(contact)) throw new Error("Admin list did not show the test registration");
    for (const status of ["contacted", "piloting", "closed"]) {
      const update = await fetch(`${base}/api/admin/pilots/${id}`, { method: "PATCH", headers: { Origin: base, Cookie: cookie, "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (update.status !== 200) throw new Error(`Admin PATCH ${status}: ${update.status}`);
      const [saved] = await db.execute("SELECT status FROM pilot_requests WHERE id = ?", [id]);
      if (saved[0]?.status !== status) throw new Error(`Status not saved: ${status}`);
    }
    console.log("PILOT_INTEGRATION_OK: create, persistence, duplicate protection, admin list and all status updates");
  } finally {
    await db.execute("DELETE FROM pilot_requests WHERE contact = ?", [contact]);
    await db.execute("DELETE FROM sessions WHERE token = ?", [token]);
    await db.end();
    console.log("TEST_FIXTURES_REMOVED");
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
