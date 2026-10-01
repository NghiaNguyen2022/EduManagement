/* cPanel release helper. Run with the hosting Node.js environment activated. */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { createRequire } = require("node:module");

const live = "/home/pauldigi/apps/vireon-portal";
const release = path.resolve(__dirname, "..");
const stateFile = path.join(release, "release-state.json");
const runtimeItems = ["app", "lib", "public", ".next", "server.js", "app.cjs", "app.js", "package.json", "package-lock.json", "next.config.ts", "tsconfig.json", "postcss.config.mjs", ".env", "mysql-schema.sql", "db"];
const sourceItems = ["app", "lib", "public", "package.json", "next.config.ts", "tsconfig.json", "postcss.config.mjs", "db"];
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.error || result.status !== 0) throw new Error(`${command} failed (${result.status})`);
}
function env() {
  if (fs.existsSync(path.join(live, ".env"))) process.loadEnvFile(path.join(live, ".env"));
  for (const key of ["MYSQL_DATABASE", "MYSQL_USER"]) if (!process.env[key]) throw new Error(`Missing ${key}`);
}
function save(state) { fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), { mode: 0o600 }); }
function state() { return JSON.parse(fs.readFileSync(stateFile, "utf8")); }
async function main() {
  const action = process.argv[2];
  if (!release.startsWith("/home/pauldigi/vireon-releases/")) throw new Error("Release must be inside the private release directory");
  if (action === "backup") {
    if (fs.existsSync(stateFile)) throw new Error("A backup already exists for this release");
    env();
    const backup = `/home/pauldigi/vireon-backups/labs-${new Date().toISOString().replace(/[:.]/g, "-")}`;
    fs.mkdirSync(backup, { recursive: true, mode: 0o700 });
    const items = runtimeItems.filter(item => fs.existsSync(path.join(live, item)));
    run("tar", ["-czf", path.join(backup, "application.tar.gz"), "-C", live, ...items]);
    run("tar", ["-tzf", path.join(backup, "application.tar.gz")], { stdio: "ignore" });
    const databasePath = path.join(backup, "database.sql");
    const fd = fs.openSync(databasePath, "wx", 0o600);
    try {
      run("mysqldump", ["--single-transaction", "--quick", "--skip-lock-tables", "--no-tablespaces", "--host", process.env.MYSQL_HOST || "localhost", "--port", process.env.MYSQL_PORT || "3306", "--user", process.env.MYSQL_USER, process.env.MYSQL_DATABASE], { env: { ...process.env, MYSQL_PWD: process.env.MYSQL_PASSWORD || "" }, stdio: ["ignore", fd, "inherit"] });
    } finally { fs.closeSync(fd); }
    if (fs.statSync(databasePath).size < 100) throw new Error("Database dump is unexpectedly empty");
    const storage = path.resolve(process.env.STORAGE_ROOT || path.join(live, ".data"));
    if (fs.existsSync(storage)) {
      run("tar", ["-czf", path.join(backup, "uploads.tar.gz"), "-C", path.dirname(storage), path.basename(storage)]);
      run("tar", ["-tzf", path.join(backup, "uploads.tar.gz")], { stdio: "ignore" });
    }
    save({ backup, items, storage, prepared: false, applied: false });
    console.log(`BACKUP_OK ${backup}`);
    return;
  }
  const s = state();
  const stage = path.join(release, "stage");
  if (action === "adopt") {
    if (s.applied) throw new Error("Cannot replace an applied release");
    const runtime = path.join(release, "runtime");
    for (const file of ["server.js", ".next/BUILD_ID", ".next/server/app-paths-manifest.json"]) {
      if (!fs.existsSync(path.join(runtime, file))) throw new Error(`Missing build artifact: ${file}`);
    }
    const routes = JSON.parse(fs.readFileSync(path.join(runtime, ".next/server/app-paths-manifest.json"), "utf8"));
    for (const route of ["/demo/[slug]/page", "/api/pilots/route", "/admin/pilots/page"]) {
      if (!routes[route]) throw new Error(`Missing compiled route: ${route}`);
    }
    s.standalone = runtime; s.buildOutput = path.join(runtime, ".next"); s.prepared = true; save(s);
    console.log("ARTIFACT_READY; Linux staging smoke test still required"); return;
  }
  if (action === "prepare") {
    if (fs.existsSync(stage)) throw new Error("Stage already exists; inspect it before retrying");
    fs.mkdirSync(stage, { mode: 0o700 });
    for (const item of sourceItems) if (fs.existsSync(path.join(live, item))) fs.cpSync(path.join(live, item), path.join(stage, item), { recursive: true });
    const manifest = JSON.parse(fs.readFileSync(path.join(release, "manifest.json"), "utf8"));
    for (const file of manifest.files) {
      if (file.includes("..") || path.isAbsolute(file)) throw new Error("Unsafe manifest path");
      const target = path.join(stage, file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(release, "payload", file), target);
    }
    const buildModules = fs.existsSync(path.join(release, "build-tools/node_modules/next"))
      ? path.join(release, "build-tools/node_modules")
      : path.join(live, "node_modules");
    fs.symlinkSync(buildModules, path.join(stage, "node_modules"));
    env();
    // cPanel's compiler worker needs runtime env for sitemap generation.
    run(process.execPath, [path.join(buildModules, "next/dist/bin/next"), "build", "--webpack"], { cwd: stage, env: { ...process.env, NODE_ENV: "production", RAYON_NUM_THREADS: "1", UV_THREADPOOL_SIZE: "1" } });
    const candidates = [path.join(stage, ".next/standalone/server.js"), path.join(stage, ".next/standalone", path.relative("/home/pauldigi", stage), "server.js")];
    const standalone = candidates.find(file => fs.existsSync(file));
    if (!standalone) throw new Error("Standalone server.js not found");
    s.standalone = path.dirname(standalone); s.buildOutput = path.join(stage, ".next"); s.prepared = true; save(s);
    console.log(`BUILD_OK ${stage}`);
    return;
  }
  if (action === "apply") {
    if (!s.prepared || s.applied) throw new Error("Release is not ready or already applied");
    env();
    const mysql = createRequire(path.join(live, "package.json"))("mysql2/promise");
    const conn = await mysql.createConnection({ host: process.env.MYSQL_HOST || "localhost", port: Number(process.env.MYSQL_PORT || 3306), user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE });
    try { await conn.query(fs.readFileSync(path.join(stage, "db/migrations/20260928-pilot-requests.sql"), "utf8")); } finally { await conn.end(); }
    const incoming = path.join(live, ".next-labs-incoming");
    if (fs.existsSync(incoming)) throw new Error("Incoming directory already exists");
    fs.cpSync(path.join(s.standalone, ".next"), incoming, { recursive: true });
    fs.cpSync(path.join(s.buildOutput, "static"), path.join(incoming, "static"), { recursive: true });
    s.oldBuild = path.join(live, `.next-before-labs-${Date.now()}`); save(s);
    fs.renameSync(path.join(live, ".next"), s.oldBuild);
    try {
      fs.renameSync(incoming, path.join(live, ".next"));
      fs.copyFileSync(path.join(s.standalone, "server.js"), path.join(live, "server.js"));
      const manifest = JSON.parse(fs.readFileSync(path.join(release, "manifest.json"), "utf8"));
      for (const file of manifest.files) {
        fs.mkdirSync(path.dirname(path.join(live, file)), { recursive: true });
        fs.copyFileSync(path.join(stage, file), path.join(live, file));
      }
      fs.mkdirSync(path.join(live, "tmp"), { recursive: true });
      fs.writeFileSync(path.join(live, "tmp/restart.txt"), new Date().toISOString());
      s.applied = true; save(s); console.log("APPLY_OK; restart requested; verify public routes");
    } catch (error) {
      console.error("Apply failed. Restoring active files from backup.");
      run("tar", ["-xzf", path.join(s.backup, "application.tar.gz"), "-C", live]);
      fs.writeFileSync(path.join(live, "tmp/restart.txt"), new Date().toISOString());
      throw error;
    }
    return;
  }
  if (action === "rollback") {
    if (!s.applied) throw new Error("This release has not been applied");
    // The additive pilot table is retained to avoid deleting any submitted registrations.
    run("tar", ["-xzf", path.join(s.backup, "application.tar.gz"), "-C", live]);
    fs.writeFileSync(path.join(live, "tmp/restart.txt"), new Date().toISOString());
    s.applied = false; save(s); console.log("ROLLBACK_OK"); return;
  }
  throw new Error("Expected backup, prepare, adopt, apply, or rollback");
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
