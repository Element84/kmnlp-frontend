import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../../App";

// Mock the hooks
vi.mock("../../../hooks/useChat");
vi.mock("../../../hooks/useChatManagement");

// Mock MapContainer to avoid MapLibre dependencies in tests
vi.mock("../../Map/MapContainer/MapContainer", () => ({
  MapContainer: ({ geoJsonData, cogInfo, viewport }: any) => (
    <div data-testid="map-container">
      <div data-testid="geojson-data">
        {geoJsonData ? "Has Data" : "No Data"}
      </div>
      <div data-testid="cog-info">{cogInfo ? "Has COG" : "No COG"}</div>
      <div data-testid="map-viewport">{JSON.stringify(viewport)}</div>
    </div>
  ),
}));

// Mock other complex components
vi.mock("../../Header/Header", () => ({
  MainNav: ({ onToggleMapView }: any) => (
    <div data-testid="main-nav">
      <button onClick={onToggleMapView}>Toggle Map</button>
    </div>
  ),
}));

vi.mock("../MainLayout/MainLayout", () => ({
  MainLayout: ({ onSelectChat, recentChats, chatContent, mapContent }: any) => (
    <div data-testid="main-layout">
      {recentChats?.map((chat: any) => (
        <button
          key={chat.id}
          data-testid={`chat-${chat.id}`}
          onClick={() => onSelectChat(chat.id)}
        >
          {chat.title}
        </button>
      ))}
      <div data-testid="chat-content">{chatContent}</div>
      <div data-testid="map-content">{mapContent}</div>
    </div>
  ),
}));

vi.mock("../../Chat/ChatContainer/ChatContainer", () => ({
  ChatContainer: ({ messages }: any) => (
    <div data-testid="chat-container">
      {messages?.map((msg: any) => (
        <div key={msg.id} data-testid={`message-${msg.id}`}>
          {msg.text}
          {msg.rawContent?.mapData && (
            <span data-testid="message-map-data">Has Map Data</span>
          )}
        </div>
      ))}
    </div>
  ),
}));

import { useChat } from "../../../hooks/useChat";
import { useChatManagement } from "../../../hooks/useChatManagement";

const mockUseChat = useChat as any;
const mockUseChatManagement = useChatManagement as any;

describe("App - Map Data Clearing", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseChat.mockReturnValue({
      messages: [],
      errorState: undefined,
      isLoading: false,
      isInitializing: false,
      currentChatId: null,
      cogInfo: undefined,
      sendMessage: vi.fn(),
      startNewChat: vi.fn(),
      resetToNewChat: vi.fn(),
      loadChat: vi.fn(),
      clearError: vi.fn(),
    });

    mockUseChatManagement.mockReturnValue({
      chatList: [],
      isLoading: false,
      error: undefined,
      refreshChatList: vi.fn(),
      clearError: vi.fn(),
    });
  });

  it.skip("should clear geoJsonData when switching to a chat without map data", async () => {
    const user = userEvent.setup();

    // Mock two chats
    const chatWithMapData = {
      id: "chat-1",
      title: "Chat with Map",
      date_created: new Date().toISOString(),
    };
    const chatWithoutMapData = {
      id: "chat-2",
      title: "Chat without Map",
      date_created: new Date().toISOString(),
    };

    // Messages with map data (simplified for testing)
    const messagesWithMapData = [
      {
        id: "msg-1",
        text: "User message",
        type: "user",
        timestamp: new Date(),
      },
      {
        id: "msg-2",
        text: "System response with map",
        type: "system",
        timestamp: new Date(),
        rawContent: {
          mapData: {
            type: "FeatureCollection",
            features: [],
          },
        },
      },
    ];

    // Messages without map data
    const messagesWithoutMapData = [
      {
        id: "msg-3",
        text: "User message",
        type: "user",
        timestamp: new Date(),
      },
      {
        id: "msg-4",
        text: "System response without map",
        type: "system",
        timestamp: new Date(),
      },
    ];

    const mockLoadChat = vi.fn();

    // Mock chat management with both chats
    mockUseChatManagement.mockReturnValue({
      chatList: [chatWithMapData, chatWithoutMapData],
      isLoading: false,
      error: undefined,
      refreshChatList: vi.fn(),
      clearError: vi.fn(),
    });

    // Initially show chat with map data
    mockUseChat.mockReturnValue({
      messages: messagesWithMapData,
      errorState: undefined,
      isLoading: false,
      isInitializing: false,
      currentChatId: "chat-1",
      cogInfo: undefined,
      sendMessage: vi.fn(),
      startNewChat: vi.fn(),
      resetToNewChat: vi.fn(),
      loadChat: mockLoadChat,
      clearError: vi.fn(),
    });

    const { rerender } = render(<App />);

    // Initially, should show map data
    expect(screen.getByTestId("geojson-data")).toHaveTextContent("Has Data");

    // Simulate clicking on chat without map data
    await user.click(screen.getByTestId("chat-chat-2"));

    // Update the mock to return messages without map data
    mockUseChat.mockReturnValue({
      messages: messagesWithoutMapData,
      errorState: undefined,
      isLoading: false,
      isInitializing: false,
      currentChatId: "chat-2",
      cogInfo: undefined,
      sendMessage: vi.fn(),
      startNewChat: vi.fn(),
      resetToNewChat: vi.fn(),
      loadChat: mockLoadChat,
      clearError: vi.fn(),
    });

    // Re-render to reflect the state change
    rerender(<App />);

    // Should clear map data
    await waitFor(() => {
      expect(screen.getByTestId("geojson-data")).toHaveTextContent("No Data");
    });

    // Verify loadChat was called with correct ID
    expect(mockLoadChat).toHaveBeenCalledWith("chat-2");
  });

  it.skip("should clear cogInfo when switching chats", async () => {
    const user = userEvent.setup();

    const chatWithCOG = {
      id: "cog-chat",
      title: "Chat with COG",
      date_created: new Date().toISOString(),
    };

    const chatWithoutCOG = {
      id: "no-cog-chat",
      title: "Chat without COG",
      date_created: new Date().toISOString(),
    };

    const mockLoadChat = vi.fn();

    mockUseChatManagement.mockReturnValue({
      chatList: [chatWithCOG, chatWithoutCOG],
      isLoading: false,
      error: undefined,
      refreshChatList: vi.fn(),
      clearError: vi.fn(),
    });

    // Initially show chat with COG data
    mockUseChat.mockReturnValue({
      messages: [],
      errorState: undefined,
      isLoading: false,
      isInitializing: false,
      currentChatId: "cog-chat",
      cogInfo: {
        url: "http://example.com/cog.tif",
        legend: { label: "Test Layer", color_scheme: "viridis" },
      },
      sendMessage: vi.fn(),
      startNewChat: vi.fn(),
      resetToNewChat: vi.fn(),
      loadChat: mockLoadChat,
      clearError: vi.fn(),
    });

    const { rerender } = render(<App />);

    // Initially, should show COG data
    expect(screen.getByTestId("cog-info")).toHaveTextContent("Has COG");

    // Simulate clicking on chat without COG data
    await user.click(screen.getByTestId("chat-no-cog-chat"));

    // Update mock to return no COG info
    mockUseChat.mockReturnValue({
      messages: [],
      errorState: undefined,
      isLoading: false,
      isInitializing: false,
      currentChatId: "no-cog-chat",
      cogInfo: undefined,
      sendMessage: vi.fn(),
      startNewChat: vi.fn(),
      resetToNewChat: vi.fn(),
      loadChat: mockLoadChat,
      clearError: vi.fn(),
    });

    rerender(<App />);

    // Should clear COG data
    await waitFor(() => {
      expect(screen.getByTestId("cog-info")).toHaveTextContent("No COG");
    });

    expect(mockLoadChat).toHaveBeenCalledWith("no-cog-chat");
  });

  it.skip("should clear map data when starting a new chat", async () => {
    const user = userEvent.setup();

    const mockResetToNewChat = vi.fn();

    // Initially show messages with map data
    mockUseChat.mockReturnValue({
      messages: [
        {
          id: "msg-1",
          text: "Message with map data",
          type: "system" as const,
          timestamp: new Date(),
          rawContent: {
            mapData: {
              type: "FeatureCollection",
              features: [],
            },
          },
        },
      ],
      errorState: undefined,
      isLoading: false,
      isInitializing: false,
      currentChatId: "existing-chat",
      cogInfo: undefined,
      sendMessage: vi.fn(),
      startNewChat: vi.fn(),
      resetToNewChat: mockResetToNewChat,
      loadChat: vi.fn(),
      clearError: vi.fn(),
    });

    mockUseChatManagement.mockReturnValue({
      chatList: [],
      isLoading: false,
      error: undefined,
      refreshChatList: vi.fn(),
      clearError: vi.fn(),
    });

    const { rerender } = render(<App />);

    // Initially should have map data
    expect(screen.getByTestId("geojson-data")).toHaveTextContent("Has Data");

    // Simulate starting a new chat (this would typically be triggered by a button in MainLayout)
    // For testing purposes, we'll simulate the effect of handleNewChat by updating the mock
    mockUseChat.mockReturnValue({
      messages: [],
      errorState: undefined,
      isLoading: false,
      isInitializing: false,
      currentChatId: null,
      cogInfo: undefined,
      sendMessage: vi.fn(),
      startNewChat: vi.fn(),
      resetToNewChat: mockResetToNewChat,
      loadChat: vi.fn(),
      clearError: vi.fn(),
    });

    rerender(<App />);

    // Should clear map data
    await waitFor(() => {
      expect(screen.getByTestId("geojson-data")).toHaveTextContent("No Data");
    });
  });

  it.skip("should clear both GeoJSON and COG data when switching from a chat with both types to a chat without any", async () => {
    const user = userEvent.setup();

    // Mock chats
    const chatWithBothDataTypes = {
      id: "chat-both",
      title: "Chat with both GeoJSON and COG",
      date_created: new Date().toISOString(),
    };
    const chatWithoutAnyData = {
      id: "chat-empty",
      title: "Chat without any map data",
      date_created: new Date().toISOString(),
    };

    // Messages with both GeoJSON and COG data
    const messagesWithBothTypes = [
      {
        id: "msg-1",
        text: "System response with GeoJSON",
        type: "system",
        timestamp: new Date(),
        rawContent: {
          mapData: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {},
                geometry: { type: "Point", coordinates: [-90, 25] },
              },
            ],
          },
        },
      },
    ];

    const messagesWithoutAnyData = [
      {
        id: "msg-2",
        text: "System response without any map data",
        type: "system",
        timestamp: new Date(),
      },
    ];

    const mockLoadChat = vi.fn();

    // Mock chat management
    mockUseChatManagement.mockReturnValue({
      chatList: [chatWithBothDataTypes, chatWithoutAnyData],
      isLoading: false,
      error: undefined,
      refreshChatList: vi.fn(),
      clearError: vi.fn(),
    });

    // Initially show chat with both GeoJSON and COG data
    mockUseChat.mockReturnValue({
      messages: messagesWithBothTypes,
      errorState: undefined,
      isLoading: false,
      isInitializing: false,
      currentChatId: "chat-both",
      cogInfo: {
        url: "http://example.com/test.tif",
        legend: { label: "Temperature", color_scheme: "plasma" },
      },
      sendMessage: vi.fn(),
      startNewChat: vi.fn(),
      resetToNewChat: vi.fn(),
      loadChat: mockLoadChat,
      clearError: vi.fn(),
    });

    const { rerender } = render(<App />);

    // Initially should show both types of data
    expect(screen.getByTestId("geojson-data")).toHaveTextContent("Has Data");
    expect(screen.getByTestId("cog-info")).toHaveTextContent("Has COG");

    // Simulate clicking on chat without any map data
    await user.click(screen.getByTestId("chat-chat-empty"));

    // Update mock to return no data at all
    mockUseChat.mockReturnValue({
      messages: messagesWithoutAnyData,
      errorState: undefined,
      isLoading: false,
      isInitializing: false,
      currentChatId: "chat-empty",
      cogInfo: undefined, // COG data cleared
      sendMessage: vi.fn(),
      startNewChat: vi.fn(),
      resetToNewChat: vi.fn(),
      loadChat: mockLoadChat,
      clearError: vi.fn(),
    });

    rerender(<App />);

    // Should clear both GeoJSON and COG data
    await waitFor(() => {
      expect(screen.getByTestId("geojson-data")).toHaveTextContent("No Data");
      expect(screen.getByTestId("cog-info")).toHaveTextContent("No COG");
    });

    // Verify loadChat was called
    expect(mockLoadChat).toHaveBeenCalledWith("chat-empty");
  });

  it.skip("should reset map viewport to default when switching chats", async () => {
    const user = userEvent.setup();

    const chat1 = {
      id: "chat-1",
      title: "Chat 1",
      date_created: new Date().toISOString(),
    };
    const chat2 = {
      id: "chat-2",
      title: "Chat 2",
      date_created: new Date().toISOString(),
    };

    const mockLoadChat = vi.fn();

    mockUseChatManagement.mockReturnValue({
      chatList: [chat1, chat2],
      isLoading: false,
      error: undefined,
      refreshChatList: vi.fn(),
      clearError: vi.fn(),
    });

    // Initially render with default viewport
    mockUseChat.mockReturnValue({
      messages: [],
      errorState: undefined,
      isLoading: false,
      isInitializing: false,
      currentChatId: "chat-1",
      cogInfo: undefined,
      sendMessage: vi.fn(),
      startNewChat: vi.fn(),
      resetToNewChat: vi.fn(),
      loadChat: mockLoadChat,
      clearError: vi.fn(),
    });

    const { rerender } = render(<App />);

    // Verify initial viewport is default
    const initialViewport = JSON.parse(
      screen.getByTestId("map-viewport").textContent || "{}"
    );
    expect(initialViewport).toEqual({
      latitude: 25.0,
      longitude: -89.0,
      zoom: 4,
      pitch: 0,
      bearing: 0,
    });

    // Simulate clicking on another chat
    await user.click(screen.getByTestId("chat-chat-2"));

    // Update mock for second chat
    mockUseChat.mockReturnValue({
      messages: [],
      errorState: undefined,
      isLoading: false,
      isInitializing: false,
      currentChatId: "chat-2",
      cogInfo: undefined,
      sendMessage: vi.fn(),
      startNewChat: vi.fn(),
      resetToNewChat: vi.fn(),
      loadChat: mockLoadChat,
      clearError: vi.fn(),
    });

    rerender(<App />);

    // Verify viewport is reset to default
    await waitFor(() => {
      const viewport = JSON.parse(
        screen.getByTestId("map-viewport").textContent || "{}"
      );
      expect(viewport).toEqual({
        latitude: 25.0,
        longitude: -89.0,
        zoom: 4,
        pitch: 0,
        bearing: 0,
      });
    });

    expect(mockLoadChat).toHaveBeenCalledWith("chat-2");
  });
});
