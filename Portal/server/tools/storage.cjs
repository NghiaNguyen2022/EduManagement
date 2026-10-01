const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { root, limits } = require('./config.cjs');
const { check, ToolError } = require('./errors.cjs');
const { randomUUID, createHash } = require('node:crypto');
const { Readable, Transform } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
function directory(id) {
  check(UUID.test(id), 'ID', 'Mã công việc không hợp lệ.');
  return path.join(root(), id);
}
function filePath(id, key) {
  check(/^[a-zA-Z0-9._-]{1,100}$/.test(key) && !key.includes('..'), 'PATH', 'Đường dẫn không hợp lệ.');
  return path.join(directory(id), key);
}
async function upload(id, key, body, expectedBytes) {
  check(body, 'EMPTY', 'Chưa có dữ liệu file.');
  await fsp.mkdir(directory(id), { recursive: true, mode: 0o700 });
  const temporary = filePath(id, randomUUID() + '.part');
  let bytes = 0;
  const hash = createHash('sha256');
  try {
    await pipeline(Readable.fromWeb(body), new Transform({ transform(chunk, _, cb) {
      bytes += chunk.length;
      if (bytes > limits.fileBytes || bytes > expectedBytes) return cb(new ToolError('UPLOAD_SIZE', 'Dung lượng file vượt giới hạn đã khai báo.', 413));
      hash.update(chunk); cb(null, chunk);
    }}), fs.createWriteStream(temporary, { flags: 'wx', mode: 0o600 }), { signal: AbortSignal.timeout(45000) });
    check(bytes === expectedBytes && bytes > 0, 'SIZE', 'Dung lượng file không khớp. Hãy tạo lượt mới.');
    await fsp.rename(temporary, filePath(id, key));
    return { size: bytes, sha256: hash.digest('hex') };
  } catch (error) {
    await fsp.rm(temporary, { force: true });
    throw error;
  }
}
async function removeJob(id) { await fsp.rm(directory(id), { recursive: true, force: true }); }
module.exports = { UUID, directory, filePath, upload, removeJob };
