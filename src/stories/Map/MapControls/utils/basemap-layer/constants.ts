import { BasemapOption } from './types';

export const BASEMAP_OPTIONS: BasemapOption[] = [
  { type: "outdoors", label: "Outdoors", description: "Outdoor terrain map" },
  { type: "light", label: "Light", description: "Light themed map" },
  { type: "dark", label: "Dark", description: "Dark themed map" },
  { type: "satellite", label: "Satellite", description: "Satellite imagery" },
];

export const DEFAULT_BASEMAP = "outdoors" as const;