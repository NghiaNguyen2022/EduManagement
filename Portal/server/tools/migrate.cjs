const fs = require('node:fs');
const path = require('node:path');
if (process.env.TOOLS_ENV_FILE) process.loadEnvFile(process.env.TOOLS_ENV_FILE);
const { getPool } = require('./db.cjs');
async function main() {
  for (const file of ['20260929-tools.sql', '20260930-tools-commerce.sql']) {
    const sql = fs.readFileSync(path.resolve(__dirname, '../../db/migrations', file), 'utf8');
    for (const statement of sql.split(';').map(s => s.trim()).filter(Boolean)) await getPool().query(statement);
  }
  console.log('TOOLS_MIGRATION_OK');
}
main().catch(() => { console.error('TOOLS_MIGRATION_FAILED'); process.exitCode = 1; }).finally(() => getPool().end());
