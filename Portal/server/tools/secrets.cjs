const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { root } = require('./config.cjs');
function keyFile() { return process.env.TOOLS_KEY_FILE || path.join(root(), '.portal-secrets.key'); }
function key() {
  const file = keyFile();
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  if (!fs.existsSync(file)) {
    try { fs.writeFileSync(file, crypto.randomBytes(32), { flag: 'wx', mode: 0o600 }); }
    catch (e) { if (e.code !== 'EEXIST') throw e; }
  }
  const result = fs.readFileSync(file);
  if (result.length !== 32) throw new Error('Invalid Tools encryption key');
  return result;
}
function seal(value) {
  const iv = crypto.randomBytes(12), cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const body = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64url');
}
function open(value) {
  const raw = Buffer.from(value, 'base64url'), decipher = crypto.createDecipheriv('aes-256-gcm', key(), raw.subarray(0, 12));
  decipher.setAuthTag(raw.subarray(12, 28));
  return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8');
}
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
module.exports = { seal, open, hash, keyFile };
