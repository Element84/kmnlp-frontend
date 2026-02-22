/**
 * GeoJSON File Upload Utilities
 * 
 * This module provides file-specific utilities for uploading and validating GeoJSON files.
 * It uses shared GeoJSON validation and normalization functions from ./geojson-layer
 * to avoid code duplication.
 * 
 * Responsibilities:
 * - File type validation (accepts .geojson and .json)
 * - File size validation (10MB max)
 * - File reading and parsing
 * - Geometry validation for mapping purposes
 * 
 * See also: ./geojson-layer/index.tsx for core GeoJSON conversion utilities
 */

import type { FeatureCollection } from 'geojson';
import { isValidGeoJSON, convertToGeoJSON } from './geojson-layer';

export interface UploadGeoJSONResult {
  success: boolean;
  data?: FeatureCollection;
  error?: string;
}

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validates if a file is a valid GeoJSON or JSON file
 */
export const isValidFileType = (file: File): boolean => {
  const validExtensions = ['.geojson', '.json'];
  const validMimeTypes = ['application/json', 'application/geo+json'];
  
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  const hasValidMimeType = validMimeTypes.includes(file.type);
  
  return hasValidExtension || hasValidMimeType;
};

/**
 * Validates file size
 */
export const isValidFileSize = (file: File): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB.`
    };
  }
  return { valid: true };
};

/**
 * Reads and parses a GeoJSON file (optimized for large files)
 * Uses shared GeoJSON utilities for validation and normalization
 * @param file - The file to read
 * @returns Promise resolving to UploadGeoJSONResult
 */
export const parseGeoJSONFile = (file: File): Promise<UploadGeoJSONResult> => {
  return new Promise((resolve) => {
    // Validate file type first
    if (!isValidFileType(file)) {
      resolve({
        success: false,
        error: 'Invalid file type. Please upload a .geojson or .json file.'
      });
      return;
    }

    // Validate file size
    const sizeValidation = isValidFileSize(file);
    if (!sizeValidation.valid) {
      resolve({
        success: false,
        error: sizeValidation.error
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        // Validate GeoJSON structure using shared utility
        if (!isValidGeoJSON(data)) {
          resolve({
            success: false,
            error: 'Invalid GeoJSON format. Please ensure the file contains valid GeoJSON data.'
          });
          return;
        }

        // Normalize to FeatureCollection using shared utility
        const featureCollection = convertToGeoJSON(data);

        // Additional validation - ensure we have at least one feature
        if (!featureCollection.features || featureCollection.features.length === 0) {
          resolve({
            success: false,
            error: 'No features found in GeoJSON file.'
          });
          return;
        }

        resolve({
          success: true,
          data: featureCollection
        });
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error 
            ? `Failed to parse file: ${error.message}`
            : 'Failed to parse file. Please ensure it contains valid JSON.'
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to read file. Please try again.'
      });
    };

    reader.readAsText(file);
  });
};

/**
 * Validates that a FeatureCollection contains valid geometries for mapping (optimized)
 */
export const validateGeometryForMapping = (featureCollection: FeatureCollection): {
  valid: boolean;
  error?: string;
} => {
  const { features } = featureCollection;

  if (!features || features.length === 0) {
    return {
      valid: false,
      error: 'No features found in the uploaded file.'
    };
  }

  // Quick validation - check only if geometry exists and has type
  // Don't iterate through all coordinate arrays for performance
  let invalidCount = 0;
  for (let i = 0; i < features.length; i++) {
    const { geometry } = features[i];
    if (!geometry || !geometry.type) {
      invalidCount++;
      // Early exit if we find too many invalid features
      if (invalidCount > 10) break;
    }
  }

  if (invalidCount > 0) {
    return {
      valid: false,
      error: invalidCount > 10 
        ? `Found more than 10 features with invalid or missing geometry.`
        : `Found ${invalidCount} feature(s) with invalid or missing geometry.`
    };
  }

  return { valid: true };
};
