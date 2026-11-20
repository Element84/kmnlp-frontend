import { describe, it, expect } from 'vitest';
import { isValidFileType, isValidFileSize, validateGeometryForMapping, parseGeoJSONFile } from './upload-geojson';
import type { FeatureCollection, Geometry } from 'geojson';

describe('upload-geojson utilities', () => {
  describe('isValidFileType', () => {
    it('should accept .geojson files', () => {
      const file = new File(['{}'], 'test.geojson', { type: 'application/json' });
      expect(isValidFileType(file)).toBe(true);
    });

    it('should accept .json files', () => {
      const file = new File(['{}'], 'test.json', { type: 'application/json' });
      expect(isValidFileType(file)).toBe(true);
    });

    it('should accept files with application/geo+json mime type', () => {
      const file = new File(['{}'], 'test.geojson', { type: 'application/geo+json' });
      expect(isValidFileType(file)).toBe(true);
    });

    it('should reject .txt files', () => {
      const file = new File(['{}'], 'test.txt', { type: 'text/plain' });
      expect(isValidFileType(file)).toBe(false);
    });

    it('should reject .csv files', () => {
      const file = new File(['{}'], 'test.csv', { type: 'text/csv' });
      expect(isValidFileType(file)).toBe(false);
    });

    it('should be case-insensitive for extensions', () => {
      const file = new File(['{}'], 'test.GeoJSON', { type: 'application/json' });
      expect(isValidFileType(file)).toBe(true);
    });
  });

  describe('isValidFileSize', () => {
    it('should accept files under 10MB', () => {
      const smallContent = 'a'.repeat(1024); // 1KB
      const file = new File([smallContent], 'test.geojson', { type: 'application/json' });
      const result = isValidFileSize(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files over 10MB', () => {
      // Create a file with size > 10MB
      const largeContent = 'a'.repeat(11 * 1024 * 1024); // 11MB
      const file = new File([largeContent], 'large.geojson', { type: 'application/json' });
      const result = isValidFileSize(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
    });
  });

  describe('validateGeometryForMapping', () => {
    it('should accept valid FeatureCollection with features', () => {
      const fc: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [0, 0]
            },
            properties: {}
          }
        ]
      };
      const result = validateGeometryForMapping(fc);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject FeatureCollection with no features', () => {
      const fc: FeatureCollection = {
        type: 'FeatureCollection',
        features: []
      };
      const result = validateGeometryForMapping(fc);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject features with null geometry', () => {
      const fc: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: null as unknown as Geometry,
            properties: {}
          }
        ]
      };
      const result = validateGeometryForMapping(fc);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('invalid or missing geometry');
    });
  });

  describe('parseGeoJSONFile', () => {
    it('should parse valid FeatureCollection', async () => {
      const validGeoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-122.4, 37.8]
            },
            properties: { name: 'San Francisco' }
          }
        ]
      };
      const file = new File(
        [JSON.stringify(validGeoJSON)],
        'test.geojson',
        { type: 'application/json' }
      );

      const result = await parseGeoJSONFile(file);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.features).toHaveLength(1);
    });

    it('should reject invalid file type', async () => {
      const file = new File(['{}'], 'test.txt', { type: 'text/plain' });
      const result = await parseGeoJSONFile(file);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should reject invalid JSON', async () => {
      const file = new File(
        ['not valid json'],
        'test.geojson',
        { type: 'application/json' }
      );
      const result = await parseGeoJSONFile(file);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to parse');
    });

    it('should normalize single Feature to FeatureCollection', async () => {
      const singleFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-122.4, 37.8]
        },
        properties: {}
      };
      const file = new File(
        [JSON.stringify(singleFeature)],
        'test.geojson',
        { type: 'application/json' }
      );

      const result = await parseGeoJSONFile(file);
      expect(result.success).toBe(true);
      expect(result.data?.type).toBe('FeatureCollection');
      expect(result.data?.features).toHaveLength(1);
    });

    it('should normalize raw Geometry to FeatureCollection', async () => {
      const geometry = {
        type: 'Polygon',
        coordinates: [
          [
            [-122.4, 37.8],
            [-122.5, 37.8],
            [-122.5, 37.9],
            [-122.4, 37.9],
            [-122.4, 37.8]
          ]
        ]
      };
      const file = new File(
        [JSON.stringify(geometry)],
        'test.geojson',
        { type: 'application/json' }
      );

      const result = await parseGeoJSONFile(file);
      expect(result.success).toBe(true);
      expect(result.data?.type).toBe('FeatureCollection');
      expect(result.data?.features).toHaveLength(1);
      expect(result.data?.features[0].geometry.type).toBe('Polygon');
    });

    it('should reject GeoJSON with no features', async () => {
      const emptyFC = {
        type: 'FeatureCollection',
        features: []
      };
      const file = new File(
        [JSON.stringify(emptyFC)],
        'test.geojson',
        { type: 'application/json' }
      );

      const result = await parseGeoJSONFile(file);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No features found');
    });

    it('should reject non-GeoJSON objects', async () => {
      const notGeoJSON = {
        data: 'some data',
        values: [1, 2, 3]
      };
      const file = new File(
        [JSON.stringify(notGeoJSON)],
        'test.geojson',
        { type: 'application/json' }
      );

      const result = await parseGeoJSONFile(file);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid GeoJSON format');
    });
  });
});
