const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the deployment entry without invoking a shell or touching a host.
async function simulate(action, { failRuntimeArchive = false } = {}) {
  const release = '/home/pauldigi/vireon-releases/tools-20261001-test';
  const active = '/home/pauldigi/vireon-releases/tools-20260929-beta1/runtime';
  const statePath = release + '/release-state.json';
  const state = JSON.stringify({ backup: '/old-backup', prepared: true, applied: true });
  const writes = new Map(), commands = [], messages = [];
  const fakeProcess = {
    argv: ['node', 'tools-release.cjs', action], version: 'v22.23.2',
    env: { MYSQL_DATABASE: 'portal', MYSQL_USER: 'test' },
    loadEnvFile() {},
  };
  const fakeFs = {
    existsSync: p => p === statePath || p.endsWith('/app.cjs') || p.endsWith('/.env'),
    readFileSync: p => p === statePath ? state : `require("${active}/server.js");`,
    realpathSync: p => p,
    mkdirSync() {}, copyFileSync() {}, chmodSync() {}, closeSync() {},
    openSync: () => 42, readdirSync: () => [], statSync: () => ({ size: 1024 }),
    writeFileSync: (p, text) => writes.set(p, text),
  };
  const spawnSync = (bin, args) => {
    commands.push({ bin, args });
    const failed = failRuntimeArchive && args.includes('-czf') && args.some(a => a.endsWith('/active-runtime.tar.gz'));
    return { status: failed ? 1 : 0, stdout: '# existing cron\n', stderr: '' };
  };
  const context = {
    __dirname: release + '/deploy', process: fakeProcess,
    console: { log: x => messages.push(x), error: x => messages.push(x) },
    require: name => ({ 'node:fs': fakeFs, 'node:path': path.posix,
      'node:child_process': { spawnSync } })[name],
  };
  const promise = vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../deploy/tools-release.cjs'), 'utf8'), context);
  await promise;
  return { writes, commands, messages, fakeProcess, statePath, active };
}

test('snapshot backs up active release and database without changing rollback state', async () => {
  const r = await simulate('snapshot');
  assert.equal(r.fakeProcess.exitCode, undefined);
  assert.equal(r.writes.has(r.statePath), false);
  assert.ok(r.commands.some(c => c.bin === 'tar' && c.args.includes('-czf') && c.args.includes(path.posix.dirname(r.active))));
  const manifest = [...r.writes].find(([p]) => p.endsWith('/active-runtime.json'));
  assert.equal(JSON.parse(manifest[1]).path, r.active);
  const dump = r.commands.find(c => c.bin === 'mysqldump');
  assert.ok(dump.args.includes('--ignore-table=portal.tool_jobs'));
  assert.ok(r.messages.some(m => m.startsWith('TOOLS_BACKUP_OK ')));
});

test('failed active runtime archive never reports successful backup', async () => {
  const r = await simulate('snapshot', { failRuntimeArchive: true });
  assert.equal(r.fakeProcess.exitCode, 1);
  assert.equal(r.writes.has(r.statePath), false);
  assert.equal(r.messages.some(m => m.startsWith('TOOLS_BACKUP_OK ')), false);
  assert.equal(r.commands.some(c => c.bin === 'mysqldump'), false);
});

test('backup and checkpoint refuse an already applied release', async () => {
  for (const action of ['backup', 'checkpoint']) {
    const r = await simulate(action);
    assert.equal(r.fakeProcess.exitCode, 1);
    assert.equal(r.commands.length, 0);
  }
});
