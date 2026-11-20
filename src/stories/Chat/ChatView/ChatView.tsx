import React from "react";
import "./chat-view.scss";
import { ChatInput } from "../ChatInput/ChatInput";
import { Icon } from "@trussworks/react-uswds";
export type ViewState = "expanded" | "map-maximized" | "map-hidden";

export interface ChatViewProps {
  /** Application view state determining layout and functionality */
  viewState?: ViewState;
  /** Width of the chat view as CSS value (for expanded state) */
  width?: string;
  /** Chat conversation content */
  children?: React.ReactNode;
  /** Whether a request is currently processing */
  isProcessing?: boolean;
  /** Callback when view state change is requested */
  onViewStateChange?: (newState: ViewState) => void;
  /** Callback when AOI selection is requested */
  onSelectAOI?: () => void;
  /** Callback when AOI is removed */
  onRemoveAOI?: () => void;
  /** Callback when message is submitted */
  onSubmit?: (prompt: string) => void;
  /** Callback when request is cancelled */
  onCancel?: () => void;
}

/**
 * Main conversation interface component that displays chat messages and provides input functionality.
 * Uses unified view state to determine layout and input control visibility.
 * Does NOT include chat management - that's handled by separate components.
 */
export const ChatView = ({
  viewState = "expanded",
  width = "100%",
  children,
  isProcessing = false,
  onViewStateChange,
  onSelectAOI,
  onRemoveAOI,
  onSubmit,
  onCancel,
}: ChatViewProps) => {
  const [prompt, setPrompt] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && onSubmit) {
      onSubmit(prompt.trim());
      setPrompt("");
    }
  };

  const handleToggleViewState = () => {
    if (!onViewStateChange) return;

    if (viewState === "expanded") {
      onViewStateChange("map-maximized");
    } else {
      onViewStateChange("expanded");
    }
  };

  // ChatInput props (reused in both map-hidden and expanded states)
  const chatInputProps = {
    placeholder: "Enter Prompt...",
    handleSubmit,
    onSelectAOI,
    onRemoveAOI,
    onCancel,
    prompt,
    isProcessing,
    setPrompt,
  };

  // Map Maximized State: Collapsed with NO input controls
  if (viewState === "map-maximized") {
    return (
      <div className="chat-view chat-view--collapsed">
        <div className="chat-view__collapsed-content">
          <button
            className="chat-view__expand-button"
            onClick={handleToggleViewState}
            aria-label="Expand chat view"
            title="Expand Chat"
          >
            <Icon.NavigateNext className="text-base-lightest" />
          </button>
        </div>
      </div>
    );
  }

  // Map Hidden State: Full width chat (future implementation)
  if (viewState === "map-hidden") {
    const hasMessages =
      React.isValidElement<{ messages?: unknown[] }>(children) &&
      (children.props.messages?.length ?? 0) > 0;

    return (
      <div
        className={`chat-view width-full ${
          !hasMessages ? "flex-justify-center" : ""
        }`}
      >
        <div
          className={`chat-view__content ${
            !hasMessages ? "chat-view__content--empty" : ""
          }`}
        >
          {children}
        </div>
        {!hasMessages && <h1>What would you like to ask?</h1>}
        <div className="chat-view__input-section">
          <ChatInput {...chatInputProps} />
        </div>
      </div>
    );
  }

  // Expanded State: Full chat with input controls
  const hasMessages = children !== undefined && children !== null;

  return (
    <div
      className={`chat-view flex-1 ${
        hasMessages ? "chat-view--with-messages" : "chat-view--no-messages"
      }`}
      style={width ? { width } : undefined}
    >
      <div className="chat-view__header">
        <button
          className="chat-view__collapse-button"
          onClick={handleToggleViewState}
          aria-label="Maximize map view"
          title="Maximize Map"
        >
          <Icon.NavigateBefore size={4} className="text-base-lightest" />
        </button>
      </div>

      {hasMessages && <div className="chat-view__content">{children}</div>}

      <div className="chat-view__input-section">
        <ChatInput {...chatInputProps} />
        {/* <form onSubmit={handleSubmit} className="chat-view__input-form">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter Prompt..."
            className="chat-view__prompt-input"
          />
          <div className="chat-view__button-group">
            <button
              type="button"
              onClick={onSelectAOI}
              className="chat-view__select-aoi"
            >
              Select AOI
            </button>
            <button
              type="submit"
              className="chat-view__submit"
              disabled={!prompt.trim()}
            >
              <span className="chat-view__submit-icon">↑</span>
            </button>
          </div>
        </form> */}
      </div>
    </div>
  );
};
