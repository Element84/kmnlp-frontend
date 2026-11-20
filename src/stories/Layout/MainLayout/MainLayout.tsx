import React from "react";
import { ChatManagementControls } from "../../Chat/ChatManagementControls/ChatManagementControls";
import { ChatManagementPopover } from "../../Chat/ChatManagementPopover/ChatManagementPopover";
import { ChatView, ViewState } from "../../Chat/ChatView/ChatView";
import "./main-layout.scss";

export interface ChatHistory {
  id: string;
  title: string;
  lastActivity: Date;
}

export interface MainLayoutProps {
  viewState?: ViewState;
  managementVisible?: boolean;
  chatContent?: React.ReactNode;
  mapContent?: React.ReactNode;
  recentChats?: ChatHistory[];
  isProcessing?: boolean;
  onViewStateChange?: (newState: ViewState) => void;
  onToggleManagement?: () => void;
  onNewChat?: () => void;
  onSelectChat?: (chatId: string) => void;
  onLoadMoreChats?: () => void;
  hasMoreChats?: boolean;
  isLoadingMoreChats?: boolean;
  isLoadingChats?: boolean;
  onSelectAOI?: () => void;
  onRemoveAOI?: () => void;
  onSubmit?: (message: string) => void;
  onCancel?: () => void;
}

export const MainLayout = ({
  viewState = "expanded",
  managementVisible = false,
  chatContent,
  mapContent,
  recentChats,
  isProcessing = false,
  onViewStateChange,
  onToggleManagement,
  onNewChat,
  onSelectChat,
  onLoadMoreChats,
  hasMoreChats = false,
  isLoadingMoreChats = false,
  isLoadingChats = false,
  onSelectAOI,
  onRemoveAOI,
  onSubmit,
  onCancel,
}: MainLayoutProps) => {
  return (
    <div className="main-layout">
      {/* Chat Management Controls - Dedicated left bar */}
      <div className="main-layout__management-controls">
        <ChatManagementControls
          showManagement={managementVisible}
          onToggleManagement={onToggleManagement}
          onNewChat={onNewChat}
        />
      </div>

      {/* Chat View - Main conversation interface */}
      {/* <div
        className={`main-layout__chat-section ${
          viewState === "map-hidden"
            ? "main-layout__chat-section--map-hidden"
            : ""
        }`}
      > */}
      <ChatView
        viewState={viewState}
        width={viewState === "map-maximized" ? "50px" : undefined}
        isProcessing={isProcessing}
        onViewStateChange={onViewStateChange}
        onSelectAOI={onSelectAOI}
        onRemoveAOI={onRemoveAOI}
        onSubmit={onSubmit}
        onCancel={onCancel}
      >
        {chatContent}
      </ChatView>
      {/* </div> */}

      {/* Map View - Primary interface */}
      {viewState !== "map-hidden" && (
        <div className="main-layout__map-section">{mapContent}</div>
      )}

      {/* Chat Management Popover - Overlay when visible */}
      <ChatManagementPopover
        isVisible={managementVisible}
        onClose={onToggleManagement}
        onNewChat={onNewChat}
        onSelectChat={onSelectChat}
        recentChats={recentChats}
        onLoadMoreChats={onLoadMoreChats}
        hasMoreChats={hasMoreChats}
        isLoadingMoreChats={isLoadingMoreChats}
        isLoadingChats={isLoadingChats}
      />
    </div>
  );
};
