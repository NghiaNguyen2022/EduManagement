const { query, locked } = require('./db.cjs');
const { seal, open } = require('./secrets.cjs');
const { check } = require('./errors.cjs');
const defaults = { billingEnabled: false, priceVnd: 0, momoPhone: '', momoName: '', zaloPhone: '', instructions: '', driveEnabled: false, clientId: '' };
async function get() {
  const rows = await query('SELECT * FROM tool_settings WHERE id=1');
  if (!rows.length) return { values: { ...defaults }, secrets: {} };
  return { values: { ...defaults, ...JSON.parse(rows[0].settings_json) }, secrets: JSON.parse(open(rows[0].secrets_json)) };
}
async function mutate(update) {
  return locked('tools-settings', async () => {
    const state = await get(); await update(state);
    await query('INSERT INTO tool_settings (id,settings_json,secrets_json) VALUES (1,?,?) ON DUPLICATE KEY UPDATE settings_json=VALUES(settings_json),secrets_json=VALUES(secrets_json),updated_at=UTC_TIMESTAMP()', [JSON.stringify(state.values), seal(JSON.stringify(state.secrets))]);
    return state;
  });
}
function sanitized(state) {
  return { ...state.values, connected: Boolean(state.secrets.refreshToken && state.secrets.folderId), hasClientSecret: Boolean(state.secrets.clientSecret), driveEmail: state.secrets.email || '', folderId: state.secrets.folderId || '', retentionDays: 30 };
}
async function save(body) {
  return sanitized(await mutate(async state => {
    for (const name of ['billingEnabled', 'driveEnabled']) { check(typeof body[name] === 'boolean', 'SETTING', 'Thiếu lựa chọn cấu hình.'); state.values[name] = body[name]; }
    check(Number.isSafeInteger(body.priceVnd) && body.priceVnd >= 0 && body.priceVnd <= 10000000, 'PRICE', 'Giá phải là số nguyên từ 0 đến 10.000.000 đồng.');
    state.values.priceVnd = body.priceVnd;
    for (const [name, max] of [['momoPhone', 20], ['zaloPhone', 20], ['momoName', 100], ['instructions', 1000], ['clientId', 250]]) {
      check(typeof body[name] === 'string' && body[name].length <= max, 'SETTING', 'Thông tin cấu hình không hợp lệ.'); state.values[name] = body[name].trim();
    }
    check(!state.values.billingEnabled || (state.values.priceVnd > 0 && /^0\d{9}$/.test(state.values.momoPhone) && state.values.momoName && /^0\d{9}$/.test(state.values.zaloPhone)), 'MOMO', 'Cần giá, số MoMo, tên người nhận và số Zalo 10 chữ số trước khi bật thu phí.');
    check(!state.values.driveEnabled || state.secrets.refreshToken && state.secrets.folderId, 'DRIVE', 'Kết nối Google trước khi bật lưu Drive.');
    const old = await get();
    const changing = state.values.clientId !== old.values.clientId || Boolean(body.clientSecret && body.clientSecret !== old.secrets.clientSecret);
    if (changing) {
      const files = await query('SELECT file_id FROM tool_cloud_files LIMIT 1');
      check(!files.length, 'DRIVE_IN_USE', 'Còn file trên Drive. Không đổi OAuth client khi file chưa được dọn.');
      state.values.driveEnabled = false; state.secrets = {};
    }
    if (body.clientSecret) { check(typeof body.clientSecret === 'string' && body.clientSecret.length < 1000, 'SECRET', 'Client secret không hợp lệ.'); state.secrets.clientSecret = body.clientSecret; }
  }));
}
module.exports = { get, mutate, save, sanitized };
