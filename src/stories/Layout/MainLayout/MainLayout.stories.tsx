import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { MainLayout, ChatHistory } from './MainLayout';

const meta: Meta<typeof MainLayout> = {
  title: 'Layout/MainLayout',
  component: MainLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main layout component that coordinates the three-component architecture: Chat Management Controls, Chat View, and Map View.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    chatViewCollapsed: {
      control: 'boolean',
      description: 'Whether the chat view is collapsed',
    },
    managementVisible: {
      control: 'boolean',
      description: 'Whether the management popover is visible',
    },
  },
  args: {
    onToggleChatView: fn(),
    onToggleManagement: fn(),
    onNewChat: fn(),
    onSelectChat: fn(),
    onSelectAOI: fn(),
    onSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleChats: ChatHistory[] = [
  { 
    id: '1', 
    title: 'Gulf of Mexico Plastic Waste Analysis',
    lastActivity: new Date('2024-01-15')
  },
  { 
    id: '2', 
    title: 'Hurricane Season Impact Study',
    lastActivity: new Date('2024-01-14')
  },
  { 
    id: '3', 
    title: 'Ocean Temperature Trends',
    lastActivity: new Date('2024-01-13')
  },
];

const mockChatContent = (
  <div style={{ padding: '16px', flex: 1 }}>
    <div style={{ marginBottom: '16px', padding: '12px', background: '#f0f0f0', borderRadius: '8px' }}>
      <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>What are the trends in plastic waste accumulation in the Gulf of Mexico over the past five years?</p>
      <small style={{ color: '#666', fontSize: '12px' }}>User • 5:45 PM</small>
    </div>
    <div style={{ marginBottom: '16px', padding: '12px', background: '#e3f2fd', borderRadius: '8px' }}>
      <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>I'll help you analyze plastic waste trends in the Gulf of Mexico. Let me gather the relevant data.</p>
      <small style={{ color: '#666', fontSize: '12px' }}>System • 5:45 PM</small>
    </div>
  </div>
);

const mockMapContent = (
  <div style={{ 
    width: '100%', 
    height: '100%', 
    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  }}>
    <h2 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>Map View Area</h2>
    <p style={{ margin: '0 0 24px 0', color: '#424242', textAlign: 'center' }}>Gulf of Mexico Interactive Map</p>
    
    <div style={{ 
      display: 'flex', 
      gap: '8px', 
      flexWrap: 'wrap',
      justifyContent: 'center',
      maxWidth: '600px'
    }}>
      {['Full Screen Map', 'Area of Interest Tool', 'Area Search', 'Map Layer Options', 'More'].map((label) => (
        <button key={label} style={{
          padding: '8px 16px',
          border: '1px solid #1976d2',
          background: 'white',
          color: '#1976d2',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          {label}
        </button>
      ))}
    </div>
  </div>
);

/**
 * Default layout with chat expanded and management closed
 */
export const Default: Story = {
  args: {
    chatViewCollapsed: false,
    managementVisible: false,
    chatContent: mockChatContent,
    mapContent: mockMapContent,
    recentChats: sampleChats,
  },
};

/**
 * Layout with chat view collapsed to minimal strip
 */
export const ChatCollapsed: Story = {
  args: {
    chatViewCollapsed: true,
    managementVisible: false,
    chatContent: mockChatContent,
    mapContent: mockMapContent,
    recentChats: sampleChats,
  },
};

/**
 * Layout with management popover visible
 */
export const ManagementVisible: Story = {
  args: {
    chatViewCollapsed: false,
    managementVisible: true,
    chatContent: mockChatContent,
    mapContent: mockMapContent,
    recentChats: sampleChats,
  },
};

/**
 * Layout with both chat collapsed and management visible
 */
export const ChatCollapsedWithManagement: Story = {
  args: {
    chatViewCollapsed: true,
    managementVisible: true,
    chatContent: mockChatContent,
    mapContent: mockMapContent,
    recentChats: sampleChats,
  },
};

/**
 * Interactive example demonstrating all three components working together
 */
export const Interactive: Story = {
  render: () => {
    const [chatViewCollapsed, setChatViewCollapsed] = React.useState(false);
    const [managementVisible, setManagementVisible] = React.useState(false);
    const [messages, setMessages] = React.useState([
      'Welcome to NOAA KMNLP!',
      'How can I help you analyze ocean and atmospheric data today?'
    ]);
    
    const handleSubmit = (message: string) => {
      setMessages([...messages, `User: ${message}`, 'System: I received your message and will process it.']);
    };
    
    const handleNewChat = () => {
      setMessages(['New chat started. How can I help you?']);
      setManagementVisible(false);
    };
    
    const handleSelectChat = (chatId: string) => {
      setMessages([`Loaded chat ${chatId}`, 'Previous conversation context restored.']);
      setManagementVisible(false);
    };
    
    const dynamicChatContent = (
      <div style={{ padding: '16px', flex: 1 }}>
        <h4>Messages ({messages.length})</h4>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            marginBottom: '8px', 
            padding: '8px', 
            background: msg.startsWith('User:') ? '#f0f0f0' : '#e3f2fd',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {msg}
          </div>
        ))}
      </div>
    );
    
    const dynamicMapContent = (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <h2>Interactive Map View</h2>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p>Chat: {chatViewCollapsed ? 'Collapsed' : 'Expanded'}</p>
          <p>Management: {managementVisible ? 'Visible' : 'Hidden'}</p>
          <p>Messages: {messages.length}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => setChatViewCollapsed(!chatViewCollapsed)} style={{
            padding: '8px 16px', border: '1px solid #1976d2', background: 'white',
            color: '#1976d2', borderRadius: '4px', cursor: 'pointer'
          }}>
            {chatViewCollapsed ? 'Expand' : 'Collapse'} Chat
          </button>
          <button onClick={() => setManagementVisible(!managementVisible)} style={{
            padding: '8px 16px', border: '1px solid #1976d2', background: 'white',
            color: '#1976d2', borderRadius: '4px', cursor: 'pointer'
          }}>
            {managementVisible ? 'Hide' : 'Show'} Management
          </button>
        </div>
      </div>
    );
    
    return (
      <MainLayout
        chatViewCollapsed={chatViewCollapsed}
        managementVisible={managementVisible}
        chatContent={dynamicChatContent}
        mapContent={dynamicMapContent}
        recentChats={sampleChats}
        onToggleChatView={() => setChatViewCollapsed(!chatViewCollapsed)}
        onToggleManagement={() => setManagementVisible(!managementVisible)}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}

        onSubmit={handleSubmit}
      />
    );
  },
};

/**
 * Empty state layout ready for first interaction
 */
export const EmptyState: Story = {
  args: {
    chatViewCollapsed: false,
    managementVisible: false,
    chatContent: (
      <div style={{ 
        padding: '16px', 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#666',
        textAlign: 'center'
      }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Ready to start</h3>
          <p style={{ margin: '0', fontSize: '14px' }}>Enter a prompt to begin your analysis</p>
        </div>
      </div>
    ),
    mapContent: mockMapContent,
    recentChats: [],
  },
};