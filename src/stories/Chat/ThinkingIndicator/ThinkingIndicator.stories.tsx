import type { Meta, StoryObj } from "@storybook/react";
import { ThinkingIndicator } from "./ThinkingIndicator";

const meta = {
  title: "Chat/ThinkingIndicator",
  component: ThinkingIndicator,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ThinkingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleThinking = `Let me consider the user's request about the Gulf of Mexico.
I should identify the relevant oceanographic datasets.
Temperature and salinity are the key variables here.
I'll cross-reference seasonal patterns before summarizing the findings.`;

export const Streaming: Story = {
  args: {
    text: sampleThinking,
    isStreaming: true,
  },
};

export const Finished: Story = {
  args: {
    text: sampleThinking,
    isStreaming: false,
    durationSeconds: 7,
  },
};
