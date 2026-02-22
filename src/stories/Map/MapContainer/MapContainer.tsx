import * as React from "react";
import {
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Map, {
  MapRef,
  ViewState,
  MapEvent,
  Source,
  Layer,
} from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";

import "maplibre-gl/dist/maplibre-gl.css";
import "./map-container.scss";
import MapControls from "../MapControls";
import { type BasemapType } from "../MapControls/utils/basemap-layer/types";
import {
  type AreaOfInterestType,
  type PolygonPoint,
  pointsToPolygon,
  isValidPolygon,
} from "../MapControls/utils/area-of-interest";
import { handleMapLoad, navigateToLocation } from "./utils";
import { MapContainerProps, MapViewport, DEFAULT_VIEWPORT } from "./types";
import { getBoundsFromCoordinates, calculateViewportFromBounds } from "./viewport-utils";
import { getGeoJSONBounds } from "../MapControls/utils/geojson-layer";
import { loadCOG } from "./geotiffUtils";
import MapLegend from "../MapControls/mapLegend";
import AreaOfInterestControls from "../MapControls/AreaOfInterestControls";

//TO DO: Validate that these imports are still needed
// Re-export the AreaOfInterest type for backwards compatibility
export type AreaOfInterest = AreaOfInterestType;

// Available basemap styles - all using string URLs for online services
const BASEMAP_STYLES = {
  outdoors: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  satellite:
    "https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
};

const DEFAULT_MAP_STYLE = BASEMAP_STYLES.light;

export const MapContainer: React.FC<MapContainerProps> = ({
  viewport = DEFAULT_VIEWPORT,
  onViewportChange,
  onAreaSelect,
  onAOIToggle,
  onApplyAOI,
  aoiResetKey,
  collapsed = false,
  className = "",
  aoiList = [],
  onLoadAOIs,
  isLoadingAOIs = false,
  children,
  mapStyle = DEFAULT_MAP_STYLE,
  areaSelectionActive = false,
  selectedArea = null,
  onBasemapChange,
  onLocationSelect,
  geoJsonData = null,
  geocodeAOI = null,
  cogInfo = null,
}) => {
  const mapRef = useRef<MapRef>(null);
  const [currentBasemap, setCurrentBasemap] = useState<BasemapType>("light");
  const [currentMapStyle, setCurrentMapStyle] = useState(mapStyle);
  const [marqueeZoomActive, setMarqueeZoomActive] = useState(false);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<PolygonPoint[]>([]);
  const [internalAOIActive, setInternalAOIActive] = useState(false);
  const [isCreateNewMode, setIsCreateNewMode] = useState(true);
  const [cogSource, setCogSource] = useState<any>(null);
  const [cogError, setCogError] = useState<string | null>(null);
  const [cogLoading, setCogLoading] = useState(false);
  const [cogDataRange, setCogDataRange] = useState<{
    min: number;
    max: number;
  } | null>(null);
  const [cogVisible, setCogVisible] = useState(true);
  const [uploadedGeoJSON, setUploadedGeoJSON] = useState<FeatureCollection | null>(null);

  // Use external AOI state if provided, otherwise use internal state
  const effectiveAOIActive = areaSelectionActive || internalAOIActive;

  // Handle AOI toggle - use external callback if provided, otherwise toggle internal state
  const handleAOIToggle = useCallback(() => {
    // Clear uploaded GeoJSON when AOI panel is closed (Cancel clicked)
    setUploadedGeoJSON(null);
    
    if (onAOIToggle) {
      onAOIToggle();
    } else {
      setInternalAOIActive((prev) => !prev);
    }
  }, [onAOIToggle, internalAOIActive]);

  // Handle tab change in AreaOfInterestControls
  const handleTabChange = useCallback((isCreateNew: boolean) => {
    setIsCreateNewMode(isCreateNew);
    // When switching to "Choose Existing", stop and prevent drawing
    if (!isCreateNew) {
      setIsDrawingPolygon(false);
      setPolygonPoints([]);
    } else {
      // When switching back to "Create New", clear uploaded GeoJSON
      setUploadedGeoJSON(null);
    }
  }, []);

  // Handle GeoJSON upload from AreaOfInterestControls
  const handleGeoJSONUpload = useCallback((data: FeatureCollection, fileName: string) => {
    // console.log(`GeoJSON uploaded: ${fileName} with ${data.features.length} feature(s)`);
    
    // Store the full FeatureCollection for preview rendering
    // Will be finalized when user clicks Apply
    setUploadedGeoJSON(data);
  }, []);

  // Center map viewport when uploadedGeoJSON changes
  useEffect(() => {
    if (!uploadedGeoJSON) return;

    console.log('Centering map on uploaded GeoJSON with', uploadedGeoJSON.features.length, 'features');

    // Calculate bounds using consolidated utility
    const bounds = getGeoJSONBounds(uploadedGeoJSON);
    
    if (!bounds) {
      console.warn('Could not calculate bounds from uploaded GeoJSON');
      return;
    }

    const [minLng, minLat, maxLng, maxLat] = bounds;
    
    // console.log('Bounds calculated:', {
    //   southwest: [minLng, minLat],
    //   northeast: [maxLng, maxLat],
    //   center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2]
    // });

    // Use consolidated viewport calculation utility
    const newViewport = calculateViewportFromBounds(bounds, {
      minZoom: 4,
      maxZoom: 12,
      preserveOrientation: false,
    });

    console.log('Updating viewport to:', newViewport);
    onViewportChange(newViewport);
  }, [uploadedGeoJSON, onViewportChange]);

  // Clear uploaded GeoJSON when AOI is reset
  useEffect(() => {
    setUploadedGeoJSON(null);
  }, [aoiResetKey]);

  // Handle mutual exclusivity: disable marquee zoom when AOI becomes active
  useEffect(() => {
    if (effectiveAOIActive && marqueeZoomActive && mapRef.current) {
      const map = mapRef.current.getMap();
      if (map.boxZoom) {
        try {
          map.boxZoom.disable();
          setMarqueeZoomActive(false);
        } catch (error) {
          console.error("Error disabling box zoom:", error);
        }
      }
    }
  }, [effectiveAOIActive, marqueeZoomActive]);

  // Function to switch basemap
  const switchBasemap = useCallback(
    (basemapType: BasemapType) => {
      const newStyle = BASEMAP_STYLES[basemapType];
      setCurrentBasemap(basemapType);
      setCurrentMapStyle(newStyle);
      onBasemapChange?.(basemapType);
    },
    [onBasemapChange]
  );

  // Function to toggle COG layer visibility
  const handleCogToggle = useCallback(() => {
    setCogVisible((prev) => !prev);
  }, []);

  // Function to toggle marquee zoom mode
  const handleMarqueeZoom = useCallback(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();

      if (!map.boxZoom) {
        console.error("BoxZoom handler is not available on this map instance");
        return;
      }

      if (marqueeZoomActive) {
        // Disable box zoom
        try {
          map.boxZoom.disable();
          setMarqueeZoomActive(false);
        } catch (error) {
          console.error("Error disabling box zoom:", error);
        }
      } else {
        // Disable AOI drawing when enabling marquee zoom
        if (effectiveAOIActive) {
          if (onAOIToggle) {
            onAOIToggle(); // This should disable external AOI
          }
          setInternalAOIActive(false); // Disable internal AOI
          setIsDrawingPolygon(false);
          setPolygonPoints([]);
        }

        // Enable box zoom
        try {
          map.boxZoom.enable();
          setMarqueeZoomActive(true);
        } catch (error) {
          console.error("Error enabling box zoom:", error);
        }
      }
    } else {
      console.warn("Map reference is not available");
    }
  }, [marqueeZoomActive, effectiveAOIActive, onAOIToggle]);

  // Handle map load to ensure boxZoom is available

  // Complete polygon drawing
  const completePolygon = useCallback(() => {
    if (polygonPoints.length >= 3 && onAreaSelect) {
      const area = pointsToPolygon(polygonPoints);
      onAreaSelect(area);
    }
    setIsDrawingPolygon(false);
    setPolygonPoints([]);
  }, [polygonPoints, onAreaSelect]);

  // Cancel polygon drawing
  const cancelPolygon = useCallback(() => {
    setIsDrawingPolygon(false);
    setPolygonPoints([]);
  }, []);

  // Handle keyboard shortcuts for polygon drawing
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!effectiveAOIActive || marqueeZoomActive) return;

      switch (event.key) {
        case "Enter":
          event.preventDefault();
          if (isDrawingPolygon && isValidPolygon(polygonPoints)) {
            completePolygon();
          }
          break;
        case "Escape":
          event.preventDefault();
          if (isDrawingPolygon) {
            cancelPolygon();
          }
          break;
      }
    },
    [
      effectiveAOIActive,
      marqueeZoomActive,
      isDrawingPolygon,
      polygonPoints,
      completePolygon,
      cancelPolygon,
    ]
  );

  // Handle keyboard events for polygon drawing
  useEffect(() => {
    if (effectiveAOIActive && !marqueeZoomActive) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [effectiveAOIActive, marqueeZoomActive, handleKeyDown]);

  // Reset polygon drawing when area selection is deactivated
  useEffect(() => {
    if (!effectiveAOIActive && isDrawingPolygon) {
      cancelPolygon();
    }
  }, [effectiveAOIActive, isDrawingPolygon, cancelPolygon]);

  // Convert viewport to ViewState format for react-map-gl
  const viewState: ViewState = useMemo(
    () => ({
      longitude: viewport.longitude,
      latitude: viewport.latitude,
      zoom: viewport.zoom,
      pitch: viewport.pitch,
      bearing: viewport.bearing,
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
    }),
    [viewport]
  );
  const onZoomOut = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom(); // Get the current zoom level
      const minZoom = mapRef.current.getMinZoom(); // Get the minimum zoom level
      if (currentZoom > minZoom) {
        mapRef.current.setZoom(currentZoom - 1); // Decrease zoom level by 1
      }
    }
  };
  const onZoomIn = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom(); // Get the current zoom level
      const minZoom = mapRef.current.getMinZoom(); // Get the minimum zoom level
      if (currentZoom > minZoom) {
        mapRef.current.setZoom(currentZoom + 1); // Decrease zoom level by 1
      }
    }
  };
  // Handle viewport changes from map interactions
  const handleMove = useCallback(
    (evt: any) => {
      const newViewport: MapViewport = {
        latitude: evt.viewState.latitude,
        longitude: evt.viewState.longitude,
        zoom: evt.viewState.zoom,
        pitch: evt.viewState.pitch || 0,
        bearing: evt.viewState.bearing || 0,
      };
      onViewportChange(newViewport);
    },
    [onViewportChange]
  );

  // Handle map click events (for area selection and polygon drawing)
  const handleClick = useCallback(
    (evt: MapEvent) => {
      // Skip polygon drawing if marquee zoom is active
      if (marqueeZoomActive) {
        return;
      }

      // Skip polygon drawing if in "Choose Existing" mode
      if (!isCreateNewMode) {
        return;
      }

      if (effectiveAOIActive && onAreaSelect) {
        const { lng, lat } = (evt as any).lngLat || { lng: 0, lat: 0 };

        if (isDrawingPolygon) {
          // Add point to polygon
          const newPoint: PolygonPoint = { lng, lat };
          setPolygonPoints((prev) => [...prev, newPoint]);
        } else {
          // Start drawing polygon
          setIsDrawingPolygon(true);
          const startPoint: PolygonPoint = { lng, lat };
          setPolygonPoints([startPoint]);
        }
      }
    },
    [marqueeZoomActive, effectiveAOIActive, onAreaSelect, isDrawingPolygon, isCreateNewMode]
  );
  useEffect(() => {
    if (!cogInfo?.url) {
      // Clear COG-related state when cogInfo is cleared (e.g., new chat started)
      setCogSource(null);
      setCogDataRange(null);
      setCogError(null);
      setCogLoading(false);
      return;
    }

    const cancelledRef = { current: false };
    const colorScheme = cogInfo.legend?.color_scheme || "inferno";
    const legendMin = cogInfo.legend?.min_value ?? undefined;
    const legendMax = cogInfo.legend?.max_value ?? undefined;

    loadCOG(
      cogInfo.url,
      viewport,
      setCogLoading,
      setCogError,
      onViewportChange,
      setCogSource,
      cancelledRef,
      setCogDataRange,
      colorScheme,
      legendMin,
      legendMax
    );

    return () => {
      cancelledRef.current = true;
    };
  }, [cogInfo?.url, cogInfo?.legend?.color_scheme]);

  // Compute CSS classes - combining USWDS utilities with custom classes
  const containerClasses = [
    "map-container",
    "position-relative",
    "width-full",
    "height-full",
    "bg-base-lightest",
    "radius-md",
    "overflow-hidden",
    collapsed ? "map-container--collapsed" : "map-container--expanded",
    areaSelectionActive ? "map-container--selection-active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Create GeoJSON for current polygon being drawn
  const currentPolygonGeoJSON = useMemo(() => {
    if (polygonPoints.length < 2) return null;

    return {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "LineString" as const,
            coordinates: polygonPoints.map((point) => [point.lng, point.lat]),
          },
        },
      ],
    };
  }, [polygonPoints]);

  // Create GeoJSON for polygon points
  const polygonPointsGeoJSON = useMemo(() => {
    if (polygonPoints.length === 0) return null;

    return {
      type: "FeatureCollection" as const,
      features: polygonPoints.map((point, index) => ({
        type: "Feature" as const,
        properties: { isFirst: index === 0 },
        geometry: {
          type: "Point" as const,
          coordinates: [point.lng, point.lat],
        },
      })),
    };
  }, [polygonPoints]);

  // Create GeoJSON for completed selected area
  const selectedAreaGeoJSON = useMemo(() => {
    if (
      !selectedArea ||
      !selectedArea.coordinates ||
      selectedArea.coordinates.length === 0
    )
      return null;

    return {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "Polygon" as const,
            coordinates: selectedArea.coordinates,
          },
        },
      ],
    };
  }, [selectedArea]);

  return (
    <div className={containerClasses}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleMove}
        onClick={handleClick}
        onLoad={handleMapLoad(mapRef)}
        style={{ width: "100%", height: "100%" }}
        mapStyle={currentMapStyle}
        attributionControl={false}
      >
        {/* Polygon drawing visualization */}
        {currentPolygonGeoJSON && (
          <Source
            id="current-polygon"
            type="geojson"
            data={currentPolygonGeoJSON}
          >
            <Layer
              id="current-polygon-line"
              type="line"
              paint={{
                "line-color": "#FACE00",
                "line-width": 3,
                "line-dasharray": [2, 2],
              }}
            />
          </Source>
        )}

        {cogSource && (
          <>
            <Source id="cog-source" {...cogSource} />
            <Layer
              id="cog-layer"
              type="raster"
              source="cog-source"
              paint={{
                "raster-opacity": cogVisible ? 1 : 0,
                "raster-fade-duration": 0,
              }}
            />
          </>
        )}

        {/* Polygon points visualization */}
        {polygonPointsGeoJSON && (
          <Source
            id="polygon-points"
            type="geojson"
            data={polygonPointsGeoJSON}
          >
            <Layer
              id="polygon-points-circle"
              type="circle"
              paint={{
                "circle-radius": ["case", ["get", "isFirst"], 6, 4],
                "circle-color": [
                  "case",
                  ["get", "isFirst"],
                  "#FF8C00",
                  "#FACE00",
                ],
                "circle-stroke-color": "#FFFFFF",
                "circle-stroke-width": 2,
              }}
            />
          </Source>
        )}

        {/* Completed selected area visualization */}
        {selectedAreaGeoJSON && (
          <Source id="selected-area" type="geojson" data={selectedAreaGeoJSON}>
            <Layer
              id="selected-area-fill"
              type="fill"
              paint={{
                "fill-color": "#0050D8",
                "fill-opacity": 0.2,
              }}
            />
            <Layer
              id="selected-area-outline"
              type="line"
              paint={{
                "line-color": "#0050D8",
                "line-width": 3,
              }}
            />
          </Source>
        )}

        {/* GeoJSON data from GeocodedAOI responses - hide when COG is displayed */}
        {geoJsonData && !cogSource && (
          <Source id="geocoded-aoi" type="geojson" data={geoJsonData}>
            <Layer
              id="geocoded-aoi-fill"
              type="fill"
              paint={{
                "fill-color": "#0050D8",
                "fill-opacity": 0.25,
              }}
              filter={["==", ["geometry-type"], "Polygon"]}
            />
            <Layer
              id="geocoded-aoi-line"
              type="line"
              paint={{
                "line-color": "#0050D8",
                "line-width": 3,
              }}
              filter={[
                "in",
                ["geometry-type"],
                ["literal", ["Polygon", "LineString"]],
              ]}
            />
            <Layer
              id="geocoded-aoi-point"
              type="circle"
              paint={{
                "circle-radius": 4,
                "circle-color": "#0050D8",
                "circle-stroke-color": "#FFFFFF",
                "circle-stroke-width": 2,
              }}
              filter={["==", ["geometry-type"], "Point"]}
            />
          </Source>
        )}

        {/* Uploaded GeoJSON from file upload */}
        {uploadedGeoJSON && (
          <Source id="uploaded-aoi" type="geojson" data={uploadedGeoJSON}>
            <Layer
              id="uploaded-aoi-fill"
              type="fill"
              paint={{
                "fill-color": "#0050D8",
                "fill-opacity": 0.3,
              }}
              filter={["==", ["geometry-type"], "Polygon"]}
            />
            <Layer
              id="uploaded-aoi-line"
              type="line"
              paint={{
                "line-color": "#0050D8",
                "line-width": 3,
              }}
              filter={[
                "in",
                ["geometry-type"],
                ["literal", ["Polygon", "LineString"]],
              ]}
            />
            <Layer
              id="uploaded-aoi-point"
              type="circle"
              paint={{
                "circle-radius": 4,
                "circle-color": "#0050D8",
                "circle-stroke-color": "#FFFFFF",
                "circle-stroke-width": 2,
              }}
              filter={["==", ["geometry-type"], "Point"]}
            />
          </Source>
        )}
      </Map>
      <MapControls
        onZoomOut={onZoomOut}
        onZoomIn={onZoomIn}
        onMarqueeZoom={handleMarqueeZoom}
        marqueeZoomActive={marqueeZoomActive}
        aoiActive={effectiveAOIActive}
        onAOIToggle={handleAOIToggle}
        selectedBasemap={currentBasemap}
        onBasemapChange={switchBasemap}
        onLocationSelect={navigateToLocation(
          mapRef,
          viewport,
          onViewportChange,
          onLocationSelect
        )}
        onCogToggle={handleCogToggle}
        cogVisible={cogVisible}
        hasCogLayer={!!cogSource}
      />

      <AreaOfInterestControls
        isOpen={effectiveAOIActive}
        onCancel={handleAOIToggle}
        aoiList={aoiList}
        onLoadAOIs={onLoadAOIs}
        isLoadingAOIs={isLoadingAOIs}
        onTabChange={handleTabChange}
        onApply={(aoiName, isNewAOI, file) => {
          // If there's an uploaded GeoJSON, finalize it by converting to AreaOfInterest
          if (uploadedGeoJSON) {
            const polygonFeature = uploadedGeoJSON.features.find(
              (f) => f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon'
            );
            
            if (polygonFeature && polygonFeature.geometry) {
              const geometry = polygonFeature.geometry;
              let coordinates: number[][][];
              
              if (geometry.type === 'Polygon') {
                coordinates = geometry.coordinates;
              } else if (geometry.type === 'MultiPolygon') {
                // Use the first polygon from MultiPolygon
                coordinates = geometry.coordinates[0];
              } else {
                console.error('No valid polygon geometry found');
                return;
              }
              
              // Create AreaOfInterest object with the provided name
              const areaOfInterest: AreaOfInterestType = {
                type: 'Polygon',
                coordinates,
                name: aoiName,
              };
              
              // Finalize as selected area
              onAreaSelect?.(areaOfInterest);
            }
          }
          
          // Pass the uploaded GeoJSON to onApplyAOI if available
          onApplyAOI?.(aoiName, isNewAOI, file, uploadedGeoJSON || undefined);
        }}
        onGeoJSONUpload={handleGeoJSONUpload}
        hasDrawnArea={selectedArea !== null || uploadedGeoJSON !== null}
      />

      {cogSource && cogInfo?.legend && (
        <MapLegend
          title={cogInfo.legend.label}
          content={{
            type: "gradient",
            colorScheme: cogInfo.legend.color_scheme || "inferno",
            minValue: cogDataRange?.min ?? cogInfo.legend.min_value ?? 0,
            maxValue: cogDataRange?.max ?? cogInfo.legend.max_value ?? 1,
            units: cogInfo.legend.units || undefined,
          }}
          defaultOpen={true}
          onCogToggle={handleCogToggle}
          cogVisible={cogVisible}
          hasCogLayer={!!cogSource}
        />
      )}
      {/* Custom attribution */}
      <div className="map-container__attribution bg-white bg-opacity-90 text-base-dark font-mono-2xs padding-x-1 padding-y-05 radius-sm border-1px border-base-light">
        <span className="font-family-inherit font-weight-400">
          © NOAA | MapLibre GL JS | OpenStreetMap contributors
        </span>
      </div>

      {/* Render GeoJSON AOI for testing if provided */}
      {geocodeAOI && (
        <div data-testid="geojson-layer" style={{ display: "none" }}>
          {JSON.stringify(geocodeAOI)}
        </div>
      )}

      {/* Area selection indicator */}
      {effectiveAOIActive && !isDrawingPolygon && isCreateNewMode && (
        <div className="map-container__selection-hint bg-primary text-white padding-1 padding-x-2 radius-md font-body-sm font-weight-500 shadow-2">
          Click on the map to start drawing a polygon
        </div>
      )}

      {/* Polygon drawing indicator */}
      {isDrawingPolygon && (
        <div className="map-container__polygon-hint bg-success text-white padding-1 padding-x-2 radius-md font-body-xs font-weight-500 shadow-2">
          Click to add points • Press Enter to complete • Press Escape to cancel
          {polygonPoints.length > 0 && (
            <span className="display-block font-mono-2xs margin-top-05">
              {polygonPoints.length} point
              {polygonPoints.length !== 1 ? "s" : ""}
              {polygonPoints.length >= 3
                ? " (ready to complete)"
                : ` (need ${3 - polygonPoints.length} more)`}
            </span>
          )}
        </div>
      )}

      {/* Marquee zoom indicator */}
      {marqueeZoomActive && (
        <div className="map-container__marquee-hint text-white padding-1 padding-x-2 radius-md font-body-sm font-weight-500 shadow-2">
          Hold Shift + drag to select area to zoom into
        </div>
      )}
    </div>
  );
};

// Export the basemap switching utility function for external use
export const getBasemapStyle = (basemapType: BasemapType): string => {
  return BASEMAP_STYLES[basemapType];
};

// Export available basemap types for reference
export const getAvailableBasemaps = (): BasemapType[] => {
  return Object.keys(BASEMAP_STYLES) as BasemapType[];
};

export default MapContainer;
