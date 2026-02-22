#!/usr/bin/env tsx

import { chromium } from 'playwright';
import { StorybookScreenshotter, STORY_GROUPS, STORY_CONFIGS } from '../tests/screenshot-utils';

interface CliOptions {
  component?: string;
  group?: string;
  all?: boolean;
  port?: number;
  help?: boolean;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--component':
      case '-c':
        options.component = args[++i];
        break;
      case '--group':
      case '-g':
        options.group = args[++i];
        break;
      case '--all':
      case '-a':
        options.all = true;
        break;
      case '--port':
      case '-p':
        options.port = parseInt(args[++i]);
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
Screenshot Tool for NOAA KMNLP Components

Usage:
  npm run screenshots [options]

Options:
  -c, --component <name>    Take screenshot of specific component
  -g, --group <name>        Take screenshots of component group
  -a, --all                 Take screenshots of all components
  -p, --port <number>       Storybook port (default: 6008)
  -h, --help               Show this help message

Available Components:
  ${Object.keys(STORY_CONFIGS).map(key => `  - ${key.toLowerCase()}`).join('\n')}

Available Groups:
  ${Object.keys(STORY_GROUPS).map(key => `  - ${key.toLowerCase()}`).join('\n')}

Examples:
  npm run screenshots -- --component map_container_default
  npm run screenshots -- --group map_components
  npm run screenshots -- --all
  npm run screenshots -- --port 6006 --group chat_components
`);
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  const port = options.port || 6008;
  console.log(`Using Storybook port: ${port}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const screenshotter = new StorybookScreenshotter(page, port);

  try {
    if (options.all) {
      console.log('Taking screenshots of all component groups...');
      await screenshotter.captureStoryGroups(Object.values(STORY_GROUPS));

    } else if (options.group) {
      const groupKey = options.group.toUpperCase();
      const group = STORY_GROUPS[groupKey as keyof typeof STORY_GROUPS];

      if (!group) {
        console.error(`Group "${options.group}" not found. Available groups: ${Object.keys(STORY_GROUPS).join(', ')}`);
        process.exit(1);
      }

      console.log(`Taking screenshots of ${group.groupName}...`);
      await screenshotter.captureStoryGroups([group]);

    } else if (options.component) {
      const configKey = options.component.toUpperCase();
      const config = STORY_CONFIGS[configKey as keyof typeof STORY_CONFIGS];

      if (!config) {
        console.error(`Component "${options.component}" not found. Available components: ${Object.keys(STORY_CONFIGS).join(', ')}`);
        process.exit(1);
      }

      console.log(`Taking screenshot of ${options.component}...`);
      await screenshotter.captureStory(config);

    } else {
      console.log('No options specified. Taking screenshots of MAP_COMPONENTS by default...');
      await screenshotter.captureStoryGroups([STORY_GROUPS.MAP_COMPONENTS]);
    }

    console.log('\n✅ Screenshots completed successfully!');
    console.log('📁 Check the ./temp/ directory for output files.');

  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
