import type { Meta, StoryObj } from "@storybook/react";
import { MapControls } from "./index";

const meta = {
  title: "Map/MapControls/COG Toggle",
  component: MapControls,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "MapControls component with COG layer toggle functionality. The COG toggle only appears when a COG layer is available.",
      },
    },
  },
  argTypes: {
    hasCogLayer: {
      control: "boolean",
      description: "Whether a COG layer is available to toggle",
    },
    cogVisible: {
      control: "boolean",
      description: "Whether the COG layer is currently visible",
    },
    onCogToggle: {
      action: "cogToggle",
      description: "Callback when COG visibility is toggled",
    },
    disabled: {
      control: "boolean",
      description: "Whether the controls are disabled",
    },
  },
} satisfies Meta<typeof MapControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCogLayer: Story = {
  args: {
    hasCogLayer: true,
    cogVisible: true,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Map controls with an available COG layer. The data layer toggle appears and can be used to show/hide the COG overlay.",
      },
    },
  },
};

export const CogHidden: Story = {
  args: {
    hasCogLayer: true,
    cogVisible: false,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Map controls with COG layer hidden. The toggle shows the layer as inactive.",
      },
    },
  },
};

export const NoCogLayer: Story = {
  args: {
    hasCogLayer: false,
    cogVisible: true,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Map controls when no COG layer is available. The COG toggle is hidden completely.",
      },
    },
  },
};

export const CogToggleDisabled: Story = {
  args: {
    hasCogLayer: true,
    cogVisible: true,
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Map controls with COG toggle disabled. All controls are non-interactive.",
      },
    },
  },
};
