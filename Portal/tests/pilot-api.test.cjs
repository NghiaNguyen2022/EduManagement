const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");

function load(file, mocks = {}) {
  const filename = path.resolve(root, file);
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports, Buffer, Request, Response, URL,
    console: { error() {} },
    require(id) {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (id.startsWith("@/")) return load(`${id.slice(2)}.ts`, mocks);
      if (id.startsWith(".")) return load(`${path.resolve(path.dirname(filename), id)}.ts`, mocks);
      return require(id);
    },
  }, { filename });
  return module.exports;
}
const origin = "https://vireon.vn";
const valid = { appSlug: "nhat-ky-hien-truong", name: "Đội thử", organization: "Demo", contact: "qa@example.invalid", need: "Thử quy trình nhật ký", consent: "yes", website: "" };
function request(payload, custom = {}) {
  return new Request(`${origin}/api/pilots`, { method: "POST", headers: { origin, "content-type": "application/json", ...custom }, body: JSON.stringify(payload) });
}

test("valid pilot is stored once; validation precedes storage", async () => {
  const stored = [];
  const { POST } = load("app/api/pilots/route.ts", { "@/lib/store/pilots": { createPilot: async data => stored.push(data) } });
  assert.equal((await POST(request(valid))).status, 201);
  assert.equal(stored.length, 1);
  assert.equal(stored[0].contact, valid.contact);
  for (const invalid of [null, [], {}, { ...valid, consent: "no" }, { ...valid, appSlug: "unknown" }, { ...valid, contact: "invalid" }, { ...valid, name: " " }, { ...valid, need: "x".repeat(2001) }, { ...valid, website: "spam" }]) {
    assert.equal((await POST(request(invalid))).status, 400);
  }
  assert.equal(stored.length, 1);
});
test("cross-origin, missing origin, wrong content type and large bodies are rejected", async () => {
  let writes = 0;
  const { POST } = load("app/api/pilots/route.ts", { "@/lib/store/pilots": { createPilot: async () => { writes++; } } });
  assert.equal((await POST(request(valid, { origin: "https://evil.invalid" }))).status, 403);
  assert.equal((await POST(request(valid, { origin: "null" }))).status, 403);
  assert.equal((await POST(request(valid, { "content-type": "text/plain" }))).status, 415);
  assert.equal((await POST(request({ ...valid, need: "x".repeat(17000) }))).status, 413);
  assert.equal(writes, 0);
});
test("storage failures do not report success or leak database details", async () => {
  for (const [code, expected] of [["ER_DUP_ENTRY", 409], ["ER_NO_SUCH_TABLE", 503]]) {
    const { POST } = load("app/api/pilots/route.ts", { "@/lib/store/pilots": { createPilot: async () => { throw Object.assign(new Error("private connection details"), { code }); } } });
    const result = await POST(request(valid));
    assert.equal(result.status, expected);
    assert.doesNotMatch(await result.text(), /private connection/);
  }
});
test("origin validation accepts the public host behind Next.js bind-address rewriting", () => {
  const { hasSameOrigin } = load("lib/request-origin.ts");
  assert.equal(hasSameOrigin(new Request("http://localhost:3100/api/pilots", { headers: { origin: "http://127.0.0.1:3100", host: "127.0.0.1:3100" } })), true);
  assert.equal(hasSameOrigin(new Request("http://localhost:3100/api/pilots", { headers: { origin: "https://evil.invalid", host: "vireon.vn" } })), false);
});
test("admin changes require authentication and a valid status", async () => {
  let authenticated = false; const updates = [];
  const { PATCH } = load("app/api/admin/pilots/[id]/route.ts", {
    "@/lib/auth/session": { isAdminAuthenticated: async () => authenticated },
    "@/lib/store/pilots": { updatePilot: async (...args) => { updates.push(args); return true; } },
  });
  const params = { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }) };
  assert.equal((await PATCH(request({ status: "closed" }), params)).status, 401);
  authenticated = true;
  assert.equal((await PATCH(request({ status: "invalid" }), params)).status, 400);
  assert.equal((await PATCH(request({ status: "piloting" }), params)).status, 200);
  assert.equal(updates.length, 1);
  assert.equal(updates[0][1], "piloting");
});
