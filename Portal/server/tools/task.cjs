// Isolated child: no database access, no file data on stdout/stderr.
const fs = require('node:fs/promises');
const { readFiles, metadata, processData, writeResult, preview } = require('./excel.cjs');
const { ToolError } = require('./errors.cjs');
async function run() {
  const task = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
  const started = Date.now();
  try {
    const data = await readFiles(task.files);
    let result;
    if (task.phase === 'inspect') result = { metadata: metadata(data) };
    else {
      const processed = processData(data, task.config);
      await writeResult(processed, task.output);
      result = { result: preview(processed) };
    }
    result.metrics = { durationMs: Date.now() - started, maxRssKb: process.resourceUsage().maxRSS };
    await fs.writeFile(task.response, JSON.stringify(result), { mode: 0o600 });
  } catch (e) {
    await fs.writeFile(task.response, JSON.stringify({ error: e instanceof ToolError ? { code: e.code, message: e.message } : { code: 'FILE_INVALID', message: 'Không đọc được file. Hãy mở và lưu lại thành XLSX rồi thử lại.' } }), { mode: 0o600 });
  }
}
run().catch(() => { process.exitCode = 1; });
