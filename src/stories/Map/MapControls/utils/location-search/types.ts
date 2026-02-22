export interface LocationResult {
  id: string;
  name: string;
  subtitle: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  bbox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface LocationSearchProps {
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Whether the search is currently loading */
  isLoading?: boolean;
  /** Whether the component is visible */
  isVisible?: boolean;
  /** Maximum number of results to display */
  maxResults?: number;
  /** Callback when a location is selected */
  onLocationSelect?: (location: LocationResult) => void;
  /** Callback when search input changes */
  onSearchChange?: (query: string) => void;
  /** Search results to display */
  results?: LocationResult[];
  /** Additional CSS class name */
  className?: string;
  /** Position variant for different contexts */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "dropdown";
}

export interface LocationSearchState {
  query: string;
  results: LocationResult[];
  isLoading: boolean;
  isOpen: boolean;
  selectedIndex: number;
}