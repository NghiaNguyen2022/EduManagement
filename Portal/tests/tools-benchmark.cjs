const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const ExcelJS = require('exceljs');
async function main() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'vireon-benchmark-'));
  const results = [];
  try {
    for (const operation of ['deduplicate', 'merge', 'compare']) {
      const count = operation === 'deduplicate' ? 1 : 2, rows = count === 1 ? 19999 : 9999;
      const files = [], sources = [];
      for (let i = 0; i < count; i++) {
        const name = `fixture-${i}.xlsx`, file = path.join(dir, name);
        const book = new ExcelJS.stream.xlsx.WorkbookWriter({ filename: file }); const ws = book.addWorksheet('Data');
        const headers = ['ID', ...Array.from({ length: 9 }, (_, j) => 'Value' + j)]; ws.addRow(headers).commit();
        for (let r = 0; r < rows; r++) ws.addRow([String(r).padStart(8, '0'), ...Array.from({ length: 9 }, (_, j) => r + j + i)]).commit();
        ws.commit(); await book.commit(); files.push({ id: String(i), name, path: file }); sources.push({ fileId: String(i), sheet: 'Data', keys: [0], compare: [1,2,3,4,5,6,7,8,9], names: headers });
      }
      const request = path.join(dir, operation + '.json'), response = path.join(dir, operation + '-response.json'), output = path.join(dir, operation + '-result.xlsx');
      await fs.writeFile(request, JSON.stringify({ phase: 'process', files, config: { operation, sources }, output, response }));
      const child = spawnSync(process.execPath, ['--max-old-space-size=256', path.join(__dirname, '../server/tools/task.cjs'), request], { timeout: 65000, stdio: 'ignore' });
      if (child.status !== 0) throw new Error(operation + ': child stopped');
      const report = JSON.parse(await fs.readFile(response, 'utf8')); if (report.error) throw new Error(operation + ': ' + report.error.code);
      results.push({ operation, rows: rows * count, cellsIncludingHeaders: (rows + 1) * count * 10, ...report.metrics, outputBytes: (await fs.stat(output)).size });
    }
    console.log(JSON.stringify({ platform: process.platform, node: process.version, results }, null, 2));
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
