import type { Meta, StoryObj } from "@storybook/react";
import { AreaOfInterestControls } from "./index";

const meta = {
  title: "Map/AreaOfInterestControls",
  component: AreaOfInterestControls,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A control panel for creating or selecting an Area of Interest (AOI) with file upload capabilities.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onApply: { action: "apply clicked" },
    onCancel: { action: "cancel clicked" },
    defaultName: {
      control: "text",
      description: "Initial name value for the AOI",
    },
    isOpen: {
      control: "boolean",
      description: "Whether the control panel is visible",
    },
  },
} satisfies Meta<typeof AreaOfInterestControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
  },
};

export const WithDefaultName: Story = {
  args: {
    isOpen: true,
    defaultName: "Pacific Ocean Region",
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};
