import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
  chatMessagesAtom,
  chatErrorStateAtom,
  chatLoadingStateAtom,
  currentChatIdAtom,
  cogInfoAtom,
  userSessionStateAtom,
  containerMessagesAtom,
} from "../store/atoms";
import {
  initializeUserSessionAtom,
  getCurrentUserIdAtom,
} from "../store/user-session-actions";
import {
  sendMessageAtom,
  startNewChatAtom,
  loadChatAtom,
  resetToNewChatAtom,
  cancelRequestAtom,
  clearChatErrorAtom,
} from "../store/chat-actions";
import {
  autoUpdateMapForGeoJsonAtom,
  autoShowMapForCogAtom,
} from "../store/view-actions";
import type { UIState } from "../types/api";
import type {
  Message,
  ErrorState,
  ProcessStatus,
} from "../stories/Chat/ChatContainer/ChatContainer";
import type { CogInfo } from "../stories/Map/MapContainer/types";

// Export types that are used by other modules
export type { ErrorState, ProcessStatus, CogInfo };

export interface UseChatReturn {
  messages: Message[];
  processStatus?: ProcessStatus;
  errorState?: ErrorState;
  isLoading: boolean;
  isInitializing: boolean;
  currentChatId: string | null;
  cogInfo?: CogInfo;
  sendMessage: (
    content: string,
    uiState?: UIState,
    onNewChatCreated?: () => void
  ) => Promise<void>;
  startNewChat: () => Promise<void>;
  resetToNewChat: () => void;
  loadChat: (chatId: string) => Promise<void>;
  clearError: () => void;
  cancelRequest: () => void;
}

export const useChat = (): UseChatReturn => {
  // Atom values
  const messages = useAtomValue(containerMessagesAtom);
  const errorState = useAtomValue(chatErrorStateAtom);
  const loadingState = useAtomValue(chatLoadingStateAtom);
  const currentChatId = useAtomValue(currentChatIdAtom);
  const cogInfo = useAtomValue(cogInfoAtom);
  const sessionState = useAtomValue(userSessionStateAtom);

  // Atom actions
  const initializeSession = useSetAtom(initializeUserSessionAtom);
  const sendMessageAction = useSetAtom(sendMessageAtom);
  const startNewChatAction = useSetAtom(startNewChatAtom);
  const loadChatAction = useSetAtom(loadChatAtom);
  const resetToNewChatAction = useSetAtom(resetToNewChatAtom);
  const cancelRequestAction = useSetAtom(cancelRequestAtom);
  const clearErrorAction = useSetAtom(clearChatErrorAtom);
  const autoUpdateMapForGeoJson = useSetAtom(autoUpdateMapForGeoJsonAtom);
  const autoShowMapForCog = useSetAtom(autoShowMapForCogAtom);

  // Initialize user session on mount
  useEffect(() => {
    if (sessionState.isInitializing && !sessionState.currentUserId) {
      initializeSession();
    }
  }, [
    initializeSession,
    sessionState.isInitializing,
    sessionState.currentUserId,
  ]);

  // Auto-update map when GeoJSON data changes
  useEffect(() => {
    autoUpdateMapForGeoJson();
  }, [messages, autoUpdateMapForGeoJson]);

  // Auto-show map when COG info is available
  useEffect(() => {
    autoShowMapForCog();
  }, [cogInfo, autoShowMapForCog]);

  // Wrapper functions to match original hook interface
  const sendMessage = async (
    content: string,
    uiState?: UIState,
    onNewChatCreated?: () => void
  ) => {
    await sendMessageAction({ content, uiState, onNewChatCreated });
  };

  const startNewChat = async () => {
    await startNewChatAction();
  };

  const resetToNewChat = () => {
    resetToNewChatAction();
  };

  const loadChat = async (chatId: string) => {
    await loadChatAction(chatId);
  };

  const clearError = () => {
    clearErrorAction();
  };

  const cancelRequest = () => {
    cancelRequestAction();
  };

  return {
    messages,
    processStatus: undefined, // Now embedded in messages
    errorState,
    isLoading: loadingState.isLoading,
    isInitializing: sessionState.isInitializing,
    currentChatId,
    cogInfo,
    sendMessage,
    startNewChat,
    resetToNewChat,
    loadChat,
    clearError,
    cancelRequest,
  };
};
