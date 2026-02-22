import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatContainer } from './ChatContainer';

const meta: Meta<typeof ChatContainer> = {
  title: 'Chat/ChatContainer',
  component: ChatContainer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMessages = [
  {
    id: '1',
    text: 'What are the trends in plastic waste accumulation in the Gulf of Mexico over the past five years?',
    type: 'user' as const,
    timestamp: new Date('2024-01-15T10:30:00'),
  },
  {
    id: '2',
    text: 'I\'ll help you analyze plastic waste trends in the Gulf of Mexico. Let me gather the relevant data.',
    type: 'system' as const,
    timestamp: new Date('2024-01-15T10:30:15'),
  },
];

const sampleProcessStatus = {
  id: 'process-1',
  title: 'Process (3 steps)',
  steps: [
    {
      id: 'step-1',
      text: 'Checking for data associated with Gulf of Mexico betwe...',
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
  ],
  overallStatus: 'in_progress' as const,
  isCollapsed: false,
};

const failedProcessStatus = {
  id: 'process-2',
  title: 'Process (3 steps)',
  steps: [
    {
      id: 'step-1',
      text: 'Checking for data associated with Gulf of Mexico betwe...',
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
      status: 'failed' as const,
    },
  ],
  overallStatus: 'failed' as const,
  isCollapsed: false,
};

const sampleError = {
  message: 'The geocoding process for the Gulf of Mexico data was unsuccessful.',
  details: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  showDetails: false,
};

export const Default: Story = {
  args: {
    messages: sampleMessages,
  },
};

export const WithProcess: Story = {
  args: {
    messages: sampleMessages,
    processStatus: sampleProcessStatus,
  },
};

export const WithFailedProcess: Story = {
  args: {
    messages: sampleMessages,
    processStatus: failedProcessStatus,
    errorState: sampleError,
  },
};

export const WithCollapsedProcess: Story = {
  args: {
    messages: sampleMessages,
    processStatus: {
      ...sampleProcessStatus,
      isCollapsed: true,
    },
  },
};

export const ErrorState: Story = {
  args: {
    messages: sampleMessages,
    errorState: {
      ...sampleError,
      showDetails: true,
    },
  },
};

export const Empty: Story = {
  args: {
    messages: [],
  },
};