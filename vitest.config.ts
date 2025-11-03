import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    setupFiles: ["./tests/setup/test-env.ts"],
    hookTimeout: 60000,
    testTimeout: 60000,
  },
});
