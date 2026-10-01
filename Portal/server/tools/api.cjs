const { randomBytes, randomUUID, createHash } = require('node:crypto');
const fs = require('node:fs');
const { Readable } = require('node:stream');
const { query, locked } = require('./db.cjs');
const { limits, enabled } = require('./config.cjs');
const { ToolError, check } = require('./errors.cjs');
const storage = require('./storage.cjs');
const { validateConfig } = require('./excel.cjs');
const commerce = require('./commerce.cjs');
const settings = require('./settings.cjs');
const drive = require('./drive.cjs');
const hash = s => createHash('sha256').update(s).digest('hex');
const cookieName = () => process.env.NODE_ENV === 'production' ? '__Host-vireon_tools' : 'vireon_tools';
const privateHeaders = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Vary': 'Cookie' };
function json(value, status = 200, headers = {}) { return Response.json(value, { status, headers: { ...privateHeaders, ...headers } }); }
async function readJson(request) {
  check(request.headers.get('content-type')?.includes('application/json'), 'JSON', 'Yêu cầu JSON không hợp lệ.');
  const reader = request.body?.getReader(); check(reader, 'JSON', 'Thiếu dữ liệu.');
  const chunks = []; let size = 0;
  try {
    for (;;) { const r = await reader.read(); if (r.done) break; size += r.value.length; if (size > 65536) { await reader.cancel(); throw new ToolError('SIZE', 'Yêu cầu quá lớn.', 413); } chunks.push(Buffer.from(r.value)); }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (e) { if (e instanceof ToolError) throw e; throw new ToolError('JSON', 'Dữ liệu không hợp lệ.'); }
}
function sameOrigin(request) {
  const expected = process.env.TOOLS_ORIGIN || (process.env.NODE_ENV === 'production' ? 'https://vireon.vn' : new URL(request.url).origin);
  check(request.headers.get('origin') === expected && request.headers.get('sec-fetch-site') !== 'cross-site', 'ORIGIN', 'Yêu cầu không cùng website.', 403);
}
async function rate(scope, maximum, seconds = 60) {
  const slot = Math.floor(Date.now() / (seconds * 1000));
  const key = `${scope}:${slot}`;
  await query('INSERT INTO tool_rate_limits (bucket_key,hits,expires_at) VALUES (?,1,DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? SECOND)) ON DUPLICATE KEY UPDATE hits=hits+1', [key, seconds * 2]);
  const rows = await query('SELECT hits FROM tool_rate_limits WHERE bucket_key=?', [key]);
  check(rows[0].hits <= maximum, 'RATE_LIMIT', 'Bạn thao tác quá nhanh hoặc hệ thống đã đạt hạn mức beta. Vui lòng thử lại sau.', 429);
}
async function owner(request, required = true) {
  const token = (request.headers.get('cookie') || '').split(';').map(x => x.trim()).find(x => x.startsWith(cookieName() + '='))?.slice(cookieName().length + 1);
  if (token && /^[a-f0-9]{64}$/.test(token)) {
    const hashed = hash(token);
    const rows = await query('SELECT token_hash FROM tool_sessions WHERE token_hash=? AND expires_at>UTC_TIMESTAMP()', [hashed]);
    if (rows.length) return hashed;
  }
  check(!required, 'SESSION', 'Phiên đã hết hạn. Hãy tải lại trang và dùng QR/liên kết khôi phục đã lưu.', 401);
  return null;
}
async function job(id, ownerHash) {
  check(storage.UUID.test(id || ''), 'NOT_FOUND', 'Không tìm thấy công việc.', 404);
  const rows = await query('SELECT * FROM tool_jobs WHERE id=? AND (owner_hash=? OR EXISTS (SELECT 1 FROM tool_access_sessions a WHERE a.job_id=tool_jobs.id AND a.owner_hash=?))', [id, ownerHash, ownerHash]);
  check(rows.length, 'NOT_FOUND', 'Không tìm thấy công việc.', 404);
  check(new Date(rows[0].expires_at).getTime() > Date.now() && rows[0].status !== 'expired', 'EXPIRED', 'File đã hết hạn và không còn được phép truy cập.', 410);
  return rows[0];
}
async function publicJob(j) {
  const files = await query("SELECT id,original_filename AS name,size_bytes AS size,uploaded FROM tool_files WHERE job_id=? AND role='input' ORDER BY ordinal", [j.id]);
  const access = await commerce.view(j);
  return { id: j.id, status: j.status, phase: j.phase, operation: j.operation, expiresAt: new Date(j.expires_at).toISOString(), files, metadata: j.metadata_json ? JSON.parse(j.metadata_json) : null, result: j.result_summary_json ? JSON.parse(j.result_summary_json) : null, error: j.error_message, ...access, canDownload: j.status === 'ready' && access.storageReady && (access.payment.status === 'free' || access.payment.status === 'approved') };
}
async function handle(request, id, action) {
  try {
    if (request.method !== 'GET') sameOrigin(request);
    if (action === 'session') {
      check(enabled(), 'DISABLED', 'Excel Rescue đang chuẩn bị mở beta. Vui lòng quay lại sau.', 503);
      let ownerHash = await owner(request, false), cookie;
      if (!ownerHash) {
        await rate('session-global', 300, 3600);
        const token = randomBytes(32).toString('hex'); ownerHash = hash(token);
        await query('INSERT INTO tool_sessions (token_hash,expires_at) VALUES (?,DATE_ADD(UTC_TIMESTAMP(), INTERVAL 48 HOUR))', [ownerHash]);
        cookie = `${cookieName()}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=172800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
      }
      const s = (await settings.get()).values;
      return json({ freeBeta: !s.billingEnabled, priceVnd: s.billingEnabled ? s.priceVnd : 0, driveEnabled: s.driveEnabled, limits }, 200, cookie ? { 'Set-Cookie': cookie } : {});
    }
    const ownerHash = await owner(request);
    await rate(`${request.method === 'GET' ? 'read' : 'write'}-${ownerHash}`, request.method === 'GET' ? 120 : 40);
    if (action === 'resume' && request.method === 'POST' && !id) {
      await rate('recovery-global', 100);
      const restored = await commerce.resume((await readJson(request)).token, ownerHash);
      return json(await publicJob(await job(restored, ownerHash)));
    }
    if (!id && request.method === 'GET') {
      const jobs = await query('SELECT id,status,operation,expires_at FROM tool_jobs WHERE (owner_hash=? OR EXISTS (SELECT 1 FROM tool_access_sessions a WHERE a.job_id=tool_jobs.id AND a.owner_hash=?)) AND expires_at>UTC_TIMESTAMP() ORDER BY created_at DESC LIMIT 10', [ownerHash, ownerHash]);
      return json({ jobs });
    }
    if (!id && request.method === 'POST') {
      check(enabled(), 'DISABLED', 'Công cụ tạm ngừng nhận file.', 503);
      const body = await readJson(request);
      check(storage.UUID.test(body.requestKey || ''), 'REQUEST_KEY', 'Mã yêu cầu không hợp lệ.');
      check(Array.isArray(body.files) && body.files.length >= 1 && body.files.length <= limits.files, 'FILES', 'Chọn từ 1 đến 5 file.');
      const files = body.files.map((f, i) => {
        check(typeof f.name === 'string' && f.name.length <= 180 && !/[\x00-\x1f/\\]/.test(f.name) && /\.(xlsx|csv)$/i.test(f.name), 'FORMAT', 'Chỉ nhận file XLSX/CSV, tên tối đa 180 ký tự.');
        check(Number.isSafeInteger(f.size) && f.size > 0 && f.size <= limits.fileBytes, 'SIZE', 'Mỗi file tối đa 5 MB, không được rỗng.');
        const fid = randomUUID(); return { id: fid, name: f.name, size: f.size, ordinal: i, key: fid + (/\.csv$/i.test(f.name) ? '.csv' : '.xlsx') };
      });
      return await locked('vireon-tools-create', async conn => {
        const [existing] = await conn.execute('SELECT * FROM tool_jobs WHERE owner_hash=? AND request_key=?', [ownerHash, body.requestKey]);
        if (existing.length) return json(await publicJob(await job(existing[0].id, ownerHash)));
        const [heartbeat] = await conn.execute('SELECT id FROM tool_runtime WHERE heartbeat_at>DATE_SUB(UTC_TIMESTAMP(), INTERVAL 3 MINUTE)');
        check(heartbeat.length, 'WORKER_OFFLINE', 'Bộ xử lý đang tạm nghỉ. Vui lòng thử lại sau vài phút.', 503);
        await rate('jobs-global', 100, 86400); await rate('jobs-' + ownerHash, 10, 3600);
        const [counts] = await conn.execute("SELECT COUNT(*) AS total, SUM(owner_hash=?) AS owned, SUM(status IN ('uploading','queued','processing')) AS waiting FROM tool_jobs WHERE expires_at>UTC_TIMESTAMP() AND status<>'expired'", [ownerHash]);
        check(counts[0].total < limits.activeJobs && Number(counts[0].owned) < 5 && Number(counts[0].waiting) < 6, 'CAPACITY', 'Hàng đợi hoặc hạn mức lưu file beta đã đầy. Hãy xóa lượt cũ hoặc quay lại sau.', 429);
        const jobId = randomUUID(), state = await settings.get();
        check(body.expectedPrice === undefined || body.expectedPrice === (state.values.billingEnabled ? state.values.priceVnd : 0), 'PRICE_CHANGED', 'Giá vừa thay đổi. Hãy tải lại trang để xem và xác nhận giá mới.', 409);
        await conn.beginTransaction();
        try {
          await conn.execute('INSERT INTO tool_jobs (id,owner_hash,request_key,expires_at) VALUES (?,?,?,DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 DAY))', [jobId, ownerHash, body.requestKey]);
          await commerce.create(conn, jobId, state);
          for (const f of files) await conn.execute("INSERT INTO tool_files (id,job_id,role,ordinal,storage_key,original_filename,size_bytes) VALUES (?,?,'input',?,?,?,?)", [f.id, jobId, f.ordinal, f.key, f.name, f.size]);
          await conn.commit();
        } catch (e) { await conn.rollback(); throw e; }
        return json(await publicJob(await job(jobId, ownerHash)), 201);
      });
    }
    if (!action && request.method === 'GET') return json(await publicJob(await job(id, ownerHash)));
    if (action === 'recovery' && request.method === 'POST') return json(await commerce.recovery(await job(id, ownerHash)));
    if (action === 'download' && request.method === 'GET') {
      const j = await job(id, ownerHash);
      const access = await commerce.view(j);
      check(j.status === 'ready' && access.storageReady, 'LOCKED', 'Kết quả chưa được phép tải.', 403);
      await commerce.authorizeDownload(j);
      await rate('download-' + ownerHash, 10);
      const files = await query("SELECT * FROM tool_files WHERE job_id=? AND role='output' AND uploaded=1", [id]);
      check(files.length === 1, 'RESULT_MISSING', 'Kết quả không còn trên máy chủ.', 410);
      const f = files[0];
      if (access.storageProvider !== 'drive') check(fs.existsSync(storage.filePath(id, f.storage_key)), 'RESULT_MISSING', 'Kết quả không còn trên máy chủ.', 410);
      const body = access.storageProvider === 'drive' ? (await drive.download(f.id)).body : Readable.toWeb(fs.createReadStream(storage.filePath(id, f.storage_key)));
      return new Response(body, { headers: { ...privateHeaders, 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="vireon-${j.operation}.xlsx"`, 'Content-Length': String(f.size_bytes) } });
    }
    return await locked('tools-job-' + id, async conn => {
      const j = await job(id, ownerHash);
      if (action === 'file' && request.method === 'PUT') {
        check(enabled() && j.status === 'uploading', 'STATE', 'Lượt này không còn nhận file.', 409);
        const fileId = new URL(request.url).searchParams.get('file');
        const files = await query("SELECT * FROM tool_files WHERE id=? AND job_id=? AND role='input'", [fileId, id]);
        check(files.length, 'NOT_FOUND', 'Không tìm thấy file.', 404);
        const f = files[0]; if (f.uploaded) return json({ uploaded: true });
        const saved = await storage.upload(id, f.storage_key, request.body, Number(f.size_bytes));
        await conn.execute('UPDATE tool_files SET uploaded=1,sha256=? WHERE id=?', [saved.sha256, fileId]);
        return json({ uploaded: true });
      }
      if (action === 'inspect' && request.method === 'POST') {
        if (j.status !== 'uploading') return json(await publicJob(j));
        const counts = await query("SELECT COUNT(*) AS missing FROM tool_files WHERE job_id=? AND role='input' AND uploaded=0", [id]);
        check(!counts[0].missing, 'UPLOAD_PENDING', 'Hãy tải đủ file trước khi xử lý.');
        await conn.execute("UPDATE tool_jobs SET status='queued',phase='inspect' WHERE id=? AND status='uploading'", [id]);
      } else if (action === 'process' && request.method === 'POST') {
        check(enabled(), 'DISABLED', 'Công cụ tạm ngừng xử lý.', 503);
        check(j.metadata_json, 'STATE', 'Cần đọc cấu trúc file trước khi xử lý.', 409);
        const configuration = validateConfig(await readJson(request), JSON.parse(j.metadata_json || '{}'));
        if (['queued', 'processing', 'ready'].includes(j.status) && j.phase === 'process' && j.configuration_json === JSON.stringify(configuration)) return json(await publicJob(j));
        check(j.status === 'configured', 'STATE', 'Cấu hình không thể thay đổi sau khi đã gửi xử lý. Hãy tạo lượt mới.', 409);
        await conn.execute("UPDATE tool_jobs SET configuration_json=?,operation=?,phase='process',status='queued',attempts=0,error_code=NULL,error_message=NULL WHERE id=?", [JSON.stringify(configuration), configuration.operation, id]);
      } else if (action === 'retry' && request.method === 'POST') {
        check(enabled() && j.status === 'failed' && ['WORKER_STOPPED', 'WORKER_TIMEOUT', 'WORKER_ERROR'].includes(j.error_code) && j.attempts < 3, 'RETRY', 'Lỗi này cần tạo lượt mới hoặc sửa file trước khi thử lại.', 409);
        await conn.execute("UPDATE tool_jobs SET status='queued',error_code=NULL,error_message=NULL WHERE id=?", [id]);
      } else if (request.method === 'DELETE' && !action) {
        check(j.status !== 'processing', 'PROCESSING', 'Đang xử lý. Hãy đợi tác vụ kết thúc rồi xóa.', 409);
        await conn.execute("UPDATE tool_jobs SET status='expired',expires_at=UTC_TIMESTAMP() WHERE id=?", [id]);
        return json({ deleted: true });
      } else throw new ToolError('METHOD', 'Thao tác không hợp lệ.', 405);
      return json(await publicJob(await job(id, ownerHash)));
    });
  } catch (error) {
    if (error instanceof ToolError) return json({ error: error.message, code: error.code }, error.status);
    console.error('tools_api_error', { code: typeof error.code === 'string' ? error.code.slice(0, 40) : 'INTERNAL' });
    return json({ error: 'Hệ thống chưa thể hoàn tất yêu cầu. Vui lòng thử lại sau.', code: 'INTERNAL' }, 503);
  }
}
module.exports = { handle, owner, job, rate, privateHeaders, readJson };
