import * as React from "react";
import { useState } from "react";
import { BasemapLayerProps, BasemapType, BasemapOption } from "./types";
import { BASEMAP_OPTIONS, DEFAULT_BASEMAP } from "./constants";
import "./basemap-layer.scss";

export const BasemapLayer: React.FC<BasemapLayerProps> = ({
  selectedBasemap = DEFAULT_BASEMAP,
  onBasemapChange,
  isVisible = true,
  className = "",
  position = "dropdown",
}) => {
  const [currentSelection, setCurrentSelection] = useState<BasemapType>(selectedBasemap);

  const handleBasemapSelect = (basemap: BasemapType) => {
    setCurrentSelection(basemap);
    onBasemapChange?.(basemap);
  };

  if (!isVisible) {
    return null;
  }

  const containerClasses = [
    "basemap-layer",
    position && `basemap-layer--${position}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      <div className="basemap-layer__container bg-white radius-md shadow-1 border-1px border-base-lighter padding-105 minw-15">
        {BASEMAP_OPTIONS.map((option: BasemapOption) => (
          <button
            key={option.type}
            className={`
              basemap-layer__option
              display-block width-full padding-y-105 padding-x-2 margin-0 border-0 
              text-left cursor-pointer font-body-xs text-ink radius-sm
              ${currentSelection === option.type 
                ? "basemap-layer__option--selected" 
                : "bg-transparent"
              }
              focus:outline-2px focus:outline-primary focus:outline-offset-neg-2px
            `.trim().replace(/\s+/g, ' ')}
            onClick={() => handleBasemapSelect(option.type)}
            title={option.description}
            aria-label={`Select ${option.label} basemap`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BasemapLayer;