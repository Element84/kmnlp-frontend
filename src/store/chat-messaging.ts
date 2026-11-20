

import { atom } from "jotai";
import type { ChatRequest, UIState, ApiError } from "../types/api";
import type { Message as ChatMessage } from "../stories/Chat/ChatContainer/ChatContainer";
import { apiClient } from "../services/api-client";
import { chatStreamHandler } from "../services/chat-stream";
import {
  currentChatIdAtom,
  chatMessagesAtom,
  chatLoadingStateAtom,
  chatErrorStateAtom,
  cogInfosAtom,
  userSessionStateAtom,
  appliedAOIAtom,
} from "./atoms";
import { convertResponseToMessage } from "./chat-stream-processing";


export const sendMessageAtom = atom(
  null,
  async (
    get,
    set,
    {
      content,
      uiState,
      onNewChatCreated,
    }: {
      content: string;
      uiState?: UIState;
      onNewChatCreated?: () => void;
    }
  ) => {
    // Don't allow sending messages while still initializing
    const sessionState = get(userSessionStateAtom);
    if (sessionState.isInitializing) {
      set(chatErrorStateAtom, {
        message: "Please wait while the application initializes...",
        details: "User session is still being set up.",
      });
      return;
    }

    set(chatLoadingStateAtom, {
      isLoading: true,
      isStreamingActive: true,
      shouldShowLoadingIndicator: false,
    });
    set(chatErrorStateAtom, undefined);

    // If no active chat, create one first
    let chatWasCreated = false;
    let chatId = get(currentChatIdAtom);

    if (!chatId) {
      try {
        // Ensure user session is ready before creating chat
        const userId = sessionState.currentUserId;
        if (!userId) {
          throw new Error("User session not initialized");
        }

        const chat = await apiClient.startChat();
        chatId = chat.id;
        set(currentChatIdAtom, chat.id);
        set(chatMessagesAtom, []); // Clear any existing messages
        set(cogInfosAtom, []); // Clear any previous GeoTIFF layers
        chatWasCreated = true;
      } catch (error) {
        const apiError = error as ApiError;
        console.error("Failed to create chat:", error);
        set(chatErrorStateAtom, {
          message: apiError.message || "Failed to create new chat",
          details: apiError.details
            ? JSON.stringify(apiError.details, null, 2)
            : error instanceof Error
            ? error.message
            : String(error),
        });
        set(chatLoadingStateAtom, {
          isLoading: false,
          isStreamingActive: false,
          shouldShowLoadingIndicator: false,
        });
        return;
      }
    }

    // Add user message
    const appliedAOI = get(appliedAOIAtom);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: content,
      type: "user",
      timestamp: new Date(),
      aoiName: appliedAOI?.name,
    };
    const prevMessages = get(chatMessagesAtom);
    set(chatMessagesAtom, [...prevMessages, userMessage]);

    // Show loading indicator immediately after user message
    set(chatLoadingStateAtom, {
      isLoading: true,
      isStreamingActive: true,
      shouldShowLoadingIndicator: true,
    });

    // Include the applied AOI in ui_state
    const mergedUIState: UIState = {
      ...uiState,
      aoi: appliedAOI ? appliedAOI.uuid : undefined,
    };

    const request: ChatRequest = {
      content,
      timestamp: new Date().toISOString(),
      ui_state: mergedUIState,
    };

    try {
      if (!chatId) {
        throw new Error("No active chat available");
      }

      const stream = await apiClient.postToChat(chatId, request);

      if (!stream) {
        throw new Error("No response stream received");
      }

      await chatStreamHandler.processStream(stream, {
        onMessage: (response) => {
          const message = convertResponseToMessage(response, false, set, get);
          if (message) {
            const currentMessages = get(chatMessagesAtom);
            set(chatMessagesAtom, [...currentMessages, message]);
          }
        },
        onError: (error: Error) => {
          set(chatErrorStateAtom, {
            message: "Stream processing error",
            details: error.message,
          });
          set(chatLoadingStateAtom, {
            isLoading: false,
            isStreamingActive: false,
            shouldShowLoadingIndicator: false,
          });
        },
        onComplete: () => {
          set(chatLoadingStateAtom, {
            isLoading: false,
            isStreamingActive: false,
            shouldShowLoadingIndicator: false,
          });
          // Call the callback if a new chat was created during this message
          if (chatWasCreated && onNewChatCreated) {
            onNewChatCreated();
          }
        },
      });
    } catch (error) {
      const apiError = error as ApiError;
      set(chatErrorStateAtom, {
        message: apiError.message || "Failed to send message",
        details: apiError.details
          ? JSON.stringify(apiError.details, null, 2)
          : undefined,
      });
      set(chatLoadingStateAtom, {
        isLoading: false,
        isStreamingActive: false,
        shouldShowLoadingIndicator: false,
      });
    }
  }
);
