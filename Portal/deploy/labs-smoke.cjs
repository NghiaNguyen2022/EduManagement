const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const release = path.resolve(__dirname, "..");
const live = "/home/pauldigi/apps/vireon-portal";
async function main() {
  const state = JSON.parse(fs.readFileSync(path.join(release, "release-state.json"), "utf8"));
  if (!state.prepared) throw new Error("Release is not built");
  process.loadEnvFile(path.join(live, ".env"));
  const sourceStatic = path.join(state.buildOutput, "static");
  const targetStatic = path.join(state.standalone, ".next/static");
  if (sourceStatic !== targetStatic) fs.cpSync(sourceStatic, targetStatic, { recursive: true });
  fs.cpSync(path.join(release, "stage/public"), path.join(state.standalone, "public"), { recursive: true });
  let log = "";
  const server = spawn(process.execPath, [path.join(state.standalone, "server.js")], {
    cwd: state.standalone,
    env: { ...process.env, NODE_ENV: "production", HOSTNAME: "127.0.0.1", PORT: "3219", NODE_PATH: path.join(release, "build-tools/node_modules"), RAYON_NUM_THREADS: "1", UV_THREADPOOL_SIZE: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", data => { log += data; });
  server.stderr.on("data", data => { log += data; });
  let startError;
  server.on("error", error => { startError = error; });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      if (startError) throw startError;
      if (server.exitCode !== null) throw new Error(`Staging server exited: ${log.slice(-3000)}`);
      try { const response = await fetch("http://127.0.0.1:3219/robots.txt"); if (response.ok) { ready = true; break; } } catch {}
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (!ready) throw new Error("Staging server did not become ready");
    for (const route of ["/", "/app-portal", "/app-portal/nhat-ky-hien-truong", "/demo/nhat-ky-hien-truong", "/demo/bao-hong-thiet-bi", "/demo/kiem-tra-trung-bay"]) {
      const response = await fetch(`http://127.0.0.1:3219${route}`);
      if (response.status !== 200) throw new Error(`${route}: HTTP ${response.status}`);
      const html = await response.text();
      if (!html.includes("Vireon") && !html.includes("VIREON")) throw new Error(`${route}: unexpected response`);
      const assets = [...html.matchAll(/(?:src|href)="([^" ]*\/_next\/static\/[^" ]+)"/g)].map(match => match[1]);
      if (!assets.length) throw new Error(`${route}: missing static assets`);
      for (const asset of new Set(assets)) {
        const result = await fetch(new URL(asset, "http://127.0.0.1:3219"));
        if (result.status !== 200) throw new Error(`Asset HTTP ${result.status}: ${asset}`);
      }
      console.log(`PASS ${route} and ${new Set(assets).size} assets`);
    }
    console.log("STAGING_SMOKE_OK");
  } finally { server.kill("SIGTERM"); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
