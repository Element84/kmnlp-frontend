import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { ChatHeader, ChatMessage, UIState, DataAnalysisDetails } from "../types/api";
import type { Message, ErrorState, ProcessStatus } from "../stories/Chat/ChatContainer/ChatContainer";
import type { ViewState } from "../stories/Chat/ChatView/ChatView";
import type { CogInfo, MapViewport } from "../stories/Map/MapContainer/types";
import type { AreaOfInterestType as AreaOfInterest } from "../stories/Map/MapControls/utils/area-of-interest";
import { DEFAULT_VIEWPORT } from "../stories/Map/MapContainer/types";
import { ENVIRONMENT } from "../config/api";

/**
 * Persistent user ID stored in localStorage
 * Uses empty string as default to avoid null-check issues with atomWithStorage
 * Empty string indicates no user ID has been set yet
 */
export const userIdAtom = atomWithStorage<string>(
  "noaa-nlp-user-id",
  ""
);

/**
 * Current user session state
 * Tracks initialization status and user context
 */
export const userSessionStateAtom = atom<{
  currentUserId: string | null;
  isInitializing: boolean;
  initializationError: string | null;
}>({
  currentUserId: null,
  isInitializing: true,
  initializationError: null,
});

/**
 * Currently active chat ID
 */
export const currentChatIdAtom = atom<string | null>(null);

/**
 * Messages in the current chat conversation
 */
export const chatMessagesAtom = atom<Message[]>([]);

/**
 * List of user's chat headers for management UI
 */
export const chatListAtom = atom<ChatHeader[]>([]);

/**
 * Current chat error state
 */
export const chatErrorStateAtom = atom<ErrorState | undefined>(undefined);

/**
 * Chat loading and streaming states
 */
export const chatLoadingStateAtom = atom<{
  isLoading: boolean;
  isStreamingActive: boolean;
  shouldShowLoadingIndicator: boolean;
}>({
  isLoading: false,
  isStreamingActive: false,
  shouldShowLoadingIndicator: false,
});

/**
 * Chat management UI state
 */
export const chatManagementStateAtom = atom<{
  isLoading: boolean;
  error: string | null;
  hasInitialized: boolean;
}>({
  isLoading: false,
  error: null,
  hasInitialized: false,
});

/**
 * Current view layout state (expanded, map-maximized, map-hidden)
 */
export const viewStateAtom = atom<ViewState>("map-hidden");

/**
 * Chat management popover visibility
 */
export const managementVisibleAtom = atom(false);

/**
 * Analysis modal state
 * Controls the visibility and content of the analysis details modal
 */
export const analysisModalStateAtom = atom<{
  isOpen: boolean;
  selectedAnalysis: DataAnalysisDetails | null;
}>({
  isOpen: false,
  selectedAnalysis: null,
});

/**
 * Process details panel state
 * Controls the visibility and content of the process details side panel
 * Only one panel can be open at a time
 */
export const processDetailsPanelStateAtom = atom<{
  isOpen: boolean;
  stepDetails: any[] | undefined; // Step[] type from API
  processTitle?: string;
}>({
  isOpen: false,
  stepDetails: undefined,
  processTitle: undefined,
});

/**
 * Current map viewport (center, zoom, pitch, bearing)
 */
export const mapViewportAtom = atom<MapViewport>(DEFAULT_VIEWPORT);

/**
 * Area of interest selection state
 */
export const areaSelectionStateAtom = atom<{
  isActive: boolean;
  selectedArea: AreaOfInterest | null;
}>({
  isActive: false,
  selectedArea: null,
});

/**
 * Applied area of interest with metadata
 * Stores the AOI that has been named and applied by the user
 */
export interface AppliedAOI {
  name: string;
  geojson: any;
  uuid: string;
  created_at?: string;
}

export const appliedAOIAtom = atom<AppliedAOI | null>(null);

// Toggle to trigger AOI reset effects
export const aoiResetKeyAtom = atom<boolean>(false);

/**
 * GeoTIFF/COG information for map display
 */
export const cogInfoAtom = atom<CogInfo | undefined>(undefined);

/**
 * Current GeoJSON data displayed on map
 */
export const mapGeoJsonDataAtom = atom<any>(null);

/**
 * Map interaction state (basemap, tools, drawing)
 */
export const mapInteractionStateAtom = atom<{
  currentBasemap: string;
  marqueeZoomActive: boolean;
  isDrawingPolygon: boolean;
  polygonPoints: any[];
  internalAOIActive: boolean;
}>({
  currentBasemap: "light",
  marqueeZoomActive: false,
  isDrawingPolygon: false,
  polygonPoints: [],
  internalAOIActive: false,
});

/**
 * COG/GeoTIFF processing state
 */
export const cogStateAtom = atom<{
  cogSource: any;
  cogError: string | null;
  cogLoading: boolean;
  cogDataRange: { min: number; max: number } | null;
  cogVisible: boolean;
}>({
  cogSource: null,
  cogError: null,
  cogLoading: false,
  cogDataRange: null,
  cogVisible: true,
});

/**
 * Latest GeoJSON data from chat messages
 * Finds the most recent message containing map data
 */
export const latestGeoJsonDataAtom = atom((get) => {
  const messages = get(chatMessagesAtom);
  const messageWithGeoJson = messages
    .slice()
    .reverse()
    .find((msg) => msg.rawContent?.mapData);
  return messageWithGeoJson?.rawContent?.mapData || null;
});

/**
 * UI state for API requests
 * Converts current area selection to API format
 */
export const uiStateAtom = atom<UIState>((get) => {
  const areaState = get(areaSelectionStateAtom);
  return {
    aoi: areaState.selectedArea
      ? {
          type: "polygon",
          coordinates: areaState.selectedArea.coordinates,
        }
      : null,
  };
});

/**
 * Messages formatted for ChatContainer component
 * Since chatMessagesAtom now stores Message[] directly, this is a pass-through
 */
export const containerMessagesAtom = atom((get) => {
  const messages = get(chatMessagesAtom);
  return messages; // Messages are already in the correct format
});

/**
 * Recent chats for management UI
 * Transforms chat headers to management component format
 */
export const recentChatsAtom = atom((get) => {
  const chatList = get(chatListAtom);
  return chatList.map((chatHeader) => ({
    id: chatHeader.id,
    title: chatHeader.title,
    lastActivity: new Date(chatHeader.date_created),
  }));
});

/**
 * Generate a persistent user ID
 * Creates a unique identifier for user sessions
 */
export function generatePersistentUserId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get user ID with environment fallback
 * Uses development user ID if available, otherwise generates new one
 */
export function getUserIdWithFallback(): string {
  if (ENVIRONMENT.isDevelopment && ENVIRONMENT.userId) {
    return ENVIRONMENT.userId;
  }
  return generatePersistentUserId();
}
