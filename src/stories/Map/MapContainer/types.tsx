import { ReactNode } from "react";
import { AreaOfInterestType } from "../MapControls/utils/area-of-interest";
import { BasemapType } from "../MapControls/utils/basemap-layer";
import { LocationResult } from "../MapControls/utils/location-search";
import { Legend, AOISummary } from "../../../types/api";

export interface CogInfo {
  url: string;
  legend?: Legend;
}

export interface MapContainerProps {
  viewport: MapViewport;
  onViewportChange: (viewport: MapViewport) => void;
  onAreaSelect?: (area: AreaOfInterestType) => void;
  onAOIToggle?: () => void;
  onApplyAOI?: (aoiName: string, isNewAOI: boolean, file?: File, geojson?: any) => void;
  aoiList?: AOISummary[];
  onLoadAOIs?: () => void;
  isLoadingAOIs?: boolean;
  aoiResetKey?: boolean;
  collapsed?: boolean;
  className?: string;
  children?: ReactNode;
  mapStyle?: string;
  areaSelectionActive?: boolean;
  selectedArea?: AreaOfInterestType | null;
  onBasemapChange?: (basemapType: BasemapType) => void;
  onLocationSelect?: (location: LocationResult) => void;
  geoJsonData?: any;
  geocodeAOI?: any; // Added for test compatibility, expects GeoJSON
  /** COG file information including URL and legend */
  cogInfo?: CogInfo;
}

export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

// Default Gulf of Mexico viewport - zoomed out to show entire Gulf
export const DEFAULT_VIEWPORT: MapViewport = {
  latitude: 25.0,
  longitude: -89.0,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};
