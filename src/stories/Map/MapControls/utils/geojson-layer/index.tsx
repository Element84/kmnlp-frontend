/**
 * GeoJSON Conversion and Validation Utilities
 *
 * This module provides core GeoJSON processing utilities used throughout the application.
 * It handles conversion, validation, and bounds calculation for GeoJSON data.
 *
 * Key Functions:
 * - convertToGeoJSON: Converts various JSON formats to GeoJSON FeatureCollection
 * - isValidGeoJSON: Validates if an object is valid GeoJSON (FeatureCollection, Feature, or Geometry)
 * - getGeoJSONBounds: Calculates bounding box for map fitting
 *
 * Used by:
 * - File upload utilities (../upload-geojson.ts)
 * - Chat message processing (src/store/chat-message-utils.ts)
 * - Map viewport management (src/store/view-actions.ts)
 */

import type { Feature, FeatureCollection, Geometry } from "geojson";

export interface ConvertToGeoJSONOptions {
  nameField?: string;
  descriptionField?: string;
  additionalProperties?: Record<string, any>;
}

/**
 * Converts various JSON formats to GeoJSON FeatureCollection
 * Handles single features, arrays of features, and already-formatted GeoJSON
 */
export const convertToGeoJSON = (
  data: any,
  options?: ConvertToGeoJSONOptions,
): FeatureCollection => {
  // If it's already a FeatureCollection, return it
  if (data?.type === "FeatureCollection" && Array.isArray(data.features)) {
    return data as FeatureCollection;
  }

  // If it's a single Feature, wrap it
  if (data?.type === "Feature" && data.geometry) {
    return {
      type: "FeatureCollection",
      features: [data as Feature],
    };
  }

  // If it's an array of Features
  if (Array.isArray(data)) {
    const features = data
      .filter((item) => item?.type === "Feature" && item.geometry)
      .map((item) => item as Feature);

    return {
      type: "FeatureCollection",
      features,
    };
  }

  // If it's a raw geometry object
  if (
    data?.type &&
    [
      "Point",
      "LineString",
      "Polygon",
      "MultiPoint",
      "MultiLineString",
      "MultiPolygon",
      "GeometryCollection",
    ].includes(data.type)
  ) {
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: data as Geometry,
          properties: options?.additionalProperties || {},
        },
      ],
    };
  }

  // If it has coordinates directly (common API response format)
  if (data?.coordinates) {
    const geometryType = inferGeometryType(data.coordinates);

    // Build the geometry object dynamically based on type
    const geometry: Geometry = {
      type: geometryType,
      coordinates: data.coordinates,
    } as Geometry;

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry,
          properties: {
            name: data[options?.nameField || "name"],
            description: data[options?.descriptionField || "description"],
            ...options?.additionalProperties,
          },
        },
      ],
    };
  }

  // Default: return empty FeatureCollection
  console.warn("Unable to convert data to GeoJSON:", data);
  return {
    type: "FeatureCollection",
    features: [],
  };
};

/**
 * Infer geometry type from coordinates structure
 */
const inferGeometryType = (coordinates: any): Geometry["type"] => {
  if (!Array.isArray(coordinates)) return "Point";

  if (typeof coordinates[0] === "number") {
    return "Point";
  }

  if (Array.isArray(coordinates[0])) {
    if (typeof coordinates[0][0] === "number") {
      return "LineString";
    }

    if (Array.isArray(coordinates[0][0])) {
      if (typeof coordinates[0][0][0] === "number") {
        return "Polygon";
      }
      return "MultiPolygon";
    }
  }

  return "Point";
};

/**
 * Validates if a GeoJSON object is valid
 * Supports FeatureCollection, Feature, and raw Geometry objects
 */
export const isValidGeoJSON = (data: any): boolean => {
  if (!data || typeof data !== "object") return false;

  const { type } = data;

  // Check if it's a FeatureCollection
  if (type === "FeatureCollection") {
    return Array.isArray(data.features);
  }

  // Check if it's a single Feature (geometry can be null per spec)
  if (type === "Feature") {
    return "geometry" in data;
  }

  // Check if it's a Geometry object (fast lookup)
  const validGeometryTypes = new Set([
    "Point",
    "MultiPoint",
    "LineString",
    "MultiLineString",
    "Polygon",
    "MultiPolygon",
    "GeometryCollection",
  ]);

  if (validGeometryTypes.has(type)) {
    return (
      "coordinates" in data ||
      (type === "GeometryCollection" && Array.isArray(data.geometries))
    );
  }

  return false;
};

/**
 * Computes [west, east] longitude bounds that correctly handle geometries
 * crossing the anti-meridian (±180°).
 *
 * Longitudes are points on a circle, so the tightest bounding arc is the
 * complement of the largest empty gap between consecutive longitudes. When that
 * tightest arc crosses the anti-meridian, `east` is returned "unwrapped"
 * (> 180) so that (west + east) / 2 is the correct center and (east - west) the
 * correct span.
 */
const computeLongitudeBounds = (lngs: number[]): [number, number] => {
  const normalize = (l: number) => ((((l + 180) % 360) + 360) % 360) - 180;
  const sorted = lngs.map(normalize).sort((a, b) => a - b);

  const n = sorted.length;
  if (n === 1) return [sorted[0], sorted[0]];

  // Largest gap between adjacent longitudes (the "empty" arc containing no data).
  let maxGap = -Infinity;
  let gapStartIndex = 0;
  for (let i = 0; i < n - 1; i++) {
    const gap = sorted[i + 1] - sorted[i];
    if (gap > maxGap) {
      maxGap = gap;
      gapStartIndex = i;
    }
  }

  // Gap that wraps across the anti-meridian (last point → first point).
  const wrapGap = sorted[0] + 360 - sorted[n - 1];

  if (wrapGap >= maxGap) {
    // Largest empty arc is across the anti-meridian → data doesn't cross it.
    return [sorted[0], sorted[n - 1]];
  }

  // Largest empty arc is in the interior → data wraps across the anti-meridian.
  // West is the point just after the gap; east is the point just before it,
  // unwrapped by +360 so west <= east.
  const west = sorted[gapStartIndex + 1];
  const east = sorted[gapStartIndex] + 360;
  return [west, east];
};

/**
 * Extracts bounds from GeoJSON for map fitting.
 *
 * Longitude bounds are anti-meridian aware: `maxLng` may be returned unwrapped
 * (> 180) when the geometry crosses ±180°, keeping the bounding box tight.
 */
export const getGeoJSONBounds = (
  geoJson: FeatureCollection,
): [number, number, number, number] | null => {
  if (!geoJson.features.length) return null;

  const lngs: number[] = [];
  let minLat = Infinity;
  let maxLat = -Infinity;

  const collectCoordinates = (coords: any) => {
    if (typeof coords[0] === "number" && typeof coords[1] === "number") {
      lngs.push(coords[0]);
      minLat = Math.min(minLat, coords[1]);
      maxLat = Math.max(maxLat, coords[1]);
    } else if (Array.isArray(coords)) {
      coords.forEach(collectCoordinates);
    }
  };

  geoJson.features.forEach((feature) => {
    const geometry = feature.geometry;
    if (!geometry) return;
    if (
      geometry.type === "GeometryCollection" &&
      Array.isArray((geometry as any).geometries)
    ) {
      for (const g of (geometry as any).geometries) {
        if (g?.coordinates) {
          collectCoordinates(g.coordinates);
        }
      }
    } else if ((geometry as any).coordinates) {
      collectCoordinates((geometry as any).coordinates);
    }
  });

  if (!lngs.length || minLat === Infinity) return null;

  const [minLng, maxLng] = computeLongitudeBounds(lngs);

  return [minLng, minLat, maxLng, maxLat];
};
