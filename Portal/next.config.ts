import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    cpus: 1,
    webpackBuildWorker: false,
    workerThreads: true,
  },
  outputFileTracingExcludes: {
    "*": [
      "cpanel-bundle/**",
      "build/**",
      "dist/**",
      "drizzle/**",
      "examples/**",
      "worker/**",
      "tests/**",
      "deploy/**",
      "deploy-src/**",
      "deploy-lite/**",
      "scratch-deploy/**",
      "emergency-restore/**",
      "outputs/**",
      "work/**",
      "*.zip",
      "*.tar.gz",
    ],
  },
};

export default nextConfig;
