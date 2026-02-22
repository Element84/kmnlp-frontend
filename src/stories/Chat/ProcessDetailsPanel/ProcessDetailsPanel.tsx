import React from "react";
import { Button, Icon } from "@trussworks/react-uswds";
import { DatasetContent } from "./DatasetContent";
import { Card } from "../../Card";
import { StatusIcon } from "../StatusIcon";
import type {
  Step,
  DatasetMetadata,
  DatasetSearchDetails,
  DataAnalysisDetails,
} from "../../../types/api";
import "./process-details-panel.scss";

/**
 * Extended dataset info for UI display, based on DatasetMetadata from API
 */
export interface DatasetInfo {
  name?: string;
  title: string;
  description: string;
  datasetPageUrl?: string;
  temporalCoverage?: string;
  spatialCoverage?: string;
  variables: string[];
}

export interface ProcessDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stepDetails: Step[];
  processTitle?: string;
  onOpenAnalysis?: (analysisDetails: DataAnalysisDetails) => void;
}

export const ProcessDetailsPanel = ({
  isOpen,
  onClose,
  stepDetails,
  processTitle,
  onOpenAnalysis,
}: ProcessDetailsPanelProps) => {
  // Helper to convert DatasetMetadata to DatasetInfo
  const convertToDatasetInfo = (metadata: DatasetMetadata): DatasetInfo => ({
    name: metadata.title,
    title: metadata.title,
    description: metadata.description,
    datasetPageUrl: metadata.landing_page || undefined,
    temporalCoverage: metadata.temporal_coverage,
    spatialCoverage: metadata.spatial_coverage,
    variables: metadata.variables,
  });

  // Helper to check if step has data analysis details
  const hasDataAnalysisDetails = (step: Step): boolean => {
    return step.details?.content.content_type === "DataAnalysisDetails";
  };

  // Helper to get datasets from a step
  const getDatasetsFromStep = (step: Step): DatasetInfo[] => {
    if (
      !step.details ||
      step.details.content.content_type !== "DatasetSearchDetails"
    ) {
      return [];
    }

    const searchDetails = step.details.content as DatasetSearchDetails;
    return searchDetails.results?.map(convertToDatasetInfo) || [];
  };

  return (
    <>
      {/* Side Panel */}
      <div
        className={`text-base-darker position-fixed pin-top pin-right height-viewport maxw-mobile-lg bg-white shadow-3 z-500 display-flex flex-column ${
          isOpen ? "" : "process-details-panel--closed"
        }`}
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        {/* Header - Sticky */}
        <div className="display-flex flex-align-center flex-justify padding-2 bg-base-lightest flex-no-shrink height-full details-panel__header">
          <h2 className="font-sans-lg text-bold text-primary">Details</h2>

          <Button
            type="button"
            unstyled
            className="padding-05 radius-sm hover:bg-base-lighter"
            onClick={onClose}
            aria-label="Close details panel"
          >
            <Icon.Close size={4} />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="display-flex flex-column flex-1 overflow-y-auto">
          <div className="padding-x-3 padding-y-2 border-bottom-1px border-bottom-1px border-base-lighter display-flex flex-column">
            <span className="text-base-light ">Query Title</span>

            <h2 className="margin-0 margin-top-1">{processTitle}</h2>
          </div>

          {/* Step Info */}
          {stepDetails.map((detail, index) => {
            const datasets = getDatasetsFromStep(detail);
            const hasDatasets = datasets.length > 0;
            const hasAnalysis = hasDataAnalysisDetails(detail);

            return (
              <div
                key={detail.id}
                className="flex-no-shrink display-flex flex-row border-bottom-1px border-base-lighter step-container"
              >
                <div
                  className="display-inline-flex padding-2
             flex-justify-center height-full  font-sans-xl text-bold width-full maxw-8 border-right-1px border-base-lighter"
                >
                  {index + 1}
                </div>
                <div className="padding-2 display-flex flex-column grid-gap-lg">
                  <h3 className="font-sans-md text-normal  margin-y-0 margin-bottom-1 line-height-sans-4">
                    {detail.title}
                  </h3>

                  <div className="display-flex flex-row gap-1 flex-align-center margin-y-2">
                    <span className="font-sans-sm text-bold  padding-right-1">
                      Status:
                    </span>
                    <div className="display-flex flex-align-center">
                      <StatusIcon status={detail.status} size="medium" />
                      <span
                        className={`font-sans-sm margin-left-1 status-text--${detail.status}`}
                      >
                        {/* NEED TO NORMALIZE STATUS ACROSS APP: HERE */}
                        {detail.status === "success"
                          ? "Complete"
                          : detail.status === "in_progress"
                          ? "In Progress"
                          : detail.status === "failure"
                          ? "Failed"
                          : detail.status === "pending"
                          ? "Pending"
                          : detail.status === "cancelled"
                          ? "Cancelled"
                          : "Unknown"}
                      </span>
                    </div>
                  </div>

                  {/* Datasets Section */}
                  {hasDatasets && <DatasetContent datasets={datasets} />}

                  {/* Data Analysis Card */}
                  {hasAnalysis && (
                    <Card
                      title="Analysis"
                      onClick={() => {
                        if (
                          detail.details?.content.content_type ===
                            "DataAnalysisDetails" &&
                          onOpenAnalysis
                        ) {
                          onOpenAnalysis(
                            detail.details.content as DataAnalysisDetails
                          );
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
