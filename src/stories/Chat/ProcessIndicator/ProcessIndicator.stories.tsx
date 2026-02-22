import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, within, userEvent } from 'storybook/test';
import { ProcessIndicator } from './ProcessIndicator';

const meta: Meta<typeof ProcessIndicator> = {
  title: 'Components/ProcessIndicator',
  component: ProcessIndicator,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['pending', 'in_progress', 'completed', 'failed'],
      description: 'Overall status of the process',
    },
    title: {
      control: 'text',
      description: 'Title for the process indicator',
    },
    isCollapsed: {
      control: 'boolean',
      description: 'Whether the details are collapsed',
    },
    showStepNumbers: {
      control: 'boolean',
      description: 'Whether to show step numbers',
    },
    animated: {
      control: 'boolean',
      description: 'Whether to animate progress indicators',
    },
  },
  args: {
    onToggle: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleSteps = [
  {
    id: 'step-1',
    text: 'Checking for data associated with Gulf of Mexico between 2019-2024',
    status: 'completed' as const,
  },
  {
    id: 'step-2',
    text: 'Conducting analysis over identified datasets',
    status: 'completed' as const,
  },
  {
    id: 'step-3',
    text: 'Geocoding Gulf of Mexico data',
    status: 'in_progress' as const,
  },
  {
    id: 'step-4',
    text: 'Generating visualization outputs',
    status: 'pending' as const,
  },
];

const completedSteps = sampleSteps.map(step => ({
  ...step,
  status: 'completed' as const,
}));

const failedSteps = [
  ...sampleSteps.slice(0, 2),
  {
    id: 'step-3',
    text: 'Geocoding Gulf of Mexico data',
    status: 'failed' as const,
  },
  {
    id: 'step-4',
    text: 'Generating visualization outputs',
    status: 'pending' as const,
  },
];

export const InProgress: Story = {
  args: {
    steps: sampleSteps,
    status: 'in_progress',
    title: 'Data Analysis Process',
    isCollapsed: false,
    showStepNumbers: true,
    animated: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test that the title is rendered correctly
    await expect(canvas.getByText('Data Analysis Process - In Progress')).toBeInTheDocument();
    
    // Test that progress percentage is shown
    await expect(canvas.getByText(/\d+% complete/)).toBeInTheDocument();
    
    // Test that the toggle button is present
    await expect(canvas.getByLabelText('Collapse process details')).toBeInTheDocument();
    
    // Test that steps are visible when expanded
    await expect(canvas.getByText('Checking for data associated with Gulf of Mexico between 2019-2024')).toBeInTheDocument();
  },
};

export const Completed: Story = {
  args: {
    steps: completedSteps,
    status: 'completed',
    title: 'Data Analysis Process',
    isCollapsed: false,
    showStepNumbers: true,
    animated: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    
    // Test that the completed status is shown
    await expect(canvas.getByText('Data Analysis Process - Completed')).toBeInTheDocument();
    
    // Test that no progress bar is shown for completed status
    await expect(canvas.queryByText(/% complete/)).not.toBeInTheDocument();
    
    // Test interactive collapse/expand functionality
    const toggleButton = canvas.getByLabelText('Collapse process details');
    await user.click(toggleButton);
    
    // After clicking, the steps should be hidden
    // Note: This test might need adjustment based on actual behavior
    await expect(canvas.getByLabelText('Expand process details')).toBeInTheDocument();
  },
};

export const Failed: Story = {
  args: {
    steps: failedSteps,
    status: 'failed',
    title: 'Data Analysis Process',
    isCollapsed: false,
    showStepNumbers: true,
    animated: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test that the failed status is shown
    await expect(canvas.getByText('Data Analysis Process - Failed')).toBeInTheDocument();
    
    // Test that error icon is present
    await expect(canvas.getByText('⚠️')).toBeInTheDocument();
  },
};

export const Collapsed: Story = {
  args: {
    steps: sampleSteps,
    status: 'in_progress',
    title: 'Data Analysis Process',
    isCollapsed: true,
    showStepNumbers: true,
    animated: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test that the title is still visible when collapsed
    await expect(canvas.getByText('Data Analysis Process - In Progress')).toBeInTheDocument();
    
    // Test that the toggle button shows "Expand" when collapsed
    await expect(canvas.getByLabelText('Expand process details')).toBeInTheDocument();
    
    // Test that steps are NOT visible when collapsed
    await expect(canvas.queryByText('Checking for data associated with Gulf of Mexico between 2019-2024')).not.toBeInTheDocument();
  },
};

export const WithoutStepNumbers: Story = {
  args: {
    steps: sampleSteps,
    status: 'in_progress',
    title: 'Simple Process',
    isCollapsed: false,
    showStepNumbers: false,
    animated: true,
  },
};

export const DefaultTitle: Story = {
  args: {
    steps: sampleSteps,
    status: 'in_progress',
    isCollapsed: false,
    showStepNumbers: true,
    animated: true,
  },
};

export const SingleStep: Story = {
  args: {
    steps: [
      {
        id: 'step-1',
        text: 'Processing request',
        status: 'in_progress' as const,
      },
    ],
    status: 'in_progress',
    title: 'Quick Process',
    isCollapsed: false,
    showStepNumbers: false,
    animated: true,
  },
};

export const LongSteps: Story = {
  args: {
    steps: [
      {
        id: 'step-1',
        text: 'Initializing comprehensive data collection process for environmental monitoring systems across multiple geographic regions including coastal and inland water bodies',
        status: 'completed' as const,
      },
      {
        id: 'step-2',
        text: 'Performing advanced statistical analysis and machine learning algorithms on collected datasets to identify patterns and trends in environmental indicators',
        status: 'in_progress' as const,
      },
      {
        id: 'step-3',
        text: 'Generating detailed reports and visualizations for stakeholder review',
        status: 'pending' as const,
      },
    ],
    status: 'in_progress',
    title: 'Complex Analysis Workflow',
    isCollapsed: false,
    showStepNumbers: true,
    animated: true,
  },
};