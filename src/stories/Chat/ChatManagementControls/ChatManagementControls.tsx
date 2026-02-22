
import "./chat-management-controls.scss";

export interface ChatManagementControlsProps {
  /** Whether the management popover is currently visible */
  showManagement?: boolean;
  /** Callback when the chat management toggle is clicked */
  onToggleManagement?: () => void;
  /** Callback when the new chat button is clicked */
  onNewChat?: () => void;
}

/**
 * Small overlay controls positioned in the top-left corner of the chat view.
 * Provides access to chat management and new chat functionality without taking up significant space.
 */
export const ChatManagementControls = ({
  showManagement = false,
  onToggleManagement,
  onNewChat,
}: ChatManagementControlsProps) => {
  return (
    <div className="chat-management-controls">
      <button
        className={`chat-management-controls__toggle ${
          showManagement ? "chat-management-controls__toggle--active" : ""
        }`}
        onClick={onToggleManagement}
        aria-label={
          showManagement ? "Close chat management" : "Open chat management"
        }
        title="Chat Management"
      >
        <span className="chat-management-controls__toggle-icon">
          {/* TO DO: Need to replace with proper SVGR implementation */}
          <svg
            width="20"
            height="21"
            viewBox="0 0 20 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 1.39062H16C17.864 1.39062 19.375 2.90166 19.375 4.76562V16.7656C19.375 18.6296 17.864 20.1406 16 20.1406H4C2.13604 20.1406 0.625 18.6296 0.625 16.7656V4.76562C0.625 2.90166 2.13604 1.39062 4 1.39062Z"
              stroke="#0050D8"
              strokeWidth="1.25"
            />
            <path d="M7 1V20" stroke="#0050D8" strokeWidth="1.25" />
          </svg>
        </span>
      </button>

      <button
        className="chat-management-controls__new-chat"
        onClick={onNewChat}
        aria-label="Start new chat"
        title="New Chat"
      >
        <span className="chat-management-controls__plus-icon">
          {/* TO DO: Need to replace with proper SVGR implementation */}
          <svg
            width="20"
            height="21"
            viewBox="0 0 20 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.2031 0.776367C19.2084 0.879199 19.9998 1.73448 20 2.76562V14.7656L19.9893 14.9697C19.8929 15.9077 19.1413 16.659 18.2031 16.7549L18 16.7656H3.99902L0 20.7656L0.0107422 2.76562C0.0109318 1.66592 0.900301 0.765817 2 0.765625H18L18.2031 0.776367ZM2 1.94238C1.55812 1.94258 1.18671 2.30757 1.18652 2.76562L1.17773 17.9229L3.51172 15.5889H18C18.4504 15.5887 18.8228 15.2148 18.8232 14.7656V2.76562C18.823 2.31567 18.45 1.94258 18 1.94238H2ZM10.7646 8.16504H13.8232V9.69434H10.7646V12.7529H9.23535V9.69434H6.17676V8.16504H9.23535V5.10645H10.7646V8.16504Z"
              fill="#0050D8"
            />
          </svg>
        </span>
      </button>
    </div>
  );
};
