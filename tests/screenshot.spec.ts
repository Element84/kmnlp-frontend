import { test } from '@playwright/test';
import { StorybookScreenshotter, STORY_GROUPS, STORY_CONFIGS } from './screenshot-utils';

test('take app screenshot', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');

  // Wait for the app to load
  await page.waitForLoadState('networkidle');

  // Take a full page screenshot
  await page.screenshot({
    path: './temp/app-full-page.png',
    fullPage: true
  });

  // Take a viewport screenshot
  await page.screenshot({
    path: './temp/app-viewport.png'
  });
});

test('take storybook component screenshots', async ({ page }) => {
  const screenshotter = new StorybookScreenshotter(page, 6008);

  // Capture all map components
  await screenshotter.captureStoryGroups([
    STORY_GROUPS.MAP_COMPONENTS,
    STORY_GROUPS.CHAT_COMPONENTS
  ]);
});

test('take specific component screenshots', async ({ page }) => {
  const screenshotter = new StorybookScreenshotter(page, 6008);

  // Capture individual stories with custom configurations
  await screenshotter.captureMultipleStories([
    STORY_CONFIGS.MAP_CONTAINER_DEFAULT,
    STORY_CONFIGS.CHAT_INPUT_DEFAULT,
    {
      storyPath: 'chat-chatinput--interactive',
      outputName: 'chatinput-interactive-test',
      waitTime: 1000,
      interactions: async (page) => {
        // Check if textarea exists and interact with it
        const textarea = page.locator('textarea');
        if (await textarea.isVisible()) {
          await textarea.fill('Test message for screenshot');
          await page.waitForTimeout(500);
        }

        // Check if AOI button exists and click it
        const aoiBtn = page.getByRole('button', { name: /select/i });
        if (await aoiBtn.isVisible()) {
          await aoiBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }
  ]);
});

test('take map component screenshots with interactions', async ({ page }) => {
  const screenshotter = new StorybookScreenshotter(page, 6008);

  // Test MapContainer with specific interactions
  await screenshotter.captureStory({
    storyPath: 'map-mapcontainer--full-layout-simulation',
    outputName: 'mapcontainer-interaction-test',
    waitTime: 2000,
    interactions: async (page) => {
      // Test collapse functionality
      const collapseBtn = page.getByText('Collapse Chat');
      if (await collapseBtn.isVisible()) {
        await collapseBtn.click();
        await page.waitForTimeout(1000);
      }

      // Test area selection
      const aoiBtn = page.getByText('Select AOI');
      if (await aoiBtn.isVisible()) {
        await aoiBtn.click();
        await page.waitForTimeout(500);

        // Click on map area
        await page.click('.map-container', { position: { x: 400, y: 300 } });
        await page.waitForTimeout(1000);
      }
    }
  });
});
