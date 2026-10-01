if (process.env.TOOLS_ENV_FILE) process.loadEnvFile(process.env.TOOLS_ENV_FILE);
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { createReadStream } = require('node:fs');
const { randomUUID, createHash } = require('node:crypto');
const { getPool, query, locked } = require('./db.cjs');
const { limits, root } = require('./config.cjs');
const { directory, filePath, removeJob, UUID } = require('./storage.cjs');
const drive = require('./drive.cjs');

async function cleanup() {
  const cleanupStarted = Date.now();
  const expired = await query('SELECT id FROM tool_jobs WHERE expires_at<=UTC_TIMESTAMP() AND cleaned_at IS NULL LIMIT 100');
  for (const { id } of expired) {
    if (Date.now() - cleanupStarted > 20000) break;
    await locked('tools-job-' + id, async conn => {
      await conn.execute("UPDATE tool_jobs SET status='expired',metadata_json=NULL,result_summary_json=NULL,configuration_json=NULL,error_message=NULL WHERE id=?", [id]);
      await drive.removeJob(id);
      await removeJob(id);
      await conn.execute('DELETE FROM tool_access_sessions WHERE job_id=?', [id]);
      await conn.execute('DELETE FROM tool_access WHERE job_id=?', [id]);
      await conn.execute('DELETE FROM tool_files WHERE job_id=?', [id]);
      await conn.execute('UPDATE tool_jobs SET cleaned_at=UTC_TIMESTAMP() WHERE id=?', [id]);
    }).catch(e => { if (e.code !== 'BUSY') console.error(JSON.stringify({ event: 'tools_cleanup_pending', job: id, code: e.code || 'CLEANUP_ERROR' })); });
  }
  await query('DELETE FROM tool_rate_limits WHERE expires_at<UTC_TIMESTAMP()');
  await query('DELETE FROM tool_sessions WHERE expires_at<UTC_TIMESTAMP()');
  await query('DELETE FROM tool_jobs WHERE cleaned_at<DATE_SUB(UTC_TIMESTAMP(), INTERVAL 7 DAY)');
  await fs.mkdir(root(), { recursive: true, mode: 0o700 });
  const entries = await fs.readdir(root(), { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || !UUID.test(entry.name)) continue;
    const exists = await query('SELECT id FROM tool_jobs WHERE id=?', [entry.name]);
    if (!exists.length && (await fs.stat(directory(entry.name))).mtimeMs < Date.now() - 86400000) await removeJob(entry.name);
  }
}
async function runChild(taskPath, conn) {
  const started = Date.now();
  return await new Promise(resolve => {
    const child = spawn(process.execPath, ['--max-old-space-size=256', path.join(__dirname, 'task.cjs'), taskPath], { stdio: 'ignore', windowsHide: true, env: { PATH: process.env.PATH, NODE_ENV: process.env.NODE_ENV, TOOLS_FILE_BYTES: String(limits.fileBytes), TOOLS_MAX_FILES: String(limits.files), TOOLS_MAX_ROWS: String(limits.rows), TOOLS_MAX_CELLS: String(limits.cells) } });
    let timedOut = false, lostConnection = false, finished = false;
    const timeout = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, limits.timeoutMs);
    const heartbeat = setInterval(() => {
      conn.execute('UPDATE tool_runtime SET heartbeat_at=UTC_TIMESTAMP() WHERE id=1').catch(() => { lostConnection = true; child.kill('SIGKILL'); });
    }, 10000);
    function finish(code) { if (finished) return; finished = true; clearTimeout(timeout); clearInterval(heartbeat); resolve({ code, timedOut, lostConnection, durationMs: Date.now() - started }); }
    child.once('error', () => finish(1)); child.once('exit', finish);
  });
}
async function processJob(id, conn) {
  const [lock] = await conn.execute('SELECT GET_LOCK(?,0) AS acquired', ['tools-job-' + id]);
  if (!lock[0].acquired) return;
  let taskFile, responseFile, output;
  try {
    const [rows] = await conn.execute("SELECT * FROM tool_jobs WHERE id=? AND status='queued' AND expires_at>UTC_TIMESTAMP()", [id]);
    if (!rows.length) return;
    const j = rows[0];
    await conn.execute("UPDATE tool_jobs SET status='processing',claimed_at=UTC_TIMESTAMP(),attempts=attempts+1 WHERE id=?", [id]);
    const [files] = await conn.execute("SELECT * FROM tool_files WHERE job_id=? AND role='input' AND uploaded=1 ORDER BY ordinal", [id]);
    for (const f of files) await drive.hydrate(f);
    await drive.syncJob(id);
    await fs.mkdir(directory(id), { recursive: true, mode: 0o700 });
    const attempt = randomUUID();
    taskFile = filePath(id, attempt + '.task.json'); responseFile = filePath(id, attempt + '.response.json'); output = filePath(id, attempt + '.xlsx');
    await fs.writeFile(taskFile, JSON.stringify({ phase: j.phase, files: files.map(f => ({ id: f.id, name: f.original_filename, path: filePath(id, f.storage_key) })), config: j.configuration_json ? JSON.parse(j.configuration_json) : null, output, response: responseFile }), { mode: 0o600 });
    const state = await runChild(taskFile, conn);
    if (state.lostConnection) throw new Error('Worker lost database lock');
    const error = state.timedOut ? { code: 'WORKER_TIMEOUT', message: 'File xử lý quá 60 giây. Hãy giảm số dòng/cột và thử lại.' } : state.code !== 0 ? { code: 'WORKER_ERROR', message: 'Bộ xử lý đã dừng do giới hạn tài nguyên. Hãy giảm dữ liệu hoặc thử lại.' } : null;
    const response = error ? { error } : JSON.parse(await fs.readFile(responseFile, 'utf8'));
    if (response.error) {
      await conn.execute("UPDATE tool_jobs SET status='failed',error_code=?,error_message=? WHERE id=? AND status='processing'", [response.error.code, response.error.message.slice(0, 255), id]);
    } else if (j.phase === 'inspect') {
      await conn.execute("UPDATE tool_jobs SET status='configured',metadata_json=? WHERE id=? AND status='processing'", [JSON.stringify(response.metadata), id]);
    } else {
      const stat = await fs.stat(output);
      if (stat.size < 100) throw new Error('Empty result');
      const digestState = createHash('sha256');
      for await (const chunk of createReadStream(output)) digestState.update(chunk);
      const digest = digestState.digest('hex');
      await conn.beginTransaction();
      try {
        await conn.execute("INSERT INTO tool_files (id,job_id,role,storage_key,original_filename,size_bytes,sha256,uploaded) VALUES (?,?,'output',?,'result.xlsx',?,?,1)", [randomUUID(), id, path.basename(output), stat.size, digest]);
        await conn.execute("UPDATE tool_jobs SET status='ready',result_summary_json=? WHERE id=? AND status='processing'", [JSON.stringify(response.result), id]);
        await conn.commit(); output = null;
      } catch (e) { await conn.rollback(); throw e; }
    }
    console.log(JSON.stringify({ event: 'tools_task', job: id, phase: j.phase, durationMs: state.durationMs, maxRssKb: response.metrics?.maxRssKb, outcome: response.error?.code || 'ok' }));
  } catch {
    await conn.execute("UPDATE tool_jobs SET status='failed',error_code='WORKER_ERROR',error_message='Bộ xử lý chưa hoàn tất. Bạn có thể thử lại.' WHERE id=? AND status='processing'", [id]).catch(() => {});
    console.error(JSON.stringify({ event: 'tools_task_error', job: id }));
  } finally {
    for (const file of [taskFile, responseFile, output]) if (file) await fs.rm(file, { force: true }).catch(() => {});
    await drive.syncJob(id).catch(() => console.error(JSON.stringify({ event: 'tools_drive_pending', job: id })));
    await conn.execute('SELECT RELEASE_LOCK(?)', ['tools-job-' + id]).catch(() => {});
  }
}
async function tick() {
  try {
    await locked('vireon-tools-worker', async conn => {
      await conn.execute('INSERT INTO tool_runtime (id,heartbeat_at) VALUES (1,UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE heartbeat_at=UTC_TIMESTAMP()');
      // Holding the global lock proves the previous worker connection is gone.
      await conn.execute("UPDATE tool_jobs SET status='failed',error_code='WORKER_STOPPED',error_message='Tác vụ bị gián đoạn. Bạn có thể thử lại.' WHERE status='processing'");
      await cleanup();
      const [pending] = await conn.execute("SELECT DISTINCT j.id FROM tool_jobs j JOIN tool_access a ON a.job_id=j.id JOIN tool_files f ON f.job_id=j.id LEFT JOIN tool_cloud_files c ON c.file_id=f.id AND c.synced=1 WHERE a.storage_provider='drive' AND j.status IN ('uploading','configured','ready','failed') AND j.expires_at>UTC_TIMESTAMP() AND f.uploaded=1 AND c.file_id IS NULL LIMIT 1");
      if (pending.length) await locked('tools-job-' + pending[0].id, () => drive.syncJob(pending[0].id)).catch(() => console.error(JSON.stringify({ event: 'tools_drive_pending', job: pending[0].id })));
      const [jobs] = await conn.execute("SELECT id FROM tool_jobs WHERE status='queued' AND expires_at>UTC_TIMESTAMP() ORDER BY created_at LIMIT 1");
      if (jobs.length) await processJob(jobs[0].id, conn);
    });
  } catch (e) { if (e.code !== 'BUSY') throw e; }
}
async function main() {
  if (process.env.TOOLS_ENV_FILE) process.loadEnvFile(process.env.TOOLS_ENV_FILE);
  do { await tick(); if (process.argv.includes('--loop')) await new Promise(r => setTimeout(r, 2000)); } while (process.argv.includes('--loop'));
  await getPool().end();
}
if (require.main === module) main().catch(() => { console.error('tools_worker_unavailable'); process.exitCode = 1; getPool().end().catch(() => {}); });
module.exports = { tick, cleanup, processJob };
