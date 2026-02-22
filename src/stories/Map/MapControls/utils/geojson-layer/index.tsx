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

import type { Feature, FeatureCollection, Geometry } from 'geojson';

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
  options?: ConvertToGeoJSONOptions
): FeatureCollection => {
  // If it's already a FeatureCollection, return it
  if (data?.type === 'FeatureCollection' && Array.isArray(data.features)) {
    return data as FeatureCollection;
  }

  // If it's a single Feature, wrap it
  if (data?.type === 'Feature' && data.geometry) {
    return {
      type: 'FeatureCollection',
      features: [data as Feature],
    };
  }

  // If it's an array of Features
  if (Array.isArray(data)) {
    const features = data
      .filter(item => item?.type === 'Feature' && item.geometry)
      .map(item => item as Feature);
    
    return {
      type: 'FeatureCollection',
      features,
    };
  }

  // If it's a raw geometry object
  if (data?.type && ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'].includes(data.type)) {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
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
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry,
          properties: {
            name: data[options?.nameField || 'name'],
            description: data[options?.descriptionField || 'description'],
            ...options?.additionalProperties,
          },
        },
      ],
    };
  }

  // Default: return empty FeatureCollection
  console.warn('Unable to convert data to GeoJSON:', data);
  return {
    type: 'FeatureCollection',
    features: [],
  };
};

/**
 * Infer geometry type from coordinates structure
 */
const inferGeometryType = (coordinates: any): Geometry['type'] => {
  if (!Array.isArray(coordinates)) return 'Point';
  
  if (typeof coordinates[0] === 'number') {
    return 'Point';
  }
  
  if (Array.isArray(coordinates[0])) {
    if (typeof coordinates[0][0] === 'number') {
      return 'LineString';
    }
    
    if (Array.isArray(coordinates[0][0])) {
      if (typeof coordinates[0][0][0] === 'number') {
        return 'Polygon';
      }
      return 'MultiPolygon';
    }
  }
  
  return 'Point';
};

/**
 * Validates if a GeoJSON object is valid
 * Supports FeatureCollection, Feature, and raw Geometry objects
 */
export const isValidGeoJSON = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  const { type } = data;
  
  // Check if it's a FeatureCollection
  if (type === 'FeatureCollection') {
    return Array.isArray(data.features);
  }
  
  // Check if it's a single Feature (geometry can be null per spec)
  if (type === 'Feature') {
    return 'geometry' in data;
  }
  
  // Check if it's a Geometry object (fast lookup)
  const validGeometryTypes = new Set([
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon',
    'GeometryCollection'
  ]);

  if (validGeometryTypes.has(type)) {
    return 'coordinates' in data || (type === 'GeometryCollection' && Array.isArray(data.geometries));
  }
  
  return false;
};

/**
 * Extracts bounds from GeoJSON for map fitting
 */
export const getGeoJSONBounds = (
  geoJson: FeatureCollection
): [number, number, number, number] | null => {
  if (!geoJson.features.length) return null;

  // Helper to find the first coordinate in the GeoJSON
  let found = false;
  let minLng = 0, minLat = 0, maxLng = 0, maxLat = 0;

  const findFirstCoordinate = (coords: any): [number, number] | null => {
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      return [coords[0], coords[1]];
    } else if (Array.isArray(coords)) {
      for (const c of coords) {
        const res = findFirstCoordinate(c);
        if (res) return res;
      }
    }
    return null;
  };

  for (const feature of geoJson.features) {
    const geometry = feature.geometry;
    if (!geometry) continue;
    if (geometry.type === 'GeometryCollection' && Array.isArray((geometry as any).geometries)) {
      for (const g of (geometry as any).geometries) {
        if (g?.coordinates) {
          const first = findFirstCoordinate(g.coordinates);
          if (first) {
            minLng = maxLng = first[0];
            minLat = maxLat = first[1];
            found = true;
            break;
          }
        }
      }
      if (found) break;
    } else if ((geometry as any).coordinates) {
      const first = findFirstCoordinate((geometry as any).coordinates);
      if (first) {
        minLng = maxLng = first[0];
        minLat = maxLat = first[1];
        found = true;
        break;
      }
    }
  }

  if (!found) return null;

  const processCoordinates = (coords: any) => {
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      minLng = Math.min(minLng, coords[0]);
      maxLng = Math.max(maxLng, coords[0]);
      minLat = Math.min(minLat, coords[1]);
      maxLat = Math.max(maxLat, coords[1]);
    } else if (Array.isArray(coords)) {
      coords.forEach(processCoordinates);
    }
  };

  geoJson.features.forEach(feature => {
    const geometry = feature.geometry;
    if (!geometry) return;
    if (geometry.type === 'GeometryCollection' && Array.isArray((geometry as any).geometries)) {
      for (const g of (geometry as any).geometries) {
        if (g?.coordinates) {
          processCoordinates(g.coordinates);
        }
      }
    } else if ((geometry as any).coordinates) {
      processCoordinates((geometry as any).coordinates);
    }
  });

  return [minLng, minLat, maxLng, maxLat];
};