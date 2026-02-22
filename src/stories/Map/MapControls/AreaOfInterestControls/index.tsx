import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import { Button, TextInput } from "@trussworks/react-uswds";
import type { FeatureCollection } from "geojson";
import "./area-of-interest-controls.scss";
import { UploadAOIModal } from "./UploadAOIModal";
import { apiClient } from "../../../../services/api-client";
import { AOISummary } from "../../../../types/api";
import { appliedAOIAtom } from "../../../../store/atoms";

export interface AreaOfInterestControlsProps {
  onApply?: (aoiName: string, isNewAOI: boolean, file?: File) => void;
  onCancel?: () => void;
  defaultName?: string;
  isOpen?: boolean;
  hasDrawnArea?: boolean;
  onGeoJSONUpload?: (data: FeatureCollection, fileName: string) => void;
  aoiList?: AOISummary[];
  onLoadAOIs?: () => void;
  isLoadingAOIs?: boolean;
  onTabChange?: (isCreateNew: boolean) => void;
}

export const AreaOfInterestControls: React.FC<AreaOfInterestControlsProps> = ({
  onApply,
  onCancel,
  defaultName = "",
  isOpen = true,
  hasDrawnArea = false,
  onGeoJSONUpload,
  aoiList = [],
  onLoadAOIs,
  isLoadingAOIs = false,
  onTabChange,
}) => {
  const [isCreateNew, setIsCreateNew] = useState(true);
  const [aoiName, setAoiName] = useState(defaultName);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [uploadedGeoJSON, setUploadedGeoJSON] =
    useState<FeatureCollection | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedExistingAOI, setSelectedExistingAOI] = useState<{
    name: string;
    uuid: string;
  } | null>(null);

  // Get setter for applied AOI atom
  const setAppliedAOI = useSetAtom(appliedAOIAtom);

  // Track if we've already loaded AOIs to prevent repeated calls
  const hasLoadedAOIs = useRef(false);

  // Check if the entered name is a duplicate
  const isDuplicateName = useMemo(() => {
    if (!isCreateNew || !aoiName.trim()) return false;
    return aoiList.some(
      (aoi) => aoi.name.toLowerCase() === aoiName.trim().toLowerCase(),
    );
  }, [aoiName, aoiList, isCreateNew]);

  // Load AOIs when component first opens
  useEffect(() => {
    if (isOpen && onLoadAOIs && !hasLoadedAOIs.current) {
      hasLoadedAOIs.current = true;
      onLoadAOIs();
    }
    
    // Reset the flag when component closes
    if (!isOpen) {
      hasLoadedAOIs.current = false;
    }
  }, [isOpen, onLoadAOIs]);

  if (!isOpen) return null;

  const handleApply = () => {
    // For existing AOIs, use the selected AOI name, otherwise use the entered name
    const finalName =
      !isCreateNew && selectedExistingAOI ? selectedExistingAOI.name : aoiName;
    onApply?.(finalName, isCreateNew, selectedFile);
    setAoiName("");
    setSelectedExistingAOI(null);
  };

  const handleCancel = () => {
    setAoiName("");
    setSelectedExistingAOI(null);
    setUploadedGeoJSON(null);
    setUploadedFileName("");
    console.log('[Jotai AOI] Clearing AOI on cancel');
    setAppliedAOI(null);
    onCancel?.();
  };

  // Determine if Apply button should be enabled
  const isApplyEnabled = isCreateNew
    ? aoiName.trim().length > 0 && hasDrawnArea && !isDuplicateName
    : selectedExistingAOI !== null;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleGeoJSONUpload = (data: FeatureCollection, fileName: string) => {
    setUploadedGeoJSON(data);
    setUploadedFileName(fileName);
    // Pass to parent component for map rendering
    onGeoJSONUpload?.(data, fileName);
    // Set the AOI name from the file name (without extension)
    const nameWithoutExt = fileName.replace(/\.(geojson|json)$/i, "");
    setAoiName(nameWithoutExt);
    // Close the modal is handled by UploadAOIModal
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };
  const mockListDate = [
    { name: "Alfreds Futterkiste", date: "11-11-2021", uuid: "aoi-12345" },
    {
      name: "Centro comercial Moctezuma",
      date: "11-11-2021",
      uuid: "aoi-12345",
    },
    { name: "Ernst Handel", date: "11-11-2021", uuid: "aoi-12345" },
    { name: "Alfreds Futterkiste", date: "11-11-2021", uuid: "aoi-12345" },
    {
      name: "Centro comercial Moctezuma",
      date: "11-11-2021",
      uuid: "aoi-12345",
    },
    { name: "Ernst Handel", date: "11-11-2021", uuid: "aoi-12345" },
    { name: "Alfreds Futterkiste", date: "11-11-2021", uuid: "aoi-12345" },
    {
      name: "Centro comercial Moctezuma",
      date: "11-11-2021",
      uuid: "aoi-12345",
    },
    { name: "Ernst Handel", date: "11-11-2021", uuid: "aoi-12345" },
  ];
  const handleChooseExistingClick = () => {
    setIsCreateNew(false);
    setSelectedExistingAOI(null);
    onTabChange?.(false);
  };

  const handleAOIClick = async (uuid: string) => {
    try {
      const aoiData = await apiClient.getAOI(uuid);
      console.log("AOI data:", aoiData);

      // Track the selected existing AOI
      setSelectedExistingAOI({
        name: aoiData.name,
        uuid: aoiData.uuid,
      });

      // Update the applied AOI atom with the received data
      console.log('[Jotai AOI] Setting AOI from existing selection:', {
        name: aoiData.name,
        uuid: aoiData.uuid,
        created_at: aoiData.created_at
      });
      setAppliedAOI({
        name: aoiData.name,
        geojson: aoiData.geojson,
        uuid: aoiData.uuid,
        created_at: aoiData.created_at,
      });

      // Pass the GeoJSON to parent for map rendering
      // Convert the Polygon geometry to a FeatureCollection for the map
      const featureCollection: FeatureCollection = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { name: aoiData.name },
            geometry: aoiData.geojson,
          },
        ],
      };
      onGeoJSONUpload?.(featureCollection, aoiData.name);
    } catch (error) {
      console.error("Error fetching AOI:", error);
    }
  };

  return (
    <>
      <div className="area-of-interest-controls width-full bg-white radius-lg shadow-3 border-1px border-base-light overflow-hidden">
        <div className="padding-y-105 padding-x-2 border-bottom-1px border-base-light">
          <h3 className="margin-0 font-sans-lg text-bold text-base-darkest line-height-sans-2">
            Area Of Interest
          </h3>
        </div>

        <div className=" display-flex flex-column">
          {/* Tab Buttons */}
          <div className="padding-x-2 padding-top-2">
            <div className="display-flex gap-05 bg-base-lightest radius-sm padding-05 margin-bottom-2">
              <button
                type="button"
                className={`flex-1 padding-y-1 padding-x-105 border-0 radius-sm font-body-sm text-semibold cursor-pointer text-no-wrap ${
                  isCreateNew
                    ? "bg-primary text-white shadow-1 hover:bg-primary hover:text-white"
                    : "bg-transparent text-base-dark hover:bg-primary-lighter hover:text-primary-darker"
                }`}
                onClick={() => {
                  setIsCreateNew(true);
                  // Clear any uploaded/selected GeoJSON when switching to Create New
                  setUploadedGeoJSON(null);
                  setUploadedFileName("");
                  setSelectedExistingAOI(null);
                  // Clear the applied AOI jotai object
                  console.log('[Jotai AOI] Clearing AOI on tab switch to Create New');
                  setAppliedAOI(null);
                  onTabChange?.(true);
                }}
              >
                Create New
              </button>
              <button
                type="button"
                className={`flex-1 padding-y-1 padding-x-105 border-0 radius-sm font-body-sm text-semibold cursor-pointer text-no-wrap ${
                  !isCreateNew
                    ? "bg-primary text-white shadow-1 hover:bg-primary hover:text-white"
                    : "bg-transparent text-base-dark hover:bg-primary-lighter hover:text-primary-darker"
                }`}
                onClick={handleChooseExistingClick}
              >
                Choose Existing
              </button>
            </div>
          </div>

          {/* Name Input */}
          {isCreateNew ? (
            <div className="display-flex flex-column margin-bottom-2 padding-x-2">
              <label
                htmlFor="aoi-name-input"
                className="font-body-sm text-bold text-base-darkest margin-bottom-1"
              >
                Name
              </label>
              <TextInput
                id="aoi-name-input"
                name="aoi-name"
                type="text"
                value={aoiName}
                onChange={(e) => setAoiName(e.target.value)}
                className={`width-full radius-lg ${isDuplicateName ? "border-secondary-dark border-2px" : ""}`}
                validationStatus={isDuplicateName ? "error" : undefined}
              />
              {isDuplicateName && (
                <span className="font-body-3xs text-secondary-dark margin-top-05">
                  An AOI with this name already exists
                </span>
              )}
            </div>
          ) : (
            <div className="padding-x-2 padding-bottom-2 width-full">
              <table className="width-full">
                <thead>
                  <tr className="display-flex flex-justify">
                    <th className="display-block">Name</th>
                    <th className="display-block">Date Created</th>
                  </tr>
                </thead>
                <tbody className="maxh-card overflow-y-auto display-block">
                  {isLoadingAOIs ? (
                    <tr className="display-flex flex-justify-center padding-2">
                      <td colSpan={2} className="text-base-dark">
                        Loading AOIs...
                      </td>
                    </tr>
                  ) : aoiList.length === 0 ? (
                    <tr className="display-flex flex-justify-center padding-2">
                      <td colSpan={2} className="text-base-dark">
                        No AOIs found
                      </td>
                    </tr>
                  ) : (
                    aoiList.map((item) => (
                      <Button
                        className="clickable-row width-full padding-05 radius-md hover:bg-primary-lighter text-no-underline text-base-darkest"
                        type={"button"}
                        unstyled
                        key={item.uuid}
                        onClick={() => handleAOIClick(item.uuid)}
                      >
                        <tr className="display-flex flex-justify width-full">
                          <td className="flex-5">{item.name}</td>
                          <td className="flex-2">{new Date(item.created_at).toLocaleDateString()}</td>
                        </tr>
                      </Button>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Upload AOI Button */}
          {isCreateNew && (
            <div className="display-flex flex-column margin-bottom-2 padding-x-2">
              <Button
                type="button"
                onClick={handleUploadClick}
                outline
                className="display-flex gap-05 flex-align-center flex-justify-center width-card font-body-sm text-semibold border-primary text-primary hover:bg-primary-lighter hover:border-primary-dark hover:text-primary-dark"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0"
                >
                  <path
                    d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11.3333 5.33333L8 2L4.66666 5.33333"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 2V10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Upload AOI
              </Button>
              {uploadedFileName && (
                <span className="font-mono-2xs text-base-dark padding-x-1 margin-top-1 word-break">
                  {uploadedFileName}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="padding-2 display-flex flex-justify-end gap-1 margin-top-05 border-top-1px border-base-light">
            <Button type="button" onClick={handleCancel} outline>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              disabled={!isApplyEnabled}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>

      <UploadAOIModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onGeoJSONUpload={handleGeoJSONUpload}
      />
    </>
  );
};

export default AreaOfInterestControls;
