import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { processDetailsPanelStateAtom } from "../../../store/atoms";
import { ProcessStep } from "../ProcessStep/ProcessStep";
import { StatusType } from "../StatusIcon";
import { ProgressUpdate, Step, DataAnalysisDetails } from "../../../types/api";
import "./process-indicator.scss";
import { Button, Icon } from "@trussworks/react-uswds";
import { ErrorState } from "../ChatContainer/ChatContainer";

export interface ProcessStepData {
  id: string;
  text?: string; // Optional for normalized data (legacy)
  title?: string; // Optional for API data
  status: StatusType | "success" | "failure" | "cancelled"; // Allow API status types
  subSteps?: ProgressUpdate[];
  progress_updates?: ProgressUpdate[]; // Allow API naming
  outcome?: string; // Optional outcome summary (legacy)
  outcome_summary?: string | null; // API naming
  details?: Step["details"]; // Optional step details from API
}

export interface ProcessIndicatorProps {
  steps: ProcessStepData[] | Step[];
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  title?: string;
  isCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  showStepNumbers?: boolean;
  animated?: boolean;
  errorState?: ErrorState;
  // Identifies the owning chat message so step ids (which are only unique
  // within a single process) don't collide across process indicators.
  messageId?: string;
  onOpenAnalysis?: (
    analysisDetails: DataAnalysisDetails,
    stepId?: string,
  ) => void;
}

export const ProcessIndicator = ({
  steps,
  status,
  title,
  isCollapsed = false,
  onToggle,
  showStepNumbers = true,
  animated = true,
  errorState,
  messageId,
}: ProcessIndicatorProps) => {
  const [internalCollapsed, setInternalCollapsed] = useState(isCollapsed);
  const [processDetailsPanelState, setProcessDetailsPanelState] = useAtom(
    processDetailsPanelStateAtom,
  );

  // Separate normalized steps for rendering (with text/subSteps/outcome)
  // and API steps for details panel (Step[])
  const normalizedStepsForRendering = steps.map((step) => {
    // Check if it's a Step from API
    const isApiStep = "outcome_summary" in step;

    return {
      id: step.id,
      text: isApiStep
        ? step.title
        : (step as ProcessStepData).text || step.title || "",
      status: (step.status === "success" ||
      step.status === "failure" ||
      step.status === "cancelled"
        ? step.status === "success"
          ? "completed"
          : step.status === "failure"
            ? "failed"
            : "cancelled"
        : step.status) as StatusType,
      subSteps:
        (isApiStep
          ? step.progress_updates
          : (step as ProcessStepData).subSteps || step.progress_updates) ??
        undefined,
      outcome:
        (isApiStep
          ? step.outcome_summary
          : (step as ProcessStepData).outcome || step.outcome_summary) ??
        undefined,
      details: step.details,
    };
  });

  // Convert to API Step[] format for details panel
  const apiSteps: Step[] = steps.map((step) => {
    const isApiStep = "outcome_summary" in step;

    if (isApiStep) {
      return step as Step;
    }

    // Convert ProcessStepData to Step
    return {
      id: step.id,
      title: (step as ProcessStepData).text || step.title || "",
      status: (step.status === "success"
        ? "success"
        : step.status === "failure"
          ? "failure"
          : step.status === "completed"
            ? "success"
            : step.status === "failed"
              ? "failure"
              : step.status === "cancelled"
                ? "cancelled"
                : step.status === "pending"
                  ? "pending"
                  : "in_progress") as Step["status"],
      outcome_summary:
        (step as ProcessStepData).outcome || step.outcome_summary || null,
      progress_updates:
        (step as ProcessStepData).subSteps || step.progress_updates || null,
      details: step.details || null,
    };
  });

  // Keep the details panel in sync when it's open and showing this process
  const processTitle =
    title || `Process (${normalizedStepsForRendering.length} steps)`;
  useEffect(() => {
    if (
      processDetailsPanelState.isOpen &&
      processDetailsPanelState.messageId === messageId
    ) {
      setProcessDetailsPanelState({
        isOpen: true,
        stepDetails: apiSteps,
        processTitle,
        messageId,
      });
    }
  }, [steps]);

  const collapsed = onToggle ? isCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggle) {
      onToggle(!collapsed);
    } else {
      setInternalCollapsed(!collapsed);
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const getProgressPercentage = () => {
    const completedSteps = normalizedStepsForRendering.filter(
      (step) => step.status === "completed",
    ).length;
    return Math.round(
      (completedSteps / normalizedStepsForRendering.length) * 100,
    );
  };

  return (
    <>
      <div className="process-indicator bg-white radius-lg shadow-2 padding-left-105 display-flex flex-column position-relative">
        <div className={`process-indicator--${status} status`}></div>
        <div className="width-full radius-right-lg">
          <div
            className="process-indicator__header padding-2 cursor-pointer display-flex flex-justify flex-align-center border-bottom-1px border-base-lighter hover:bg-base-lightest"
            onClick={handleToggle}
          >
            <div className="flex-1 miw-0">
              <h4 className="process-indicator__title margin-0 font-sans-md text-bold text-base-darkest line-height-sans-3">
                {title ||
                  `Process (${normalizedStepsForRendering.length} steps)`}{" "}
                - {getStatusText()}
              </h4>
              {status === "in_progress" && (
                <p className="margin-0 margin-top-05 font-sans-xs text-base">
                  {getProgressPercentage()}% complete
                </p>
              )}
            </div>

            <button
              className="bg-transparent border-0 cursor-pointer radius-sm text-base-darker padding-1 hover:bg-primary-lighter"
              aria-label={
                collapsed
                  ? "Expand process details"
                  : "Collapse process details"
              }
            >
              <span
                className={`process-indicator__toggle-icon ${
                  collapsed ? "process-indicator__toggle-icon--collapsed" : ""
                }`}
              >
                <Icon.ExpandLess size={4} />
              </span>
            </button>
          </div>
          {!collapsed && (
            <div className="process-indicator__content padding-2">
              <div className="display-flex flex-column flex-align-start">
                {normalizedStepsForRendering.map((step, index) => (
                  <ProcessStep
                    key={step.id}
                    stepText={step.text || ""}
                    status={step.status}
                    index={showStepNumbers ? index : undefined}
                    showConnector={true}
                    isLast={index === normalizedStepsForRendering.length - 1}
                    animated={animated}
                    subSteps={step.subSteps}
                    outcome={step.outcome}
                  />
                ))}
              </div>

              {status === "failed" && errorState && (
                <div className="margin-top-2 padding-105 bg-error-lighter radius-lg border-1px border-error-light">
                  <div className="display-flex flex-align-center margin-bottom-1">
                    <span className="font-sans-md margin-right-1">⚠️</span>
                    <span className="font-sans-sm text-bold text-error-dark">
                      Process Failed
                    </span>
                  </div>
                  <p className="margin-0 font-sans-xs text-error-dark line-height-sans-4">
                    {errorState.message}
                  </p>
                </div>
              )}
              {(status !== "in_progress" ||
                apiSteps.some((step) => step.details)) && (
                <div className="border-top-1px border-base-lighter display-flex flex-justify-end margin-top-1 margin-x-neg-2 padding-top-2 padding-right-2">
                  <Button
                    type="button"
                    className="width-auto text-light text-primary-dark font-sans-xs padding-x-105 padding-x-05"
                    onClick={() =>
                      setProcessDetailsPanelState({
                        isOpen: true,
                        stepDetails: apiSteps,
                        processTitle,
                        messageId,
                      })
                    }
                    accentStyle="cool"
                  >
                    Details
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
