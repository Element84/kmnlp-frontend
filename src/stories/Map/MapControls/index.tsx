import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { BasemapLayer, type BasemapType } from "./utils/basemap-layer";
import { LocationSearch, type LocationResult } from "./utils/location-search";
import "./map-controls.scss";

export interface MapControlsProps {
  /** Whether area of interest selection is active */
  aoiActive?: boolean;
  /** Area of interest selection callback */
  onAOIToggle?: () => void;
  /** Area search callback */
  onAreaSearch?: () => void;
  /** Map layers panel toggle callback */
  onLayerToggle?: () => void;
  /** More options callback */
  onMoreOptions?: () => void;
  /** Zoom in callback */
  onZoomIn?: () => void;
  /** Zoom out callback */
  onZoomOut?: () => void;
  /** Marquee zoom callback */
  onMarqueeZoom?: () => void;
  /** Whether marquee zoom mode is active */
  marqueeZoomActive?: boolean;
  /** Full screen toggle callback */
  onFullScreen?: () => void;
  /** Basemap change callback */
  onBasemapChange?: (basemap: BasemapType) => void;
  /** Currently selected basemap */
  selectedBasemap?: BasemapType;
  /** Location selection callback */
  onLocationSelect?: (location: LocationResult) => void;
  /** COG layer toggle callback */
  onCogToggle?: () => void;
  /** Whether COG layer is visible */
  cogVisible?: boolean;
  /** Whether COG layer is available */
  hasCogLayer?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Whether controls are disabled */
  disabled?: boolean;
}

export const MapControls: React.FC<MapControlsProps> = ({
  aoiActive = false,
  onAOIToggle,
  onAreaSearch,
  onLayerToggle,
  onMoreOptions,
  onZoomIn,
  onZoomOut,
  onMarqueeZoom,
  marqueeZoomActive = false,
  onBasemapChange,
  selectedBasemap = "light",
  onLocationSelect,
  className = "",
  disabled = false,
}) => {
  const [showBasemapLayer, setShowBasemapLayer] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const basemapButtonRef = useRef<HTMLButtonElement>(null);
  const basemapLayerRef = useRef<HTMLDivElement>(null);
  const locationSearchButtonRef = useRef<HTMLButtonElement>(null);
  const locationSearchRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close panels
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close basemap layer
      if (
        showBasemapLayer &&
        basemapLayerRef.current &&
        basemapButtonRef.current &&
        !basemapLayerRef.current.contains(event.target as Node) &&
        !basemapButtonRef.current.contains(event.target as Node)
      ) {
        setShowBasemapLayer(false);
      }

      // Close location search
      if (
        showLocationSearch &&
        locationSearchRef.current &&
        locationSearchButtonRef.current &&
        !locationSearchRef.current.contains(event.target as Node) &&
        !locationSearchButtonRef.current.contains(event.target as Node)
      ) {
        setShowLocationSearch(false);
      }
    };

    if (showBasemapLayer || showLocationSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBasemapLayer, showLocationSearch]);

  const handleLayerToggle = () => {
    setShowBasemapLayer(!showBasemapLayer);
    onLayerToggle?.();
  };

  const handleBasemapChange = (basemap: BasemapType) => {
    onBasemapChange?.(basemap);
    setShowBasemapLayer(false);
  };

  const handleAreaSearchToggle = () => {
    setShowLocationSearch(!showLocationSearch);
    setShowBasemapLayer(false); // Close other panels
    onAreaSearch?.();
  };

  const handleLocationSelect = (location: LocationResult) => {
    onLocationSelect?.(location);
    setShowLocationSearch(false);
  };
  const controlClasses = [
    "map-controls",
    disabled ? "map-controls--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={controlClasses}>
      {/* Primary tools section */}
      <div className="map-controls__section map-controls__section--primary">
        <button
          className={`map-controls__button ${
            aoiActive ? "map-controls__button--active" : ""
          }`}
          onClick={onAOIToggle}
          disabled={disabled}
          title="Area of Interest Selection"
          aria-label="Toggle area of interest selection"
        >
          <svg
            width="21"
            height="20"
            viewBox="0 0 21 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.1121 8.10449L15.1873 17.1064H5.72241L2.79761 8.10449L10.4548 2.54199L18.1121 8.10449Z"
              stroke={aoiActive ? "white" : "#0050D8"}
              strokeWidth="1.25"
            />
            <path
              d="M10.455 1.09277C11.1534 1.09277 11.7196 1.65898 11.7196 2.35742C11.7196 3.05588 11.1534 3.62207 10.455 3.62207C9.7565 3.62204 9.19031 3.05586 9.19031 2.35742C9.19032 1.659 9.75651 1.09281 10.455 1.09277Z"
              fill={aoiActive ? "white" : "#0050D8"}
              stroke={aoiActive ? "white" : "#0050D8"}
            />
            <path
              d="M2.21973 6.9751C2.91821 6.9751 3.48436 7.54131 3.48438 8.23975C3.48438 8.9382 2.91822 9.50439 2.21973 9.50439C1.52127 9.50436 0.955078 8.93818 0.955078 8.23975C0.955094 7.54133 1.52128 6.97513 2.21973 6.9751Z"
              fill={aoiActive ? "white" : "#0050D8"}
              stroke={aoiActive ? "white" : "#0050D8"}
            />
            <path
              d="M5.74915 15.7983C6.44762 15.7983 7.01378 16.3645 7.01379 17.063C7.01379 17.7614 6.44763 18.3276 5.74915 18.3276C5.05069 18.3276 4.4845 17.7614 4.4845 17.063C4.48451 16.3646 5.0507 15.7984 5.74915 15.7983Z"
              fill={aoiActive ? "white" : "#0050D8"}
              stroke={aoiActive ? "white" : "#0050D8"}
            />
            <path
              d="M15.161 15.7983C15.8595 15.7983 16.4256 16.3645 16.4257 17.063C16.4257 17.7614 15.8595 18.3276 15.161 18.3276C14.4626 18.3276 13.8964 17.7614 13.8964 17.063C13.8964 16.3646 14.4626 15.7984 15.161 15.7983Z"
              fill={aoiActive ? "white" : "#0050D8"}
              stroke={aoiActive ? "white" : "#0050D8"}
            />
            <path
              d="M18.6903 6.9751C19.3888 6.9751 19.9549 7.54131 19.955 8.23975C19.955 8.9382 19.3888 9.50439 18.6903 9.50439C17.9918 9.50436 17.4257 8.93818 17.4257 8.23975C17.4257 7.54133 17.9919 6.97513 18.6903 6.9751Z"
              fill={aoiActive ? "white" : "#0050D8"}
              stroke={aoiActive ? "white" : "#0050D8"}
            />
          </svg>
        </button>

        <button
          ref={locationSearchButtonRef}
          className={`map-controls__button ${
            showLocationSearch ? "map-controls__button--active" : ""
          }`}
          onClick={handleAreaSearchToggle}
          disabled={disabled}
          title="Area Search"
          aria-label="Search for specific area"
        >
          <svg
            className="map-controls__icon"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.5 3C5.46243 3 3 5.46243 3 8.5C3 11.5376 5.46243 14 8.5 14C9.83879 14 11.0659 13.5217 12.0196 12.7266L16.6464 17.3536L17.3536 16.6464L12.7266 12.0196C13.5217 11.0659 14 9.83879 14 8.5C14 5.46243 11.5376 3 8.5 3ZM4 8.5C4 6.01472 6.01472 4 8.5 4C10.9853 4 13 6.01472 13 8.5C13 10.9853 10.9853 13 8.5 13C6.01472 13 4 10.9853 4 8.5Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <button
          ref={basemapButtonRef}
          className={`map-controls__button ${
            showBasemapLayer ? "map-controls__button--active" : ""
          }`}
          onClick={handleLayerToggle}
          disabled={disabled}
          title="Map Layer Options"
          aria-label="Toggle map layer options"
        >
          <svg
            className="map-controls__icon"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 2L2 6L10 10L18 6L10 2Z"
              fill="currentColor"
              fillOpacity="0.7"
            />
            <path
              d="M2 10L10 14L18 10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M2 14L10 18L18 14"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </button>

        <button
          className="map-controls__button"
          onClick={onMoreOptions}
          disabled={disabled}
          title="More Options"
          aria-label="More map options"
        >
          <svg
            className="map-controls__icon"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="4" cy="10" r="2" fill="currentColor" />
            <circle cx="10" cy="10" r="2" fill="currentColor" />
            <circle cx="16" cy="10" r="2" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Basemap Layer Selector */}
      {showBasemapLayer && (
        <div
          ref={basemapLayerRef}
          className="map-controls__basemap-layer"
        >
          <BasemapLayer
            selectedBasemap={selectedBasemap}
            onBasemapChange={handleBasemapChange}
            isVisible={showBasemapLayer}
          />
        </div>
      )}

      {/* Location Search */}
      {showLocationSearch && (
        <div
          ref={locationSearchRef}
          className="map-controls__location-search"
        >
          <LocationSearch
            placeholder="Search locations..."
            onLocationSelect={handleLocationSelect}
            isVisible={showLocationSearch}
          />
        </div>
      )}

      {/* Navigation section */}
      <div className="map-controls__section map-controls__section--navigation">
        <button
          className="map-controls__button"
          onClick={onZoomIn}
          disabled={disabled}
          title="Zoom In"
          aria-label="Zoom in"
        >
          <svg
            className="map-controls__icon"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 4V16M4 10H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <button
          className="map-controls__button"
          onClick={onZoomOut}
          disabled={disabled}
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <svg
            className="map-controls__icon"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 10H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <button
          className={`map-controls__button ${
            marqueeZoomActive ? "map-controls__button--active" : ""
          }`}
          onClick={onMarqueeZoom}
          disabled={disabled}
          title={marqueeZoomActive ? "Exit Marquee Zoom" : "Marquee Zoom"}
          aria-label={marqueeZoomActive ? "Exit marquee zoom tool" : "Marquee zoom tool"}
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.4817 15.1303C17.399 13.8784 17.8098 12.3263 17.632 10.7844C17.4542 9.2426 16.7009 7.82476 15.5228 6.81457C14.3446 5.80439 12.8285 5.27635 11.2778 5.33611C9.72715 5.39587 8.2562 6.03902 7.15928 7.13688C6.06235 8.23474 5.42034 9.70635 5.3617 11.2573C5.30306 12.8082 5.83211 14.3241 6.843 15.5017C7.85389 16.6793 9.27208 17.4317 10.8138 17.6084C12.3556 17.7851 13.9072 17.3731 15.1583 16.4548H15.1573C15.1851 16.4927 15.216 16.529 15.2502 16.5638L18.8974 20.2115C19.075 20.3893 19.316 20.4892 19.5673 20.4893C19.8186 20.4894 20.0596 20.3896 20.2374 20.2119C20.4151 20.0343 20.515 19.7933 20.5151 19.542C20.5152 19.2906 20.4155 19.0496 20.2378 18.8718L16.5906 15.2241C16.5568 15.1898 16.5203 15.159 16.4817 15.1303ZM16.7261 11.4882C16.7261 12.1726 16.5913 12.8502 16.3295 13.4824C16.0676 14.1146 15.6838 14.6891 15.2 15.173C14.7162 15.6569 14.1418 16.0407 13.5097 16.3026C12.8775 16.5645 12.2 16.6993 11.5158 16.6993C10.8316 16.6993 10.154 16.5645 9.52189 16.3026C8.88974 16.0407 8.31536 15.6569 7.83154 15.173C7.34772 14.6891 6.96393 14.1146 6.70209 13.4824C6.44025 12.8502 6.30548 12.1726 6.30548 11.4882C6.30548 10.1062 6.85442 8.78076 7.83154 7.80351C8.80866 6.82626 10.1339 6.27724 11.5158 6.27724C12.8976 6.27724 14.2229 6.82626 15.2 7.80351C16.1771 8.78076 16.7261 10.1062 16.7261 11.4882Z"
              fill={marqueeZoomActive ? "white" : "#0050D8"}
            />
            <path
              d="M16.515 6.17352V3.64718C16.515 2.60074 15.6667 1.75243 14.6203 1.75243H3.67301C2.62658 1.75243 1.77829 2.60074 1.77829 3.64718V14.5946C1.77846 15.6409 2.62669 16.4894 3.67301 16.4894H6.1993L6.26427 16.4927C6.58255 16.5252 6.83088 16.7941 6.83088 17.121C6.83072 17.4477 6.58248 17.7168 6.26427 17.7493L6.1993 17.7526H3.67301C1.92907 17.7526 0.515307 16.3386 0.515137 14.5946V3.64718C0.515137 1.90311 1.92896 0.489258 3.67301 0.489258H14.6203C16.3643 0.489258 17.7782 1.90311 17.7782 3.64718V6.17352C17.7781 6.52228 17.4954 6.8051 17.1466 6.8051C16.7978 6.80508 16.5151 6.52227 16.515 6.17352Z"
              fill={marqueeZoomActive ? "white" : "#0050D8"}
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MapControls;
