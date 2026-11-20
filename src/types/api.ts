export interface UIState {
  aoi?: string | Record<string, unknown> | null;
}

export interface ChatRequest {
  content: string;
  timestamp?: string;
  ui_state?: UIState;
}

export interface BackendError {
  content_type: "BackendError";
  message: string;
}

// GeoJSON type aliases
type Point = [number, number];
type LinearRing = Point[];

export interface GeoJSONGeometry {
  type:
    | "Point"
    | "MultiPoint"
    | "LineString"
    | "MultiLineString"
    | "Polygon"
    | "MultiPolygon";
  coordinates: Point | Point[] | LinearRing[] | LinearRing[][];
  bbox?: [number, number, number, number] | null;
}

/**
 * A GeoJSON GeometryCollection.
 */
export interface GeoJSONGeometryCollection {
  type: "GeometryCollection";
  geometries: (GeoJSONGeometry | GeoJSONGeometryCollection)[];
  bbox?: [number, number, number, number] | null;
}

export interface GeoJSONFeature {
  type: "Feature";
  geometry?: GeoJSONGeometry | GeoJSONGeometryCollection | null;
  properties?: Record<string, any> | null;
  bbox?: [number, number, number, number] | null;
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
  bbox?: [number, number, number, number] | null;
}

export interface GeocodedAOI {
  content_type: "GeocodedAOI";
  query: string;
  label?: string | null;
  geojson: GeoJSONFeatureCollection;
}
export interface EndOfTurn {
  content_type: "EndOfTurn";
}

export interface Image {
  content_type: "Image";
  media_type: "image/png" | "image/gif";
  url: string;
}

export interface Video {
  content_type: "Video";
  media_type: "video/mp4";
  url: string;
}

export interface Text {
  content_type: "Text";
  text: string;
}

export interface TextDelta {
  content_type: "TextDelta";
  content_delta: string;
}

export interface Thinking {
  content_type: "Thinking";
  thinking: string;
  duration?: number | null; // Elapsed thinking time in seconds, if provided
}

export interface ThinkingDelta {
  content_type: "ThinkingDelta";
  content_delta: string;
}

// Variable type used in data analysis
export interface Variable {
  name: string;
  type: string;
  description?: string | null;
}

// Data analysis types
export interface DataAnalysisProblem {
  content_type: "DataAnalysisProblem";
  statement: string;
  inputs_provided: Variable[];
  outputs_requested: Variable[];
}

export interface DataAnalysisSolution {
  content_type: "DataAnalysisSolution";
  reasoning?: string | null;
  analysis: string;
  pseudocode: string;
  explanation: string;
}

export interface DownloadLink {
  content_type: "DownloadLink";
  file_type: "image" | "animation" | "geotiff" | "data";
  url: string;
}

export interface DataAnalysisOutput {
  name: string;
  value: string | DownloadLink;
}

export interface DataAnalysisDetails {
  content_type: "DataAnalysisDetails";
  problem: DataAnalysisProblem;
  solution?: DataAnalysisSolution | null;
  outputs?: DataAnalysisOutput[] | null;
}

// Dataset search types
export interface DatasetMetadata {
  content_type: "DatasetMetadata";
  title: string;
  description: string;
  temporal_coverage: string;
  spatial_coverage: string;
  variables: string[];
  landing_page: string | null;
}

export interface DatasetSearchDetails {
  content_type: "DatasetSearchDetails";
  query: string;
  results?: DatasetMetadata[] | null;
}

// Step details (discriminated union)
export type StepDetailsContent = DatasetSearchDetails | DataAnalysisDetails;

export interface StepDetails {
  content_type: "StepDetails";
  content: StepDetailsContent;
}

export interface Legend {
  content_type: "Legend";
  label: string;
  units: string | null;
  min_value: number | null;
  max_value: number | null;
  // Note: color_scheme is not in OpenAPI spec but used by frontend
  color_scheme?: string;
}

export interface GeoTIFF {
  content_type: "GeoTIFF";
  url: string;
  legend: Legend;
}

export interface ProgressUpdate {
  content_type: "ProgressUpdate";
  title: string;
}

export interface Step {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "success" | "failure" | "cancelled";
  outcome_summary?: string | null;
  progress_updates?: ProgressUpdate[] | null;
  details?: StepDetails | null;
}

export interface Plan {
  content_type: "Plan";
  id: string;
  title: string;
  steps: Step[];
}

export type ChatResponseContent =
  | BackendError
  | EndOfTurn
  | Text
  | TextDelta
  | Thinking
  | ThinkingDelta
  | Plan
  | ProgressUpdate
  | GeoTIFF
  | Image
  | Video
  | GeocodedAOI;

export interface ChatResponse {
  content: ChatResponseContent;
  timestamp?: string;
}

export type ChatMessage = ChatRequest | ChatResponse;

export interface ChatHeader {
  id: string;
  title: string;
  date_created: string; // ISO 8601 date-time string
}

export interface Chat {
  id: string;
  title: string;
  messages?: ChatMessage[];
  date_created: string; // ISO 8601 date-time string
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface UserCreateRequest {
  user_id: string;
}

export interface UserResponse {
  user_id: string;
  chat_ids: string[];
}

export interface ApiError {
  status: number;
  message: string;
  details?: HTTPValidationError;
}

// AOI (Area of Interest) types
export interface AOISummary {
  name: string;
  uuid: string;
  created_at: string;
}

export interface AOI {
  name: string;
  uuid: string;
  created_at: string;
  geojson: GeoJSONFeatureCollection;
}

// System model types
export interface SystemModel {
  name: string;
  description: string;
}
