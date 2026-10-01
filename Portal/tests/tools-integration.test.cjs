const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { randomUUID } = require('node:crypto');
const mysql = require('mysql2/promise');
const ExcelJS = require('exceljs');
// Explicitly targets a throwaway LOCAL database; never reads .env or production credentials.
const active = process.env.TOOLS_TEST_MYSQL_PORT;
let admin, db, temp, handle, tick, cleanup, query, pool;
const origin = 'http://127.0.0.1:3199';
test.before(async () => {
  if (!active) return;
  admin = await mysql.createConnection({ host: '127.0.0.1', port: Number(active), user: process.env.TOOLS_TEST_MYSQL_USER || 'root', password: process.env.TOOLS_TEST_MYSQL_PASSWORD || '' });
  db = 'tools_test_' + process.pid; await admin.query(`CREATE DATABASE \`${db}\` CHARACTER SET utf8mb4`);
  temp = await fs.mkdtemp(path.join(os.tmpdir(), 'vireon-tools-integration-'));
  Object.assign(process.env, { MYSQL_HOST: '127.0.0.1', MYSQL_PORT: active, MYSQL_DATABASE: db, MYSQL_USER: process.env.TOOLS_TEST_MYSQL_USER || 'root', MYSQL_PASSWORD: process.env.TOOLS_TEST_MYSQL_PASSWORD || '', NODE_ENV: 'test', TOOLS_ENABLED: 'true', TOOLS_STORAGE_ROOT: temp, TOOLS_ORIGIN: origin, FREE_BETA: 'true' });
  ({ query, getPool: pool } = require('../server/tools/db.cjs'));
  for (const file of ['20260929-tools.sql', '20260930-tools-commerce.sql']) {
    const sql = await fs.readFile(path.join(__dirname, '../db/migrations', file), 'utf8');
    for (const statement of sql.split(';').map(s => s.trim()).filter(Boolean)) await query(statement);
  }
  ({ handle } = require('../server/tools/api.cjs')); ({ tick, cleanup } = require('../server/tools/worker.cjs')); await tick();
});
test.after(async () => { if (!active) return; if (pool) await pool().end(); if (admin) { if (/^tools_test_\d+$/.test(db)) await admin.query(`DROP DATABASE \`${db}\``); await admin.end(); } if (temp) await fs.rm(temp, { recursive: true, force: true }); });
async function request(cookie, method, id, action, body, extra = {}) {
  const url = origin + '/api/tools/' + (action === 'session' ? 'session' : 'jobs' + (id ? '/' + id : '') + (action ? '/' + action : '')) + (extra.search || '');
  return handle(new Request(url, { method, headers: { Origin: origin, ...(cookie ? { Cookie: cookie } : {}), ...(body && typeof body !== 'string' && !Buffer.isBuffer(body) ? { 'Content-Type': 'application/json' } : {}), ...extra.headers }, body: body === undefined ? undefined : Buffer.isBuffer(body) || typeof body === 'string' ? body : JSON.stringify(body), duplex: 'half' }), id, action);
}
async function session() { const response = await request('', 'POST', undefined, 'session'); assert.equal(response.status, 200); return response.headers.get('set-cookie').split(';')[0]; }
async function create(cookie, contents, key = randomUUID()) {
  const response = await request(cookie, 'POST', undefined, undefined, { requestKey: key, files: contents.map((s, i) => ({ name: 'input-' + i + '.csv', size: Buffer.byteLength(s) })) });
  assert.ok([200, 201].includes(response.status), JSON.stringify(await response.clone().json()));
  const j = await response.json();
  for (let i = 0; i < contents.length; i++) { const r = await request(cookie, 'PUT', j.id, 'file', contents[i], { search: '?file=' + j.files[i].id }); assert.equal(r.status, 200); }
  assert.equal((await request(cookie, 'POST', j.id, 'inspect')).status, 200); await tick();
  return (await request(cookie, 'GET', j.id)).json();
}
const options = { skip: !active };
test('real MySQL queue, ownership, idempotency and XLSX download for all operations', options, async () => {
  const owner = await session(), stranger = await session();
  for (const operation of ['deduplicate', 'merge', 'compare']) {
    const contents = operation === 'deduplicate' ? ['ID,Value\n001,A\n001,B\n,Blank\n'] : ['ID,Value\n001,A\n002,B\n', 'ID,Value\n001,C\n003,D\n'];
    const j = await create(owner, contents); assert.equal(j.status, 'configured');
    assert.equal((await request(stranger, 'GET', j.id)).status, 404);
    assert.equal((await request(stranger, 'GET', j.id, 'download')).status, 404);
    assert.equal((await request(owner, 'GET', j.id, 'download')).status, 403);
    const config = { operation, sources: j.metadata.files.map(f => ({ fileId: f.id, sheet: 'CSV', keys: [0], compare: [1], names: ['ID', 'Value'] })) };
    const first = await request(owner, 'POST', j.id, 'process', config); assert.equal(first.status, 200);
    assert.equal((await request(owner, 'POST', j.id, 'process', config)).status, 200);
    await Promise.all([tick(), tick()]);
    const ready = await (await request(owner, 'GET', j.id)).json(); assert.equal(ready.status, 'ready', JSON.stringify(ready));
    const download = await request(owner, 'GET', j.id, 'download'); assert.equal(download.status, 200); assert.match(download.headers.get('cache-control'), /no-store/);
    const book = new ExcelJS.Workbook(); await book.xlsx.load(Buffer.from(await download.arrayBuffer())); assert.ok(book.getWorksheet('Summary'));
    if (operation === 'deduplicate') { assert.equal(ready.result.stats.removedRows, 1); assert.equal(book.getWorksheet('Cleaned').getCell('A2').value, '001'); }
    if (operation === 'merge') assert.equal(book.getWorksheet('Merged').rowCount, 5);
    if (operation === 'compare') assert.equal(ready.result.stats.changedCells, 1);
    assert.equal((await query("SELECT id FROM tool_files WHERE job_id=? AND role='output'", [j.id])).length, 1);
    // Existing free jobs retain their original entitlement after configuration changes.
    process.env.FREE_BETA = 'false'; assert.equal((await request(owner, 'GET', j.id, 'download')).status, 200); process.env.FREE_BETA = 'true';
  }
});
test('CSRF, missing session, body size and uploaded file size are enforced', options, async () => {
  const owner = await session();
  assert.equal((await request(owner, 'POST', undefined, undefined, {}, { headers: { Origin: 'https://evil.invalid' } })).status, 403);
  assert.equal((await request('', 'GET')).status, 401);
  assert.equal((await request(owner, 'POST', undefined, undefined, { huge: 'a'.repeat(65536) })).status, 413);
  const response = await request(owner, 'POST', undefined, undefined, { requestKey: randomUUID(), files: [{ name: 'wrong.csv', size: 3 }] }); const j = await response.json();
  const overflow = await request(owner, 'PUT', j.id, 'file', 'TOO-LONG', { search: '?file=' + j.files[0].id }); assert.notEqual(overflow.status, 200);
  assert.equal((await query('SELECT uploaded FROM tool_files WHERE job_id=?', [j.id]))[0].uploaded, 0);
  assert.equal((await request(owner, 'POST', j.id, 'inspect')).status, 400);
  const files = await fs.readdir(path.join(temp, j.id)); assert.equal(files.length, 0);
});
test('create idempotency, interrupted worker retry, expiry and physical cleanup', options, async () => {
  const owner = await session(), key = randomUUID();
  const body = { requestKey: key, files: [{ name: 'x.csv', size: 5 }] };
  const first = await (await request(owner, 'POST', undefined, undefined, body)).json(); const second = await (await request(owner, 'POST', undefined, undefined, body)).json(); assert.equal(first.id, second.id);
  const j = await create(owner, ['ID,Value\n1,A\n']);
  await query("UPDATE tool_jobs SET status='processing' WHERE id=?", [j.id]); await tick();
  assert.equal((await (await request(owner, 'GET', j.id)).json()).status, 'failed');
  assert.equal((await request(owner, 'POST', j.id, 'retry')).status, 200); await tick();
  assert.equal((await (await request(owner, 'GET', j.id)).json()).status, 'configured');
  await query('UPDATE tool_jobs SET expires_at=DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 SECOND) WHERE id=?', [j.id]);
  assert.equal((await request(owner, 'GET', j.id)).status, 410); await cleanup();
  await assert.rejects(fs.stat(path.join(temp, j.id)), { code: 'ENOENT' });
  const stored = (await query('SELECT * FROM tool_jobs WHERE id=?', [j.id]))[0]; assert.equal(stored.metadata_json, null); assert.equal(stored.status, 'expired');
});
test('worker kills a child exceeding its deadline without publishing a result', options, async () => {
  const owner = await session(); const j = await create(owner, ['ID,Value\n1,A\n']);
  const configuration = { operation: 'deduplicate', sources: j.metadata.files.map(f => ({ fileId: f.id, sheet: 'CSV', keys: [0] })) };
  assert.equal((await request(owner, 'POST', j.id, 'process', configuration)).status, 200);
  const result = require('node:child_process').spawnSync(process.execPath, [path.join(__dirname, '../server/tools/worker.cjs')], { env: { ...process.env, TOOLS_TIMEOUT_MS: '1' }, timeout: 10000, stdio: 'ignore' });
  assert.equal(result.status, 0);
  const row = (await query('SELECT status,error_code FROM tool_jobs WHERE id=?', [j.id]))[0];
  assert.equal(row.status, 'failed'); assert.equal(row.error_code, 'WORKER_TIMEOUT');
  assert.equal((await query("SELECT id FROM tool_files WHERE job_id=? AND role='output'", [j.id])).length, 0);
});

async function finishJob(cookie, j) {
  const configuration = { operation: 'deduplicate', sources: j.metadata.files.map(f => ({ fileId: f.id, sheet: 'CSV', keys: [0] })) };
  assert.equal((await request(cookie, 'POST', j.id, 'process', configuration)).status, 200);
  await tick(); return (await request(cookie, 'GET', j.id)).json();
}
test('manual activation unlocks only the matched job, including QR on another device', options, async () => {
  const settings = require('../server/tools/settings.cjs'), commerce = require('../server/tools/commerce.cjs');
  const { hash } = require('../server/tools/secrets.cjs');
  await settings.mutate(s => Object.assign(s.values, { billingEnabled: true, priceVnd: 15000, momoPhone: '0900000000', zaloPhone: '0900000000', momoName: 'Test', instructions: 'Synthetic only' }));
  const owner = await session(), stranger = await session(), resumed = await session();
  const j = await finishJob(owner, await create(owner, ['ID,Value\n1,A\n1,B\n']));
  assert.equal(j.payment.amount, 15000); assert.equal(j.payment.status, 'unpaid'); assert.equal(j.canDownload, false);
  assert.ok(new Date(j.expiresAt).getTime() - Date.now() > 29 * 86400000);
  const recovery = await (await request(owner, 'POST', j.id, 'recovery')).json();
  assert.match(recovery.qr, /^data:image\/png;base64,/);
  const token = new URLSearchParams(new URL(recovery.url).hash.slice(1)).get('resume');
  assert.equal((await request(stranger, 'GET', j.id)).status, 404);
  assert.equal((await request(resumed, 'POST', undefined, 'resume', { token })).status, 200);
  assert.equal((await request(owner, 'GET', j.id, 'download')).status, 403);
  assert.equal((await request(resumed, 'GET', j.id, 'download')).status, 403);
  const found = await commerce.list(0, j.payment.reference); assert.equal(found.length, 1); assert.equal(found[0].id, j.id);
  const activated = await commerce.approve(j.id, hash('test-admin')); assert.equal(activated.reference, j.payment.reference); assert.equal('code' in activated, false);
  await commerce.approve(j.id, hash('test-admin'));
  assert.equal((await query('SELECT * FROM tool_payment_audit WHERE job_id=?', [j.id])).length, 1);
  assert.equal((await request(stranger, 'GET', j.id, 'download')).status, 404);
  assert.equal((await request(resumed, 'GET', j.id, 'download')).status, 200);
  assert.equal((await (await request(owner, 'GET', j.id)).json()).canDownload, true);
  const second = await finishJob(owner, await create(owner, ['ID,Value\n2,C\n']));
  assert.equal((await request(resumed, 'GET', second.id)).status, 404);
  assert.equal((await request(owner, 'GET', second.id, 'download')).status, 403);
  await settings.mutate(s => { s.values.billingEnabled = false; s.values.priceVnd = 30000; });
  assert.equal((await (await request(owner, 'GET', second.id)).json()).payment.amount, 15000);
  assert.equal((await request(owner, 'GET', second.id, 'download')).status, 403);
  await query('UPDATE tool_jobs SET expires_at=DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 SECOND) WHERE id=?', [j.id]);
  assert.equal((await request(resumed, 'GET', j.id, 'download')).status, 410);
  assert.equal((await request(resumed, 'POST', undefined, 'resume', { token })).status, 404);
  await cleanup(); assert.equal((await query('SELECT job_id FROM tool_access WHERE job_id=?', [j.id])).length, 0);
});

test('Drive protocol: verified offload, rehydrate, gated download and retryable expiry deletion', options, async () => {
  const settings = require('../server/tools/settings.cjs');
  const crypto = require('node:crypto'), savedFetch = global.fetch, cloud = new Map(); let serial = 0, failDelete = false;
  global.fetch = async (url, init = {}) => {
    const u = new URL(url);
    if (u.hostname === 'oauth2.googleapis.com') return Response.json({ access_token: 'FAKE' });
    assert.equal(u.hostname, 'www.googleapis.com');
    if (u.pathname.endsWith('/generateIds')) return Response.json({ ids: ['fake-' + (++serial)] });
    if (u.pathname.startsWith('/upload/')) {
      const body = Buffer.from(init.body), delimiter = init.headers['Content-Type'].split('boundary=')[1];
      const marker = Buffer.from('\r\n--' + delimiter + '\r\nContent-Type: application/octet-stream\r\n\r\n');
      const start = body.indexOf('\r\n\r\n') + 4, split = body.indexOf(marker);
      const metadata = JSON.parse(body.subarray(start, split).toString());
      const data = body.subarray(split + marker.length, body.length - Buffer.byteLength('\r\n--' + delimiter + '--\r\n'));
      assert.ok(!metadata.name.includes('input-')); assert.deepEqual(metadata.parents, ['private-folder']);
      cloud.set(metadata.id, Buffer.from(data)); return Response.json({ id: metadata.id });
    }
    const id = u.pathname.split('/').pop(), data = cloud.get(id);
    if (init.method === 'DELETE') { if (failDelete) return new Response('', { status: 503 }); cloud.delete(id); return new Response(null, { status: data ? 204 : 404 }); }
    if (!data) return new Response('', { status: 404 });
    if (u.searchParams.get('alt') === 'media') return new Response(data);
    return Response.json({ id, size: String(data.length), md5Checksum: crypto.createHash('md5').update(data).digest('hex'), trashed: false });
  };
  try {
    await settings.mutate(s => { Object.assign(s.values, { driveEnabled: true, billingEnabled: false, clientId: 'fake' }); Object.assign(s.secrets, { refreshToken: 'fake', clientSecret: 'fake', folderId: 'private-folder' }); });
    const owner = await session(), configured = await create(owner, ['ID,Value\n1,A\n1,B\n']); assert.equal(configured.status, 'configured');
    const input = (await query("SELECT * FROM tool_files WHERE job_id=? AND role='input'", [configured.id]))[0];
    await assert.rejects(fs.stat(path.join(temp, configured.id, input.storage_key)), { code: 'ENOENT' });
    const ready = await finishJob(owner, configured); assert.equal(ready.status, 'ready'); assert.equal(ready.storageReady, true); assert.equal(cloud.size, 2);
    const download = await request(owner, 'GET', ready.id, 'download'); assert.equal(download.status, 200);
    const book = new ExcelJS.Workbook(); await book.xlsx.load(Buffer.from(await download.arrayBuffer())); assert.ok(book.getWorksheet('Summary'));
    await query('UPDATE tool_jobs SET expires_at=DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 SECOND) WHERE id=?', [ready.id]);
    failDelete = true; await cleanup(); assert.equal(cloud.size, 2); assert.equal((await query('SELECT cleaned_at FROM tool_jobs WHERE id=?', [ready.id]))[0].cleaned_at, null);
    assert.equal((await request(owner, 'GET', ready.id, 'download')).status, 410);
    failDelete = false; await cleanup(); assert.equal(cloud.size, 0); assert.equal((await query('SELECT * FROM tool_cloud_files')).length, 0);
  } finally { global.fetch = savedFetch; await settings.mutate(s => { s.values.driveEnabled = false; s.secrets = {}; s.values.clientId = ''; }); }
});

test('Google OAuth state is single-use, admin-bound and rejects switching Drive accounts', options, async () => {
  const settings = require('../server/tools/settings.cjs'), drive = require('../server/tools/drive.cjs');
  const { hash } = require('../server/tools/secrets.cjs');
  const previous = await settings.get(), savedFetch = global.fetch, actor = hash('admin-oauth'); let account = 'account-one', requests = 0;
  global.fetch = async url => {
    requests++;
    const u = new URL(url);
    if (u.hostname === 'oauth2.googleapis.com') return Response.json({ access_token: 'TEST-ACCESS', refresh_token: 'TEST-REFRESH', scope: 'https://www.googleapis.com/auth/drive.file' });
    if (u.pathname.endsWith('/about')) return Response.json({ user: { permissionId: account, emailAddress: 'test@example.invalid' } });
    if (u.pathname.endsWith('/files')) return Response.json({ id: 'test-folder' });
    throw new Error('Unexpected Google endpoint');
  };
  try {
    await settings.mutate(s => { s.values.clientId = 'TEST-CLIENT'; s.secrets = { clientSecret: 'TEST-SECRET' }; });
    const url = new URL(await drive.begin(actor)), state = url.searchParams.get('state');
    assert.equal(url.searchParams.get('scope'), 'https://www.googleapis.com/auth/drive.file');
    await assert.rejects(drive.finish(hash('another-admin'), state, 'test-code'), e => e.code === 'OAUTH_STATE'); assert.equal(requests, 0);
    await drive.finish(actor, state, 'test-code');
    const exposed = settings.sanitized(await settings.get()); assert.equal(exposed.connected, true); assert.equal(exposed.driveEmail, 'test@example.invalid');
    assert.ok(!JSON.stringify(exposed).includes('TEST-SECRET')); assert.ok(!JSON.stringify(exposed).includes('TEST-REFRESH'));
    await assert.rejects(drive.finish(actor, state, 'test-code'), e => e.code === 'OAUTH_STATE');
    account = 'account-two'; const next = new URL(await drive.begin(actor)).searchParams.get('state');
    await assert.rejects(drive.finish(actor, next, 'test-code'), e => e.code === 'DRIVE_ACCOUNT');
    assert.equal((await settings.get()).secrets.accountId, 'account-one');
  } finally { global.fetch = savedFetch; await settings.mutate(s => { s.values = previous.values; s.secrets = previous.secrets; }); }
});
