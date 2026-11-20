import { useEffect, useMemo, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import {
  analysisModalStateAtom,
  processDetailsPanelStateAtom,
  chatLoadingStateAtom,
} from "../../../store/atoms";
import "./chat-container.scss";
import { ProcessIndicator } from "../ProcessIndicator/ProcessIndicator";
import { AnalysisModal } from "../AnalysisModal/AnalysisModal";
import { ProcessDetailsPanel } from "../ProcessDetailsPanel/ProcessDetailsPanel";
import { LoadingIndicator } from "../LoadingIndicator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "github-markdown-css/github-markdown-light.css";
import type { ProgressUpdate, DataAnalysisDetails } from "../../../types/api";
import { AuthenticatedImage } from "../AuthenticatedImage/AuthenticatedImage";
import { AuthenticatedVideo } from "../AuthenticatedVideo/AuthenticatedVideo";
import { ThinkingIndicator } from "../ThinkingIndicator/ThinkingIndicator";
import { AreaOfInterestPill } from "../AreaOfInterestPill";

export interface Message {
  id: string;
  text: string;
  type: "user" | "system" | "process" | "thinking" | "progress";
  timestamp: Date;
  rawContent?: any; // For plan data or other special content
  url?: string;
  mediaKind?: "image" | "video"; // How to render `url`; defaults to image
  processStatus?: ProcessStatus;
  isStreaming?: boolean; // True while text is still being streamed via TextDelta
  thinkingDurationSeconds?: number; // Elapsed thinking time, set when thinking finalizes
  aoiName?: string; // Name of the AOI attached to a submitted user message
  mapLayerOrder?: number;
}

export interface ProcessStatus {
  id: string;
  title: string;
  steps: Array<{
    id: string;
    text: string;
    status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
    outcome?: any;
    progress_updates?: ProgressUpdate[];
    details?: any;
  }>;
  overallStatus:
    | "pending"
    | "in_progress"
    | "completed"
    | "failed"
    | "cancelled";
  isCollapsed?: boolean;
}

export interface ErrorState {
  message: string;
  details?: string;
  showDetails?: boolean;
}

export interface ChatContainerProps {
  messages?: Message[];
  processStatus?: ProcessStatus;
  errorState?: ErrorState;
  children?: React.ReactNode;
  onOpenAnalysis?: (
    analysisDetails: DataAnalysisDetails,
    stepId?: string,
  ) => void;
}

export const ChatContainer = ({
  messages = [],
  errorState,
  children,
  onOpenAnalysis,
}: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [analysisModalState, setAnalysisModalState] = useAtom(
    analysisModalStateAtom,
  );
  const [processDetailsPanelState, setProcessDetailsPanelState] = useAtom(
    processDetailsPanelStateAtom,
  );
  const chatLoadingState = useAtomValue(chatLoadingStateAtom);

  const handleOpenAnalysis = (
    analysisDetails: DataAnalysisDetails,
    stepId?: string,
    messageId?: string,
  ) => {
    setAnalysisModalState({
      isOpen: true,
      selectedStepId: stepId ?? null,
      selectedMessageId: messageId ?? null,
      selectedAnalysis: analysisDetails,
    });
    if (onOpenAnalysis) {
      onOpenAnalysis(analysisDetails, stepId);
    }
  };

  const handleCloseAnalysisModal = () => {
    setAnalysisModalState({
      isOpen: false,
      selectedStepId: null,
      selectedMessageId: null,
      selectedAnalysis: null,
    });
  };

  // Derive the analysis from the live message stream so the modal reflects
  // fields as they are incrementally populated (e.g. streamed reasoning).
  // Falls back to the snapshot captured at open time when the step can no
  // longer be found in the current messages.
  const liveSelectedAnalysis = useMemo<DataAnalysisDetails | null>(() => {
    const { selectedStepId, selectedMessageId, selectedAnalysis } =
      analysisModalState;
    if (selectedStepId && selectedMessageId) {
      // Step ids are only unique within a single process, so the owning
      // message must also match to avoid picking up a same-id step from a
      // different process indicator.
      const message = messages.find((m) => m.id === selectedMessageId);
      const step = message?.processStatus?.steps.find(
        (s) => s.id === selectedStepId,
      );
      const content = step?.details?.content;
      if (content?.content_type === "DataAnalysisDetails") {
        return content as DataAnalysisDetails;
      }
    }
    return selectedAnalysis;
  }, [messages, analysisModalState]);

  const handleCloseDetailsPanel = () => {
    setProcessDetailsPanelState({
      isOpen: false,
      stepDetails: undefined,
      processTitle: undefined,
    });
  };

  // Auto-scroll to bottom when messages change. Scroll the messages container
  // itself (not scrollIntoView, which can also scroll the whole page).
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    // jsdom (tests) doesn't implement scrollTo.
    if (typeof container.scrollTo === "function") {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-container__messages" ref={messagesContainerRef}>
        {messages.map((message) => (
          <div key={message.id}>
            {/* Render process messages as ProcessIndicators (no timestamp) */}
            {message.type === "process" && message.processStatus ? (
              <>
                <ProcessIndicator
                  status={message.processStatus.overallStatus}
                  steps={message.processStatus.steps}
                  title={message.processStatus.title}
                  isCollapsed={message.processStatus.isCollapsed}
                  showStepNumbers={true}
                  animated={
                    message.processStatus.overallStatus === "in_progress"
                  }
                  errorState={errorState}
                  messageId={message.id}
                  onOpenAnalysis={(analysisDetails, stepId) =>
                    handleOpenAnalysis(analysisDetails, stepId, message.id)
                  }
                />
              </>
            ) : message.type === "thinking" ? (
              <ThinkingIndicator
                text={message.text}
                isStreaming={!!message.isStreaming}
                durationSeconds={message.thinkingDurationSeconds}
              />
            ) : message.type === "progress" ? (
              <div className="chat-container__progress-update">
                {message.text}
              </div>
            ) : message.text || message.url ? (
              /* Render regular messages (only if there's actual content) */
              <div
                className={`chat-container__message chat-container__message--${message.type}`}
              >
                {message.type === "user" && message.aoiName && (
                  <div className="chat-container__message-aoi">
                    <AreaOfInterestPill label={`AOI: ${message.aoiName}`} />
                  </div>
                )}
                <div className="chat-container__message-content">
                  {message.url ? (
                    message.mediaKind === "video" ? (
                      <AuthenticatedVideo
                        url={message.url}
                        style={{ maxWidth: "100%", height: "auto" }}
                      />
                    ) : (
                      <AuthenticatedImage
                        url={message.url}
                        alt={message.text}
                        style={{ maxWidth: "100%", height: "auto" }}
                      />
                    )
                  ) : (
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                <div className="chat-container__message-time">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ) : null}
          </div>
        ))}

        {/* Loading indicator - shows after user submits until process panel appears */}
        {chatLoadingState.shouldShowLoadingIndicator && <LoadingIndicator />}

        {children}
        <div ref={messagesEndRef} />
      </div>

      {/* Analysis Modal */}
      {liveSelectedAnalysis && (
        <AnalysisModal
          isOpen={analysisModalState.isOpen}
          onClose={handleCloseAnalysisModal}
          analysisDetails={liveSelectedAnalysis}
        />
      )}

      {/* Process Details Panel */}
      {processDetailsPanelState.stepDetails && (
        <ProcessDetailsPanel
          isOpen={processDetailsPanelState.isOpen}
          onClose={handleCloseDetailsPanel}
          stepDetails={processDetailsPanelState.stepDetails}
          processTitle={processDetailsPanelState.processTitle}
          onOpenAnalysis={(analysisDetails, stepId) =>
            handleOpenAnalysis(
              analysisDetails,
              stepId,
              processDetailsPanelState.messageId,
            )
          }
        />
      )}
    </div>
  );
};
