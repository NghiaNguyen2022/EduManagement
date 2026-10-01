const mysql = require('mysql2/promise');
let pool;
function getPool() {
  if (!pool) {
    if (!process.env.MYSQL_HOST || !process.env.MYSQL_DATABASE || !process.env.MYSQL_USER) throw new Error('Tools database is not configured');
    pool = mysql.createPool({ host: process.env.MYSQL_HOST, port: Number(process.env.MYSQL_PORT || 3306), user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD || '', database: process.env.MYSQL_DATABASE, timezone: 'Z', charset: 'utf8mb4', connectionLimit: 3, waitForConnections: true });
  }
  return pool;
}
async function query(sql, values = []) { const [rows] = await getPool().execute(sql, values); return rows; }
async function locked(name, run) {
  const conn = await getPool().getConnection();
  let held = false;
  try {
    const [r] = await conn.execute('SELECT GET_LOCK(?, 0) AS acquired', [name]);
    if (!r[0].acquired) { const { ToolError } = require('./errors.cjs'); throw new ToolError('BUSY', 'Đang có thao tác khác. Vui lòng thử lại sau vài giây.', 409); }
    held = true; return await run(conn);
  } finally {
    if (held) await conn.execute('SELECT RELEASE_LOCK(?)', [name]).catch(() => {});
    conn.release();
  }
}
module.exports = { getPool, query, locked };
