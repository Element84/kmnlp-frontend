import { atom } from "jotai";
import type { ApiError, ChatRequest } from "../types/api";
import type { Message as ChatMessage } from "../stories/Chat/ChatContainer/ChatContainer";
import { apiClient } from "../services/api-client";
import {
  currentChatIdAtom,
  chatMessagesAtom,
  chatLoadingStateAtom,
  chatErrorStateAtom,
  cogInfosAtom,
  userSessionStateAtom,
  processDetailsPanelStateAtom,
} from "./atoms";
import { convertResponseToMessage } from "./chat-stream-processing";
import {
  appendTextDelta,
  finalizeStreamingText,
  appendThinkingDelta,
  finalizeThinking,
} from "./chat-message-utils";

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
  set(cogInfosAtom, []);
  set(processDetailsPanelStateAtom, { isOpen: false, stepDetails: undefined, processTitle: undefined });

  try {
    // Ensure user session is ready
    const userId = sessionState.currentUserId;
    if (!userId) {
      throw new Error("User session not initialized");
    }

    const chat = await apiClient.startChat();
    set(currentChatIdAtom, chat.id);
    set(chatMessagesAtom, []);
    set(cogInfosAtom, []); // Clear any previous GeoTIFF layers
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
  set(cogInfosAtom, []); // Clear any previous GeoTIFF data when loading a different chat
  set(processDetailsPanelStateAtom, { isOpen: false, stepDetails: undefined, processTitle: undefined });

  try {
    const chat = await apiClient.getChat(chatId);
    set(currentChatIdAtom, chat.id);

    // Convert existing messages with deduplication
    const convertedMessages: ChatMessage[] = [];
    const processMessageIndices = new Map<string, number>(); // Track latest index of each process message by plan ID
    const aoiUuidByMessageId = new Map<string, string>(); // Attached AOI UUID per loaded user message

    if (chat.messages) {
      // First pass: convert all messages and track process message positions
      chat.messages.forEach((msg, index) => {
        if ("content" in msg && typeof msg.content === "string") {
          // ChatRequest
          const messageId = `loaded-user-${index}`;
          const attachedAOI = (msg as ChatRequest).ui_state?.aoi;
          if (typeof attachedAOI === "string") {
            aoiUuidByMessageId.set(messageId, attachedAOI);
          }
          convertedMessages.push({
            id: messageId,
            text: msg.content,
            type: "user",
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          });
        } else if ("content" in msg && typeof msg.content === "object") {
          // ChatResponse
          const content = msg.content as { content_type: string; content_delta?: string; text?: string; thinking?: string; duration?: number | null };
          const msgTimestamp = msg.timestamp ? new Date(msg.timestamp) : new Date();

          // Reconstruct streamed text from persisted deltas / final marker.
          if (content.content_type === "TextDelta") {
            const updated = appendTextDelta(
              convertedMessages,
              content.content_delta ?? "",
              msgTimestamp
            );
            convertedMessages.splice(0, convertedMessages.length, ...updated);
            return;
          }
          if (content.content_type === "Text") {
            const updated = finalizeStreamingText(
              convertedMessages,
              content.text ?? "",
              msgTimestamp
            );
            convertedMessages.splice(0, convertedMessages.length, ...updated);
            return;
          }
          if (content.content_type === "ThinkingDelta") {
            const updated = appendThinkingDelta(
              convertedMessages,
              content.content_delta ?? "",
              msgTimestamp
            );
            convertedMessages.splice(0, convertedMessages.length, ...updated);
            return;
          }
          if (content.content_type === "Thinking") {
            const updated = finalizeThinking(
              convertedMessages,
              content.thinking ?? "",
              content.duration,
              msgTimestamp
            );
            convertedMessages.splice(0, convertedMessages.length, ...updated);
            return;
          }

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

    // Resolve names for AOIs attached to loaded user messages.
    const uniqueAoiUuids = [...new Set(aoiUuidByMessageId.values())];
    if (uniqueAoiUuids.length > 0) {
      const nameByUuid = new Map<string, string>();
      await Promise.all(
        uniqueAoiUuids.map(async (uuid) => {
          try {
            const aoi = await apiClient.getAOI(uuid);
            nameByUuid.set(uuid, aoi.name);
          } catch (error) {
            console.error("Failed to resolve AOI name for", uuid, error);
          }
        })
      );
      for (const message of convertedMessages) {
        const uuid = aoiUuidByMessageId.get(message.id);
        const name = uuid ? nameByUuid.get(uuid) : undefined;
        if (name) {
          message.aoiName = name;
        }
      }
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

export const resetToNewChatAtom = atom(null, (_get, set) => {
  set(currentChatIdAtom, null);
  set(chatMessagesAtom, []);
  set(chatErrorStateAtom, undefined);
  set(cogInfosAtom, []);
  set(processDetailsPanelStateAtom, { isOpen: false, stepDetails: undefined, processTitle: undefined });
});
