import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@trussworks/react-uswds";
import {
  getD3ColorScheme,
  LegendGradient,
  LegendTable,
  LegendTableItem,
} from "./LegendContents";
import "./mapLayerControl.scss";

const formatUnits = (units?: string): string | undefined => {
  if (!units) return units;

  const unitMap: Record<string, string> = {
    degrees_celsius: "°C",
    degrees_fahrenheit: "°F",
    degrees_c: "°C",
    degrees_f: "°F",
    celsius: "°C",
    fahrenheit: "°F",
  };

  const normalizedUnit = units.toLowerCase().replace(/\s+/g, "_");
  return unitMap[normalizedUnit] || units;
};

const getColorSchemeSwatch = (colorScheme?: string): React.CSSProperties => {
  const interpolator = getD3ColorScheme(colorScheme || "viridis");
  return {
    background: `linear-gradient(90deg, ${interpolator(0)}, ${interpolator(0.5)}, ${interpolator(1)})`,
  };
};

const truncateLayerName = (name: string, maxLength = 100) =>
  name.length > maxLength ? `${name.slice(0, maxLength - 1).trimEnd()}…` : name;

type LayerKind = "vector" | "raster";

export const RASTER_COLOR_SCHEMES = [
  "plasma",
  "viridis",
  "inferno",
  "magma",
  "turbo",
  "reds",
  "greens",
  "blues",
] as const;

type LayerLegend =
  | {
      type: "table";
      items: LegendTableItem[];
    }
  | {
      type: "gradient";
      colorScheme: string;
      minValue: number;
      maxValue: number;
      units?: string;
      steps?: number;
    };

export interface MapLayerControlLayer {
  id: string;
  createdAt?: number;
  name?: string;
  kind: LayerKind;
  visible: boolean;
  color?: string;
  colorScheme?: string;
  onColorSchemeChange?: (colorScheme: string) => void;
  legend?: LayerLegend;
  onToggle: () => void;
  onZoom: () => void;
}

export interface MapLayerControlProps {
  layers: MapLayerControlLayer[];
  defaultOpen?: boolean;
}

export const MapLayerControl: React.FC<MapLayerControlProps> = ({
  layers,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [openColorMap, setOpenColorMap] = useState<string | null>(null);
  const previousLayerCount = useRef(layers.length);

  useEffect(() => {
    if (layers.length > previousLayerCount.current) {
      setIsOpen(true);
    }
    previousLayerCount.current = layers.length;
  }, [layers.length]);

  if (layers.length === 0) return null;

  return (
    <div
      className={`map-layer-control ${isOpen ? "map-layer-control--open" : ""}`}
      data-testid="map-layer-control"
    >
      <button
        className="map-layer-control__toggle"
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close map layers" : "Open map layers"}
        title={isOpen ? "Close map layers" : "Open map layers"}
      >
        <Icon.FilterList aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="map-layer-control__panel" aria-label="Map layers">
          <div className="map-layer-control__list">
            {layers.map((layer, index) => {
              const name = layer.name?.trim() || `Layer ${index + 1}`;
              const displayName = truncateLayerName(name);

              return (
                <section
                  className={`map-layer-control__layer ${
                    layer.visible ? "" : "map-layer-control__layer--hidden"
                  }`}
                  key={layer.id}
                >
                  <div className="map-layer-control__layer-row">
                    <button
                      className="map-layer-control__visibility"
                      type="button"
                      onClick={layer.onToggle}
                      aria-label={`${layer.visible ? "Hide" : "Show"} ${name}`}
                      title={`${layer.visible ? "Hide" : "Show"} ${name}`}
                    >
                      {layer.visible ? (
                        <Icon.Visibility />
                      ) : (
                        <Icon.VisibilityOff />
                      )}
                    </button>
                    {layer.kind === "vector" && (
                      <span
                        className="map-layer-control__swatch"
                        style={{ backgroundColor: layer.color || "#0050D8" }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="map-layer-control__name" title={name}>
                      {displayName}
                    </span>
                    {layer.kind === "raster" && layer.onColorSchemeChange && (
                      <div className="map-layer-control__color-control">
                        <button
                          className="map-layer-control__color-button"
                          type="button"
                          onClick={() =>
                            setOpenColorMap((current) =>
                              current === layer.id ? null : layer.id,
                            )
                          }
                          aria-expanded={openColorMap === layer.id}
                          aria-label={`Choose color map for ${name}`}
                          title={`Color map: ${layer.colorScheme}`}
                        >
                          <span
                            className="map-layer-control__color-icon"
                            style={getColorSchemeSwatch(layer.colorScheme)}
                            aria-hidden="true"
                          />
                        </button>
                        {openColorMap === layer.id && (
                          <div
                            className="map-layer-control__color-menu"
                            role="menu"
                            aria-label={`Color maps for ${name}`}
                          >
                            {[
                              ...(layer.colorScheme &&
                              !RASTER_COLOR_SCHEMES.includes(
                                layer.colorScheme as (typeof RASTER_COLOR_SCHEMES)[number],
                              )
                                ? [layer.colorScheme]
                                : []),
                              ...RASTER_COLOR_SCHEMES,
                            ].map((scheme) => (
                              <button
                                key={scheme}
                                className="map-layer-control__color-option"
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  layer.onColorSchemeChange?.(scheme);
                                  setOpenColorMap(null);
                                }}
                              >
                                <span
                                  className="map-layer-control__color-icon"
                                  style={getColorSchemeSwatch(scheme)}
                                  aria-hidden="true"
                                />
                                {scheme}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      className="map-layer-control__zoom"
                      type="button"
                      onClick={layer.onZoom}
                      aria-label={`Zoom to ${name}`}
                      title={`Zoom to ${name}`}
                    >
                      <Icon.ZoomOutMap />
                    </button>
                  </div>

                  {layer.visible && layer.legend && (
                    <div className="map-layer-control__legend">
                      {layer.legend.type === "gradient" ? (
                        <LegendGradient
                          colorScheme={layer.legend.colorScheme}
                          minValue={layer.legend.minValue}
                          maxValue={layer.legend.maxValue}
                          units={formatUnits(layer.legend.units)}
                          steps={layer.legend.steps}
                        />
                      ) : (
                        <LegendTable items={layer.legend.items} />
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLayerControl;
