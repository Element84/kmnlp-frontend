import React, { useState } from "react";
import { Button, Icon, Table } from "@trussworks/react-uswds";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { DataAnalysisDetails } from "../../../types/api";
import "./analysis-modal.scss";

SyntaxHighlighter.registerLanguage("python", python);

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
        className="position-fixed top-0 left-0 width-full height-viewport display-flex flex-align-center flex-justify-center z-top padding-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="analysis-modal-heading"
      >
        <div className="analysis-modal__container position-relative bg-white radius-lg shadow-3 maxw-tablet-lg width-full display-flex flex-column maxh-tablet-lg">
          {/* Header - Sticky */}
          <div className="display-flex flex-align-center flex-justify padding-2 border-bottom-1px border-base-lighter flex-no-shrink">
            <h2
              id="analysis-modal-heading"
              className="font-sans-lg text-bold text-base-darkest margin-0"
            >
              {analysisDetails.solution?.content_type}
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
            {analysisDetails.problem?.inputs_provided && (
              <div className="padding-1 border-1px border-base-light radius-lg margin-bottom-2">
                <Table bordered={false} className="width-full margin-0">
                  <thead>
                    <tr>
                      <th className="font-sans-md border-bottom-0">
                        Inputs Provided
                      </th>
                    </tr>
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
                            {input.description}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </Table>
              </div>
            )}
            {analysisDetails.problem?.outputs_requested && (
              <div className="padding-1 border-1px border-base-light radius-lg margin-bottom-2">
                <Table bordered={false} className="width-full  margin-0">
                  <thead>
                    <tr>
                      <th className="font-sans-md border-bottom-0">
                        Outputs Requested
                      </th>
                    </tr>
                    <tr>
                      <th className=" text-base-light text-semibold border-bottom-1px border-base-light">
                        Name
                      </th>
                      <th className=" text-base-light text-semibold border-bottom-1px border-base-light">
                        Type
                      </th>
                      <th className=" text-base-light text-semibold  border-bottom-1px border-base-light">
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
                            {output.description}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </Table>
              </div>
            )}
            <div className="padding-0 overflow-y-auto position-relative">
              <div className="position-relative bg-base-darkest padding-1  border-bottom-1px border-base-dark">
                <Button
                  type="button"
                  unstyled
                  className="analysis-modal__copy-button display-flex flex-align-center padding-x-1 padding-y-05 text-white font-sans-xs radius-sm"
                  onClick={handleCopy}
                >
                  <Icon.ContentCopy size={3} className="margin-right-05" />
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              {/* @ts-expect-error - react-syntax-highlighter type issue with React 18 */}
              <SyntaxHighlighter
                language="python"
                style={vscDarkPlus}
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
                {analysisDetails.solution?.pseudocode || "# No code available"}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
