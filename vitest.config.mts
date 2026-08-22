import path from "node:path";
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      AUTH_SECRET: "test-auth-secret-with-32-bytes-min",
      DATABASE_URL: "file:./data/test.db",
      NODE_ENV: "test",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
    },
  },
});
