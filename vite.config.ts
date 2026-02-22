import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import { fileURLToPath } from "url";
import svgr from "vite-plugin-svgr";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "~uswds": path.resolve(__dirname, "node_modules/@uswds/uswds"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "legacy",
        silenceDeprecations: ["legacy-js-api", "global-builtin", "mixed-decls"],
        includePaths: [
          "node_modules/@uswds/uswds",
          "node_modules/@uswds/uswds/dist",
          "node_modules/@uswds/uswds/packages",
          path.resolve(__dirname, "node_modules/@uswds/uswds/packages"),
        ],
      },
    },
  },
});
