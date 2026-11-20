import { useCallback } from "react";
import type { RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { LocationResult } from "../MapControls/utils/location-search";
import { MapViewport } from "./types";

// Function to navigate to a location
export const navigateToLocation = (
  mapRef: RefObject<MapRef>,
  viewport: MapViewport,
  onViewportChange: (v: MapViewport) => void,
  onLocationSelect?: (l: LocationResult) => void
) =>
  useCallback(
    (location: LocationResult) => {
      const { coordinates, bbox } = location;

      if (bbox) {
        // If we have bounding box, fit to bounds with padding
        const { north, south, east, west } = bbox;
        mapRef.current?.fitBounds(
          [
            [west, south],
            [east, north],
          ],
          {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            duration: 1000,
          },
        );
      } else {
        // Otherwise, fly to coordinates with appropriate zoom
        const newViewport: MapViewport = {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          zoom: 12, // Good zoom level for city/location view
          pitch: viewport.pitch,
          bearing: viewport.bearing,
        };

        onViewportChange(newViewport);

        // Also use flyTo for smooth animation
        mapRef.current?.flyTo({
          center: [coordinates.longitude, coordinates.latitude],
          zoom: 12,
          duration: 1000,
        });
      }

      onLocationSelect?.(location);
    },
    [viewport.pitch, viewport.bearing, onViewportChange, onLocationSelect],
  );

export const useMapLoadHandler = (mapRef: RefObject<MapRef>) =>
  useCallback(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      // Ensure boxZoom is available and initially disabled
      if (map.boxZoom) {
        map.boxZoom.disable();
      } else {
        console.warn("BoxZoom handler not available on this map instance");
      }
    }
  }, []);
