import { useState } from "react";
import { Provider } from "jotai";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { MainNav } from "./stories/Header";
import { MainLayout } from "./stories/Layout/MainLayout/MainLayout";
import { ChatContainer } from "./stories/Chat/ChatContainer/ChatContainer";
import { MapContainer } from "./stories/Map/MapContainer/MapContainer";
import type { AreaOfInterestType as AreaOfInterest } from "./stories/Map/MapControls/utils/area-of-interest";
import { useChat } from "./hooks/useChat";
import { useChatManagement } from "./hooks/useChatManagement";
import { useChatUrlSync } from "./hooks/useChatUrlSync";
import { apiClient } from "./services/api-client";
import { AOISummary } from "./types/api";
import {
  viewStateAtom,
  managementVisibleAtom,
  mapViewportAtom,
  areaSelectionStateAtom,
  appliedAOIAtom,
  aoiResetKeyAtom,
  containerMessagesAtom,
  recentChatsAtom,
  uiStateAtom,
  cogInfosAtom,
  geoJsonLayersAtom,
} from "./store/atoms";
import "./App.scss";
import "./index.scss";

function AppContent() {
  // Hooks for complex logic
  const {
    errorState,
    isLoading,
    isInitializing,
    sendMessage,
    resetToNewChat,
    loadChat,
    cancelRequest,
  } = useChat();

  const {
    isLoading: isChatListLoading,
    isLoadingMore: isChatListLoadingMore,
    hasMore: hasMoreChats,
    error: chatListError,
    refreshChatList,
    loadMoreChats,
    clearError: clearChatListError,
  } = useChatManagement({ userSessionReady: !isInitializing });

  // Keep the browser URL in sync with the active chat (router-free).
  useChatUrlSync();

  // AOI list state
  const [aoiList, setAoiList] = useState<AOISummary[]>([]);
  const [isLoadingAOIs, setIsLoadingAOIs] = useState(false);

  // Direct atom usage (much simpler!)
  const [viewState, setViewState] = useAtom(viewStateAtom);
  const [managementVisible, setManagementVisible] = useAtom(
    managementVisibleAtom,
  );
  const [mapViewport, setMapViewport] = useAtom(mapViewportAtom);
  const [areaSelectionState, setAreaSelectionState] = useAtom(
    areaSelectionStateAtom,
  );
  const setAppliedAOI = useSetAtom(appliedAOIAtom);
  const [aoiResetKey, setAoiResetKey] = useAtom(aoiResetKeyAtom);

  // Read-only atoms
  const messages = useAtomValue(containerMessagesAtom);
  const recentChats = useAtomValue(recentChatsAtom);
  const uiState = useAtomValue(uiStateAtom);
  const cogInfos = useAtomValue(cogInfosAtom);

  // Simple handlers (no action atoms needed!)
  const handleToggleMapView = () => {
    setViewState(viewState === "expanded" ? "map-hidden" : "expanded");
  };

  const handleNewChat = async () => {
    resetToNewChat();
    setAreaSelectionState({ isActive: false, selectedArea: null });
    console.log("[Jotai AOI] Clearing AOI on new chat");
    setAppliedAOI(null);
    setAoiResetKey((prev) => !prev);
    setMapViewport({
      latitude: 25.0,
      longitude: -89.0,
      zoom: 4,
      pitch: 0,
      bearing: 0,
    });
    setManagementVisible(false);
  };

  const handleSelectChat = async (chatId: string) => {
    setAreaSelectionState({ isActive: false, selectedArea: null });
    await loadChat(chatId);
    setManagementVisible(false);
  };

  const handleSubmit = async (message: string) => {
    await sendMessage(message, uiState, refreshChatList);
  };

  const handleSelectAOI = () => {
    // If activating AOI selection and map is hidden, show the map
    if (!areaSelectionState.isActive && viewState === "map-hidden") {
      setViewState("expanded");
    }

    // If deactivating, clear the selected area
    if (areaSelectionState.isActive) {
      setAreaSelectionState({ isActive: false, selectedArea: null });
    } else {
      setAreaSelectionState({
        ...areaSelectionState,
        isActive: true,
      });
    }
  };

  const handleAreaSelect = (area: AreaOfInterest) => {
    // Keep controls open after drawing so user can enter a name and apply
    setAreaSelectionState({ isActive: true, selectedArea: area });
  };

  const handleApplyAOI = async (
    aoiName: string,
    isNewAOI: boolean,
    _file?: File,
    uploadedGeojson?: any,
  ) => {
    // Use uploaded GeoJSON if provided, otherwise convert selected area to GeoJSON format
    const geojson =
      uploadedGeojson ||
      (areaSelectionState.selectedArea
        ? {
            type: "Feature",
            properties: { name: aoiName },
            geometry: {
              type: "Polygon",
              coordinates: areaSelectionState.selectedArea.coordinates,
            },
          }
        : undefined);

    // Only send AOI data to backend if it's a new AOI being created
    if (isNewAOI) {
      try {
        // Backend accepts either a bare geometry or a full FeatureCollection.
        let geometry;
        if (geojson) {
          if (geojson.type === "FeatureCollection") {
            // Send the whole collection so multi-feature AOIs aren't truncated
            geometry = geojson;
          } else if (geojson.type === "Feature") {
            // Get geometry from feature
            geometry = geojson.geometry;
          } else {
            // Already a geometry object
            geometry = geojson;
          }
        }

        // Post to backend without UUID - backend will generate it
        const createdAOI = await apiClient.postAOI({
          name: aoiName,
          geojson: geometry,
        });

        // Update Jotai AOI object with UUID received from backend
        console.log("[Jotai AOI] Setting AOI from backend response:", {
          name: aoiName,
          uuid: createdAOI.uuid,
          created_at: createdAOI.created_at,
        });
        setAppliedAOI({
          name: aoiName,
          geojson: createdAOI.geojson,
          uuid: createdAOI.uuid,
          created_at: new Date().toISOString(),
        });

        console.log(
          "AOI successfully created with backend UUID:",
          createdAOI.uuid,
        );
      } catch (error) {
        console.error("Failed to post AOI to backend:", error);
        // TODO: Handle error - show notification to user
      }
    } else {
      console.log("Existing AOI applied - skipping backend POST");
    }

    // Close the controls but keep the area visible on the map
    setAreaSelectionState({
      isActive: false,
      selectedArea: areaSelectionState.selectedArea,
    });
  };

  const handleRemoveAOI = () => {
    setAreaSelectionState({ isActive: false, selectedArea: null });
    console.log("[Jotai AOI] Removing AOI");
    setAppliedAOI(null);
    setAoiResetKey((prev) => !prev);
  };

  const handleLoadAOIs = async () => {
    setIsLoadingAOIs(true);
    try {
      const aois = await apiClient.getAOIs();
      setAoiList(aois);
    } catch (error) {
      console.error("Failed to load AOIs:", error);
      // TODO: Show error notification to user
    } finally {
      setIsLoadingAOIs(false);
    }
  };

  return (
    <div className="app">
      <MainNav
        onToggleMapView={handleToggleMapView}
        isMapOpen={viewState !== "map-hidden"}
      />
      {chatListError && (
        <div className="app__error-notification">
          <div className="app__error-content">
            <span>Chat list error: {chatListError}</span>
            <button onClick={clearChatListError}>×</button>
          </div>
        </div>
      )}
      <div className="app__content">
        <MainLayout
          viewState={viewState}
          managementVisible={managementVisible}
          chatContent={
            <ChatContainer messages={messages} errorState={errorState} />
          }
          mapContent={
            <MapContainer
              viewport={mapViewport}
              onViewportChange={setMapViewport}
              onAreaSelect={handleAreaSelect}
              onAOIToggle={handleSelectAOI}
              onApplyAOI={handleApplyAOI}
              collapsed={viewState === "map-maximized"}
              areaSelectionActive={areaSelectionState.isActive}
              selectedArea={areaSelectionState.selectedArea}
              aoiResetKey={aoiResetKey}
              geoJsonLayers={useAtomValue(geoJsonLayersAtom)}
              cogInfos={cogInfos}
              aoiList={aoiList}
              onLoadAOIs={handleLoadAOIs}
              isLoadingAOIs={isLoadingAOIs}
            />
          }
          recentChats={recentChats}
          isProcessing={isLoading}
          onViewStateChange={setViewState}
          onToggleManagement={() => setManagementVisible(!managementVisible)}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onLoadMoreChats={loadMoreChats}
          hasMoreChats={hasMoreChats}
          isLoadingMoreChats={isChatListLoadingMore}
          isLoadingChats={isChatListLoading}
          onSelectAOI={handleSelectAOI}
          onRemoveAOI={handleRemoveAOI}
          onSubmit={handleSubmit}
          onCancel={cancelRequest}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <Provider>
      <AppContent />
    </Provider>
  );
}

export default App;
