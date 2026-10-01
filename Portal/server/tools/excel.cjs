const fs = require('node:fs');
const fsp = require('node:fs/promises');
const ExcelJS = require('exceljs');
const yauzl = require('yauzl');
const { parse } = require('csv-parse');
const { limits } = require('./config.cjs');
const { check, ToolError } = require('./errors.cjs');

async function validateZip(filename) {
  const zip = await new Promise((resolve, reject) => yauzl.open(filename, { lazyEntries: true, validateEntrySizes: true }, (e, z) => e ? reject(e) : resolve(z)));
  return new Promise((resolve, reject) => {
    let entries = 0, total = 0, declared = 0, workbook = false, types = false, done = false;
    const names = new Set();
    const fail = e => { if (!done) { done = true; zip.close(); reject(e instanceof ToolError ? e : new ToolError('XLSX_INVALID', 'File XLSX bị lỗi hoặc không được hỗ trợ.')); } };
    zip.on('error', fail);
    zip.on('end', () => {
      if (done) return;
      try { check(workbook && types, 'XLSX_INVALID', 'File không phải workbook XLSX hợp lệ.'); done = true; resolve(); } catch (e) { fail(e); }
    });
    zip.on('entry', entry => {
      try {
        entries++; declared += entry.uncompressedSize;
        check(entries <= limits.entries && declared <= limits.expandedBytes, 'ZIP_LIMIT', 'File có quá nhiều dữ liệu giải nén.');
        check(!entry.fileName.split('/').includes('..') && !entry.fileName.startsWith('/') && !entry.fileName.includes('\\') && !names.has(entry.fileName), 'ZIP_PATH', 'Cấu trúc file không hợp lệ.');
        names.add(entry.fileName);
        check(!(entry.generalPurposeBitFlag & 1), 'ENCRYPTED', 'Hãy bỏ mật khẩu bảo vệ file trước khi tải lên.');
        check(!/vbaProject|externalLinks|embeddings|activeX|connections\.xml/i.test(entry.fileName), 'ACTIVE_CONTENT', 'Hãy loại macro, nội dung nhúng và liên kết dữ liệu ngoài rồi lưu thành XLSX.');
        workbook ||= entry.fileName === 'xl/workbook.xml'; types ||= entry.fileName === '[Content_Types].xml';
        zip.openReadStream(entry, (error, stream) => {
          if (error) return fail(error);
          let tail = '';
          stream.on('error', fail);
          stream.on('data', chunk => {
            try {
              total += chunk.length;
              check(total <= limits.expandedBytes, 'ZIP_LIMIT', 'File có quá nhiều dữ liệu giải nén.');
              if (/\.(xml|rels)$/i.test(entry.fileName)) {
                const sample = tail + chunk.toString('utf8');
                check(!/<!DOCTYPE|<!ENTITY|macroEnabled|vbaProject/i.test(sample) && !chunk.includes(0), 'XML_CONTENT', 'Nội dung XML hoặc macro không được hỗ trợ.');
                tail = sample.slice(-100);
              }
            } catch (e) { stream.destroy(); fail(e); }
          });
          stream.on('end', () => { if (!done) zip.readEntry(); });
        });
      } catch (e) { fail(e); }
    });
    zip.readEntry();
  });
}

function scalar(value, budget, warnings) {
  if (value == null) return null;
  if (value instanceof Date) {
    check(Number.isFinite(value.getTime()), 'DATE', 'File chứa ngày không hợp lệ.');
    return { date: value.toISOString() };
  }
  if (typeof value === 'object') {
    if ('formula' in value || 'sharedFormula' in value) {
      check(value.result !== undefined && value.result !== null, 'FORMULA_CACHE', 'Có công thức chưa có giá trị lưu sẵn. Mở file trong Excel, tính lại và lưu trước khi tải lên.');
      warnings.add('Công thức được đọc từ giá trị lưu sẵn; hệ thống không tính lại công thức.');
      return scalar(value.result, budget, warnings);
    }
    if (value.richText) return scalar(value.richText.map(x => x.text).join(''), budget, warnings);
    if ('hyperlink' in value) { warnings.add('Liên kết được xuất thành văn bản, không giữ hyperlink.'); return scalar(value.text || '', budget, warnings); }
    check(!value.error, 'CELL_ERROR', 'Có ô lỗi Excel (#N/A, #VALUE...). Hãy xử lý lỗi trước khi tải lên.');
    throw new ToolError('CELL_TYPE', 'File có kiểu ô chưa được hỗ trợ.');
  }
  check(['string', 'number', 'boolean'].includes(typeof value), 'CELL_TYPE', 'Kiểu dữ liệu không được hỗ trợ.');
  if (typeof value === 'number') check(Number.isFinite(value), 'NUMBER', 'File có số không hợp lệ.');
  if (typeof value === 'string') {
    budget.text += Buffer.byteLength(value);
    check(value.length <= 32767 && budget.text <= limits.textBytes, 'TEXT_LIMIT', 'Nội dung văn bản trong file vượt giới hạn beta.');
  }
  return value;
}
function accountRow(budget, width) {
  budget.rows++; budget.cells += width;
  check(width <= limits.columns && budget.rows <= limits.rows && budget.cells <= limits.cells, 'DATA_LIMIT', `Vượt giới hạn ${limits.rows} dòng, ${limits.cells} ô hoặc ${limits.columns} cột.`);
}
function sheet(name, raw, warnings) {
  check(raw.length > 0, 'EMPTY_SHEET', 'Sheet chưa có hàng tiêu đề.');
  const width = Math.max(...raw.map(r => r.values.length));
  const headers = Array.from({ length: width }, (_, i) => {
    const v = raw[0].values[i];
    check(v == null || typeof v !== 'object', 'HEADER', 'Tiêu đề cột phải là văn bản hoặc số.');
    check(v == null || String(v).length <= 100, 'HEADER', 'Tên cột tối đa 100 ký tự. Hãy rút gọn tiêu đề trước khi xử lý.');
    return { id: String(i), name: v == null || String(v).trim() === '' ? `Cột ${i + 1}` : String(v).trim() };
  });
  if (new Set(headers.map(h => h.name)).size < headers.length) warnings.add('Có tiêu đề trùng. Hãy phân biệt bằng số thứ tự cột hoặc sửa tên khi ghép.');
  return { name, headers, rows: raw.slice(1).map(r => ({ row: r.row, values: Array.from({ length: width }, (_, i) => r.values[i] ?? null) })) };
}
async function readFiles(files) {
  const budget = { rows: 0, cells: 0, text: 0 }, warnings = new Set();
  const result = [];
  for (const file of files) {
    const stat = await fsp.stat(file.path);
    check(stat.size > 0 && stat.size <= limits.fileBytes, 'SIZE', 'Dung lượng file vượt giới hạn.');
    const sheets = [];
    if (/\.xlsx$/i.test(file.name)) {
      await validateZip(file.path);
      const book = new ExcelJS.Workbook();
      await book.xlsx.readFile(file.path);
      check(book.worksheets.length > 0 && book.worksheets.length <= limits.sheets, 'SHEETS', `Chỉ hỗ trợ tối đa ${limits.sheets} sheet/file.`);
      for (const ws of book.worksheets) {
        if (!ws.rowCount) continue;
        check(ws.rowCount <= limits.rows && ws.columnCount <= limits.columns, 'DATA_LIMIT', 'Sheet vượt giới hạn dòng/cột.');
        check(!(ws.model.merges?.length), 'MERGED', 'Sheet có ô gộp. Hãy tách ô gộp trước khi xử lý.');
        const raw = [];
        for (let r = 1; r <= ws.rowCount; r++) {
          const row = ws.getRow(r); accountRow(budget, ws.columnCount);
          raw.push({ row: r, values: Array.from({ length: ws.columnCount }, (_, i) => {
            const cell = row.getCell(i + 1);
            if (typeof cell.value === 'number' && /0{2,}/.test(cell.numFmt || '')) warnings.add('Có số được định dạng thêm số 0 đầu. Hệ thống dùng giá trị số gốc; muốn giữ mã 00123, hãy chuyển ô thành văn bản.');
            return scalar(cell.value, budget, warnings);
          }) });
        }
        sheets.push(sheet(ws.name, raw, warnings));
      }
    } else {
      check(/\.csv$/i.test(file.name), 'FORMAT', 'Chỉ nhận XLSX và CSV UTF-8.');
      const buffer = await fsp.readFile(file.path);
      let content;
      try { content = new TextDecoder('utf-8', { fatal: true }).decode(buffer); } catch { throw new ToolError('ENCODING', 'Hãy lưu CSV với encoding UTF-8.'); }
      check(!content.includes('\0'), 'FORMAT', 'CSV chứa dữ liệu nhị phân không hợp lệ.');
      const first = content.replace(/^\uFEFF/, '').split(/\r?\n/)[0];
      const outside = first.replace(/"(?:[^"]|"")*"/g, '');
      const candidates = [',', ';', '\t'].filter(c => outside.includes(c));
      check(candidates.length <= 1, 'DELIMITER', 'Không xác định rõ dấu phân cách CSV. Hãy lưu thành XLSX hoặc CSV dấu phẩy.');
      const raw = [];
      try {
        const parser = parse(content, { bom: true, delimiter: candidates[0] || ',', max_record_size: 1024 * 1024, skip_empty_lines: true });
        for await (const record of parser) {
          accountRow(budget, record.length);
          raw.push({ row: raw.length + 1, values: record.map(v => scalar(v, budget, warnings)) });
        }
      } catch (e) { if (e instanceof ToolError) throw e; throw new ToolError('CSV_INVALID', 'CSV có hàng/cột hoặc dấu nháy không hợp lệ. Hãy lưu lại thành XLSX.'); }
      sheets.push(sheet('CSV', raw, warnings));
      warnings.add('CSV được giữ dưới dạng văn bản để bảo toàn mã có số 0 đầu; dung sai số chỉ áp dụng cho ô số trong XLSX.');
    }
    check(sheets.length > 0, 'EMPTY', 'File không có sheet chứa dữ liệu.');
    result.push({ id: file.id, name: file.name, sheets });
  }
  return { files: result, warnings: [...warnings] };
}
function metadata(data) {
  return { warnings: data.warnings, files: data.files.map(f => ({ id: f.id, name: f.name, sheets: f.sheets.map(s => ({ name: s.name, headers: s.headers, rows: s.rows.length, sample: s.rows.slice(0, 3) })) })) };
}
function validateConfig(config, meta) {
  check(meta && Array.isArray(meta.files), 'CONFIG', 'Cần đọc cấu trúc file trước khi xử lý.');
  check(config && ['deduplicate', 'merge', 'compare'].includes(config.operation), 'CONFIG', 'Chọn thao tác hợp lệ.');
  const count = meta.files.length;
  check(config.operation === 'deduplicate' ? count === 1 : config.operation === 'compare' ? count === 2 : count >= 2 && count <= limits.files, 'FILE_COUNT', 'Loại trùng cần 1 file; đối chiếu cần 2 file; ghép cần 2–5 file.');
  check(Array.isArray(config.sources) && config.sources.length === count, 'SOURCES', 'Chọn sheet cho từng file.');
  const ids = new Set();
  const sources = config.sources.map(source => {
    const f = meta.files.find(f => f.id === source.fileId);
    const s = f?.sheets.find(s => s.name === source.sheet);
    check(s && !ids.has(f.id), 'SHEET', 'Sheet hoặc file không hợp lệ.'); ids.add(f.id);
    function columns(values, min, max) {
      check(Array.isArray(values) && values.length >= min && values.length <= max && new Set(values).size === values.length && values.every(i => Number.isInteger(i) && i >= 0 && i < s.headers.length), 'COLUMNS', 'Chọn cột hợp lệ, không trùng lặp.');
      return values;
    }
    const output = { fileId: f.id, sheet: s.name };
    if (config.operation !== 'merge') output.keys = columns(source.keys, 1, 3);
    if (config.operation === 'compare') output.compare = columns(source.compare, 1, limits.columns);
    if (config.operation === 'merge') {
      check(Array.isArray(source.names) && source.names.length === s.headers.length && source.names.every(n => typeof n === 'string' && n.trim().length > 0 && n.trim().length <= 100), 'MAPPING', 'Tên cột ghép cần có nội dung và tối đa 100 ký tự.');
      output.names = source.names.map(n => n.trim());
      check(new Set(output.names).size === output.names.length, 'DUPLICATE_HEADERS', 'Tên cột ghép trong cùng sheet phải khác nhau.');
    }
    return output;
  });
  if (config.operation === 'compare') {
    check(sources[0].keys.length === sources[1].keys.length && sources[0].compare.length === sources[1].compare.length, 'MAPPING', 'Số cột khóa và số cột so sánh ở A/B phải tương ứng.');
  }
  const tolerance = config.tolerance ?? 0;
  check(typeof tolerance === 'number' && Number.isFinite(tolerance) && tolerance >= 0 && tolerance <= 1000000000, 'TOLERANCE', 'Dung sai không hợp lệ.');
  check(['absolute', 'percent'].includes(config.toleranceMode || 'absolute'), 'TOLERANCE', 'Loại dung sai không hợp lệ.');
  check(['first', 'last'].includes(config.keep || 'first'), 'KEEP', 'Quy tắc giữ dòng không hợp lệ.');
  return { operation: config.operation, sources, trim: config.trim === true, ignoreCase: config.ignoreCase === true, keep: config.keep || 'first', includeSource: config.includeSource !== false, includeMatched: config.includeMatched !== false, tolerance, toleranceMode: config.toleranceMode || 'absolute' };
}
function normalized(v, config) {
  if (typeof v !== 'string') return v;
  let x = config.trim ? v.trim() : v;
  return config.ignoreCase ? x.toLocaleLowerCase('vi') : x;
}
function key(row, columns, config) {
  const values = columns.map(i => normalized(row.values[i], config));
  if (values.some(v => v == null || v === '')) return null;
  return JSON.stringify(values.map(v => [typeof v, v]));
}
function same(a, b, config) {
  if (typeof a === 'number' && typeof b === 'number') {
    const threshold = config.toleranceMode === 'percent' ? Math.abs(a) * config.tolerance / 100 : config.tolerance;
    return Math.abs(a - b) <= threshold;
  }
  return JSON.stringify(normalized(a, config)) === JSON.stringify(normalized(b, config));
}
function processData(data, rawConfig) {
  const config = validateConfig(rawConfig, metadata(data));
  const sources = config.sources.map(s => ({ ...s, file: data.files.find(f => f.id === s.fileId), table: data.files.find(f => f.id === s.fileId).sheets.find(t => t.name === s.sheet) }));
  const tables = [], stats = {}, warnings = [...data.warnings];
  let outputCells = 0, outputTextBytes = 0;
  const add = (name, headers, rows) => {
    outputCells += (rows.length + 1) * headers.length;
    check(outputCells <= 1500000, 'OUTPUT_LIMIT', 'Kết quả có quá nhiều ô. Hãy chia nhỏ dữ liệu hoặc giảm số cột so sánh.');
    for (const row of [headers, ...rows]) for (const value of row) {
      if (typeof value === 'string') outputTextBytes += Buffer.byteLength(value);
      check(outputTextBytes <= 24 * 1024 * 1024, 'OUTPUT_LIMIT', 'Văn bản kết quả quá lớn. Hãy chia nhỏ dữ liệu.');
    }
    tables.push({ name, headers, rows });
  };
  if (config.operation === 'deduplicate') {
    const s = sources[0], groups = new Map(), blanks = [];
    for (const r of s.table.rows) { const k = key(r, s.keys, config); if (k === null) { blanks.push(r); continue; } if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); }
    const removed = new Map(); let duplicateGroups = 0;
    for (const rows of groups.values()) { if (rows.length < 2) continue; duplicateGroups++; const kept = config.keep === 'first' ? rows[0] : rows[rows.length - 1]; for (const r of rows) if (r !== kept) removed.set(r.row, kept.row); }
    const kept = s.table.rows.filter(r => !removed.has(r.row));
    add('Cleaned', s.table.headers.map(h => h.name), kept.map(r => r.values));
    add('Duplicates', [...s.table.headers.map(h => h.name), 'OriginalRow', 'KeptRow'], s.table.rows.filter(r => removed.has(r.row)).map(r => [...r.values, r.row, removed.get(r.row)]));
    Object.assign(stats, { inputRows: s.table.rows.length, outputRows: kept.length, removedRows: removed.size, duplicateGroups, blankKeys: blanks.length });
    if (blanks.length) warnings.push(`${blanks.length} dòng có khóa trống được giữ nguyên.`);
  } else if (config.operation === 'merge') {
    const headers = [...new Set(sources.flatMap(s => s.names))];
    check(headers.length <= limits.columns, 'COLUMNS', 'Tổng số cột sau ghép vượt 100.');
    const output = [], types = headers.map(() => new Set());
    for (const s of sources) for (const r of s.table.rows) {
      const values = headers.map((h, i) => { const index = s.names.indexOf(h); const v = index < 0 ? null : r.values[index]; if (v != null) types[i].add(typeof v === 'object' ? 'date' : typeof v); return v; });
      output.push(config.includeSource ? [...values, s.file.name, s.sheet] : values);
    }
    if (types.some(s => s.size > 1)) warnings.push('Một số cột chứa nhiều kiểu dữ liệu; từng giá trị được giữ nguyên kiểu, không tự chuyển đổi.');
    const uniqueName = name => { while (headers.includes(name)) name = '_' + name; return name; };
    add('Merged', config.includeSource ? [...headers, uniqueName('SourceFile'), uniqueName('SourceSheet')] : headers, output);
    Object.assign(stats, { inputRows: output.length, outputRows: output.length, files: sources.length });
  } else {
    const [a, b] = sources;
    function index(s) { const map = new Map(), blank = []; for (const r of s.table.rows) { const k = key(r, s.keys, config); if (k === null) { blank.push(r); continue; } if (!map.has(k)) map.set(k, []); map.get(k).push(r); } return { map, blank }; }
    const ai = index(a), bi = index(b), onlyA = [], onlyB = [], changed = [], matched = [], duplicate = [];
    const duplicateHeaders = ['Source', 'OriginalRow', 'Reason', ...a.table.headers.map(h => 'A: ' + h.name), ...b.table.headers.map(h => 'B: ' + h.name)];
    function unresolved(side, r, reason) { duplicate.push([side, r.row, reason, ...(side === 'A' ? r.values : a.table.headers.map(() => null)), ...(side === 'B' ? r.values : b.table.headers.map(() => null))]); }
    ai.blank.forEach(r => unresolved('A', r, 'Khóa trống')); bi.blank.forEach(r => unresolved('B', r, 'Khóa trống'));
    for (const k of new Set([...ai.map.keys(), ...bi.map.keys()])) {
      const ar = ai.map.get(k) || [], br = bi.map.get(k) || [];
      if (ar.length > 1 || br.length > 1) { ar.forEach(r => unresolved('A', r, 'Khóa lặp A/B')); br.forEach(r => unresolved('B', r, 'Khóa lặp A/B')); continue; }
      if (!ar.length) { onlyB.push(br[0].values); continue; } if (!br.length) { onlyA.push(ar[0].values); continue; }
      let changes = 0;
      a.compare.forEach((col, i) => {
        const av = ar[0].values[col], bv = br[0].values[b.compare[i]];
        if (!same(av, bv, config)) { changes++; changed.push([ar[0].row, br[0].row, ...a.keys.map(j => ar[0].values[j]), a.table.headers[col].name, b.table.headers[b.compare[i]].name, av, bv, typeof av === typeof bv ? 'Khác giá trị' : 'Khác kiểu dữ liệu']); }
      });
      if (!changes) matched.push(ar[0].values);
    }
    add('OnlyA', a.table.headers.map(h => h.name), onlyA); add('OnlyB', b.table.headers.map(h => h.name), onlyB);
    add('Changed', ['RowA', 'RowB', ...a.keys.map(i => 'Key: ' + a.table.headers[i].name), 'ColumnA', 'ColumnB', 'ValueA', 'ValueB', 'Difference'], changed);
    if (config.includeMatched) add('Matched', a.table.headers.map(h => h.name), matched);
    add('DuplicateKeys', duplicateHeaders, duplicate);
    Object.assign(stats, { inputRows: a.table.rows.length + b.table.rows.length, onlyA: onlyA.length, onlyB: onlyB.length, changedCells: changed.length, matched: matched.length, unresolvedRows: duplicate.length });
    if (duplicate.length) warnings.push('Các dòng khóa trống hoặc lặp được đưa vào DuplicateKeys, không tự ghép.');
  }
  const summaryRows = [['Operation', config.operation], ...Object.entries(stats), ['Configuration', JSON.stringify(config)], ...warnings.map(w => ['Warning', w]), ['Export', 'Chỉ giá trị; không giữ công thức/định dạng gốc.']];
  add('Summary', ['Field', 'Value'], summaryRows);
  return { config, stats, warnings, tables };
}
async function writeResult(result, filename) {
  const book = new ExcelJS.stream.xlsx.WorkbookWriter({ filename, useStyles: false, useSharedStrings: false });
  for (const table of result.tables) {
    const ws = book.addWorksheet(table.name);
    ws.addRow(table.headers).commit();
    for (const row of table.rows) ws.addRow(row.map(v => v && typeof v === 'object' && v.date ? v.date : v)).commit();
    ws.commit();
  }
  await book.commit();
  await fsp.chmod(filename, 0o600);
}
function preview(result) { return { stats: result.stats, warnings: result.warnings, tables: result.tables.filter(t => t.name !== 'Summary').map(t => ({ name: t.name, headers: t.headers, totalRows: t.rows.length, rows: t.rows.slice(0, 10) })) }; }
module.exports = { validateZip, readFiles, metadata, validateConfig, processData, writeResult, preview };
