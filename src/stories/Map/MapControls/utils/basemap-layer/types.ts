export type BasemapType = "outdoors" | "light" | "dark" | "satellite";

export interface BasemapLayerProps {
  /** Currently selected basemap type */
  selectedBasemap?: BasemapType;
  /** Callback when basemap selection changes */
  onBasemapChange?: (basemap: BasemapType) => void;
  /** Whether the component is visible */
  isVisible?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Position variant for different contexts */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "dropdown";
}

export interface BasemapOption {
  type: BasemapType;
  label: string;
  description?: string;
}