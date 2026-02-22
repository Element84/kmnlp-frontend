import { AreaOfInterest, PolygonPoint } from "./types";

/**
 * Converts an array of points to a GeoJSON Polygon
 */
export const pointsToPolygon = (points: PolygonPoint[]): AreaOfInterest => {
  // Close the polygon by adding the first point at the end if it's not already closed
  const coordinates = [...points];
  if (
    coordinates.length > 0 &&
    (coordinates[0].lng !== coordinates[coordinates.length - 1].lng ||
      coordinates[0].lat !== coordinates[coordinates.length - 1].lat)
  ) {
    coordinates.push(coordinates[0]);
  }

  return {
    type: "Polygon",
    coordinates: [coordinates.map((point) => [point.lng, point.lat])],
    id: generateAreaId(),
    created: new Date(),
  };
};

/**
 * Generates a unique ID for an area of interest
 */
export const generateAreaId = (): string => {
  return `aoi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculates the area of a polygon in square kilometers (approximate)
 */
export const calculatePolygonArea = (area: AreaOfInterest): number => {
  if (area.coordinates.length === 0) return 0;

  const coords = area.coordinates[0];
  if (coords.length < 3) return 0;

  // Simple area calculation using the shoelace formula
  // Note: This is approximate and doesn't account for Earth's curvature
  let totalArea = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[i + 1];
    totalArea += x1 * y2 - x2 * y1;
  }

  // Convert to approximate square kilometers
  // This is a rough approximation - for precise calculations, use a proper geodesic library
  const areaInDegrees = Math.abs(totalArea) / 2;
  const areaInKm2 = areaInDegrees * 12364; // Rough conversion factor

  return areaInKm2;
};

/**
 * Validates if a polygon has minimum required points
 */
export const isValidPolygon = (points: PolygonPoint[]): boolean => {
  return points.length >= 3;
};

/**
 * Calculates the centroid of a polygon
 */
export const getPolygonCenter = (
  area: AreaOfInterest
): { lng: number; lat: number } => {
  
  if (area.coordinates.length === 0 || area.coordinates[0].length === 0) {
    return { lng: 0, lat: 0 };
  }

  const coords = area.coordinates[0];
  let totalLng = 0;
  let totalLat = 0;

  for (const [lng, lat] of coords) {
    totalLng += lng;
    totalLat += lat;
  }

  return {
    lng: totalLng / coords.length,
    lat: totalLat / coords.length,
  };
};

/**
 * Formats area size for display
 */
export const formatAreaSize = (areaKm2: number): string => {
  if (areaKm2 < 1) {
    return `${(areaKm2 * 1000000).toFixed(0)} m²`;
  } else if (areaKm2 < 100) {
    return `${areaKm2.toFixed(2)} km²`;
  } else {
    return `${areaKm2.toFixed(0)} km²`;
  }
};
