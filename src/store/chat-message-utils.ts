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
      return "failed"; // Treat cancelled as failed
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
export const processGeocodedResponse = (response: any): ChatMessage | null => {
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

  const areaName =
    geoJsonData.properties?.name ||
    mapData.features[0]?.properties?.name ||
    "Geographic area";

  return {
    id,
    text: "",
    type: "system" as const,
    timestamp,
    rawContent: {
      ...response.content,
      mapData,
    },
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
