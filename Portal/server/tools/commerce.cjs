const { randomBytes, randomUUID } = require('node:crypto');
const { query, locked } = require('./db.cjs');
const settings = require('./settings.cjs');
const { seal, open, hash } = require('./secrets.cjs');
const { check } = require('./errors.cjs');
const origin = () => process.env.TOOLS_ORIGIN || 'https://vireon.vn';
async function create(conn, id, state) {
  const recovery = randomBytes(32).toString('hex'), s = state.values;
  await conn.execute('INSERT INTO tool_access (job_id,recovery_hash,recovery_cipher,amount,payment_status,payment_json,storage_provider) VALUES (?,?,?,?,?,?,?)', [id, hash(recovery), seal(recovery), s.billingEnabled ? s.priceVnd : 0, s.billingEnabled ? 'unpaid' : 'free', JSON.stringify({ phone: s.momoPhone, name: s.momoName, zaloPhone: s.zaloPhone, instructions: s.instructions }), s.driveEnabled ? 'drive' : 'local']);
}
async function access(id) { return (await query('SELECT * FROM tool_access WHERE job_id=?', [id]))[0]; }
async function view(j) {
  const a = await access(j.id);
  if (!a) return { payment: { status: 'free', amount: 0, requiresPayment: false }, storageReady: true, storageProvider: 'local' };
  const missing = a.storage_provider === 'drive' ? await query('SELECT f.id FROM tool_files f LEFT JOIN tool_cloud_files c ON c.file_id=f.id AND c.synced=1 WHERE f.job_id=? AND f.uploaded=1 AND c.file_id IS NULL LIMIT 1', [j.id]) : [];
  return { payment: { status: a.payment_status, amount: a.amount, requiresPayment: a.amount > 0, momo: a.amount > 0 ? JSON.parse(a.payment_json) : null, reference: 'VR' + j.id.replaceAll('-', '').toUpperCase() }, storageReady: missing.length === 0, storageProvider: a.storage_provider };
}
async function recovery(j) {
  let a = await access(j.id);
  if (!a) { await locked('tools-access-' + j.id, async conn => { if (!await access(j.id)) await create(conn, j.id, { values: { billingEnabled: false, driveEnabled: false } }); }); a = await access(j.id); }
  const url = origin() + '/tools/excel#resume=' + open(a.recovery_cipher);
  const qr = await require('qrcode').toDataURL(url, { width: 280, margin: 2, errorCorrectionLevel: 'M' });
  return { url, qr, expiresAt: new Date(j.expires_at).toISOString() };
}
async function resume(token, ownerHash) {
  check(typeof token === 'string' && /^[a-f0-9]{64}$/.test(token), 'RECOVERY', 'Liên kết khôi phục không hợp lệ hoặc đã hết hạn.', 404);
  const rows = await query("SELECT j.id FROM tool_access a JOIN tool_jobs j ON j.id=a.job_id WHERE a.recovery_hash=? AND j.expires_at>UTC_TIMESTAMP() AND j.status<>'expired'", [hash(token)]);
  check(rows.length, 'RECOVERY', 'Liên kết khôi phục không hợp lệ hoặc đã hết hạn.', 404);
  await query('INSERT IGNORE INTO tool_access_sessions (job_id,owner_hash) VALUES (?,?)', [rows[0].id, ownerHash]); return rows[0].id;
}
const reference = id => 'VR' + id.replaceAll('-', '').toUpperCase();
async function authorizeDownload(j) {
  const a = await access(j.id);
  check(!a || a.amount === 0 || a.payment_status === 'approved', 'PAYMENT_PENDING', 'Giao dịch chưa được kích hoạt. Hãy liên hệ Zalo và gửi mã giao dịch.', 403);
}
async function list(page = 0, search = '') {
  const offset = Math.min(10000, Math.max(0, Math.floor(Number(page) || 0))) * 30;
  const compact = String(search || '').trim().replace(/^VR/i, '').replaceAll('-', '').toLowerCase();
  check(!compact || /^[a-f0-9]{32}$/.test(compact), 'SEARCH', 'Dán đầy đủ mã giao dịch VR… hoặc mã công việc.');
  return query(`SELECT j.id,j.status,j.operation,j.expires_at,a.amount,a.payment_status,a.approved_at,a.storage_provider,
    (SELECT GROUP_CONCAT(f.original_filename ORDER BY f.ordinal SEPARATOR ', ') FROM tool_files f WHERE f.job_id=j.id AND f.role='input') AS filenames
    FROM tool_jobs j JOIN tool_access a ON a.job_id=j.id WHERE j.expires_at>UTC_TIMESTAMP() AND j.status<>'expired' AND (?='' OR REPLACE(j.id,'-','')=?)
    ORDER BY j.created_at DESC LIMIT 30 OFFSET ${offset}`, [compact, compact]);
}
async function approve(id, actor) {
  return locked('tools-job-' + id, async conn => {
    const rows = await query("SELECT * FROM tool_jobs WHERE id=? AND expires_at>UTC_TIMESTAMP() AND status='ready'", [id]);
    check(rows.length, 'PAYMENT_STATE', 'Lượt chưa sẵn sàng hoặc đã hết hạn.', 409);
    const j = rows[0], a = await access(id); check(a?.amount > 0, 'PAYMENT_STATE', 'Lượt này miễn phí, không cần kích hoạt.', 409);
    check((await view(j)).storageReady, 'DRIVE_PENDING', 'Kết quả chưa lưu xong trên Drive.', 409);
    if (a.payment_status !== 'approved') {
      await conn.beginTransaction();
      try {
        await conn.execute("UPDATE tool_access SET payment_status='approved',approved_at=UTC_TIMESTAMP(),approved_by=? WHERE job_id=?", [actor, id]);
        await conn.execute('INSERT INTO tool_payment_audit (id,job_id,action,admin_hash) VALUES (?,?,?,?)', [randomUUID(), id, 'activate', actor]);
        await conn.commit();
      } catch (e) { await conn.rollback(); throw e; }
    }
    const recoveryUrl = origin() + '/tools/excel#resume=' + open(a.recovery_cipher);
    const expiresAt = new Date(j.expires_at).toISOString();
    return { id, reference: reference(id), amount: a.amount, expiresAt, recoveryUrl,
      message: 'Vireon — giao dịch ' + reference(id) + ' đã được kích hoạt.\nSố tiền: ' + Number(a.amount).toLocaleString('vi-VN') + ' đ.\nBạn tải lại trang hoặc quét QR đã lưu để tải file, không cần nhập mã.\nMở lại: ' + recoveryUrl + '\nHạn tải: ' + new Date(j.expires_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) + ' (giờ Việt Nam).' };
  });
}
module.exports = { create, access, view, recovery, resume, authorizeDownload, list, approve, reference };
