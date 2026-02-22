import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import path from "path";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  staticDirs: ["../public"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-addon-sass-postcss",
  ],
  viteFinal: async (config) => {
    return mergeConfig(config, {
      css: {
        preprocessorOptions: {
          scss: {
            includePaths: [
              path.resolve(__dirname, "../node_modules/@uswds/uswds//dist/scss"),
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
