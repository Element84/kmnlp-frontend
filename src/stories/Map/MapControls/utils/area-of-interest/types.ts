export interface AreaOfInterest {
  type: "Polygon";
  coordinates: number[][][];
  id?: string;
  name?: string;
  created?: Date;
}

export interface PolygonPoint {
  lng: number;
  lat: number;
}

export interface AreaOfInterestProps {
  /** Whether area drawing is active */
  isActive: boolean;
  /** Callback when area is completed */
  onAreaComplete: (area: AreaOfInterest) => void;
  /** Callback when drawing is cancelled */
  onCancel?: () => void;
  /** Current area being drawn */
  currentArea?: AreaOfInterest | null;
  /** Additional CSS class name */
  className?: string;
}

export interface PolygonDrawState {
  isDrawing: boolean;
  points: PolygonPoint[];
  isComplete: boolean;
}