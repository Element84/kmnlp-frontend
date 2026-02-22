import { describe, it, expect } from "vitest";
import {
  calculateViewportFromBounds,
  getBoundsFromCoordinates,
  calculateViewportFromCOG,
  type BoundingBox,
} from "./viewport-utils";
import type { MapViewport } from "./types";

describe("viewport-utils", () => {
  describe("getBoundsFromCoordinates", () => {
    it("should extract bounds from COG corner coordinates", () => {
      // COG corners: [top-left, top-right, bottom-right, bottom-left]
      const cogCorners: Array<[number, number]> = [
        [-95, 30],
        [-85, 30],
        [-85, 20],
        [-95, 20],
      ];

      const bounds = getBoundsFromCoordinates(cogCorners);

      expect(bounds).toEqual([-95, 20, -85, 30]);
    });

    it("should handle single coordinate", () => {
      const coords: Array<[number, number]> = [[-90, 25]];

      const bounds = getBoundsFromCoordinates(coords);

      expect(bounds).toEqual([-90, 25, -90, 25]);
    });

    it("should throw error for empty coordinates", () => {
      expect(() => getBoundsFromCoordinates([])).toThrow(
        "Cannot calculate bounds from empty coordinate array"
      );
    });
  });

  describe("calculateViewportFromBounds", () => {
    it("should calculate center and zoom from bounds", () => {
      const bounds: BoundingBox = [-95, 20, -85, 30];

      const viewport = calculateViewportFromBounds(bounds);

      // Center should be midpoint
      expect(viewport.latitude).toBe(25);
      expect(viewport.longitude).toBe(-90);

      // Zoom should be calculated from extent
      // maxRange = 10, zoom = 12 - log2(10 * 10) = 12 - log2(100) ≈ 5.36
      expect(viewport.zoom).toBeCloseTo(5.36, 1);

      // Default orientation
      expect(viewport.pitch).toBe(0);
      expect(viewport.bearing).toBe(0);
    });

    it("should preserve orientation when requested", () => {
      const bounds: BoundingBox = [-95, 20, -85, 30];
      const currentViewport: MapViewport = {
        latitude: 0,
        longitude: 0,
        zoom: 5,
        pitch: 45,
        bearing: 90,
      };

      const viewport = calculateViewportFromBounds(bounds, {
        currentViewport,
        preserveOrientation: true,
      });

      expect(viewport.pitch).toBe(45);
      expect(viewport.bearing).toBe(90);
    });

    it("should respect min/max zoom constraints", () => {
      const bounds: BoundingBox = [-95, 20, -85, 30];

      const viewportMin = calculateViewportFromBounds(bounds, {
        minZoom: 10,
        maxZoom: 18,
      });

      expect(viewportMin.zoom).toBeGreaterThanOrEqual(10);
      expect(viewportMin.zoom).toBeLessThanOrEqual(18);
    });

    it("should apply zoom offset", () => {
      const bounds: BoundingBox = [-95, 20, -85, 30];

      const baseViewport = calculateViewportFromBounds(bounds);
      const zoomedInViewport = calculateViewportFromBounds(bounds, {
        zoomOffset: 2,
      });
      const zoomedOutViewport = calculateViewportFromBounds(bounds, {
        zoomOffset: -2,
      });

      expect(zoomedInViewport.zoom).toBeCloseTo(baseViewport.zoom + 2, 1);
      expect(zoomedOutViewport.zoom).toBeCloseTo(baseViewport.zoom - 2, 1);
    });

    it("should round zoom when requested", () => {
      const bounds: BoundingBox = [-95, 20, -85, 30];

      const viewport = calculateViewportFromBounds(bounds, {
        roundZoom: true,
      });

      // Zoom should be rounded to nearest 0.5
      expect(viewport.zoom % 0.5).toBe(0);
    });

    it("should handle very small extents (zoom in)", () => {
      const bounds: BoundingBox = [-90.1, 24.9, -89.9, 25.1];

      const viewport = calculateViewportFromBounds(bounds, {
        maxZoom: 18,
      });

      // Should zoom in for small extent
      expect(viewport.zoom).toBeGreaterThan(10);
    });

    it("should handle very large extents (zoom out)", () => {
      const bounds: BoundingBox = [-180, -80, 180, 80];

      const viewport = calculateViewportFromBounds(bounds, {
        minZoom: 1,
      });

      // Should zoom out for large extent
      expect(viewport.zoom).toBeLessThan(3);
    });
  });

  describe("calculateViewportFromCOG", () => {
    it("should calculate viewport from COG corner coordinates", () => {
      // COG corners: [top-left, top-right, bottom-right, bottom-left]
      const cogCorners: Array<[number, number]> = [
        [-95, 30],
        [-85, 30],
        [-85, 20],
        [-95, 20],
      ];

      const viewport = calculateViewportFromCOG(cogCorners);

      expect(viewport.latitude).toBe(25);
      expect(viewport.longitude).toBe(-90);
      expect(viewport.zoom).toBeCloseTo(5.36, 1);
    });

    it("should pass options to underlying bounds calculation", () => {
      const cogCorners: Array<[number, number]> = [
        [-95, 30],
        [-85, 30],
        [-85, 20],
        [-95, 20],
      ];
      const currentViewport: MapViewport = {
        latitude: 0,
        longitude: 0,
        zoom: 5,
        pitch: 30,
        bearing: 45,
      };

      const viewport = calculateViewportFromCOG(cogCorners, {
        currentViewport,
        preserveOrientation: true,
        minZoom: 4,
        maxZoom: 12,
      });

      expect(viewport.pitch).toBe(30);
      expect(viewport.bearing).toBe(45);
      expect(viewport.zoom).toBeGreaterThanOrEqual(4);
      expect(viewport.zoom).toBeLessThanOrEqual(12);
    });
  });

  describe("zoom calculation consistency", () => {
    it("should produce same zoom for same extent regardless of location", () => {
      const bounds1: BoundingBox = [-95, 20, -85, 30];
      const bounds2: BoundingBox = [5, 40, 15, 50];

      const viewport1 = calculateViewportFromBounds(bounds1);
      const viewport2 = calculateViewportFromBounds(bounds2);

      // Same extent (10x10 degrees) should produce same zoom
      expect(viewport1.zoom).toBeCloseTo(viewport2.zoom, 2);
    });

    it("should produce higher zoom for smaller extents", () => {
      const largeBounds: BoundingBox = [-100, 20, -80, 40];
      const smallBounds: BoundingBox = [-95, 24, -85, 26];

      const largeViewport = calculateViewportFromBounds(largeBounds);
      const smallViewport = calculateViewportFromBounds(smallBounds);

      expect(smallViewport.zoom).toBeGreaterThan(largeViewport.zoom);
    });
  });
});
