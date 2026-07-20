import {
  env,
  envPaths,
} from "../config/env.js";

console.log(
  "Đã nạp cấu hình môi trường:",
);

console.log({
  projectRoot:
    envPaths.projectRoot,
  envLocalPath:
    envPaths.envLocalPath,
  nodeEnv:
    env.nodeEnv,
  port:
    env.port,
  databaseHost:
    env.database.host,
  databasePort:
    env.database.port,
  databaseUser:
    env.database.user,
  databaseName:
    env.database.name,
  passwordConfigured:
    Boolean(
      env.database.password,
    ),
});
