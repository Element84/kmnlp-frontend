import * as React from "react";
import { useRef, useCallback, useMemo, useState, useEffect } from "react";
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
import { useMapLoadHandler, navigateToLocation } from "./utils";
import {
  MapContainerProps,
  MapViewport,
  CogInfo,
  DEFAULT_VIEWPORT,
} from "./types";
import { calculateViewportFromBounds } from "./viewport-utils";
import { getGeoJSONBounds } from "../MapControls/utils/geojson-layer";
import { loadCOG } from "./geotiffUtils";
import { apiClient } from "../../../services/api-client";
import MapLayerControl, {
  type MapLayerControlLayer,
} from "../MapControls/mapLayerControl";
import AreaOfInterestControls from "../MapControls/AreaOfInterestControls";

//TO DO: Validate that these imports are still needed
// Re-export the AreaOfInterest type for backwards compatibility
export type AreaOfInterest = AreaOfInterestType;
export type { MapViewport } from "./types";

// Available basemap styles - all using string URLs for online services
const BASEMAP_STYLES = {
  outdoors: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  satellite:
    "https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
};

const DEFAULT_MAP_STYLE = BASEMAP_STYLES.light;

// Default categorical palette for distinguishing GeoJSON layers. Colors are
// assigned by layer order and wrap around if there are more layers than colors.
const GEOJSON_LAYER_PALETTE = [
  "#0050D8", // blue
  "#E52207", // red
  "#00A91C", // green
  "#FF7900", // orange
  "#8168B3", // purple
  "#02BFE7", // cyan
  "#C05600", // brown
  "#AB2165", // magenta
];

const EMPTY_COG_INFOS: CogInfo[] = [];

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
  mapStyle = DEFAULT_MAP_STYLE,
  areaSelectionActive = false,
  selectedArea = null,
  onBasemapChange,
  onLocationSelect,
  geoJsonLayers = [],
  geocodeAOI = null,
  cogInfos = EMPTY_COG_INFOS,
}) => {
  const rasterInfos = cogInfos;
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentBasemap, setCurrentBasemap] = useState<BasemapType>("light");
  const [currentMapStyle, setCurrentMapStyle] = useState(mapStyle);
  const [marqueeZoomActive, setMarqueeZoomActive] = useState(false);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<PolygonPoint[]>([]);
  const [internalAOIActive, setInternalAOIActive] = useState(false);
  const [isCreateNewMode, setIsCreateNewMode] = useState(true);
  const [rasterStates, setRasterStates] = useState<
    Record<
      string,
      {
        source: any;
        error: string | null;
        loading: boolean;
        dataRange: { min: number; max: number } | null;
        visible: boolean;
      }
    >
  >({});
  const [rasterColorSchemes, setRasterColorSchemes] = useState<
    Record<string, string>
  >({});
  const rasterColorSchemeKey = rasterInfos
    .map((info, index) => {
      const id = info.id || `cog-${index}`;
      return `${id}:${rasterColorSchemes[id] || info.legend?.color_scheme || "plasma"}`;
    })
    .join("|");
  const [layerVisibility, setLayerVisibility] = useState<
    Record<string, boolean>
  >({});
  const [uploadedGeoJSON, setUploadedGeoJSON] =
    useState<FeatureCollection | null>(null);
  const [uploadedGeoJSONName, setUploadedGeoJSONName] = useState<string>();
  const [uploadedGeoJSONCreatedAt, setUploadedGeoJSONCreatedAt] =
    useState<number>();
  const [selectedAreaName, setSelectedAreaName] = useState<string>();
  const [selectedAreaCreatedAt, setSelectedAreaCreatedAt] = useState<number>();

  const isLayerVisible = useCallback(
    (layerId: string) => layerVisibility[layerId] !== false,
    [layerVisibility],
  );

  const toggleLayerVisibility = useCallback((layerId: string) => {
    setLayerVisibility((previous) => ({
      ...previous,
      [layerId]: previous[layerId] === false,
    }));
  }, []);

  const toggleRasterVisibility = useCallback((rasterId: string) => {
    setRasterStates((previous) => ({
      ...previous,
      [rasterId]: {
        ...previous[rasterId],
        visible: !(previous[rasterId]?.visible ?? true),
      },
    }));
  }, []);

  const setRasterColorScheme = useCallback(
    (rasterId: string, colorScheme: string) => {
      setRasterColorSchemes((previous) => ({
        ...previous,
        [rasterId]: colorScheme,
      }));
    },
    [],
  );

  // Use external AOI state if provided, otherwise use internal state
  const effectiveAOIActive = areaSelectionActive || internalAOIActive;

  // Handle AOI toggle - use external callback if provided, otherwise toggle internal state
  const handleAOIToggle = useCallback(() => {
    // Clear uploaded GeoJSON when AOI panel is closed (Cancel clicked)
    setUploadedGeoJSON(null);
    setUploadedGeoJSONName(undefined);
    setUploadedGeoJSONCreatedAt(undefined);

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
      setUploadedGeoJSONName(undefined);
      setUploadedGeoJSONCreatedAt(undefined);
    }
  }, []);

  // Handle GeoJSON upload from AreaOfInterestControls
  const handleGeoJSONUpload = useCallback(
    (data: FeatureCollection, fileName: string) => {
      // console.log(`GeoJSON uploaded: ${fileName} with ${data.features.length} feature(s)`);

      // Store the full FeatureCollection for preview rendering
      // Will be finalized when user clicks Apply
      setUploadedGeoJSON(data);
      setUploadedGeoJSONCreatedAt(Date.now());
      setUploadedGeoJSONName(
        fileName.replace(/\.(geojson|json)$/i, "").trim() || undefined,
      );
    },
    [],
  );

  // Center map viewport when uploadedGeoJSON changes
  useEffect(() => {
    if (!uploadedGeoJSON) return;

    console.log(
      "Centering map on uploaded GeoJSON with",
      uploadedGeoJSON.features.length,
      "features",
    );

    // Calculate bounds using consolidated utility
    const bounds = getGeoJSONBounds(uploadedGeoJSON);

    if (!bounds) {
      console.warn("Could not calculate bounds from uploaded GeoJSON");
      return;
    }

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

    console.log("Updating viewport to:", newViewport);
    onViewportChange(newViewport);
  }, [uploadedGeoJSON, onViewportChange]);

  // Fit the map to all GeoJSON layers from chat responses. Uses the live map
  // instance's fitBounds with pixel padding so the fit is viewport-aware (no
  // over-zoom) and leaves a margin around the features. Runs only when the set
  // of layers changes (the array reference is stable otherwise).
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const allFeatures = geoJsonLayers.flatMap((layer) => layer.data.features);

    Object.values(rasterStates).forEach((state) => {
      const coordinates = state.source?.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length < 3) return;

      allFeatures.push({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [[...coordinates, coordinates[0]]],
        },
      });
    });

    const bounds = getGeoJSONBounds({
      type: "FeatureCollection",
      features: allFeatures,
    });
    if (!bounds) return;

    const [minLng, minLat, maxLng, maxLat] = bounds;
    const map = mapRef.current.getMap();

    // Defer a frame so any layout change (e.g. the map becoming visible) is
    // applied before we measure the container for the fit.
    const raf = requestAnimationFrame(() => {
      map.resize();
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 48, maxZoom: 12, duration: 600 },
      );
    });
    return () => cancelAnimationFrame(raf);
  }, [geoJsonLayers, mapLoaded, rasterStates]);

  // Clear uploaded GeoJSON when AOI is reset
  useEffect(() => {
    setUploadedGeoJSON(null);
    setUploadedGeoJSONName(undefined);
    setUploadedGeoJSONCreatedAt(undefined);
    setSelectedAreaName(undefined);
    setSelectedAreaCreatedAt(undefined);
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
    [onBasemapChange],
  );

  const zoomToBounds = useCallback(
    (bounds: [number, number, number, number] | null) => {
      if (!bounds || !mapRef.current) return;

      const [minLng, minLat, maxLng, maxLat] = bounds;
      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 48, maxZoom: 12, duration: 600 },
      );
    },
    [],
  );

  const zoomToGeoJSON = useCallback(
    (data: any) => {
      zoomToBounds(getGeoJSONBounds(data));
    },
    [zoomToBounds],
  );

  const zoomToRaster = useCallback(
    (source: any) => {
      const coordinates = source?.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length < 3) return;

      zoomToBounds(
        getGeoJSONBounds({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: [[...coordinates, coordinates[0]]],
              },
            },
          ],
        }),
      );
    },
    [zoomToBounds],
  );

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
    ],
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
    [viewport],
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
    [onViewportChange],
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
    [
      marqueeZoomActive,
      effectiveAOIActive,
      onAreaSelect,
      isDrawingPolygon,
      isCreateNewMode,
    ],
  );

  const handleContextMenu = useCallback(
    (evt: MapEvent) => {
      if (!effectiveAOIActive || marqueeZoomActive) return;
      if (!isCreateNewMode) return;

      if (isDrawingPolygon && isValidPolygon(polygonPoints)) {
        const originalEvent = (evt as any).originalEvent as
          | MouseEvent
          | undefined;
        originalEvent?.preventDefault();
        completePolygon();
      }
    },
    [
      effectiveAOIActive,
      marqueeZoomActive,
      isCreateNewMode,
      isDrawingPolygon,
      polygonPoints,
      completePolygon,
    ],
  );
  useEffect(() => {
    const activeIds = new Set(
      rasterInfos.map((info, index) => info.id || `cog-${index}`),
    );
    setRasterStates((previous) => {
      const next: typeof previous = {};
      activeIds.forEach((id) => {
        next[id] = previous[id] || {
          source: null,
          error: null,
          loading: false,
          dataRange: null,
          visible: true,
        };
      });
      return next;
    });

    if (rasterInfos.length === 0) return;

    const cancelledRef = { current: false };
    rasterInfos.forEach((rasterInfo, index) => {
      const rasterId = rasterInfo.id || `cog-${index}`;
      setRasterStates((previous) => ({
        ...previous,
        [rasterId]: {
          ...(previous[rasterId] || {
            source: null,
            error: null,
            dataRange: null,
            visible: true,
          }),
          loading: true,
          error: null,
        },
      }));

      const resolveAndLoad = async () => {
        const resolvedUrl = apiClient.isApiUrl(rasterInfo.url)
          ? await apiClient.resolveDataUrl(rasterInfo.url)
          : rasterInfo.url;

        if (cancelledRef.current) return;

        loadCOG(
          resolvedUrl,
          viewport,
          (loading) =>
            setRasterStates((previous) => ({
              ...previous,
              [rasterId]: { ...previous[rasterId], loading },
            })),
          (error) =>
            setRasterStates((previous) => ({
              ...previous,
              [rasterId]: { ...previous[rasterId], error },
            })),
          onViewportChange,
          (source) =>
            setRasterStates((previous) => ({
              ...previous,
              [rasterId]: { ...previous[rasterId], source },
            })),
          cancelledRef,
          (dataRange) =>
            setRasterStates((previous) => ({
              ...previous,
              [rasterId]: { ...previous[rasterId], dataRange },
            })),
          rasterColorSchemes[rasterId] ||
            rasterInfo.legend?.color_scheme ||
            "plasma",
          rasterInfo.legend?.min_value ?? undefined,
          rasterInfo.legend?.max_value ?? undefined,
        );
      };

      resolveAndLoad().catch((err) => {
        if (!cancelledRef.current) {
          setRasterStates((previous) => ({
            ...previous,
            [rasterId]: {
              ...previous[rasterId],
              error:
                err instanceof Error ? err.message : "Failed to load GeoTIFF",
              loading: false,
            },
          }));
        }
      });
    });

    return () => {
      cancelledRef.current = true;
    };
  }, [rasterInfos, rasterColorSchemeKey]);

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
          properties: {
            name: selectedArea?.name || selectedAreaName,
          },
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
  }, [selectedArea, selectedAreaName]);

  // useMapLoadHandler is a hook (uses useCallback), so it must be called during
  // render to obtain the memoized load handler; it cannot be invoked from
  // inside the event callback.
  const runMapLoad = useMapLoadHandler(mapRef);
  const uploadedAOIColor =
    GEOJSON_LAYER_PALETTE[geoJsonLayers.length % GEOJSON_LAYER_PALETTE.length];
  const selectedAreaColor =
    GEOJSON_LAYER_PALETTE[
      (geoJsonLayers.length + (uploadedGeoJSON ? 1 : 0)) %
        GEOJSON_LAYER_PALETTE.length
    ];

  const layerControlLayers: MapLayerControlLayer[] = [
    ...rasterInfos.map((rasterInfo, index) => {
      const rasterId = rasterInfo.id || `cog-${index}`;
      const state = rasterStates[rasterId];
      return {
        id: rasterId,
        createdAt: rasterInfo.createdAt,
        name: rasterInfo.legend?.label,
        kind: "raster" as const,
        colorScheme:
          rasterColorSchemes[rasterId] ||
          rasterInfo.legend?.color_scheme ||
          "plasma",
        onColorSchemeChange: (colorScheme: string) =>
          setRasterColorScheme(rasterId, colorScheme),
        visible: state?.visible ?? true,
        onToggle: () => toggleRasterVisibility(rasterId),
        onZoom: () => zoomToRaster(state?.source),
        legend: rasterInfo.legend
          ? {
              type: "gradient" as const,
              colorScheme:
                rasterColorSchemes[rasterId] ||
                rasterInfo.legend.color_scheme ||
                "plasma",
              minValue:
                state?.dataRange?.min ?? rasterInfo.legend.min_value ?? 0,
              maxValue:
                state?.dataRange?.max ?? rasterInfo.legend.max_value ?? 1,
              units: rasterInfo.legend.units || undefined,
            }
          : undefined,
      };
    }),
    ...(uploadedGeoJSON
      ? [
          {
            id: "uploaded-aoi",
            createdAt: uploadedGeoJSONCreatedAt,
            name: uploadedGeoJSONName,
            kind: "vector" as const,
            visible: isLayerVisible("uploaded-aoi"),
            color: uploadedAOIColor,
            onToggle: () => toggleLayerVisibility("uploaded-aoi"),
            onZoom: () => zoomToGeoJSON(uploadedGeoJSON),
          },
        ]
      : []),
    ...(selectedAreaGeoJSON
      ? [
          {
            id: "selected-area",
            createdAt: selectedAreaCreatedAt,
            name: selectedArea?.name || selectedAreaName,
            kind: "vector" as const,
            visible: isLayerVisible("selected-area"),
            color: selectedAreaColor,
            onToggle: () => toggleLayerVisibility("selected-area"),
            onZoom: () => zoomToGeoJSON(selectedAreaGeoJSON),
          },
        ]
      : []),
    ...geoJsonLayers.map((layer, index) => {
      const safeId = layer.id.replace(/[^a-zA-Z0-9_-]/g, "");
      const id = `geocoded-aoi-${safeId}`;
      const featureProperties = layer.data.features?.[0]?.properties;
      return {
        id,
        createdAt: layer.createdAt,
        name:
          layer.label?.trim() ||
          featureProperties?.name ||
          featureProperties?.title ||
          featureProperties?.label ||
          `Layer ${index + 1}`,
        kind: "vector" as const,
        visible: isLayerVisible(id),
        color: GEOJSON_LAYER_PALETTE[index % GEOJSON_LAYER_PALETTE.length],
        onToggle: () => toggleLayerVisibility(id),
        onZoom: () => zoomToGeoJSON(layer.data),
      };
    }),
  ].sort((left, right) => (right.createdAt ?? 0) - (left.createdAt ?? 0));

  return (
    <div className={containerClasses}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleMove}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onLoad={() => {
          runMapLoad();
          setMapLoaded(true);
        }}
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
            tolerance={0}
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

        {rasterInfos.map((rasterInfo, index) => {
          const rasterId = rasterInfo.id || `cog-${index}`;
          const state = rasterStates[rasterId];
          if (!state?.source) return null;

          return (
            <React.Fragment key={rasterId}>
              <Source id={`cog-source-${rasterId}`} {...state.source} />
              <Layer
                id={`cog-layer-${rasterId}`}
                type="raster"
                source={`cog-source-${rasterId}`}
                paint={{
                  "raster-opacity": state.visible ? 1 : 0,
                  "raster-fade-duration": 0,
                }}
                layout={{
                  visibility: state.visible ? "visible" : "none",
                }}
              />
            </React.Fragment>
          );
        })}

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
          <Source
            id="selected-area"
            type="geojson"
            data={selectedAreaGeoJSON}
            tolerance={0}
          >
            <Layer
              id="selected-area-fill"
              type="fill"
              layout={{
                visibility: isLayerVisible("selected-area")
                  ? "visible"
                  : "none",
              }}
              paint={{
                "fill-color": selectedAreaColor,
                "fill-opacity": 0.2,
              }}
            />
            <Layer
              id="selected-area-outline"
              type="line"
              layout={{
                visibility: isLayerVisible("selected-area")
                  ? "visible"
                  : "none",
              }}
              paint={{
                "line-color": selectedAreaColor,
                "line-width": 3,
              }}
            />
          </Source>
        )}

        {/* GeoJSON data from GeocodedAOI responses - each as its own colored
            layer. Hidden when a COG is displayed. */}
        {geoJsonLayers.map((layer, index) => {
          const color =
            GEOJSON_LAYER_PALETTE[index % GEOJSON_LAYER_PALETTE.length];
          const safeId = layer.id.replace(/[^a-zA-Z0-9_-]/g, "");
          const layerId = `geocoded-aoi-${safeId}`;
          return (
            <Source
              key={layer.id}
              id={layerId}
              type="geojson"
              data={layer.data}
              tolerance={0}
            >
              <Layer
                id={`geocoded-aoi-fill-${safeId}`}
                type="fill"
                layout={{
                  visibility: isLayerVisible(layerId) ? "visible" : "none",
                }}
                paint={{
                  "fill-color": color,
                  "fill-opacity": 0.25,
                }}
                filter={["==", ["geometry-type"], "Polygon"]}
              />
              <Layer
                id={`geocoded-aoi-line-${safeId}`}
                type="line"
                layout={{
                  visibility: isLayerVisible(layerId) ? "visible" : "none",
                }}
                paint={{
                  "line-color": color,
                  "line-width": 3,
                }}
                filter={[
                  "in",
                  ["geometry-type"],
                  ["literal", ["Polygon", "LineString"]],
                ]}
              />
              <Layer
                id={`geocoded-aoi-point-${safeId}`}
                type="circle"
                layout={{
                  visibility: isLayerVisible(layerId) ? "visible" : "none",
                }}
                paint={{
                  "circle-radius": 4,
                  "circle-color": color,
                  "circle-stroke-color": "#FFFFFF",
                  "circle-stroke-width": 2,
                }}
                filter={["==", ["geometry-type"], "Point"]}
              />
            </Source>
          );
        })}

        {/* Uploaded GeoJSON from file upload */}
        {uploadedGeoJSON && (
          <Source
            id="uploaded-aoi"
            type="geojson"
            data={uploadedGeoJSON}
            tolerance={0}
          >
            <Layer
              id="uploaded-aoi-fill"
              type="fill"
              layout={{
                visibility: isLayerVisible("uploaded-aoi") ? "visible" : "none",
              }}
              paint={{
                "fill-color": uploadedAOIColor,
                "fill-opacity": 0.3,
              }}
              filter={["==", ["geometry-type"], "Polygon"]}
            />
            <Layer
              id="uploaded-aoi-line"
              type="line"
              layout={{
                visibility: isLayerVisible("uploaded-aoi") ? "visible" : "none",
              }}
              paint={{
                "line-color": uploadedAOIColor,
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
              layout={{
                visibility: isLayerVisible("uploaded-aoi") ? "visible" : "none",
              }}
              paint={{
                "circle-radius": 4,
                "circle-color": uploadedAOIColor,
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
          onLocationSelect,
        )}
      />

      <AreaOfInterestControls
        isOpen={effectiveAOIActive}
        onCancel={handleAOIToggle}
        aoiList={aoiList}
        onLoadAOIs={onLoadAOIs}
        isLoadingAOIs={isLoadingAOIs}
        onTabChange={handleTabChange}
        showSelectionHint={
          effectiveAOIActive && !isDrawingPolygon && isCreateNewMode
        }
        isDrawingPolygon={isDrawingPolygon}
        polygonPoints={polygonPoints}
        onApply={(aoiName, isNewAOI, file) => {
          if (uploadedGeoJSON) {
            setUploadedGeoJSONName(aoiName.trim() || undefined);
            setUploadedGeoJSONCreatedAt(Date.now());
          } else {
            setSelectedAreaName(aoiName.trim() || undefined);
            setSelectedAreaCreatedAt(Date.now());
          }

          // If there's an uploaded GeoJSON, finalize it by converting to AreaOfInterest
          if (uploadedGeoJSON) {
            const polygonFeature = uploadedGeoJSON.features.find(
              (f) =>
                f.geometry?.type === "Polygon" ||
                f.geometry?.type === "MultiPolygon",
            );

            if (polygonFeature && polygonFeature.geometry) {
              const geometry = polygonFeature.geometry;
              let coordinates: number[][][];

              if (geometry.type === "Polygon") {
                coordinates = geometry.coordinates;
              } else if (geometry.type === "MultiPolygon") {
                // Use the first polygon from MultiPolygon
                coordinates = geometry.coordinates[0];
              } else {
                console.error("No valid polygon geometry found");
                return;
              }

              // Create AreaOfInterest object with the provided name
              const areaOfInterest: AreaOfInterestType = {
                type: "Polygon",
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

      <MapLayerControl layers={layerControlLayers} defaultOpen={true} />
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
