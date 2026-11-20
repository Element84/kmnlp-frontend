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
        // USWDS's own SCSS triggers Dart Sass deprecations (@import, if(), /-division,
        // deprecated settings/mixins). quietDeps silences warnings from dependencies
        // (node_modules) so only issues in our own SCSS surface.
        quietDeps: true,
        // NOTE: "mixed-decls" was intentionally dropped — that deprecation is now
        // obsolete in the current Dart Sass, and silencing an obsolete id emits its
        // own warning.
        silenceDeprecations: ["legacy-js-api", "global-builtin"],
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
