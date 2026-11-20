import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import path from "path";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  staticDirs: ["../public", "../node_modules/@uswds/uswds/dist"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-vitest",
    "storybook-addon-sass-postcss",
    "@storybook/addon-docs"
  ],
  viteFinal: async (config) => {
    return mergeConfig(config, {
      css: {
        preprocessorOptions: {
          scss: {
            api: "legacy",
            // Silence Dart Sass deprecations coming from USWDS in node_modules
            // (@import, if(), /-division, deprecated settings/mixins).
            quietDeps: true,
            // "mixed-decls" dropped — obsolete in current Dart Sass; silencing an
            // obsolete id emits its own warning.
            silenceDeprecations: ["legacy-js-api", "global-builtin"],
            includePaths: [
              'node_modules/@uswds/uswds',
              'node_modules/@uswds/uswds/dist',
              'node_modules/@uswds/uswds/packages',
              path.resolve(__dirname, 'node_modules/@uswds/uswds/packages')
    
            ],
            
          },
        },
      },
    });
  },
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};
export default config;
