import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Export a function so we can access `mode`
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in `.env`, `.env.development`, etc.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    define: {
      'process.env': {},
      global: "window",
    },
    resolve: {
      alias: {
        buffer: path.resolve(__dirname, "node_modules/buffer/"),
        stream: path.resolve(__dirname, "node_modules/stream-browserify/"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      rollupOptions: {
        external: ["bcryptjs", "mock-aws-s3", "aws-sdk", "nock", "fs", "path", "crypto"],
      },
    },
  };
});
