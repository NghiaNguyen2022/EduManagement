const path = require('node:path');
function limit(name, fallback, max = fallback) {
  const n = Number(process.env[name] || fallback);
  if (!Number.isSafeInteger(n) || n < 1 || n > max) throw new Error(`Invalid ${name}`);
  return n;
}
const limits = Object.freeze({
  fileBytes: limit('TOOLS_FILE_BYTES', 5 * 1024 * 1024),
  files: limit('TOOLS_MAX_FILES', 5), rows: limit('TOOLS_MAX_ROWS', 20000),
  cells: limit('TOOLS_MAX_CELLS', 200000), columns: 100, sheets: 10,
  expandedBytes: 40 * 1024 * 1024, entries: 1000, textBytes: 12 * 1024 * 1024,
  timeoutMs: limit('TOOLS_TIMEOUT_MS', 60000), retentionHours: 720, activeJobs: 40,
});
const freeBeta = () => process.env.FREE_BETA !== 'false';
const enabled = () => process.env.TOOLS_ENABLED === 'true';
function root() {
  if (process.env.NODE_ENV === 'production' && !process.env.TOOLS_STORAGE_ROOT) throw new Error('TOOLS_STORAGE_ROOT required');
  const result = path.resolve(process.env.TOOLS_STORAGE_ROOT || '.tools-data');
  const publicRoot = path.resolve('public');
  if (result === publicRoot || result.startsWith(publicRoot + path.sep)) throw new Error('Tools storage must be private');
  return result;
}
module.exports = { limits, freeBeta, enabled, root };
