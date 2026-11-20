import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProcessStep } from "./ProcessStep";

const meta: Meta<typeof ProcessStep> = {
  title: "Components/ProcessStep",
  component: ProcessStep,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    stepText: {
      control: "text",
      description: "Text description of the process step",
    },
    status: {
      control: "select",
      options: ["pending", "in_progress", "completed", "failed", "cancelled"],
      description: "Current status of the step",
    },
    index: {
      control: "number",
      description: "Step number (0-based index)",
    },
    showConnector: {
      control: "boolean",
      description: "Whether to show the connector line",
    },
    isLast: {
      control: "boolean",
      description: "Whether this is the last step (hides connector)",
    },
    animated: {
      control: "boolean",
      description: "Whether to animate the in-progress state",
    },
    outcome: {
      control: "text",
      description:
        "Optional outcome summary displayed in bold below progress updates",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  args: {
    stepText: "Checking for data associated with Gulf of Mexico between...",
    status: "pending",
    index: 0,
    showConnector: true,
    isLast: false,
    animated: false,
  },
};

export const InProgress: Story = {
  args: {
    stepText: "Conducting analysis over identified datasets",
    status: "in_progress",
    index: 1,
    showConnector: true,
    isLast: false,
    animated: true,
  },
};

export const Completed: Story = {
  args: {
    stepText: "Geocoding Gulf of Mexico data",
    status: "completed",
    index: 2,
    showConnector: true,
    isLast: false,
    animated: false,
  },
};

export const Failed: Story = {
  args: {
    stepText: "Processing environmental data layers",
    status: "failed",
    index: 3,
    showConnector: false,
    isLast: true,
    animated: false,
  },
};

export const WithoutIndex: Story = {
  args: {
    stepText: "Validating input parameters",
    status: "completed",
    showConnector: true,
    isLast: false,
    animated: false,
  },
};

export const LongText: Story = {
  args: {
    stepText:
      "This is a very long step description that demonstrates how the component handles text wrapping and maintains proper spacing and alignment even with extensive content that spans multiple lines.",
    status: "in_progress",
    index: 0,
    showConnector: true,
    isLast: false,
    animated: true,
  },
};

export const WithSubSteps: Story = {
  args: {
    stepText: "Processing oceanographic data",
    status: "in_progress",
    index: 1,
    showConnector: true,
    isLast: false,
    animated: true,
    subSteps: [
      { content_type: "ProgressUpdate", title: "Loading temperature datasets" },
      { content_type: "ProgressUpdate", title: "Filtering by date range" },
      {
        content_type: "ProgressUpdate",
        title: "Applying quality control checks",
      },
      {
        content_type: "ProgressUpdate",
        title: "Generating statistical summaries",
      },
    ],
  },
};

export const CompletedWithSubSteps: Story = {
  args: {
    stepText: "Analyzing Gulf of Mexico data",
    status: "completed",
    index: 0,
    showConnector: true,
    isLast: false,
    animated: false,
    subSteps: [
      { content_type: "ProgressUpdate", title: "Retrieved 1,234 data points" },
      { content_type: "ProgressUpdate", title: "Applied temperature filters" },
      { content_type: "ProgressUpdate", title: "Calculated mean and variance" },
      {
        content_type: "ProgressUpdate",
        title: "Generated regional statistics",
      },
    ],
  },
};

export const WithOutcome: Story = {
  args: {
    stepText: "Geocoding Gulf of Mexico region",
    status: "completed",
    index: 0,
    showConnector: true,
    isLast: false,
    animated: false,
    outcome:
      "Successfully identified 15 monitoring stations in the specified area with temperature data spanning 2020-2024.",
  },
};

export const WithSubStepsAndOutcome: Story = {
  args: {
    stepText: "Processing environmental data layers",
    status: "completed",
    index: 1,
    showConnector: true,
    isLast: false,
    animated: false,
    subSteps: [
      {
        content_type: "ProgressUpdate",
        title: "Loading sea surface temperature data",
      },
      {
        content_type: "ProgressUpdate",
        title: "Processing chlorophyll-a concentrations",
      },
      {
        content_type: "ProgressUpdate",
        title: "Calculating water quality indices",
      },
    ],
    outcome:
      "Created comprehensive environmental dataset with 3,847 data points across 12 parameters for the Gulf of Mexico region.",
  },
};

export const ProcessSequence: Story = {
  render: () => (
    <div style={{ maxWidth: "400px" }}>
      <ProcessStep
        stepText="Checking for data associated with Gulf of Mexico between..."
        status="completed"
        index={0}
        showConnector={true}
        isLast={false}
      />
      <ProcessStep
        stepText="Conducting analysis over identified datasets"
        status="completed"
        index={1}
        showConnector={true}
        isLast={false}
      />
      <ProcessStep
        stepText="Geocoding Gulf of Mexico data"
        status="in_progress"
        index={2}
        showConnector={true}
        isLast={false}
        animated={true}
      />
      <ProcessStep
        stepText="Generating visualization outputs"
        status="pending"
        index={3}
        showConnector={false}
        isLast={true}
      />
    </div>
  ),
};
