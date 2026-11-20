import { useState, useRef, useEffect } from "react";
import { StatusIcon, StatusType } from "../StatusIcon";
import { ProgressUpdate } from "../../../types/api";
import "./process-step.scss";

export interface ProcessStepProps {
  stepText: string;
  status: StatusType;
  index?: number;
  showConnector?: boolean;
  isLast?: boolean;
  subSteps?: ProgressUpdate[];
  animated?: boolean;
  outcome?: string;
}

const OdometerSummary = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState(text);
  const [animating, setAnimating] = useState(false);
  const prevTextRef = useRef(text);

  useEffect(() => {
    if (text !== prevTextRef.current) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setDisplayedText(text);
        setAnimating(false);
      }, 200);
      prevTextRef.current = text;
      return () => clearTimeout(timer);
    }
  }, [text]);

  return (
    <div className="process-step__substeps-summary process-step__substeps-summary--odometer">
      <span
        key={displayedText}
        className={`process-step__odometer-text ${
          animating ? "process-step__odometer-text--exit" : "process-step__odometer-text--enter"
        }`}
      >
        {displayedText}
      </span>
    </div>
  );
};

export const ProcessStep = ({
  stepText,
  status,
  showConnector = true,
  isLast = false,
  animated = false,
  subSteps,
  outcome,
}: ProcessStepProps) => {
  const hasSubSteps = subSteps && subSteps.length > 0;
  const [expanded, setExpanded] = useState(false);
  const lastStep = hasSubSteps ? subSteps[subSteps.length - 1] : null;

  const handleToggle = () => {
    if (hasSubSteps) setExpanded(!expanded);
  };

  return (
    <div
      className={`process-step process-step--${status}${hasSubSteps ? " process-step--collapsible" : ""}`}
      onClick={handleToggle}
    >  <div className="process-step__icon-container">
        <StatusIcon
          status={status}
          size="medium"
          animated={animated && status === "in_progress"}
        />
        {showConnector && !isLast && (
          <div
            className={`process-step__connector process-step__connector--${status}`}
          />
        )}
      </div>

      <div className="process-step__content">
        {hasSubSteps ? (
          <span
            className="process-step__text process-step__text--clickable"
            role="button"
            aria-expanded={expanded}
          >
            <span className={`process-step__chevron ${expanded ? "process-step__chevron--expanded" : ""}`}>&#9654;</span>
            {stepText}
          </span>
        ) : (
          <div className="process-step__text">{stepText}</div>
        )}
        {hasSubSteps && expanded && (
          <ul className="process-step__substeps">
            {subSteps.map((step, idx) => (
              <li key={idx}>{step.title}</li>
            ))}
          </ul>
        )}
        {hasSubSteps && !expanded && (
          status === "in_progress" && lastStep ? (
            <OdometerSummary text={lastStep.title} />
          ) : (
            <div className="process-step__substeps-summary">
              {subSteps.length} {subSteps.length === 1 ? "update" : "updates"}
            </div>
          )
        )}
        {outcome && (
          <div className="process-step__outcome">
            {outcome}
          </div>
        )}
        {status === "in_progress" && (
          <div className="process-step__progress">
            <div className="process-step__progress-bar">
              <div className="process-step__progress-fill" />
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="process-step__error-indicator">
            <span className="process-step__error-text">Step failed</span>
          </div>
        )}
      </div>
      
    </div>
  );
};
