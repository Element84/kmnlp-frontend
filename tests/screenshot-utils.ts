import { Page } from '@playwright/test';

export interface ScreenshotConfig {
  storyPath: string;
  outputName: string;
  waitTime?: number;
  fullPage?: boolean;
  storybookPort?: number;
  interactions?: (page: Page) => Promise<void>;
}

export interface StoryScreenshotGroup {
  groupName: string;
  stories: ScreenshotConfig[];
}

export class StorybookScreenshotter {
  constructor(private page: Page, private storybookPort: number = 6006) {}

  async captureStory(config: ScreenshotConfig): Promise<void> {
    const port = config.storybookPort || this.storybookPort;
    const url = `http://localhost:${port}/?path=/story/${config.storyPath}`;
    
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    
    // Default wait time for components to load (maps, animations, etc.)
    await this.page.waitForTimeout(config.waitTime || 2000);
    
    // Perform any custom interactions (clicks, hovers, etc.)
    if (config.interactions) {
      await config.interactions(this.page);
    }
    
    await this.page.screenshot({
      path: `./temp/${config.outputName}.png`,
      fullPage: config.fullPage ?? true
    });
  }

  async captureMultipleStories(stories: ScreenshotConfig[]): Promise<void> {
    for (const story of stories) {
      console.log(`Capturing screenshot: ${story.outputName}`);
      await this.captureStory(story);
    }
  }

  async captureStoryGroups(groups: StoryScreenshotGroup[]): Promise<void> {
    for (const group of groups) {
      console.log(`\n--- Capturing ${group.groupName} Stories ---`);
      await this.captureMultipleStories(group.stories);
    }
  }
}

// Predefined story configurations for easy reuse
export const STORY_CONFIGS = {
  // Map Components
  MAP_CONTAINER_DEFAULT: {
    storyPath: 'map-mapcontainer--default',
    outputName: 'mapcontainer-default',
    waitTime: 3000 // Maps need extra time
  },
  MAP_CONTAINER_AREA_SELECTION: {
    storyPath: 'map-mapcontainer--area-selection-active',
    outputName: 'mapcontainer-area-selection',
    waitTime: 2000
  },
  MAP_CONTAINER_LAYOUT: {
    storyPath: 'map-mapcontainer--full-layout-simulation',
    outputName: 'mapcontainer-layout',
    waitTime: 2000,
    interactions: async (page: Page) => {
      // Test interactions like button clicks
      const collapseBtn = page.getByText('Collapse Chat');
      if (await collapseBtn.isVisible()) {
        await collapseBtn.click();
        await page.waitForTimeout(500);
      }
    }
  },
  MAP_CONTAINER_CUSTOM_STYLE: {
    storyPath: 'map-mapcontainer--custom-style',
    outputName: 'mapcontainer-custom-style',
    waitTime: 3000 // Maps need extra time
  },

  // Map Controls
  MAP_CONTROLS_DEFAULT: {
    storyPath: 'map-mapcontrols--default',
    outputName: 'mapcontrols-default'
  },
  MAP_CONTROLS_AOI_ACTIVE: {
    storyPath: 'map-mapcontrols--aoi-active',
    outputName: 'mapcontrols-aoi-active'
  },
  MAP_CONTROLS_DISABLED: {
    storyPath: 'map-mapcontrols--disabled',
    outputName: 'mapcontrols-disabled'
  },
  MAP_CONTROLS_WITH_BACKGROUND: {
    storyPath: 'map-mapcontrols--with-map-background',
    outputName: 'mapcontrols-with-background'
  },
  MAP_CONTROLS_INTERACTION: {
    storyPath: 'map-mapcontrols--interaction-example',
    outputName: 'mapcontrols-interaction-integrated',
    waitTime: 3000 // Map needs time to load
  },

  // Chat Components  
  CHAT_INPUT_DEFAULT: {
    storyPath: 'chat-chatinput--default',
    outputName: 'chatinput-default'
  },
  CHAT_INPUT_PROCESSING: {
    storyPath: 'chat-chatinput--processing',
    outputName: 'chatinput-processing'
  },
  CHAT_CONTAINER_DEFAULT: {
    storyPath: 'chat-chatcontainer--default',
    outputName: 'chatcontainer-default'
  },
  CHAT_VIEW_DEFAULT: {
    storyPath: 'chat-chatview--default',
    outputName: 'chatview-default'
  },
  CHAT_VIEW_COLLAPSED: {
    storyPath: 'chat-chatview--collapsed',
    outputName: 'chatview-collapsed'
  },
  CHAT_VIEW_MAXIMIZED: {
    storyPath: 'chat-chatview--maximized-map-mode',
    outputName: 'chatview-maximized-map-mode'
  },

  // UI Components
  BUTTON_DEFAULT: {
    storyPath: 'example-button--primary',
    outputName: 'button-primary'
  },
  HEADER_DEFAULT: {
    storyPath: 'example-header--logged-in',
    outputName: 'header-default'
  },

  // Complete System Integration
  COMPLETE_SYSTEM_ACTIVE: {
    storyPath: 'integration-complete-system--active-analysis',
    outputName: 'complete-system-active-analysis',
    waitTime: 4000 // Maps need extra time
  },
  COMPLETE_SYSTEM_COMPLETED: {
    storyPath: 'integration-complete-system--completed-analysis',
    outputName: 'complete-system-completed-analysis', 
    waitTime: 4000
  },
  COMPLETE_SYSTEM_ERROR: {
    storyPath: 'integration-complete-system--error-state',
    outputName: 'complete-system-error-state',
    waitTime: 3000
  },
  COMPLETE_SYSTEM_MAXIMIZED: {
    storyPath: 'integration-complete-system--maximized-map-view',
    outputName: 'complete-system-maximized-map',
    waitTime: 4000
  },
  COMPLETE_SYSTEM_INTERACTIVE: {
    storyPath: 'integration-complete-system--full-user-flow',
    outputName: 'complete-system-interactive-demo',
    waitTime: 4000
  }
} as const;

// Predefined groups for batch screenshot capture
export const STORY_GROUPS: StoryGroupsConfig = {
  MAP_COMPONENTS: {
    groupName: 'Map Components',
    stories: [
      STORY_CONFIGS.MAP_CONTAINER_DEFAULT,
      STORY_CONFIGS.MAP_CONTAINER_AREA_SELECTION,
      STORY_CONFIGS.MAP_CONTAINER_LAYOUT,
      STORY_CONFIGS.MAP_CONTAINER_CUSTOM_STYLE,
      STORY_CONFIGS.MAP_CONTROLS_DEFAULT,
      STORY_CONFIGS.MAP_CONTROLS_AOI_ACTIVE,
      STORY_CONFIGS.MAP_CONTROLS_DISABLED,
      STORY_CONFIGS.MAP_CONTROLS_WITH_BACKGROUND,
      STORY_CONFIGS.MAP_CONTROLS_INTERACTION
    ]
  },
  
  CHAT_COMPONENTS: {
    groupName: 'Chat Components',
    stories: [
      STORY_CONFIGS.CHAT_INPUT_DEFAULT,
      STORY_CONFIGS.CHAT_INPUT_PROCESSING,
      STORY_CONFIGS.CHAT_CONTAINER_DEFAULT,
      STORY_CONFIGS.CHAT_VIEW_DEFAULT,
      STORY_CONFIGS.CHAT_VIEW_COLLAPSED,
      STORY_CONFIGS.CHAT_VIEW_MAXIMIZED
    ]
  },
  
  UI_COMPONENTS: {
    groupName: 'UI Components', 
    stories: [
      STORY_CONFIGS.BUTTON_DEFAULT,
      STORY_CONFIGS.HEADER_DEFAULT
    ]
  },
  
  COMPLETE_SYSTEM: {
    groupName: 'Complete System Integration',
    stories: [
      STORY_CONFIGS.COMPLETE_SYSTEM_ACTIVE,
      STORY_CONFIGS.COMPLETE_SYSTEM_COMPLETED,
      STORY_CONFIGS.COMPLETE_SYSTEM_ERROR,
      STORY_CONFIGS.COMPLETE_SYSTEM_MAXIMIZED,
      STORY_CONFIGS.COMPLETE_SYSTEM_INTERACTIVE
    ]
  }
};

type StoryGroupsConfig = {
  [K in keyof typeof STORY_GROUPS]: StoryScreenshotGroup;
};