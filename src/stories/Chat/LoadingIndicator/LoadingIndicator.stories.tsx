import type { Meta, StoryObj } from "@storybook/react";
import { LoadingIndicator } from ".";

const meta = {
  title: "Chat/LoadingIndicator",
  component: LoadingIndicator,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LoadingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const InChatContext: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="maxw-tablet padding-2 bg-base-lightest radius-md">
        <div className="padding-2 bg-white radius-md margin-bottom-1">
          User: Tell me about the Gulf of Mexico
        </div>
        <Story />
      </div>
    ),
  ],
};
