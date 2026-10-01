// CloudLinux Node.js Selector/Passenger chỉ nạp trực tiếp CommonJS.
// Wrapper này chuyển tiếp sang backend ESM đã biên dịch.
(() => import("./dist-server/server/index.js"))();
