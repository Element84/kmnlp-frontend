import { atom } from "jotai";
import type { ApiError } from "../types/api";
import type { Message as ChatMessage } from "../stories/Chat/ChatContainer/ChatContainer";
import { apiClient } from "../services/api-client";
import {
  currentChatIdAtom,
  chatMessagesAtom,
  chatLoadingStateAtom,
  chatErrorStateAtom,
  cogInfoAtom,
  userSessionStateAtom,
} from "./atoms";
import { convertResponseToMessage } from "./chat-stream-processing";

export const startNewChatAtom = atom(null, async (get, set) => {
  // Don't allow creating new chat while still initializing
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
    isStreamingActive: false,
    shouldShowLoadingIndicator: false,
  });
  set(chatErrorStateAtom, undefined);
  set(cogInfoAtom, undefined);

  try {
    // Ensure user session is ready
    const userId = sessionState.currentUserId;
    if (!userId) {
      throw new Error("User session not initialized");
    }

    const chat = await apiClient.startChat();
    set(currentChatIdAtom, chat.id);
    set(chatMessagesAtom, []);
    set(cogInfoAtom, undefined); // Clear any previous GeoTIFF URL
  } catch (error) {
    const apiError = error as ApiError;
    set(chatErrorStateAtom, {
      message: apiError.message || "Failed to start new chat",
      details: apiError.details
        ? JSON.stringify(apiError.details, null, 2)
        : undefined,
    });
  } finally {
    set(chatLoadingStateAtom, {
      isLoading: false,
      isStreamingActive: false,
      shouldShowLoadingIndicator: false,
    });
  }
});

export const loadChatAtom = atom(null, async (get, set, chatId: string) => {
  set(chatLoadingStateAtom, {
    isLoading: true,
    isStreamingActive: false,
    shouldShowLoadingIndicator: false,
  });
  set(chatErrorStateAtom, undefined);
  set(cogInfoAtom, undefined); // Clear any previous GeoTIFF data when loading a different chat

  try {
    const chat = await apiClient.getChat(chatId);
    set(currentChatIdAtom, chat.id);

    // Convert existing messages with deduplication
    const convertedMessages: ChatMessage[] = [];
    const processMessageIndices = new Map<string, number>(); // Track latest index of each process message by plan ID

    if (chat.messages) {
      // First pass: convert all messages and track process message positions
      chat.messages.forEach((msg, index) => {
        if ("content" in msg && typeof msg.content === "string") {
          // ChatRequest
          convertedMessages.push({
            id: `loaded-user-${index}`,
            text: msg.content,
            type: "user",
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          });
        } else if ("content" in msg && typeof msg.content === "object") {
          // ChatResponse
          const converted = convertResponseToMessage(
            msg as any,
            true,
            set,
            get
          );
          if (converted) {
            if (converted.type === "process" && converted.processStatus) {
              const planId = converted.processStatus.id;
              const existingIndex = processMessageIndices.get(planId);

              if (existingIndex !== undefined) {
                // Replace existing process message with updated version
                convertedMessages[existingIndex] = converted;
              } else {
                // New process message, add at current position
                processMessageIndices.set(planId, convertedMessages.length);
                convertedMessages.push(converted);
              }
            } else {
              // Non-process message, add directly
              convertedMessages.push(converted);
            }
          }
        }
      });
    }

    set(chatMessagesAtom, convertedMessages);
  } catch (error) {
    const apiError = error as ApiError;
    set(chatErrorStateAtom, {
      message: apiError.message || "Failed to load chat",
      details: apiError.details
        ? JSON.stringify(apiError.details, null, 2)
        : undefined,
    });
  } finally {
    set(chatLoadingStateAtom, {
      isLoading: false,
      isStreamingActive: false,
      shouldShowLoadingIndicator: false,
    });
  }
});

export const resetToNewChatAtom = atom(null, (get, set) => {
  set(currentChatIdAtom, null);
  set(chatMessagesAtom, []);
  set(chatErrorStateAtom, undefined);
  set(cogInfoAtom, undefined);
});
