const settings = require('./settings.cjs');
const commerce = require('./commerce.cjs');
const drive = require('./drive.cjs');
const { readJson, privateHeaders } = require('./api.cjs');
const { ToolError, check } = require('./errors.cjs');
async function handle(request, action, actor) {
  try {
    let result;
    if (request.method === 'GET' && action === 'settings') result = { ...settings.sanitized(await settings.get()), callback: drive.callback() };
    else if (request.method === 'GET' && action === 'jobs') result = { jobs: await commerce.list(new URL(request.url).searchParams.get('page'), new URL(request.url).searchParams.get('search')) };
    else if (request.method === 'POST' && action === 'settings') {
      const body = await readJson(request);
      if (body.driveEnabled) await drive.health();
      result = await settings.save(body);
    }
    else if (request.method === 'POST' && action === 'connect') result = { url: await drive.begin(actor) };
    else if (request.method === 'POST' && action === 'drive-check') result = await drive.health();
    else if (request.method === 'POST' && action === 'approve') {
      const body = await readJson(request);
      check(body.confirmed === true, 'CONFIRM', 'Cần xác nhận đã đối soát giao dịch MoMo.');
      check(/^[a-f0-9-]{36}$/.test(body.id || ''), 'ID', 'Mã công việc không hợp lệ.');
      result = await commerce.approve(body.id, actor);
    } else throw new ToolError('METHOD', 'Thao tác không hợp lệ.', 405);
    return Response.json(result, { headers: privateHeaders });
  } catch (e) {
    return Response.json({ error: e instanceof ToolError ? e.message : 'Không thể hoàn tất. Kiểm tra migration, kết nối DB và khóa mã hóa trên hosting.', code: e instanceof ToolError ? e.code : 'ADMIN_ERROR' }, { status: e instanceof ToolError ? e.status : 503, headers: privateHeaders });
  }
}
module.exports = { handle };
