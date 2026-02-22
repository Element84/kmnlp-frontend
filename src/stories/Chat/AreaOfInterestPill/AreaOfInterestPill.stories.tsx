import type { Meta, StoryObj } from "@storybook/react";
import { AreaOfInterestPill } from ".";

const meta: Meta<typeof AreaOfInterestPill> = {
  title: "Chat/AreaOfInterestPill",
  component: AreaOfInterestPill,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AreaOfInterestPill>;

export const Default: Story = {
  args: {
    label: "Neighborhood Boundaries",
    onRemove: () => console.log("Remove clicked"),
  },
};

export const LongLabel: Story = {
  args: {
    label: "Gulf of Mexico Coastal Region",
    onRemove: () => console.log("Remove clicked"),
  },
};

export const WithoutRemove: Story = {
  args: {
    label: "Read-only Area",
  },
};

export const MultipleExample: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <AreaOfInterestPill
        label="Neighborhood Boundaries"
        onRemove={() => console.log("Remove 1")}
      />
      <AreaOfInterestPill
        label="Downtown District"
        onRemove={() => console.log("Remove 2")}
      />
      <AreaOfInterestPill
        label="Coastal Region"
        onRemove={() => console.log("Remove 3")}
      />
    </div>
  ),
};
