import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ChatView } from "./ChatView";

const meta: Meta<typeof ChatView> = {
  title: "Chat/ChatView",
  component: ChatView,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Main conversation interface component that displays chat messages and provides input functionality. Can be collapsed to a minimal strip while preserving essential functionality.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    viewState: {
      control: "select",
      options: ["expanded", "map-maximized", "map-hidden"],
      description:
        "Application view state determining layout and functionality",
    },
    width: {
      control: "text",
      description: "Width of the chat view as CSS value (for expanded state)",
    },
  },
  args: {
    onViewStateChange: fn(),
    onSelectAOI: fn(),
    onSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default expanded chat view with conversation content and working toggle
 */
export const Default: Story = {
  args: {
    viewState: "expanded",
    width: "350px",
    children: (
      <div style={{ padding: "16px", flex: 1 }}>
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            background: "#f0f0f0",
            borderRadius: "8px",
          }}
        >
          <p style={{ margin: "0", fontSize: "14px" }}>
            Welcome to NOAA KMNLP! How can I help you analyze ocean and
            atmospheric data today?
          </p>
          <small style={{ color: "#666", fontSize: "12px" }}>5:49 PM</small>
        </div>
      </div>
    ),
  },
};

/**
 * Map maximized mode - collapsed chat with NO input controls (proper unified state)
 */
export const MapMaximized: Story = {
  args: {
    viewState: "map-maximized",
  },
};

/**
 * Map hidden mode - full width chat for conversation focus (future implementation)
 */
export const MapHidden: Story = {
  args: {
    viewState: "map-hidden",
    children: (
      <div style={{ padding: "16px", flex: 1 }}>
        <h4 style={{ margin: "0 0 16px 0" }}>Full Screen Chat View</h4>
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            background: "#f0f0f0",
            borderRadius: "8px",
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}>
            What are the trends in plastic waste accumulation in the Gulf of
            Mexico over the past five years?
          </p>
          <small style={{ color: "#666", fontSize: "12px" }}>
            User • 5:45 PM
          </small>
        </div>
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            background: "#e3f2fd",
            borderRadius: "8px",
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}>
            I'll help you analyze plastic waste trends in the Gulf of Mexico.
            Let me gather the relevant data.
          </p>
          <small style={{ color: "#666", fontSize: "12px" }}>
            System • 5:45 PM
          </small>
        </div>
      </div>
    ),
  },
};

/**
 * Interactive example with unified state management
 */
export const Interactive: Story = {
  render: () => {
    const [viewState, setViewState] = React.useState<
      "expanded" | "map-maximized" | "map-hidden"
    >("expanded");
    const [messages, setMessages] = React.useState([
      "Welcome to NOAA KMNLP!",
      "How can I help you analyze ocean and atmospheric data today?",
    ]);

    const handleSubmit = (message: string) => {
      setMessages([
        ...messages,
        `User: ${message}`,
        "System: I received your message.",
      ]);
    };

    return (
      <div style={{ display: "flex", height: "100vh" }}>
        <ChatView
          viewState={viewState}
          onViewStateChange={setViewState}
          onSubmit={handleSubmit}
        >
          <div style={{ padding: "16px", flex: 1 }}>
            <h4>Chat Messages ({messages.length})</h4>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: "8px",
                  padding: "8px",
                  background: msg.startsWith("User:") ? "#f0f0f0" : "#e3f2fd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                {msg}
              </div>
            ))}
          </div>
        </ChatView>

        <div
          style={{
            flex: 1,
            background: "#e3f2fd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h2>Map View Area</h2>
            <p>Current state: {viewState}</p>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button onClick={() => setViewState("expanded")}>
                Expand Chat
              </button>
              <button onClick={() => setViewState("map-maximized")}>
                Maximize Map
              </button>
              <button onClick={() => setViewState("map-hidden")}>
                Hide Map
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

/**
 * Empty chat view ready for first message
 */
export const Empty: Story = {
  args: {
    viewState: "expanded",
    width: "350px",
    children: (
      <div
        style={{
          padding: "16px",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          textAlign: "center",
        }}
      >
        <div>
          <h3 style={{ margin: "0 0 8px 0", color: "#333" }}>Ready to chat</h3>
          <p style={{ margin: "0", fontSize: "14px" }}>
            Enter a prompt below to get started
          </p>
        </div>
      </div>
    ),
  },
};
