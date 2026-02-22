import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // ✅ enables `expect`, `describe`, etc. globally

    include: ["**/*.test.tsx", "**/*.spec.tsx"],
    setupFiles: ["vitest.setup.ts"],
    environment: "jsdom",
  },
});
