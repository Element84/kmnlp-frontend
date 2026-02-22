//
export {
  // User & Session
  userIdAtom,
  userSessionStateAtom,
  generatePersistentUserId,
  getUserIdWithFallback,

  // Chat State
  currentChatIdAtom,
  chatMessagesAtom,
  chatListAtom,
  chatErrorStateAtom,
  chatLoadingStateAtom,
  chatManagementStateAtom,

  // UI & View State
  viewStateAtom,
  managementVisibleAtom,

  // Map State
  mapViewportAtom,
  areaSelectionStateAtom,
  cogInfoAtom,
  mapGeoJsonDataAtom,
  mapInteractionStateAtom,
  cogStateAtom,

  // Derived State
  latestGeoJsonDataAtom,
  uiStateAtom,
  containerMessagesAtom,
  recentChatsAtom,
} from "./atoms";

// User Session Actions
export {
  initializeUserSessionAtom,
  getUserChatsAtom,
  clearUserSessionAtom,
  regenerateUserIdAtom,
  getCurrentUserIdAtom,
} from "./user-session-actions";

// Chat Management Actions
export {
  refreshChatListAtom,
  clearChatManagementErrorAtom,
  autoInitializeChatListAtom,
} from "./chat-management-actions";

// Chat Operations (Main Chat Actions)
export {
  sendMessageAtom,
  startNewChatAtom,
  loadChatAtom,
  resetToNewChatAtom,
  cancelRequestAtom,
  clearChatErrorAtom,
} from "./chat-operations";

// View Actions
export {
  // View State
  changeViewStateAtom,
  toggleMapViewAtom,
  toggleManagementAtom,
  setManagementVisibleAtom,

  // Map State
  updateMapViewportAtom,
  toggleAreaSelectionAtom,
  setAreaSelectionActiveAtom,
  selectAreaAtom,
  clearSelectedAreaAtom,
  resetMapViewportAtom,
  resetMapDataAtom,

  // Auto-update Actions
  autoUpdateMapForGeoJsonAtom,
  autoShowMapForCogAtom,

  // Map Interactions
  setCurrentBasemapAtom,
  toggleMarqueeZoomAtom,
  setDrawingPolygonAtom,
  updatePolygonPointsAtom,
  toggleInternalAOIAtom,

  // COG/GeoTIFF
  setCogSourceAtom,
  setCogErrorAtom,
  setCogLoadingAtom,
  setCogDataRangeAtom,
  setCogVisibilityAtom,
} from "./view-actions";

// Message Processing Utilities
export {
  mapStepStatus,
  getOverallStatus,
  createProcessMessage,
  processGeocodedResponse,
  updateProcessStatusInMessages,
} from "./chat-message-utils";

// Stream Processing
export {
  convertResponseToMessage,
  processStreamAtom,
} from "./chat-stream-processing";

export * from "./chat-actions";
