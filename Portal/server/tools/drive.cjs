const fs = require('node:fs/promises');
const crypto = require('node:crypto');
const settings = require('./settings.cjs');
const { query } = require('./db.cjs');
const { check, ToolError } = require('./errors.cjs');
const storage = require('./storage.cjs');
const { hash } = require('./secrets.cjs');
const scope = 'https://www.googleapis.com/auth/drive.file';
const api = 'https://www.googleapis.com/drive/v3/';
const callback = () => (process.env.TOOLS_ORIGIN || 'https://vireon.vn') + '/api/admin/tools/drive/callback';
async function google(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(45000), redirect: 'error' });
  if (!response.ok && ![404, 409].includes(response.status)) throw new ToolError('DRIVE_UNAVAILABLE', 'Google Drive chưa sẵn sàng. Admin cần kiểm tra kết nối hoặc dung lượng.', 503);
  return response;
}
async function tokenRequest(body) {
  const r = await google('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams(body) });
  check(r.ok, 'DRIVE_AUTH', 'Không thể xác thực Google Drive.', 503);
  const t = await r.json(); check(t.access_token, 'DRIVE_AUTH', 'Google chưa cấp quyền truy cập.', 503); return t;
}
async function token() {
  const s = await settings.get();
  check(s.secrets.refreshToken, 'DRIVE_AUTH', 'Admin chưa kết nối Google Drive.', 503);
  return (await tokenRequest({ client_id: s.values.clientId, client_secret: s.secrets.clientSecret, refresh_token: s.secrets.refreshToken, grant_type: 'refresh_token' })).access_token;
}
async function call(resource, options = {}, accessToken) {
  return google(api + resource, { ...options, headers: { ...options.headers, Authorization: 'Bearer ' + (accessToken || await token()) } });
}
async function begin(adminHash) {
  const s = await settings.get(); check(s.values.clientId && s.secrets.clientSecret, 'OAUTH_CONFIG', 'Lưu Client ID và Client secret trước.');
  const state = crypto.randomBytes(32).toString('hex');
  await query('DELETE FROM tool_oauth_states WHERE expires_at<UTC_TIMESTAMP()');
  await query('INSERT INTO tool_oauth_states VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 10 MINUTE))', [hash(state), adminHash]);
  return 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({ client_id: s.values.clientId, redirect_uri: callback(), response_type: 'code', scope, access_type: 'offline', prompt: 'consent', state });
}
async function finish(adminHash, state, code) {
  check(/^[a-f0-9]{64}$/.test(state || '') && typeof code === 'string' && code.length < 4096, 'OAUTH_STATE', 'Phiên kết nối Google không hợp lệ.');
  const deleted = await query('DELETE FROM tool_oauth_states WHERE state_hash=? AND admin_hash=? AND expires_at>UTC_TIMESTAMP()', [hash(state), adminHash]);
  check(deleted.affectedRows === 1, 'OAUTH_STATE', 'Phiên kết nối hết hạn. Hãy kết nối lại.');
  await settings.mutate(async s => {
    const t = await tokenRequest({ client_id: s.values.clientId, client_secret: s.secrets.clientSecret, code, redirect_uri: callback(), grant_type: 'authorization_code' });
    check(t.refresh_token && t.scope?.split(' ').includes(scope), 'OAUTH_SCOPE', 'Cần cấp quyền lưu file và truy cập ngoại tuyến.');
    const about = await (await call('about?fields=user(permissionId,emailAddress)', {}, t.access_token)).json();
    check(about.user?.permissionId, 'OAUTH_ACCOUNT', 'Không xác định được tài khoản Google.');
    check(!s.secrets.accountId || s.secrets.accountId === about.user.permissionId, 'DRIVE_ACCOUNT', 'Hãy kết nối lại đúng Gmail đang giữ file.');
    let folderId = s.secrets.folderId;
    if (!folderId) {
      const r = await call('files?fields=id', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Vireon Portal — Private files', mimeType: 'application/vnd.google-apps.folder' }) }, t.access_token);
      check(r.ok, 'DRIVE_FOLDER', 'Không tạo được thư mục riêng tư.'); folderId = (await r.json()).id;
    }
    Object.assign(s.secrets, { refreshToken: t.refresh_token, accountId: about.user.permissionId, email: about.user.emailAddress, folderId });
  });
}
async function health() {
  const s = await settings.get();
  check(s.secrets.folderId, 'DRIVE_FOLDER', 'Chưa có thư mục Drive.');
  const r = await call('files/' + encodeURIComponent(s.secrets.folderId) + '?fields=id,trashed,capabilities(canAddChildren),permissions(type,role)');
  check(r.ok, 'DRIVE_FOLDER', 'Không truy cập được thư mục Drive.', 503);
  const f = await r.json();
  check(!f.trashed && f.capabilities?.canAddChildren && !f.permissions?.some(p => p.type === 'anyone' || p.type === 'domain'), 'DRIVE_PRIVATE', 'Thư mục phải riêng tư và có quyền ghi.', 503);
  return { ok: true, email: s.secrets.email };
}
async function syncFile(f) {
  let rows = await query('SELECT * FROM tool_cloud_files WHERE file_id=?', [f.id]);
  if (rows[0]?.synced) return;
  const t = await token(), s = await settings.get();
  if (!rows.length) {
    const r = await call('files/generateIds?count=1&space=drive&type=files', {}, t);
    check(r.ok, 'DRIVE_ID', 'Không tạo được mã file Drive.', 503);
    const driveId = (await r.json()).ids[0];
    await query('INSERT INTO tool_cloud_files (file_id,drive_id) VALUES (?,?)', [f.id, driveId]);
    rows = [{ drive_id: driveId }];
  }
  const filename = storage.filePath(f.job_id, f.storage_key), stat = await fs.stat(filename);
  check(stat.size <= 40 * 1024 * 1024, 'RESULT_SIZE', 'File kết quả vượt ngân sách lưu trữ.', 413);
  const data = await fs.readFile(filename), boundary = 'vireon_' + crypto.randomBytes(16).toString('hex');
  const metadata = { id: rows[0].drive_id, name: f.id + (f.role === 'output' ? '.xlsx' : /\.csv$/i.test(f.original_filename) ? '.csv' : '.xlsx'), parents: [s.secrets.folderId] };
  const body = Buffer.concat([Buffer.from('--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata) + '\r\n--' + boundary + '\r\nContent-Type: application/octet-stream\r\n\r\n'), data, Buffer.from('\r\n--' + boundary + '--\r\n')]);
  const r = await google('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', { method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'multipart/related; boundary=' + boundary }, body });
  check(r.ok || r.status === 409, 'DRIVE_UPLOAD', 'Chưa lưu được file trên Drive.', 503);
  const info = await call('files/' + encodeURIComponent(rows[0].drive_id) + '?fields=id,size,md5Checksum,trashed', {}, t);
  const saved = await info.json();
  check(info.ok && !saved.trashed && Number(saved.size) === data.length && saved.md5Checksum === crypto.createHash('md5').update(data).digest('hex'), 'DRIVE_VERIFY', 'File Drive chưa được xác minh.', 503);
  await query('UPDATE tool_cloud_files SET synced=1 WHERE file_id=?', [f.id]);
}
async function syncJob(id) {
  const a = await query('SELECT storage_provider FROM tool_access WHERE job_id=?', [id]);
  if (a[0]?.storage_provider !== 'drive') return;
  const files = await query('SELECT * FROM tool_files WHERE job_id=? AND uploaded=1', [id]);
  for (const f of files) await syncFile(f);
  const j = await query('SELECT status FROM tool_jobs WHERE id=?', [id]);
  if (['configured', 'ready'].includes(j[0]?.status)) for (const f of files) await fs.rm(storage.filePath(id, f.storage_key), { force: true });
}
async function hydrate(f) {
  const filename = storage.filePath(f.job_id, f.storage_key);
  try { await fs.access(filename); return; } catch {}
  const response = await download(f.id);
  const data = Buffer.from(await response.arrayBuffer());
  check(data.length === Number(f.size_bytes) && hash(data) === f.sha256, 'DRIVE_VERIFY', 'File tải từ Drive không khớp dữ liệu ban đầu.', 503);
  await fs.mkdir(storage.directory(f.job_id), { recursive: true, mode: 0o700 });
  await fs.writeFile(filename, data, { mode: 0o600 });
}
async function download(fileId) {
  const rows = await query('SELECT drive_id FROM tool_cloud_files WHERE file_id=? AND synced=1', [fileId]);
  check(rows.length, 'DRIVE_PENDING', 'File đang được lưu. Vui lòng thử lại sau.', 503);
  const r = await call('files/' + encodeURIComponent(rows[0].drive_id) + '?alt=media');
  check(r.ok, 'RESULT_MISSING', 'File không còn trên Drive hoặc mất quyền truy cập.', 410); return r;
}
async function removeJob(id) {
  const rows = await query('SELECT c.* FROM tool_cloud_files c JOIN tool_files f ON f.id=c.file_id WHERE f.job_id=?', [id]);
  for (const row of rows) {
    const r = await call('files/' + encodeURIComponent(row.drive_id), { method: 'DELETE' });
    check(r.ok || r.status === 404, 'DRIVE_DELETE', 'Chưa xóa được file Drive.', 503);
    await query('DELETE FROM tool_cloud_files WHERE file_id=?', [row.file_id]);
  }
}
module.exports = { begin, finish, health, callback, syncJob, hydrate, download, removeJob };
