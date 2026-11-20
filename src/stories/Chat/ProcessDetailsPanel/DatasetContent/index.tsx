import { useState } from "react";
import { Icon } from "@trussworks/react-uswds";
import { DatasetInfo } from "../ProcessDetailsPanel";
import { Card } from "../../../Card";
import "./styles.scss";

export interface DatasetContentProps {
  datasets: DatasetInfo[];
  query?: string;
}

export const DatasetContent = ({ datasets, query }: DatasetContentProps) => {
  const [expandedDatasets, setExpandedDatasets] = useState<string[]>([]);

  const getDatasetKey = (dataset: DatasetInfo) => dataset.name || dataset.title;

  const toggleDataset = (datasetKey: string) => {
    setExpandedDatasets((prev) =>
      prev.includes(datasetKey)
        ? prev.filter((key) => key !== datasetKey)
        : [...prev, datasetKey],
    );
  };
  const formatTemporalCoverage = (temporalCoverage: string): string => {
    try {
      const parts = temporalCoverage.split(" to ");

      if (parts.length === 2) {
        const startDate = parts[0].trim().split(" ")[0];
        const endDate = parts[1].trim().split(" ")[0];

        return `${startDate} to ${endDate}`;
      }

      // If not in expected format, return original
      return temporalCoverage;
    } catch (error) {
      // If parsing fails, return original string
      return temporalCoverage;
    }
  };
  return (
    <div className="dataset-content flex-fill overflow-y-auto">
      {query && (
        <div className="margin-bottom-2">
          <h3 className="dataset-content__section-heading font-sans-sm text-bold margin-top-0">
            Search query
          </h3>
          <div className="dataset-content__query">
            <p className="font-sans-sm text-base-darkest margin-0 text-italic">
              {query}
            </p>
          </div>
        </div>
      )}
      <h3 className="dataset-content__section-heading font-sans-sm text-bold margin-top-0">
        Datasets found: {datasets.length}
      </h3>

      {datasets.map((dataset, index) => {
        const datasetKey = getDatasetKey(dataset);
        const isExpanded = expandedDatasets.includes(datasetKey);

        return (
          <Card
            key={index}
            title={datasetKey}
            expandable
            isExpanded={isExpanded}
            onClick={() => toggleDataset(datasetKey)}
            className="dataset-content__card margin-bottom-2"
          >
            {/* Dataset Page Link */}
            {dataset.datasetPageUrl && (
              <div className="dataset-content__link margin-bottom-2">
                <a
                  href={dataset.datasetPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans-sm font-bold text-primary text-no-underline display-inline-flex flex-align-center hover:text-underline"
                >
                  Dataset page
                  <Icon.Launch className="margin-left-05" size={3} />
                </a>
              </div>
            )}{" "}
            {/* Dataset Description */}
            <div className="dataset-content__description margin-bottom-2">
              <p className="font-sans-sm text-base-darkest line-height-sans-4 margin-0">
                {dataset.description}
              </p>
            </div>
            {/* Dataset Metadata */}
            <div className="dataset-content__metadata margin-bottom-2">
              {dataset.temporalCoverage && (
                <div className="dataset-content__metadata-row display-flex margin-bottom-2">
                  <span className="font-sans-xs text-base-dark minw-15 flex-1 details--title">
                    temporal coverage:
                  </span>
                  <span className="font-sans-xs text-base-darkest flex-1">
                    {formatTemporalCoverage(dataset.temporalCoverage)}
                  </span>
                </div>
              )}

              {dataset.spatialCoverage && (
                <div className="dataset-content__metadata-row display-flex margin-bottom-2">
                  <span className="font-sans-xs text-base-dark minw-15 flex-1 details--title">
                    spatial coverage:
                  </span>
                  <span className="font-sans-xs text-base-darkest flex-1">
                    {dataset.spatialCoverage}
                  </span>
                </div>
              )}

              {dataset.variables && dataset.variables.length > 0 && (
                <div className="dataset-content__metadata-row display-flex margin-bottom-2">
                  <span className="font-sans-xs text-base-dark minw-15 flex-1 details--title">
                    variables:
                  </span>
                  <span className="font-sans-xs text-base-darkest flex-1">
                    {dataset.variables.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
