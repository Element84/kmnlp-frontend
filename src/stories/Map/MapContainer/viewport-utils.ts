import type { MapViewport } from "./types";

export interface ViewportCalculationOptions {
  preserveOrientation?: boolean;
  currentViewport?: MapViewport;
  minZoom?: number;
  maxZoom?: number;
  zoomOffset?: number;
  roundZoom?: boolean;
}

export type BoundingBox = [number, number, number, number];

export const calculateViewportFromBounds = (
  bounds: BoundingBox,
  options: ViewportCalculationOptions = {}
): MapViewport => {
  const {
    preserveOrientation = false,
    currentViewport,
    minZoom = 1,
    maxZoom = 18,
    zoomOffset = 0,
    roundZoom = false,
  } = options;

  const [minLng, minLat, maxLng, maxLat] = bounds;

  // Calculate center point. Longitude bounds may be "unwrapped" (maxLng > 180)
  // for anti-meridian-crossing geometries, so normalize the center back into
  // [-180, 180].
  const rawCenterLng = (minLng + maxLng) / 2;
  const centerLng = ((((rawCenterLng + 180) % 360) + 360) % 360) - 180;
  const centerLat = (minLat + maxLat) / 2;

  // Calculate extent ranges
  const lngRange = Math.abs(maxLng - minLng);
  const latRange = Math.abs(maxLat - minLat);
  const maxRange = Math.max(lngRange, latRange);

  // Logarithmic zoom calculation
  let zoom = 12 - Math.log2(maxRange * 10);

  // Apply zoom offset
  zoom += zoomOffset;

  // Clamp to min/max zoom
  zoom = Math.max(minZoom, Math.min(maxZoom, zoom));

  // Round to nearest 0.5 if requested
  if (roundZoom) {
    zoom = Math.round(zoom * 2) / 2;
  }

  // Preserve or reset orientation
  const pitch =
    preserveOrientation && currentViewport ? currentViewport.pitch : 0;
  const bearing =
    preserveOrientation && currentViewport ? currentViewport.bearing : 0;

  return {
    latitude: centerLat,
    longitude: centerLng,
    zoom,
    pitch,
    bearing,
  };
};


export const getBoundsFromCoordinates = (
  coordinates: Array<[number, number]>
): BoundingBox => {
  if (coordinates.length === 0) {
    throw new Error("Cannot calculate bounds from empty coordinate array");
  }

  let minLng = coordinates[0][0];
  let minLat = coordinates[0][1];
  let maxLng = coordinates[0][0];
  let maxLat = coordinates[0][1];

  for (const [lng, lat] of coordinates) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  return [minLng, minLat, maxLng, maxLat];
};

export const calculateViewportFromCOG = (
  cogCorners: Array<[number, number]>,
  options: ViewportCalculationOptions = {}
): MapViewport => {
  const bounds = getBoundsFromCoordinates(cogCorners);
  return calculateViewportFromBounds(bounds, options);
};
