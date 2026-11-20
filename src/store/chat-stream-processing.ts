import { atom } from "jotai";
import type { ChatResponse, Plan } from "../types/api";
import type { Message as ChatMessage } from "../stories/Chat/ChatContainer/ChatContainer";
import { chatStreamHandler } from "../services/chat-stream";
import {
  chatMessagesAtom,
  chatLoadingStateAtom,
  chatErrorStateAtom,
  cogInfosAtom,
} from "./atoms";
import {
  createProcessMessage,
  processGeocodedResponse,
  updateProcessStatusInMessages,
  appendTextDelta,
  finalizeStreamingText,
  appendThinkingDelta,
  finalizeThinking,
  applyTerminalState,
} from "./chat-message-utils";

let nextMapLayerOrder = 0;


/**
 * Convert API response to UI message
 */
export const convertResponseToMessage = (
  response: ChatResponse,
  isLoading = false,
  set: any,
  get: any
): ChatMessage | null => {
  const id = `msg-${Date.now()}-${Math.random()}`;
  const timestamp = response.timestamp
    ? new Date(response.timestamp)
    : new Date();

  switch (response.content.content_type) {
    case "TextDelta":
      // Streamed partial text. Accumulate into the current streaming message.
      // The loading/replay path (isLoading) handles accumulation itself.
      if (!isLoading) {
        set(
          chatMessagesAtom,
          appendTextDelta(
            get(chatMessagesAtom),
            response.content.content_delta,
            timestamp
          )
        );
      }
      return null;

    case "Text":
      // Final, fully-formed text. This is the authoritative payload: it
      // overwrites any text accumulated from deltas and ends the stream.
      if (!isLoading) {
        set(
          chatMessagesAtom,
          finalizeStreamingText(
            get(chatMessagesAtom),
            response.content.text,
            timestamp
          )
        );
      }
      return null;

    case "ThinkingDelta":
      // Streamed partial thinking. Accumulated into the current thinking message.
      if (!isLoading) {
        set(
          chatMessagesAtom,
          appendThinkingDelta(
            get(chatMessagesAtom),
            response.content.content_delta,
            timestamp
          )
        );
      }
      return null;

    case "Thinking":
      // Final, fully-formed thinking; overwrites deltas and ends the stream.
      if (!isLoading) {
        set(
          chatMessagesAtom,
          finalizeThinking(
            get(chatMessagesAtom),
            response.content.thinking,
            response.content.duration,
            timestamp
          )
        );
      }
      return null;

    case "BackendError":
      console.error("BackendError content received:", response.content);
      // Terminal response: wind down any in-flight work by marking active
      // process steps as failed and finalizing any in-progress streamed text.
      // (The replay/loading path persists final step statuses already.)
      if (!isLoading) {
        set(chatMessagesAtom, applyTerminalState(get(chatMessagesAtom), "failed"));
      }
      set(chatErrorStateAtom, {
        message: response.content.message,
        details: "Backend error occurred",
      });
      return null;

    case "GeoTIFF":
      set(cogInfosAtom, [
        ...get(cogInfosAtom),
        {
          id,
          createdAt: nextMapLayerOrder++,
          url: response.content.url,
        legend: response.content.legend,
        },
      ]);
      return null;

    case "EndOfTurn":
      // EndOfTurn just signals end of response, don't update loading state here
      // Let the onComplete callback handle final state cleanup
      return null;

    case "Plan":
      // Hide loading indicator when process panel appears
      set(chatLoadingStateAtom, {
        ...get(chatLoadingStateAtom),
        shouldShowLoadingIndicator: false,
      });
      
      if (isLoading) {
        // During loading, return process message directly
        return createProcessMessage(response.content);
      } else {
        // During real-time streaming, update existing messages
        updateProcessStatusInMessagesAtom(response.content, set, get);
        return null;
      }

    case "ProgressUpdate":
      // Top-level narration of what the agent is currently doing.
      set(chatLoadingStateAtom, {
        ...get(chatLoadingStateAtom),
        shouldShowLoadingIndicator: false,
      });
      return {
        id,
        text: response.content.title,
        type: "progress",
        timestamp,
        rawContent: response.content,
      };

    case "Image":
      return {
        id,
        text: "",
        type: "system",
        timestamp,
        rawContent: response.content,
        url: response.content.url,
      };

    case "Video":
      return {
        id,
        text: "",
        type: "system",
        timestamp,
        rawContent: response.content,
        url: response.content.url,
        mediaKind: "video",
      };

    case "GeocodedAOI":
      return processGeocodedResponse(response, nextMapLayerOrder++);

    default:
      return null;
  }
};

/**
 * Update process status in messages using atoms
 */
const updateProcessStatusInMessagesAtom = (plan: Plan, set: any, get: any) => {
  const prevMessages = get(chatMessagesAtom);
  const updatedMessages = updateProcessStatusInMessages(plan, prevMessages);
  set(chatMessagesAtom, updatedMessages);
};

/**
 * Process stream atom - handles incoming message streams
 */
export const processStreamAtom = atom(
  null,
  async (
    get,
    set,
    {
      stream,
      onComplete,
    }: {
      stream: ReadableStream<Uint8Array>;
      onComplete?: () => void;
    }
  ) => {
    try {
      await chatStreamHandler.processStream(stream, {
        onMessage: (response: ChatResponse) => {
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
          onComplete?.();
        },
      });
    } catch (error) {
      console.error("Stream processing failed:", error);
      set(chatErrorStateAtom, {
        message: "Stream processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
      set(chatLoadingStateAtom, {
        isLoading: false,
        isStreamingActive: false,
        shouldShowLoadingIndicator: false,
      });
    }
  }
);
