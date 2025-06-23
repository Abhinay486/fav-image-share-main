import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    global: "window", // Fixes missing 'global'
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
        target: "https://fav-image-share.onrender.com", // Your backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      // 🚫 Tell Vite NOT to bundle these (they're backend-only or Node.js-only)
      external: ["bcryptjs", "mock-aws-s3", "aws-sdk", "nock", "fs", "path", "crypto"],
    },
  },
});
