import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "github-markdown-css/github-markdown-light.css";
import "./thinking-indicator.scss";

export interface ThinkingIndicatorProps {
  /** The (possibly partial) thinking content. */
  text: string;
  /** True while thinking deltas are still streaming in. */
  isStreaming: boolean;
  /** Elapsed thinking time; shown in the label once streaming ends. */
  durationSeconds?: number;
}

/**
 * Collapsible "Thinking" section for the chat panel.
 *
 * While streaming it shows a short, auto-scrolling preview of the latest lines;
 * once the stream ends it fully collapses to a "Thought for x seconds" label
 * that can be expanded to reveal the full thinking text.
 */
export const ThinkingIndicator = ({
  text,
  isStreaming,
  durationSeconds,
}: ThinkingIndicatorProps) => {
  const [expanded, setExpanded] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Keep the streaming preview pinned to the most recent content.
  useEffect(() => {
    if (isStreaming && previewRef.current) {
      previewRef.current.scrollTop = previewRef.current.scrollHeight;
    }
  }, [text, isStreaming]);

  const label = isStreaming
    ? "Thinking"
    : durationSeconds && durationSeconds > 0
      ? `Thought for ${durationSeconds} ${durationSeconds === 1 ? "second" : "seconds"}`
      : "Thoughts";

  return (
    <div
      className={`thinking-indicator${isStreaming ? " thinking-indicator--streaming" : ""}`}
    >
      <button
        type="button"
        className="thinking-indicator__header"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <span
          className={`thinking-indicator__chevron${expanded ? " thinking-indicator__chevron--expanded" : ""}`}
        >
          &#9654;
        </span>
        <span className="thinking-indicator__label">{label}</span>
      </button>

      {expanded ? (
        <div className="thinking-indicator__full markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
      ) : (
        isStreaming && (
          <div
            ref={previewRef}
            className="thinking-indicator__preview"
            aria-hidden="true"
          >
            {text}
          </div>
        )
      )}
    </div>
  );
};
