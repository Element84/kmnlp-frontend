import { atom } from "jotai";
import {
  viewStateAtom,
  managementVisibleAtom,
  mapViewportAtom,
  areaSelectionStateAtom,
  mapGeoJsonDataAtom,
  geoJsonLayersAtom,
  cogInfosAtom,
  mapInteractionStateAtom,
  cogStateAtom,
} from "./atoms";
import type { ViewState } from "../stories/Chat/ChatView/ChatView";
import type { MapViewport } from "../stories/Map/MapContainer/types";
import type { AreaOfInterestType as AreaOfInterest } from "../stories/Map/MapControls/utils/area-of-interest";
import { DEFAULT_VIEWPORT } from "../stories/Map/MapContainer/types";

/**
 * Change view state atom
 */
export const changeViewStateAtom = atom(
  null,
  (_get, set, newState: ViewState) => {
    set(viewStateAtom, newState);
  }
);

/**
 * Toggle map view atom
 */
export const toggleMapViewAtom = atom(null, (get, set) => {
  const currentViewState = get(viewStateAtom);
  if (currentViewState === "expanded") {
    set(viewStateAtom, "map-hidden");
  } else {
    set(viewStateAtom, "expanded");
  }
});

/**
 * Toggle management popover atom
 */
export const toggleManagementAtom = atom(null, (get, set) => {
  const currentVisible = get(managementVisibleAtom);
  set(managementVisibleAtom, !currentVisible);
});

/**
 * Set management visible atom
 */
export const setManagementVisibleAtom = atom(
  null,
  (_get, set, visible: boolean) => {
    set(managementVisibleAtom, visible);
  }
);

// =================== 🗺️ MAP STATE ACTIONS ===================

/**
 * Update map viewport atom
 */
export const updateMapViewportAtom = atom(
  null,
  (_get, set, viewport: MapViewport) => {
    set(mapViewportAtom, viewport);
  }
);

/**
 * Toggle area selection atom
 */
export const toggleAreaSelectionAtom = atom(null, (get, set) => {
  const currentState = get(areaSelectionStateAtom);
  set(areaSelectionStateAtom, {
    ...currentState,
    isActive: !currentState.isActive,
  });
});

/**
 * Set area selection active atom
 */
export const setAreaSelectionActiveAtom = atom(
  null,
  (get, set, isActive: boolean) => {
    const currentState = get(areaSelectionStateAtom);
    set(areaSelectionStateAtom, {
      ...currentState,
      isActive,
    });
  }
);

/**
 * Select area atom
 */
export const selectAreaAtom = atom(null, (_get, set, area: AreaOfInterest) => {
  set(areaSelectionStateAtom, {
    isActive: false,
    selectedArea: area,
  });
});

/**
 * Clear selected area atom
 */
export const clearSelectedAreaAtom = atom(null, (_get, set) => {
  set(areaSelectionStateAtom, {
    isActive: false,
    selectedArea: null,
  });
});

/**
 * Reset map to default viewport atom
 */
export const resetMapViewportAtom = atom(null, (_get, set) => {
  set(mapViewportAtom, DEFAULT_VIEWPORT);
});

/**
 * Auto-update map based on new GeoJSON data atom
 * Watches the set of GeoJSON layers from all messages. When that set changes it
 * shows the map (if hidden); the actual camera fit is performed in MapContainer
 * via map.fitBounds, which applies viewport-aware (pixel) padding and therefore
 * needs the live map instance.
 */
export const autoUpdateMapForGeoJsonAtom = atom(null, (get, set) => {
  const geoJsonLayers = get(geoJsonLayersAtom);
  const currentGeoJsonLayers = get(mapGeoJsonDataAtom);
  const currentViewState = get(viewStateAtom);

  if (geoJsonLayers !== currentGeoJsonLayers) {
    set(mapGeoJsonDataAtom, geoJsonLayers);

    // Automatically show map when GeoJSON AOI data is received.
    if (geoJsonLayers.length > 0 && currentViewState === "map-hidden") {
      set(viewStateAtom, "expanded");
    }
  }
});

/**
 * Auto-show map when GeoTIFF data is received atom
 */
export const autoShowMapForCogAtom = atom(null, (get, set) => {
  const cogInfos = get(cogInfosAtom);
  const currentViewState = get(viewStateAtom);

  if (cogInfos.length > 0 && currentViewState === "map-hidden") {
    set(viewStateAtom, "expanded");
  }
});

/**
 * Reset all map data atom (used when starting new chat or loading different chat)
 */
export const resetMapDataAtom = atom(null, (_get, set) => {
  set(mapGeoJsonDataAtom, null);
  set(areaSelectionStateAtom, {
    isActive: false,
    selectedArea: null,
  });
  set(mapViewportAtom, DEFAULT_VIEWPORT);
});

// =================== 🎛️ MAP INTERACTION ACTIONS ===================

/**
 * Set current basemap atom
 */
export const setCurrentBasemapAtom = atom(null, (get, set, basemap: string) => {
  const currentState = get(mapInteractionStateAtom);
  set(mapInteractionStateAtom, {
    ...currentState,
    currentBasemap: basemap,
  });
});

/**
 * Toggle marquee zoom atom
 */
export const toggleMarqueeZoomAtom = atom(null, (get, set) => {
  const currentState = get(mapInteractionStateAtom);
  set(mapInteractionStateAtom, {
    ...currentState,
    marqueeZoomActive: !currentState.marqueeZoomActive,
  });
});

/**
 * Set drawing polygon state atom
 */
export const setDrawingPolygonAtom = atom(
  null,
  (get, set, isDrawing: boolean) => {
    const currentState = get(mapInteractionStateAtom);
    set(mapInteractionStateAtom, {
      ...currentState,
      isDrawingPolygon: isDrawing,
    });
  }
);

/**
 * Update polygon points atom
 */
export const updatePolygonPointsAtom = atom(null, (get, set, points: any[]) => {
  const currentState = get(mapInteractionStateAtom);
  set(mapInteractionStateAtom, {
    ...currentState,
    polygonPoints: points,
  });
});

/**
 * Toggle internal AOI active atom
 */
export const toggleInternalAOIAtom = atom(null, (get, set) => {
  const currentState = get(mapInteractionStateAtom);
  set(mapInteractionStateAtom, {
    ...currentState,
    internalAOIActive: !currentState.internalAOIActive,
  });
});

/**
 * Set COG source atom
 */
export const setCogSourceAtom = atom(null, (get, set, source: any) => {
  const currentState = get(cogStateAtom);
  set(cogStateAtom, {
    ...currentState,
    cogSource: source,
  });
});

/**
 * Set COG error atom
 */
export const setCogErrorAtom = atom(null, (get, set, error: string | null) => {
  const currentState = get(cogStateAtom);
  set(cogStateAtom, {
    ...currentState,
    cogError: error,
  });
});

/**
 * Set COG loading atom
 */
export const setCogLoadingAtom = atom(null, (get, set, loading: boolean) => {
  const currentState = get(cogStateAtom);
  set(cogStateAtom, {
    ...currentState,
    cogLoading: loading,
  });
});

/**
 * Set COG data range atom
 */
export const setCogDataRangeAtom = atom(
  null,
  (get, set, dataRange: { min: number; max: number } | null) => {
    const currentState = get(cogStateAtom);
    set(cogStateAtom, {
      ...currentState,
      cogDataRange: dataRange,
    });
  }
);

/**
 * Set COG visibility atom
 */
export const setCogVisibilityAtom = atom(null, (get, set, visible: boolean) => {
  const currentState = get(cogStateAtom);
  set(cogStateAtom, {
    ...currentState,
    cogVisible: visible,
  });
});
