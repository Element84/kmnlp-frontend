import type { Step, Plan } from "../types/api";
import type {
  Message as ChatMessage,
  ProcessStatus,
} from "../stories/Chat/ChatContainer/ChatContainer";
import {
  convertToGeoJSON,
  isValidGeoJSON,
} from "../stories/Map/MapControls/utils/geojson-layer";

/**
 * Maps API step status to UI status
 */
export const mapStepStatus = (
  status: Step["status"]
): ProcessStatus["steps"][0]["status"] => {
  switch (status) {
    case "success":
      return "completed";
    case "failure":
      return "failed";
    case "cancelled":
      return "cancelled";
    case "pending":
      return "pending";
    case "in_progress":
      return "in_progress";
    default:
      return status;
  }
};

/**
 * Calculates overall status from individual step statuses
 */
export const getOverallStatus = (
  steps: ProcessStatus["steps"]
): ProcessStatus["overallStatus"] => {
  if (steps.some((s: ProcessStatus["steps"][0]) => s.status === "failed"))
    return "failed";
  if (steps.some((s: ProcessStatus["steps"][0]) => s.status === "cancelled"))
    return "cancelled";
  if (steps.some((s: ProcessStatus["steps"][0]) => s.status === "in_progress"))
    return "in_progress";
  if (steps.every((s: ProcessStatus["steps"][0]) => s.status === "completed"))
    return "completed";
  return "pending";
};

/**
 * Creates a process status message from a Plan
 */
export const createProcessMessage = (plan: Plan, id?: string): ChatMessage => {
  const steps = plan.steps.map((step) => ({
    id: step.id,
    text: step.title,
    status: mapStepStatus(step.status),
    outcome: step.outcome_summary || undefined,
    subSteps: step.progress_updates || undefined,
    details: step.details || undefined,
  }));

  const processStatus: ProcessStatus = {
    id: plan.id,
    title: plan.title,
    steps,
    overallStatus: getOverallStatus(steps),
    isCollapsed: false,
  };

  return {
    id: id || `process-${plan.id}`,
    text: "",
    type: "process",
    timestamp: new Date(),
    processStatus,
  };
};

/**
 * Processes geocoded response and converts to proper GeoJSON
 */
export const processGeocodedResponse = (
  response: any,
  mapLayerOrder?: number,
): ChatMessage | null => {
  const id = `msg-${Date.now()}-${Math.random()}`;
  const timestamp = response.timestamp
    ? new Date(response.timestamp)
    : new Date();
  const geoJsonData = response.content.geojson;

  // Convert to proper GeoJSON format
  const mapData = convertToGeoJSON(geoJsonData, {
    nameField: "name",
    additionalProperties: {
      source: "GeocodedAOI",
    },
  });

  // Validate the converted data
  if (!isValidGeoJSON(mapData)) {
    console.error("Invalid GeoJSON generated:", mapData);
    return null;
  }

  return {
    id,
    text: "",
    type: "system" as const,
    timestamp,
    rawContent: {
      ...response.content,
      mapData,
    },
    mapLayerOrder,
  };
};

/**
 * Updates process status in existing messages array
 */
export const updateProcessStatusInMessages = (
  plan: Plan,
  messages: ChatMessage[]
): ChatMessage[] => {
  const steps = plan.steps.map((step) => ({
    id: step.id,
    text: step.title,
    status: mapStepStatus(step.status),
    outcome: step.outcome_summary || undefined,
    subSteps: step.progress_updates || undefined,
    details: step.details || undefined,
  }));

  const newStatus: ProcessStatus = {
    id: plan.id,
    title: plan.title,
    steps,
    overallStatus: getOverallStatus(steps),
    isCollapsed: false,
  };

  // Find existing process message
  const existingProcessIndex = messages.findIndex(
    (msg: ChatMessage) =>
      msg.type === "process" && msg.processStatus?.id === plan.id
  );

  if (existingProcessIndex !== -1) {
    // Update existing process message
    const updatedMessages = [...messages];
    updatedMessages[existingProcessIndex] = {
      ...updatedMessages[existingProcessIndex],
      processStatus: newStatus,
      timestamp: new Date(),
    };
    return updatedMessages;
  } else {
    // Create new process message
    const processMessage: ChatMessage = {
      id: `process-${plan.id}`,
      text: "",
      type: "process",
      timestamp: new Date(),
      processStatus: newStatus,
    };
    return [...messages, processMessage];
  }
};

/**
 * Append a streamed text delta to the messages list.
 *
 * If the last message is an in-progress streaming text message, the delta is
 * appended to it. Otherwise a new streaming text message is started.
 */
export const appendTextDelta = (
  messages: ChatMessage[],
  delta: string,
  timestamp: Date
): ChatMessage[] => {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage.type === "system" && lastMessage.isStreaming) {
    return messages.map((msg, index) =>
      index === messages.length - 1
        ? { ...msg, text: msg.text + delta }
        : msg
    );
  }

  const streamingMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random()}`,
    text: delta,
    type: "system",
    timestamp,
    isStreaming: true,
  };
  return [...messages, streamingMessage];
};

/**
 * Append a streamed thinking delta to the messages list.
 *
 * Mirrors `appendTextDelta` but uses a dedicated `thinking` message type so the
 * UI can render it as a collapsible "Thinking" section.
 */
export const appendThinkingDelta = (
  messages: ChatMessage[],
  delta: string,
  timestamp: Date
): ChatMessage[] => {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage.type === "thinking" && lastMessage.isStreaming) {
    return messages.map((msg, index) =>
      index === messages.length - 1
        ? { ...msg, text: msg.text + delta }
        : msg
    );
  }

  const streamingMessage: ChatMessage = {
    id: `thinking-${Date.now()}-${Math.random()}`,
    text: delta,
    type: "thinking",
    timestamp,
    isStreaming: true,
  };
  return [...messages, streamingMessage];
};

/**
 * Finalize streamed thinking using the authoritative, fully-formed `Thinking`
 * payload. Overwrites accumulated deltas, clears the streaming flag, and records
 * the API-provided elapsed thinking duration (used for the "Thought for x
 * seconds" label).
 */
export const finalizeThinking = (
  messages: ChatMessage[],
  finalThinking: string,
  duration: number | null | undefined,
  timestamp: Date
): ChatMessage[] => {
  const durationSeconds = duration != null ? Math.round(duration) : undefined;
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage.type === "thinking" && lastMessage.isStreaming) {
    return messages.map((msg, index) =>
      index === messages.length - 1
        ? {
            ...msg,
            text: finalThinking,
            isStreaming: false,
            thinkingDurationSeconds: durationSeconds,
          }
        : msg
    );
  }

  const finalMessage: ChatMessage = {
    id: `thinking-${Date.now()}-${Math.random()}`,
    text: finalThinking,
    type: "thinking",
    timestamp,
    thinkingDurationSeconds: durationSeconds,
  };
  return [...messages, finalMessage];
};

/**
 * Wind down in-flight work when a terminal event occurs (backend error or user
 * cancellation).
 *
 * Any active (pending/in-progress) process steps are set to `terminalStatus`
 * and the process' overall status is recomputed. Any in-progress streamed text
 * message is finalized (its `isStreaming` flag cleared) so it no longer appears
 * to be actively streaming.
 */
export const applyTerminalState = (
  messages: ChatMessage[],
  terminalStatus: "failed" | "cancelled"
): ChatMessage[] => {
  return messages.map((msg) => {
    if (msg.type === "process" && msg.processStatus) {
      const steps = msg.processStatus.steps.map((step) =>
        step.status === "in_progress" || step.status === "pending"
          ? { ...step, status: terminalStatus }
          : step
      );
      return {
        ...msg,
        processStatus: {
          ...msg.processStatus,
          steps,
          overallStatus: getOverallStatus(steps),
        },
      };
    }

    if (msg.type === "system" && msg.isStreaming) {
      return { ...msg, isStreaming: false };
    }

    if (msg.type === "thinking" && msg.isStreaming) {
      return { ...msg, isStreaming: false };
    }

    return msg;
  });
};

/**
 * Finalize streamed text using the authoritative, fully-formed `Text` payload.
 *
 * The final `Text` content carries the complete text and is the source of
 * truth: it overwrites whatever was accumulated from deltas and clears the
 * streaming flag. If no streaming text message is in progress (e.g. a `Text`
 * arrived without preceding deltas), a new completed system message is added.
 */
export const finalizeStreamingText = (
  messages: ChatMessage[],
  finalText: string,
  timestamp: Date
): ChatMessage[] => {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage.type === "system" && lastMessage.isStreaming) {
    return messages.map((msg, index) =>
      index === messages.length - 1
        ? { ...msg, text: finalText, isStreaming: false }
        : msg
    );
  }

  const finalMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random()}`,
    text: finalText,
    type: "system",
    timestamp,
  };
  return [...messages, finalMessage];
};
