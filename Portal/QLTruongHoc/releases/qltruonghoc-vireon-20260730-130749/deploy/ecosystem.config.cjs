module.exports = {
  apps: [
    {
      name: "vireon-edu-management",
      cwd: __dirname + "/..",
      script: "dist-server/server/index.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "700M",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: "3100",
        AUTH_COOKIE_NAME: "edu_management_session",
        COOKIE_PATH: "/app-portal/edu-management",
      },
    },
  ],
};
