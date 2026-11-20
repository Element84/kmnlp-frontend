import { atom } from "jotai";
import type { Message as ChatMessage } from "../stories/Chat/ChatContainer/ChatContainer";
import { apiClient } from "../services/api-client";
import { chatStreamHandler } from "../services/chat-stream";
import {
  chatMessagesAtom,
  chatLoadingStateAtom,
  chatErrorStateAtom,
} from "./atoms";
import { applyTerminalState } from "./chat-message-utils";

export const cancelRequestAtom = atom(null, (get, set) => {
  // Cancel the API request
  apiClient.cancelCurrentRequest();

  // Cancel the stream processing
  chatStreamHandler.cancelStream();

  // Update loading state
  set(chatLoadingStateAtom, {
    isLoading: false,
    isStreamingActive: false,
    shouldShowLoadingIndicator: false,
  });

  // Mark any active process steps as cancelled and finalize in-progress
  // streamed text, then append a system message indicating cancellation.
  const currentMessages = applyTerminalState(get(chatMessagesAtom), "cancelled");
  const cancelMessage: ChatMessage = {
    id: `cancel-${Date.now()}`,
    text: "Request cancelled by user",
    type: "system",
    timestamp: new Date(),
  };
  set(chatMessagesAtom, [...currentMessages, cancelMessage]);
});

export const clearChatErrorAtom = atom(null, (_get, set) => {
  set(chatErrorStateAtom, undefined);
});
