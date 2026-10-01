const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const id = process.argv[2];
if (!/^tools-\d{8}-[a-z0-9-]+$/.test(id || '')) throw new Error('Pass a unique tools-YYYYMMDD-name release id');
const root = path.resolve(__dirname, '..'), release = path.join(root, 'outputs', id);
if (fs.existsSync(release)) throw new Error('Release already exists; use a fresh id');
const runtime = path.join(release, 'runtime');
fs.mkdirSync(runtime, { recursive: true });
fs.cpSync(path.join(root, '.next/standalone/.next'), path.join(runtime, '.next'), { recursive: true });
fs.cpSync(path.join(root, '.next/static'), path.join(runtime, '.next/static'), { recursive: true });
for (const file of ['server.js']) fs.copyFileSync(path.join(root, '.next/standalone', file), path.join(runtime, file));
for (const item of ['public', 'server', 'db', 'package.json', 'package-lock.json']) fs.cpSync(path.join(root, item), path.join(runtime, item), { recursive: true });
for (const item of ['app', 'lib', 'server', 'db', 'public', 'next.config.ts', 'tsconfig.json', 'postcss.config.mjs', 'package.json', 'package-lock.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml']) fs.cpSync(path.join(root, item), path.join(release, 'source', item), { recursive: true });
for (const item of ['deploy/tools-release.cjs', 'deploy/tools-smoke.cjs', 'deploy/tools-verify.cjs']) {
  const source = path.join(root, item); if (!fs.existsSync(source)) throw new Error('Missing release helper ' + item);
  fs.mkdirSync(path.dirname(path.join(release, item)), { recursive: true }); fs.copyFileSync(source, path.join(release, item));
}
fs.mkdirSync(path.join(runtime, 'tests'), { recursive: true });
fs.copyFileSync(path.join(root, 'tests/tools-benchmark.cjs'), path.join(runtime, 'tests/tools-benchmark.cjs'));
fs.writeFileSync(path.join(release, 'manifest.json'), JSON.stringify({ id, buildId: fs.readFileSync(path.join(runtime, '.next/BUILD_ID'), 'utf8').trim(), created: new Date().toISOString(), dependencies: JSON.parse(fs.readFileSync(path.join(root, 'package.json'))).dependencies }, null, 2));
const archive = path.join(root, 'outputs', id + '.tar.gz');
const tar = spawnSync('tar', ['-czf', archive, '-C', path.dirname(release), id], { stdio: 'inherit' });
if (tar.status !== 0) throw new Error('Archive failed');
const sha256 = crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
fs.writeFileSync(archive + '.sha256', sha256 + '\n'); console.log(JSON.stringify({ archive, bytes: fs.statSync(archive).size, sha256 }));
