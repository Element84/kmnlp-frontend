import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { MainLayout, ChatHistory } from "../MainLayout/MainLayout";
import { ChatContainer } from "../../Chat/ChatContainer/ChatContainer";
import { ChatInput } from "../../Chat/ChatInput/ChatInput";
import {
  MapContainer,
  AreaOfInterest,
} from "../../Map/MapContainer/MapContainer";
import type { MapViewport } from "../../Map/MapContainer/types";
import { MapControls } from "../../Map/MapControls";

const meta: Meta<typeof MainLayout> = {
  title: "Integration/Complete System",
  component: MainLayout,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Complete integration stories demonstrating the full NOAA KMNLP application with realistic data flows, process tracking, and user interactions.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  args: {
    onViewStateChange: fn(),
    onToggleManagement: fn(),
    onNewChat: fn(),
    onSelectChat: fn(),
    onSubmit: fn(),
    onSelectAOI: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default Gulf of Mexico viewport - zoomed out to show entire Gulf
const gulfViewport: MapViewport = {
  latitude: 25.0,
  longitude: -89.0,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

// Integrated Map Component for Complete System Stories
interface IntegratedMapProps {
  analysisState: "idle" | "in_progress" | "completed" | "error";
  showControls?: boolean;
  collapsed?: boolean;
  overlayContent?: React.ReactNode;
}

const IntegratedMapComponent: React.FC<IntegratedMapProps> = ({
  analysisState,
  showControls = true,
  collapsed = false,
  overlayContent,
}) => {
  const [viewport, setViewport] = useState<MapViewport>(gulfViewport);
  const [aoiActive, setAoiActive] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AreaOfInterest | null>(null);

  const handleAreaSelect = (area: AreaOfInterest) => {
    setSelectedArea(area);
    setAoiActive(false);
  };

  const getMapStyle = (): string | undefined => {
    // MapContainer expects a style URL string; use its default basemap for all states.
    return undefined;
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <MapContainer
        viewport={viewport}
        onViewportChange={setViewport}
        areaSelectionActive={aoiActive}
        onAreaSelect={handleAreaSelect}
        selectedArea={selectedArea}
        collapsed={collapsed}
        mapStyle={getMapStyle()}
        cogInfos={[]}
      >
        {showControls && (
          <MapControls
            aoiActive={aoiActive}
            disabled={analysisState === "error"}
            onAOIToggle={() => setAoiActive(!aoiActive)}
            onZoomIn={() =>
              setViewport((prev: MapViewport) => ({
                ...prev,
                zoom: Math.min(prev.zoom + 1, 22),
              }))
            }
            onZoomOut={() =>
              setViewport((prev: MapViewport) => ({
                ...prev,
                zoom: Math.max(prev.zoom - 1, 0),
              }))
            }
          />
        )}
      </MapContainer>

      {/* No custom overlays - keep clean map design */}

      {overlayContent}
    </div>
  );
};

const realisticChatHistory: ChatHistory[] = [
  {
    id: "chat-1",
    title: "Gulf Water Quality Analysis",
    lastActivity: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    id: "chat-2",
    title: "Hurricane Impact Assessment",
    lastActivity: new Date(Date.now() - 172800000), // 2 days ago
  },
  {
    id: "chat-3",
    title: "Coral Reef Monitoring",
    lastActivity: new Date(Date.now() - 259200000), // 3 days ago
  },
  {
    id: "chat-4",
    title: "Plastic Pollution Tracking",
    lastActivity: new Date(Date.now() - 345600000), // 4 days ago
  },
];

const sampleMessages = [
  {
    id: "1",
    text: "Please analyze the water quality data for the Gulf of Mexico region, focusing on the areas affected by recent oil spill incidents.",
    type: "user" as const,
    timestamp: new Date(Date.now() - 600000),
  },
  {
    id: "2",
    text: "I'll help you analyze the water quality data for the Gulf of Mexico region. Let me start by gathering the relevant datasets and processing the information.",
    type: "system" as const,
    timestamp: new Date(Date.now() - 540000),
  },
];

const processStepsInProgress = [
  {
    id: "1",
    text: "Accessing NOAA satellite imagery database",
    status: "completed" as const,
  },
  {
    id: "2",
    text: "Filtering data for Gulf of Mexico coordinates",
    status: "completed" as const,
  },
  {
    id: "3",
    text: "Processing water quality metrics (temperature, salinity, turbidity)",
    status: "completed" as const,
  },
  {
    id: "4",
    text: "Analyzing oil spill impact zones",
    status: "in_progress" as const,
  },
  {
    id: "5",
    text: "Correlating with historical pollution data",
    status: "pending" as const,
  },
  {
    id: "6",
    text: "Generating comparative analysis charts",
    status: "pending" as const,
  },
  {
    id: "7",
    text: "Preparing recommendations report",
    status: "pending" as const,
  },
];

const processStepsCompleted = [
  {
    id: "1",
    text: "Accessing NOAA satellite imagery database",
    status: "completed" as const,
  },
  {
    id: "2",
    text: "Filtering data for Gulf of Mexico coordinates",
    status: "completed" as const,
  },
  {
    id: "3",
    text: "Processing water quality metrics",
    status: "completed" as const,
  },
  {
    id: "4",
    text: "Analyzing oil spill impact zones",
    status: "completed" as const,
  },
  {
    id: "5",
    text: "Correlating with historical pollution data",
    status: "completed" as const,
  },
  {
    id: "6",
    text: "Generating comparative analysis charts",
    status: "completed" as const,
  },
  {
    id: "7",
    text: "Preparing recommendations report",
    status: "completed" as const,
  },
];

const processStepsFailed = [
  {
    id: "1",
    text: "Accessing NOAA satellite imagery database",
    status: "completed" as const,
  },
  {
    id: "2",
    text: "Filtering data for Gulf of Mexico coordinates",
    status: "completed" as const,
  },
  {
    id: "3",
    text: "Processing water quality metrics",
    status: "failed" as const,
  },
  {
    id: "4",
    text: "Analyzing oil spill impact zones",
    status: "pending" as const,
  },
  {
    id: "5",
    text: "Correlating with historical pollution data",
    status: "pending" as const,
  },
];

/**
 * Complete system with active data processing workflow
 */
export const ActiveAnalysis: Story = {
  args: {
    viewState: "expanded",
    managementVisible: false,
    recentChats: realisticChatHistory,
    chatContent: (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <ChatContainer
          messages={sampleMessages}
          processStatus={{
            id: "analysis-1",
            title: "Water Quality Analysis",
            steps: processStepsInProgress,
            overallStatus: "in_progress",
            isCollapsed: false,
          }}
        />
        <ChatInput
          placeholder="Follow up with additional questions..."
          isProcessing={true}
          prompt=""
          setPrompt={() => {}}
        />
      </div>
    ),
    mapContent: <IntegratedMapComponent analysisState="in_progress" />,
  },
};

/**
 * System showing completed analysis with results
 */
export const CompletedAnalysis: Story = {
  args: {
    viewState: "expanded",
    managementVisible: false,
    recentChats: realisticChatHistory,
    chatContent: (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <ChatContainer
          messages={[
            ...sampleMessages,
            {
              id: "3",
              text: "Analysis completed successfully! I've identified several areas of concern in the Gulf of Mexico water quality data. The results show elevated turbidity levels in three specific zones, likely related to recent shipping activity and weather patterns.",
              type: "system" as const,
              timestamp: new Date(Date.now() - 60000),
            },
          ]}
          processStatus={{
            id: "analysis-1",
            title: "Water Quality Analysis",
            steps: processStepsCompleted,
            overallStatus: "completed",
            isCollapsed: false,
          }}
        />
        <ChatInput
          placeholder="Ask questions about the analysis results..."
          prompt=""
          setPrompt={() => {}}
        />
      </div>
    ),
    mapContent: <IntegratedMapComponent analysisState="completed" />,
  },
};

/**
 * System showing error state with recovery options
 */
export const ErrorState: Story = {
  args: {
    viewState: "expanded",
    managementVisible: false,
    recentChats: realisticChatHistory,
    chatContent: (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <ChatContainer
          messages={sampleMessages}
          processStatus={{
            id: "analysis-1",
            title: "Water Quality Analysis",
            steps: processStepsFailed,
            overallStatus: "failed",
            isCollapsed: false,
          }}
          errorState={{
            message:
              "Unable to process water quality metrics due to data connectivity issues.",
            details:
              "The NOAA satellite data service is temporarily unavailable. This may be due to scheduled maintenance or network connectivity issues. Please try again in a few minutes.",
            showDetails: true,
          }}
        />
        <ChatInput
          placeholder="Try rephrasing your request or ask a different question..."
          prompt=""
          setPrompt={() => {}}
        />
      </div>
    ),
    mapContent: <IntegratedMapComponent analysisState="error" />,
  },
};

/**
 * System with chat collapsed showing maximum map view
 */
export const MaximizedMapView: Story = {
  args: {
    viewState: "map-maximized",
    managementVisible: false,
    recentChats: realisticChatHistory,
    chatContent: (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <ChatContainer messages={sampleMessages} />
        <ChatInput
          placeholder="Enter Prompt..."
          prompt=""
          setPrompt={() => {}}
        />
      </div>
    ),
    mapContent: (
      <IntegratedMapComponent analysisState="idle" collapsed={true} />
    ),
  },
};

/**
 * Interactive demonstration with full user flow
 */
export const FullUserFlow: Story = {
  render: () => {
    const [viewState, setViewState] = React.useState<
      "expanded" | "map-maximized" | "map-hidden"
    >("expanded");
    const [managementVisible, setManagementVisible] = React.useState(false);
    const [messages, setMessages] = React.useState(sampleMessages);
    const [currentProcess, setCurrentProcess] = React.useState<any>(null);

    const startAnalysis = (message: string) => {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          text: message,
          type: "user" as const,
          timestamp: new Date(),
        },
      ]);

      setCurrentProcess({
        id: "new-analysis",
        title: "Processing Your Request",
        steps: processStepsInProgress.slice(0, 3),
        overallStatus: "in_progress",
        isCollapsed: false,
      });

      // Simulate progressive analysis
      let step = 0;
      const interval = setInterval(() => {
        step++;
        if (step <= processStepsInProgress.length) {
          setCurrentProcess({
            id: "new-analysis",
            title: "Processing Your Request",
            steps: processStepsInProgress.slice(0, step + 2),
            overallStatus:
              step === processStepsInProgress.length
                ? "completed"
                : "in_progress",
            isCollapsed: false,
          });

          if (step === processStepsInProgress.length) {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                text: "Analysis completed! I've processed your request and generated the environmental analysis you requested.",
                type: "system" as const,
                timestamp: new Date(),
              },
            ]);
            clearInterval(interval);
          }
        }
      }, 2000);
    };

    const handleNewChat = () => {
      setMessages([
        {
          id: "new-1",
          text: "New chat session started. How can I help you analyze NOAA environmental data today?",
          type: "system" as const,
          timestamp: new Date(),
        },
      ]);
      setCurrentProcess(null);
      setManagementVisible(false);
    };

    const dynamicChatContent = (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <ChatContainer messages={messages} processStatus={currentProcess} />
        <ChatInput
          placeholder="Try: 'Analyze water temperature trends in the Gulf'"
          isProcessing={currentProcess?.overallStatus === "in_progress"}
          prompt=""
          setPrompt={() => {}}
        />
      </div>
    );

    const getAnalysisState = ():
      | "idle"
      | "in_progress"
      | "completed"
      | "error" => {
      if (currentProcess?.overallStatus === "completed") return "completed";
      if (currentProcess?.overallStatus === "in_progress") return "in_progress";
      return "idle";
    };

    const dynamicMapContent = (
      <IntegratedMapComponent
        analysisState={getAnalysisState()}
        collapsed={viewState === "map-maximized"}
      />
    );

    return (
      <MainLayout
        viewState={viewState}
        managementVisible={managementVisible}
        chatContent={dynamicChatContent}
        mapContent={dynamicMapContent}
        recentChats={realisticChatHistory}
        onViewStateChange={setViewState}
        onToggleManagement={() => setManagementVisible(!managementVisible)}
        onNewChat={handleNewChat}
        onSelectChat={(chatId) => {
          setMessages([
            {
              id: "loaded-1",
              text: `Loaded previous chat: ${realisticChatHistory.find((c) => c.id === chatId)?.title}`,
              type: "system" as const,
              timestamp: new Date(),
            },
          ]);
          setManagementVisible(false);
          setCurrentProcess(null);
        }}
        onSubmit={startAnalysis}
      />
    );
  },
};
