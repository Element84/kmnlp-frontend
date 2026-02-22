import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ChatManagementControls } from './ChatManagementControls';

const meta: Meta<typeof ChatManagementControls> = {
  title: 'Chat/ChatManagementControls',
  component: ChatManagementControls,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Small overlay controls positioned in the top-left corner of the chat view. Provides access to chat management and new chat functionality.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showManagement: {
      control: 'boolean',
      description: 'Whether the management popover is currently visible',
    },
  },
  args: {
    onToggleManagement: fn(),
    onNewChat: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state with management popover closed
 */
export const Default: Story = {
  args: {
    showManagement: false,
  },
};

/**
 * State when management popover is open (toggle button appears active)
 */
export const ManagementOpen: Story = {
  args: {
    showManagement: true,
  },
};

/**
 * Interactive example showing both states
 */
export const Interactive: Story = {
  render: () => {
    const [showManagement, setShowManagement] = React.useState(false);
    
    return (
      <div style={{ position: 'relative', width: '200px', height: '100px', background: '#f0f0f0', border: '1px dashed #ccc' }}>
        <p style={{ margin: '8px', fontSize: '12px', color: '#666' }}>Chat View Area</p>
        <ChatManagementControls
          showManagement={showManagement}
          onToggleManagement={() => setShowManagement(!showManagement)}
        />
      </div>
    );
  },
};

/**
 * Example showing controls in context of a collapsed chat view
 */
export const InCollapsedView: Story = {
  render: () => (
    <div className="chat-view--collapsed" style={{ position: 'relative', width: '50px', height: '200px', background: '#f8f9fa', border: '1px solid #dee2e6' }}>
      <ChatManagementControls
        showManagement={false}
        onToggleManagement={fn()}
        onNewChat={fn()}
      />
    </div>
  ),
};