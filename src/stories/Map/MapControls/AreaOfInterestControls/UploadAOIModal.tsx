import React, { useState, useRef, useEffect, DragEvent } from "react";
import { Icon, Alert } from "@trussworks/react-uswds";
import type { FeatureCollection } from "geojson";
import { parseGeoJSONFile, isValidFileType, validateGeometryForMapping } from "../utils/upload-geojson";
import "./upload-aoi-modal.scss";

export interface UploadAOIModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when valid GeoJSON is uploaded */
  onGeoJSONUpload: (data: FeatureCollection, fileName: string) => void;
}

export const UploadAOIModal: React.FC<UploadAOIModalProps> = ({
  isOpen,
  onClose,
  onGeoJSONUpload,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsProcessing(false);
      setIsSuccess(false);
      setIsDragging(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);

    // Validate file type
    if (!isValidFileType(file)) {
      setError("Invalid file type. Please upload a .geojson or .json file.");
      setIsProcessing(false);
      return;
    }

    // Parse the file
    const result = await parseGeoJSONFile(file);

    if (!result.success || !result.data) {
      setError(result.error || "Failed to parse file.");
      setIsProcessing(false);
      return;
    }

    // Validate geometry
    const validation = validateGeometryForMapping(result.data);
    if (!validation.valid) {
      setError(validation.error || "Invalid geometry in file.");
      setIsProcessing(false);
      return;
    }

    // Success - pass data to parent
    onGeoJSONUpload(result.data, file.name);
    setIsProcessing(false);
    setIsSuccess(true);
    
    // Show success message briefly, then close immediately
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 500);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="upload-aoi-modal__backdrop position-fixed top-0 left-0 right-0 bottom-0 bg-black-transparent-50 display-flex flex-align-center flex-justify-center z-top"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-aoi-modal-title"
    >
      <div className="upload-aoi-modal position-relative width-mobile-lg maxw-tablet-lg z-top bg-white radius-md shadow-5">
        {/* Header */}
        <div className="display-flex flex-align-center flex-justify padding-y-2 padding-x-205 border-bottom-1px border-base-light">
          <h2
            id="upload-aoi-modal-title"
            className="margin-0 font-sans-lg text-bold text-base-darkest"
          >
            Upload Area of Interest
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="upload-aoi-modal__close-button padding-0 border-0 bg-transparent cursor-pointer"
            aria-label="Close modal"
          >
            <Icon.Close size={3} className="text-base-dark" />
          </button>
        </div>

        {/* Content */}
        <div className="padding-3">
          {error && (
            <Alert type="error" headingLevel="h4" className="margin-bottom-2">
              {error}
            </Alert>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".geojson,.json"
            onChange={handleFileInputChange}
            className="display-none"
            aria-label="File input"
            disabled={isProcessing}
          />

          <div
            className={`upload-aoi-modal__drop-zone radius-md padding-6 display-flex flex-column flex-align-center flex-justify-center cursor-pointer bg-base-lightest ${
              isDragging ? "upload-aoi-modal__drop-zone--dragging" : ""
            } ${isProcessing ? "upload-aoi-modal__drop-zone--processing opacity-70 cursor-not-allowed" : ""}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onClick={isProcessing ? undefined : handleBrowseClick}
            onKeyDown={(e) => {
              if (!isProcessing && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                handleBrowseClick();
              }
            }}
          >
            {/* Upload Icon */}
            <div className="display-flex flex-align-center flex-justify-center margin-bottom-2">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="upload-aoi-modal__icon"
              >
                <path
                  d="M42 30V38C42 39.0609 41.5786 40.0783 40.8284 40.8284C40.0783 41.5786 39.0609 42 38 42H10C8.93913 42 7.92172 41.5786 7.17157 40.8284C6.42143 40.0783 6 39.0609 6 38V30"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M34 16L24 6L14 16"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M24 6V30"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Success message or upload prompt */}
            <div className="text-center">
              {isSuccess ? (
                <div className="display-flex flex-column flex-align-center">
                  <Icon.Check size={4} className="text-success margin-bottom-1" />
                  <p className="margin-0 font-body-md text-semibold text-success">
                    Area of Interest uploaded successfully!
                  </p>
                </div>
              ) : isProcessing ? (
                <p className="margin-0 font-body-md text-base-dark">
                  Processing file...
                </p>
              ) : (
                <>
                  <p className="margin-0 margin-bottom-1 font-body-md text-semibold text-base-darkest">
                    Drag and Drop to upload GeoJSON
                  </p>
                  <p className="margin-0 font-body-sm text-base-dark">
                    Or,{" "}
                    <span className="text-primary text-underline cursor-pointer">
                      click to browse
                    </span>
                  </p>
                  <p className="margin-top-1 margin-0 font-body-xs text-base">
                    Accepts .geojson and .json files only
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadAOIModal;
