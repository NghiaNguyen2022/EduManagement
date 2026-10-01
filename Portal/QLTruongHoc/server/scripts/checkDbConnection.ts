import {
  checkDbConnection,
  closeDbConnection,
  getDbConnectionInfo
} from "../db/connection.js";

async function main(): Promise<void> {
  try {
    await checkDbConnection();
    const information = await getDbConnectionInfo();

    console.log("Kết nối MySQL thành công.");
    console.dir(information, { depth: null });
  } finally {
    await closeDbConnection();
  }
}

main().catch((error) => {
  console.error("Kết nối MySQL thất bại:", error);
  process.exitCode = 1;
});
