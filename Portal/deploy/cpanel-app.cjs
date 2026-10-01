const fs = require("node:fs");
const path = require("node:path");

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator);
    const value = trimmed.slice(separator + 1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

async function start() {
  const root = __dirname;
  const startupLog = path.join(root, "startup.log");
  loadEnv(path.join(root, ".env"));
  fs.appendFileSync(startupLog, `${new Date().toISOString()} loading database\n`);

  const mysql = require("mysql2/promise");
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT || 3306),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    multipleStatements: true,
    charset: "utf8mb4",
  });

  try {
    await connection.query(fs.readFileSync(path.join(root, "mysql-schema.sql"), "utf8"));
  } finally {
    await connection.end();
  }

  fs.appendFileSync(startupLog, `${new Date().toISOString()} starting Next.js\n`);
  require("./server.js");
}

start().catch((error) => {
  fs.appendFileSync(
    path.join(__dirname, "startup-error.log"),
    `${new Date().toISOString()} ${error && error.stack ? error.stack : error}\n`,
  );
  console.error("Vireon startup failed:", error);
  process.exitCode = 1;
});
