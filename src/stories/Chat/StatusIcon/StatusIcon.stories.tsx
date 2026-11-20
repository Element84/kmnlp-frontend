import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusIcon } from ".";

const meta: Meta<typeof StatusIcon> = {
  title: "Components/StatusIcon",
  component: StatusIcon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["pending", "in_progress", "completed", "failed", "cancelled"],
      description: "The status to display",
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
      description: "Size of the status icon",
    },
    animated: {
      control: "boolean",
      description: "Whether to animate the in-progress state",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  args: {
    status: "pending",
    size: "medium",
    animated: false,
  },
};

export const InProgress: Story = {
  args: {
    status: "in_progress",
    size: "medium",
    animated: false,
  },
};

export const InProgressAnimated: Story = {
  args: {
    status: "in_progress",
    size: "medium",
    animated: true,
  },
};

export const Completed: Story = {
  args: {
    status: "completed",
    size: "medium",
    animated: false,
  },
};

export const Failed: Story = {
  args: {
    status: "failed",
    size: "medium",
    animated: false,
  },
};

export const SmallSize: Story = {
  args: {
    status: "completed",
    size: "small",
    animated: false,
  },
};

export const LargeSize: Story = {
  args: {
    status: "in_progress",
    size: "large",
    animated: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <StatusIcon status="pending" size="medium" />
        <div style={{ fontSize: "12px", marginTop: "4px" }}>Pending</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <StatusIcon status="in_progress" size="medium" animated />
        <div style={{ fontSize: "12px", marginTop: "4px" }}>In Progress</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <StatusIcon status="completed" size="medium" />
        <div style={{ fontSize: "12px", marginTop: "4px" }}>Completed</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <StatusIcon status="failed" size="medium" />
        <div style={{ fontSize: "12px", marginTop: "4px" }}>Failed</div>
      </div>
    </div>
  ),
};
