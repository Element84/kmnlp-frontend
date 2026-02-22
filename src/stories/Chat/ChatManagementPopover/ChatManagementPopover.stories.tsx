import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ChatManagementPopover, ChatHistory } from './ChatManagementPopover';

const meta: Meta<typeof ChatManagementPopover> = {
  title: 'Chat/ChatManagementPopover',
  component: ChatManagementPopover,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Overlay popover panel that appears over the chat view to show chat management options. Provides access to chat history and new chat creation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isVisible: {
      control: 'boolean',
      description: 'Whether the popover is visible',
    },
    recentChats: {
      control: 'object',
      description: 'Array of recent chat conversations',
    },
  },
  args: {
    onClose: fn(),
    onNewChat: fn(),
    onSelectChat: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleChats: ChatHistory[] = [
  { 
    id: '1', 
    title: 'Previous Chat 1 - Lorem Ipsum',
    lastActivity: new Date('2024-01-15')
  },
  { 
    id: '2', 
    title: 'Previous Chat 2 - Lorem Ipsum',
    lastActivity: new Date('2024-01-14')
  },
  { 
    id: '3', 
    title: 'Previous Chat 3 - Lorem Ipsum',
    lastActivity: new Date('2024-01-13')
  },
];

const longTitleChats: ChatHistory[] = [
  { 
    id: '1', 
    title: 'Analysis of Ocean Temperature Trends in the Gulf of Mexico Over the Past Five Years',
    lastActivity: new Date('2024-01-15')
  },
  { 
    id: '2', 
    title: 'Plastic Waste Accumulation Patterns and Environmental Impact Assessment',
    lastActivity: new Date('2024-01-14')
  },
  { 
    id: '3', 
    title: 'Hurricane Season Impact on Marine Ecosystems - 2023 Study',
    lastActivity: new Date('2024-01-13')
  },
];

/**
 * Hidden state (default when not visible)
 */
export const Hidden: Story = {
  args: {
    isVisible: false,
  },
};

/**
 * Visible popover with sample chat history
 */
export const Visible: Story = {
  args: {
    isVisible: true,
    recentChats: sampleChats,
  },
};

/**
 * Popover with longer chat titles to test text wrapping
 */
export const WithLongTitles: Story = {
  args: {
    isVisible: true,
    recentChats: longTitleChats,
  },
};

/**
 * Empty state with no recent chats
 */
export const EmptyState: Story = {
  args: {
    isVisible: true,
    recentChats: [],
  },
};

/**
 * Interactive example with state management
 */
export const Interactive: Story = {
  render: () => {
    const [isVisible, setIsVisible] = React.useState(true);
    const [chats, setChats] = React.useState(sampleChats);
    
    const handleNewChat = () => {
      const newChat: ChatHistory = {
        id: Date.now().toString(),
        title: `New Chat ${chats.length + 1}`,
        lastActivity: new Date(),
      };
      setChats([newChat, ...chats]);
      setIsVisible(false);
    };
    
    const handleSelectChat = (chatId: string) => {
      setIsVisible(false);
    };
    
    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <div style={{ padding: '20px' }}>
          <button onClick={() => setIsVisible(!isVisible)}>
            {isVisible ? 'Hide' : 'Show'} Management Popover
          </button>
          <p>Chat count: {chats.length}</p>
        </div>
        
        <ChatManagementPopover
          isVisible={isVisible}
          onClose={() => setIsVisible(false)}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          recentChats={chats}
        />
      </div>
    );
  },
};

/**
 * Popover positioned over a mock chat interface
 */
export const InContext: Story = {
  render: () => (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#f0f0f0' }}>
      {/* Mock chat interface */}
      <div style={{ 
        position: 'absolute', 
        left: 0, 
        top: 0, 
        height: '100%', 
        background: 'white', 
        border: '1px solid #ddd',
        padding: '16px'
      }}>
        <h3>Chat View</h3>
        <p>This is where the chat conversation would appear.</p>
      </div>
      
      {/* Mock map area */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        right: 0, 
        height: '100%', 
        background: '#e3f2fd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h2>Map View Area</h2>
      </div>
      
      <ChatManagementPopover
        isVisible={true}
        onClose={fn()}
        onNewChat={fn()}
        onSelectChat={fn()}
        recentChats={sampleChats}
      />
    </div>
  ),
};