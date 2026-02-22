import React from "react";
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

export const ProcessStep = ({
  stepText,
  status,
  index,
  showConnector = true,
  isLast = false,
  animated = false,
  subSteps,
  outcome,
}: ProcessStepProps) => {
  return (
    <div className={`process-step process-step--${status}`}>
      <div className="process-step__icon-container">
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
        <div className="process-step__text">{stepText}</div>
        {subSteps && subSteps.length > 0 && (
          <ul className="process-step__substeps">
            {subSteps.map((step, idx) => (
              <li key={idx}>{step.title}</li>
            ))}
          </ul>
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
