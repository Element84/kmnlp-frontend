import * as React from "react";
import { useState } from "react";
import "./mapLegend.scss";
import {
  LegendGradient,
  LegendTable,
  LegendTableItem,
} from "./LegendContents";
import { Icon } from "@trussworks/react-uswds";

/**
 * Converts unit strings to their proper symbols
 * @param units - The unit string to convert (e.g., "degrees_Celsius", "degrees_Fahrenheit")
 * @returns The formatted unit symbol (e.g., "°C", "°F")
 */
export const formatUnits = (units?: string): string | undefined => {
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

export interface LegendItem {
  name: string;
  color: string;
  value: string | number;
}

type MapLegendContentProps =
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

export interface MapLegendProps {
  title?: string;
  defaultOpen?: boolean;
  content: MapLegendContentProps;
  /** COG layer toggle callback */
  onCogToggle?: () => void;
  /** Whether COG layer is visible */
  cogVisible?: boolean;
  /** Whether COG layer is available */
  hasCogLayer?: boolean;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  title = "Legend",
  defaultOpen = false,
  content,
  onCogToggle,
  cogVisible = true,
  hasCogLayer = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleLegend = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      className={`map-legend ${
        isOpen ? "map-legend--open" : "map-legend--collapsed"
      }`}
    >
      {/* Collapsed state - just the button */}
      {!isOpen && (
        <button
          className="map-legend__toggle-btn"
          onClick={toggleLegend}
          aria-label="Open legend"
          title="Open legend"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 19 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 1.44141H14C15.933 1.44141 17.5 3.00841 17.5 4.94141V14.9414C17.5 16.8744 15.933 18.4414 14 18.4414H4C2.067 18.4414 0.5 16.8744 0.5 14.9414V4.94141C0.5 3.00841 2.067 1.44141 4 1.44141Z"
              stroke="#0050D8"
            />
            <path
              d="M9 18.9414H4C1.79086 18.9414 1.61066e-08 17.1505 0 14.9414V4.94141C0 2.73227 1.79086 0.941406 4 0.941406H9V18.9414ZM4.06641 9.18848L4 9.48926L4.58789 9.69531C4.54996 9.97564 4.44248 10.6703 4.26562 11.7793C4.13292 12.6085 4.05015 13.1497 4.01855 13.4014C3.99973 13.5783 4.04764 13.7123 4.16113 13.8037C4.28117 13.8952 4.45175 13.9414 4.67285 13.9414C4.93825 13.9414 5.16934 13.8757 5.36523 13.7441C5.56103 13.6127 5.70603 13.4863 5.80078 13.3662L5.67773 13.1436C5.5705 13.2349 5.47907 13.3008 5.40332 13.3408C5.33382 13.3751 5.26384 13.3926 5.19434 13.3926C5.15018 13.3926 5.11262 13.375 5.08105 13.3408C5.05578 13.3008 5.04297 13.2464 5.04297 13.1777L5.05176 13.0918L5.6875 9.08594L5.46875 8.99121L4.06641 9.18848ZM5.45996 6.94141C5.27682 6.94141 5.11552 7.00423 4.97656 7.12988C4.84386 7.2557 4.77734 7.40767 4.77734 7.58496C4.77739 7.7221 4.82771 7.83936 4.92871 7.93652C5.03603 8.03365 5.16246 8.08193 5.30762 8.08203C5.5098 8.08203 5.67441 8.01934 5.80078 7.89355C5.9271 7.7678 5.99362 7.61355 6 7.43066C6 7.29341 5.95221 7.17842 5.85742 7.08691C5.7627 6.98998 5.63024 6.94145 5.45996 6.94141Z"
              fill="#0050D8"
            />
          </svg>
        </button>
      )}

      {/* Expanded state - the full legend */}
      {isOpen && (
        <div className="map-legend__panel">
          <div className="map-legend__header">
            <div className="display-flex flex-align-center">
            <h3 className="map-legend__title margin-right-1">{title}</h3>
                    {/* COG Layer Toggle - only show when COG layer is available */}
              {hasCogLayer && (
                <button
                  className={`map-legend__toggle-button ${
                    cogVisible ? "map-legend__toggle-button--active" : ""
                  }`}
                  onClick={onCogToggle}
                  title={cogVisible ? "Hide Data Layer" : "Show Data Layer"}
                  aria-label={
                    cogVisible ? "Hide data layer" : "Show data layer"
                  }
                >
                  {cogVisible ? <Icon.Visibility /> : <Icon.VisibilityOff />}
                </button>
              )}
                    </div>

            <div className="map-legend__header-controls">
              <button
                className="map-legend__close-btn"
                onClick={toggleLegend}
                aria-label="Close legend"
              >
                −
              </button>
            </div>
          </div>
          <div className="map-legend__content">
            {content.type === "gradient" ? (
              <LegendGradient
                colorScheme={content.colorScheme}
                minValue={content.minValue}
                maxValue={content.maxValue}
                units={formatUnits(content.units)}
                steps={content.steps}
              />
            ) : (
              <LegendTable items={content.items} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLegend;
