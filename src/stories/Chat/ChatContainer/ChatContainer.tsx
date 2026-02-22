import { useEffect, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import { analysisModalStateAtom, processDetailsPanelStateAtom, chatLoadingStateAtom } from "../../../store/atoms";
import "./chat-container.scss";
import { ProcessIndicator } from "../ProcessIndicator/ProcessIndicator";
import { AnalysisModal } from "../AnalysisModal/AnalysisModal";
import { ProcessDetailsPanel } from "../ProcessDetailsPanel/ProcessDetailsPanel";
import { LoadingIndicator } from "../LoadingIndicator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ProgressUpdate, DataAnalysisDetails } from "../../../types/api";

export interface Message {
  id: string;
  text: string;
  type: "user" | "system" | "process";
  timestamp: Date;
  rawContent?: any; // For plan data or other special content
  url?: string;
  processStatus?: ProcessStatus;
}

export interface ProcessStatus {
  id: string;
  title: string;
  steps: Array<{
    id: string;
    text: string;
    status: "pending" | "in_progress" | "completed" | "failed";
    outcome?: any;
    progress_updates?: ProgressUpdate[];
    details?: any;
  }>;
  overallStatus: "pending" | "in_progress" | "completed" | "failed";
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
  onOpenAnalysis?: (analysisDetails: DataAnalysisDetails) => void;
}

export const ChatContainer = ({
  messages = [],
  processStatus, // Kept for backward compatibility but not used
  errorState,
  children,
  onOpenAnalysis,
}: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [analysisModalState, setAnalysisModalState] = useAtom(analysisModalStateAtom);
  const [processDetailsPanelState, setProcessDetailsPanelState] = useAtom(processDetailsPanelStateAtom);
  const chatLoadingState = useAtomValue(chatLoadingStateAtom);

  const handleOpenAnalysis = (analysisDetails: DataAnalysisDetails) => {
    setAnalysisModalState({
      isOpen: true,
      selectedAnalysis: analysisDetails,
    });
    if (onOpenAnalysis) {
      onOpenAnalysis(analysisDetails);
    }
  };

  const handleCloseAnalysisModal = () => {
    setAnalysisModalState({
      isOpen: false,
      selectedAnalysis: null,
    });
  };

  const handleCloseDetailsPanel = () => {
    setProcessDetailsPanelState({
      isOpen: false,
      stepDetails: undefined,
      processTitle: undefined,
    });
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-container__messages">
        {messages.map((message) => (
          <div key={message.id}>
            {/* Render process messages as ProcessIndicators */}
            {message.type === "process" && message.processStatus ? (
              <ProcessIndicator
                status={message.processStatus.overallStatus}
                steps={message.processStatus.steps}
                title={message.processStatus.title}
                isCollapsed={message.processStatus.isCollapsed}
                showStepNumbers={true}
                animated={message.processStatus.overallStatus === "in_progress"}
                errorState={errorState}
                onOpenAnalysis={handleOpenAnalysis}
              />
            ) : (
              /* Render regular messages */
              <div
                className={`chat-container__message chat-container__message--${message.type}`}
              >
                <div className="chat-container__message-content">
                  {message.url ? (
                    <img
                      src={message.url}
                      alt={message.text}
                      style={{ maxWidth: "100%", height: "auto" }}
                    />
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  )}
                </div>
                <div className="chat-container__message-time">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator - shows after user submits until process panel appears */}
        {chatLoadingState.shouldShowLoadingIndicator && <LoadingIndicator />}

        {children}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Analysis Modal */}
      {analysisModalState.selectedAnalysis && (
        <AnalysisModal
          isOpen={analysisModalState.isOpen}
          onClose={handleCloseAnalysisModal}
          analysisDetails={analysisModalState.selectedAnalysis}
        />
      )}

      {/* Process Details Panel */}
      {processDetailsPanelState.stepDetails && (
        <ProcessDetailsPanel
          isOpen={processDetailsPanelState.isOpen}
          onClose={handleCloseDetailsPanel}
          stepDetails={processDetailsPanelState.stepDetails}
          processTitle={processDetailsPanelState.processTitle}
          onOpenAnalysis={handleOpenAnalysis}
        />
      )}
    </div>
  );
};