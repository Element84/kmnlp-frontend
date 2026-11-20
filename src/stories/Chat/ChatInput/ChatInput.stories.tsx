import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ChatInput } from './ChatInput';

const meta: Meta<typeof ChatInput> = {
  title: 'Chat/ChatInput',
  component: ChatInput,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input field',
    },
    isProcessing: {
      control: 'boolean',
      description: 'Whether a request is being processed',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
  },
  args: {
    handleSubmit: fn(),
    onSelectAOI: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter Prompt...',
    isProcessing: false,
    disabled: false,
  },
};

export const Processing: Story = {
  args: {
    placeholder: 'Enter Prompt...',
    isProcessing: true,
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Enter Prompt...',
    isProcessing: false,
    disabled: true,
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Ask about environmental data...',
    isProcessing: false,
    disabled: false,
  },
};

export const Interactive: Story = {
  args: {
    placeholder: 'Try typing a message...',
    isProcessing: false,
    disabled: false,
  },
  play: async () => {
    // This story can be used to test interactive behavior
  },
};