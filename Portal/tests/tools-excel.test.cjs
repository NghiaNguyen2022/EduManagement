const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const ExcelJS = require('exceljs');
const { createRequire } = require('node:module');
const JSZip = createRequire(require.resolve('exceljs'))('jszip');
const { readFiles, metadata, processData, writeResult, validateZip } = require('../server/tools/excel.cjs');
let temp;
test.before(async () => { temp = await fs.mkdtemp(path.join(os.tmpdir(), 'vireon-excel-test-')); });
test.after(async () => { await fs.rm(temp, { recursive: true, force: true }); });
async function workbook(name, rows, mutate) { const book = new ExcelJS.Workbook(); const ws = book.addWorksheet('Dữ liệu'); rows.forEach(r => ws.addRow(r)); if (mutate) mutate(ws); const filename = path.join(temp, name); await book.xlsx.writeFile(filename); return { id: name, name, path: filename }; }
function config(data, operation, extra = {}) { return { operation, sources: data.files.map(f => ({ fileId: f.id, sheet: f.sheets[0].name, keys: [0], compare: [1], names: f.sheets[0].headers.map(h => h.name) })), ...extra }; }
test('deduplicate preserves types, leading zeros, blank keys, Unicode and input', async () => {
  const file = await workbook('dedup.xlsx', [['Mã', 'Tên'], ['00123', 'Đặng'], [123, 'Số'], ['00123', 'Trùng'], [null, 'Trống'], [null, 'Trống 2'], [' A ', 'First'], ['a', 'Last']]);
  const before = await fs.readFile(file.path); const data = await readFiles([file]);
  const result = processData(data, config(data, 'deduplicate', { trim: true, ignoreCase: true, keep: 'last' }));
  assert.deepEqual(result.stats, { inputRows: 7, outputRows: 5, removedRows: 2, duplicateGroups: 2, blankKeys: 2 });
  assert.deepEqual(result.tables[1].rows.map(r => r.slice(-2)), [[2, 4], [7, 8]]);
  const output = path.join(temp, 'result.xlsx'); await writeResult(result, output);
  const book = new ExcelJS.Workbook(); await book.xlsx.readFile(output);
  assert.equal(book.getWorksheet('Cleaned').getCell('A2').value, 123);
  assert.equal(book.getWorksheet('Cleaned').getCell('A3').value, '00123');
  assert.deepEqual(await fs.readFile(file.path), before);
});
test('merge maps by header name, preserves values and rejects duplicate mappings', async () => {
  const data = await readFiles([await workbook('merge-a.xlsx', [['Mã', 'Giá'], ['A', 10]]), await workbook('merge-b.xlsx', [[' Giá ', 'Mã', 'Ghi chú'], [20, 'B', '=HYPERLINK("bad")']])]);
  const result = processData(data, config(data, 'merge'));
  assert.deepEqual(result.tables[0].headers, ['Mã', 'Giá', 'Ghi chú', 'SourceFile', 'SourceSheet']);
  assert.deepEqual(result.tables[0].rows[1].slice(0, 3), ['B', 20, '=HYPERLINK("bad")']);
  const bad = config(data, 'merge'); bad.sources[1].names = ['X', 'X', 'Y']; assert.throws(() => processData(data, bad), { code: 'DUPLICATE_HEADERS' });
  const output = path.join(temp, 'merge.xlsx'); await writeResult(result, output); const read = new ExcelJS.Workbook(); await read.xlsx.readFile(output);
  assert.equal(read.getWorksheet('Merged').getCell('C3').type, ExcelJS.ValueType.String);
});
test('compare excludes ambiguous keys on both sides; emits differences and only rows', async () => {
  const data = await readFiles([await workbook('a.xlsx', [['ID', 'Số tiền'], ['same', 100], ['changed', 15], ['dup', 1], ['dup', 2], ['onlyA', 5], [null, 0]]), await workbook('b.xlsx', [['Mã', 'Giá'], ['same', 100], ['changed', 16], ['dup', 8], ['onlyB', 6]])]);
  const result = processData(data, config(data, 'compare'));
  assert.deepEqual(result.stats, { inputRows: 10, onlyA: 1, onlyB: 1, changedCells: 1, matched: 1, unresolvedRows: 4 });
  assert.equal(result.tables.find(t => t.name === 'Changed').rows[0][2], 'changed');
  const tolerance = processData(data, config(data, 'compare', { tolerance: 1 })); assert.equal(tolerance.stats.changedCells, 0);
});
test('numeric percent uses absolute A baseline and handles zero and negative values', async () => {
  const data = await readFiles([await workbook('p-a.xlsx', [['ID', 'V'], ['x', -100], ['z', 0]]), await workbook('p-b.xlsx', [['ID', 'V'], ['x', -101], ['z', .1]])]);
  const result = processData(data, config(data, 'compare', { tolerance: 1, toleranceMode: 'percent' }));
  assert.equal(result.stats.matched, 1); assert.equal(result.stats.changedCells, 1);
});
test('CSV keeps UTF-8 and leading zeros; rejects malformed binary and encoding', async () => {
  const filename = path.join(temp, 'csv.csv'); await fs.writeFile(filename, '\uFEFFMã;Tên\r\n00123;Nguyễn\r\n00123;Trùng\r\n');
  const data = await readFiles([{ id: 'csv', name: 'csv.csv', path: filename }]); assert.equal(data.files[0].sheets[0].rows[0].values[0], '00123');
  assert.equal(processData(data, config(data, 'deduplicate')).stats.removedRows, 1);
  await fs.writeFile(filename, Buffer.from([0xff, 0xfe])); await assert.rejects(readFiles([{ id: 'csv', name: 'csv.csv', path: filename }]), { code: 'ENCODING' });
});
test('formula cache and dates are explicit; merged cells and absent caches rejected', async () => {
  const file = await workbook('formula.xlsx', [['ID', 'V'], ['x', { formula: '1+2', result: 3 }], ['date', new Date('2026-01-02T00:00:00Z')]]);
  const data = await readFiles([file]); assert.equal(data.files[0].sheets[0].rows[0].values[1], 3); assert.deepEqual(data.files[0].sheets[0].rows[1].values[1], { date: '2026-01-02T00:00:00.000Z' });
  assert.ok(data.warnings.some(w => /Công thức/.test(w)));
  await assert.rejects(readFiles([await workbook('no-cache.xlsx', [['ID'], [{ formula: '1+2' }]])]), { code: 'FORMULA_CACHE' });
  await assert.rejects(readFiles([await workbook('merged.xlsx', [['ID', 'V'], ['A', 1]], ws => ws.mergeCells('A1:B1'))]), { code: 'MERGED' });
});
test('ZIP gate rejects macro, DTD, decompression bombs and non-workbook ZIP', async () => {
  async function zipped(name, entries) { const zip = new JSZip(); for (const [key, value] of Object.entries(entries)) zip.file(key, value); const p = path.join(temp, name); await fs.writeFile(p, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })); return p; }
  await assert.rejects(validateZip(await zipped('macro.xlsx', { 'xl/vbaProject.bin': 'bad' })), { code: 'ACTIVE_CONTENT' });
  await assert.rejects(validateZip(await zipped('dtd.xlsx', { 'xl/workbook.xml': '<!DOCTYPE x [<!ENTITY a "b">]>' })), { code: 'XML_CONTENT' });
  await assert.rejects(validateZip(await zipped('bomb.xlsx', { 'xl/workbook.xml': 'a'.repeat(41 * 1024 * 1024) })), { code: 'ZIP_LIMIT' });
  await assert.rejects(validateZip(await zipped('other.xlsx', { 'nothing.txt': 'hello' })), { code: 'XLSX_INVALID' });
});
test('limits include every sheet and typed compound keys cannot collide', async () => {
  await assert.rejects(readFiles([await workbook('wide.xlsx', [Array.from({ length: 101 }, (_, i) => String(i)), Array(101).fill(1)])]), { code: 'DATA_LIMIT' });
  const data = await readFiles([await workbook('keys.xlsx', [['A', 'B'], ['a|b', 'c'], ['a', 'b|c'], [0, false], ['0', 'false']])]);
  const c = config(data, 'deduplicate'); c.sources[0].keys = [0, 1]; assert.equal(processData(data, c).stats.removedRows, 0);
  assert.equal(metadata(data).files[0].sheets[0].sample.length, 3);
});
test('compare refuses output amplification even when the input has few rows', () => {
  const headers = Array.from({ length: 10 }, (_, i) => ({ id: String(i), name: 'C' + i }));
  const data = { warnings: [], files: ['A', 'B'].map((id, side) => ({ id, name: id + '.xlsx', sheets: [{ name: 'Data', headers, rows: Array.from({ length: 200 }, (_, i) => ({ row: i + 2, values: [String(i) + 'x'.repeat(20000), ...Array(9).fill(side)] })) }] })) };
  const c = config(data, 'compare'); for (const source of c.sources) source.compare = [1,2,3,4,5,6,7,8,9];
  assert.throws(() => processData(data, c), { code: 'OUTPUT_LIMIT' });
});
