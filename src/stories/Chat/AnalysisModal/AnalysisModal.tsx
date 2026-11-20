import React, { useEffect, useState } from "react";
import { Button, Icon, Table } from "@trussworks/react-uswds";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "github-markdown-css/github-markdown-light.css";
import type { DataAnalysisDetails, DownloadLink } from "../../../types/api";
import { apiClient } from "../../../services/api-client";
import "./analysis-modal.scss";

SyntaxHighlighter.registerLanguage("python", python);

const DOWNLOAD_LINK_LABELS: Record<DownloadLink["file_type"], string> = {
  image: "Download image",
  animation: "Download animation",
  geotiff: "Download GeoTIFF",
  data: "Download data",
};

const OutputValue = ({ value }: { value: string | DownloadLink }) => {
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (typeof value === "string") {
    return <>{value}</>;
  }

  const label = DOWNLOAD_LINK_LABELS[value.file_type] ?? "Download file";

  const handleDownload = async () => {
    setError(null);

    // Public URLs can be opened directly; API URLs must be resolved to a
    // pre-signed URL because they require the x-user-id auth header, which a
    // plain anchor cannot send.
    if (!apiClient.isApiUrl(value.url)) {
      window.open(value.url, "_blank", "noopener,noreferrer");
      return;
    }

    setResolving(true);
    try {
      const downloadUrl = await apiClient.resolveDataUrl(value.url);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get download link",
      );
    } finally {
      setResolving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="analysis-modal__download-link"
        onClick={handleDownload}
        disabled={resolving}
      >
        {resolving ? "Preparing download…" : label}
      </button>
      {error && (
        <span className="analysis-modal__download-error"> {error}</span>
      )}
    </>
  );
};

const TruncatedText = ({
  text,
  maxChars = 120,
}: {
  text: string;
  maxChars?: number;
}) => {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text.length > maxChars;

  return (
    <span style={{ whiteSpace: "pre-line" }}>
      {expanded || !needsTruncation ? text : `${text.slice(0, maxChars)}…`}
      {needsTruncation && (
        <>
          {" "}
          <button
            className="analysis-modal__see-more"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "see less" : "see more"}
          </button>
        </>
      )}
    </span>
  );
};

const CollapsibleSection = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="analysis-modal__section border-1px border-base-light radius-lg margin-bottom-2">
      <button
        className="analysis-modal__section-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span
          className={`analysis-modal__section-chevron ${open ? "analysis-modal__section-chevron--open" : ""}`}
        >
          &#9654;
        </span>
        <h3 className="font-sans-md margin-0">{title}</h3>
      </button>
      {open && <div className="analysis-modal__section-body">{children}</div>}
    </div>
  );
};

export interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisDetails: DataAnalysisDetails;
}

export const AnalysisModal = ({
  isOpen,
  onClose,
  analysisDetails,
}: AnalysisModalProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = () => {
    if (analysisDetails.solution?.pseudocode) {
      navigator.clipboard.writeText(analysisDetails.solution.pseudocode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 z-top left-0 width-full height-viewport bg-black opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="position-fixed top-0 left-0 width-full height-viewport display-flex flex-justify-center overflow-y-auto z-top padding-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="analysis-modal-heading"
      >
        <div className="analysis-modal__container position-relative bg-white radius-lg shadow-3 maxw-tablet-lg width-full display-flex flex-column maxh-tablet-lg margin-y-auto flex-no-shrink">
          {/* Header - Sticky */}
          <div className="display-flex flex-align-center flex-justify padding-2 border-bottom-1px border-base-lighter flex-no-shrink">
            <h2
              id="analysis-modal-heading"
              className="font-sans-lg text-bold text-base-darkest margin-0"
            >
              Analysis Details
            </h2>
            <Button
              type="button"
              unstyled
              className="padding-05 radius-sm hover:bg-base-lighter"
              onClick={onClose}
              aria-label="Close analysis modal"
            >
              <Icon.Close size={4} />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="padding-2 overflow-y-auto flex-1">
            {analysisDetails.problem?.statement && (
              <CollapsibleSection title="Problem Statement">
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {analysisDetails.problem.statement}
                  </ReactMarkdown>
                </div>
              </CollapsibleSection>
            )}
            {analysisDetails.problem?.inputs_provided && (
              <CollapsibleSection title="Inputs Provided">
                <Table bordered={false} className="width-full margin-0">
                  <thead>
                    <tr>
                      <th className=" text-base-light text-semibold border-bottom-1px border-base-light">
                        Name
                      </th>

                      <th className=" text-base-light text-semibold border-bottom-1px border-base-light">
                        Type
                      </th>
                      <th className=" text-base-light text-semibold border-bottom-1px border-base-light">
                        Description
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {analysisDetails.problem?.inputs_provided.map(
                      (input, index) => (
                        <tr key={index} className="text-top">
                          <td className="border-bottom-1px border-base-light width-card-lg">
                            {input.name}
                          </td>
                          <td className="border-bottom-1px border-base-light width-card-lg">
                            {input.type}
                          </td>
                          <td className="border-bottom-1px border-base-light ">
                            <TruncatedText text={input.description || ""} />
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </Table>
              </CollapsibleSection>
            )}
            {analysisDetails.problem?.outputs_requested && (
              <CollapsibleSection title="Outputs Requested">
                <Table bordered={false} className="width-full margin-0">
                  <thead>
                    <tr>
                      <th className=" text-base-light text-semibold border-bottom-1px border-base-light">
                        Name
                      </th>
                      <th className=" text-base-light text-semibold border-bottom-1px border-base-light">
                        Type
                      </th>
                      <th className=" text-base-light text-semibold border-bottom-1px border-base-light">
                        Description
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {analysisDetails.problem?.outputs_requested.map(
                      (output, index) => (
                        <tr key={index} className="text-top">
                          <td className="border-bottom-1px border-base-light width-card-lg">
                            {output.name}
                          </td>
                          <td className="border-bottom-1px border-base-light width-card-lg">
                            {output.type}
                          </td>
                          <td className="border-bottom-1px border-base-light ">
                            <TruncatedText text={output.description || ""} />
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </Table>
              </CollapsibleSection>
            )}
            {analysisDetails.solution?.reasoning && (
              <CollapsibleSection title="Reasoning">
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {analysisDetails.solution.reasoning}
                  </ReactMarkdown>
                </div>
              </CollapsibleSection>
            )}
            {analysisDetails.solution?.analysis && (
              <CollapsibleSection title="Problem Analysis">
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {analysisDetails.solution.analysis}
                  </ReactMarkdown>
                </div>
              </CollapsibleSection>
            )}
            <CollapsibleSection title="Solution Pseudocode">
              <div className="position-relative overflow-y-auto">
                <Button
                  type="button"
                  unstyled
                  className="analysis-modal__copy-button"
                  onClick={handleCopy}
                  aria-label="Copy code"
                >
                  <Icon.ContentCopy size={3} />
                  {copied && (
                    <span className="analysis-modal__copy-tooltip">
                      Copied!
                    </span>
                  )}
                </Button>
                {/* @ts-expect-error - react-syntax-highlighter type issue with React 18 */}
                <SyntaxHighlighter
                  language="python"
                  style={vs}
                  customStyle={{
                    margin: 0,
                    minHeight: "200px",
                    maxHeight: "60vh",
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                  }}
                  codeTagProps={{
                    style: {
                      fontSize: "0.875rem",
                    },
                  }}
                >
                  {analysisDetails.solution?.pseudocode ||
                    "# No code available"}
                </SyntaxHighlighter>
              </div>
            </CollapsibleSection>

            {analysisDetails.solution?.explanation && (
              <CollapsibleSection title="Explanation">
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {analysisDetails.solution.explanation}
                  </ReactMarkdown>
                </div>
              </CollapsibleSection>
            )}

            {analysisDetails.outputs && analysisDetails.outputs.length > 0 && (
              <CollapsibleSection title="Outputs Produced">
                <Table bordered={false} className="width-full margin-0">
                  <thead>
                    <tr>
                      <th className="text-base-light text-semibold border-bottom-1px border-base-light">
                        Name
                      </th>
                      <th className="text-base-light text-semibold border-bottom-1px border-base-light">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisDetails.outputs.map((output, index) => (
                      <tr key={index} className="text-top">
                        <td className="border-bottom-1px border-base-light width-card-lg">
                          {output.name}
                        </td>
                        <td className="border-bottom-1px border-base-light">
                          <OutputValue value={output.value} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CollapsibleSection>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
