import * as React from "react";
import { useMemo } from "react";
import * as d3 from "d3";
import "./legendContents.scss";

export interface LegendTableItem {
  name: string;
  color: string;
  value: string | number;
}

export interface LegendTableProps {
  items: LegendTableItem[];
}

export interface LegendGradientProps {
  colorScheme: string;
  minValue: number;
  maxValue: number;
  units?: string;
  steps?: number;
}

/**
 * LegendTable - Displays discrete legend items in a table format
 */
export const LegendTable: React.FC<LegendTableProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="legend-table">
      <table className="legend-table__table">
        <thead>
          <tr>
            <th className="legend-table__header">Name</th>
            <th className="legend-table__header legend-table__header--right">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="legend-table__row">
              <td className="legend-table__cell">
                <div className="legend-table__item">
                  <span
                    className="legend-table__color-box"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="legend-table__name">{item.name}</span>
                </div>
              </td>
              <td className="legend-table__cell legend-table__cell--right">
                {item.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * LegendGradient - Displays a continuous gradient legend with min/max values
 */
export const LegendGradient: React.FC<LegendGradientProps> = ({
  colorScheme,
  minValue,
  maxValue,
  units = "",
  steps = 100,
}) => {
  const gradientId = useMemo(
    () => `legend-gradient-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  // Convert string color scheme to D3 interpolator
  const interpolator = useMemo(
    () => getD3ColorScheme(colorScheme),
    [colorScheme]
  );

  const gradientStops = useMemo(() => {
    const stops = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const color = interpolator(t);
      stops.push({ offset: `${(t * 100).toFixed(1)}%`, color });
    }
    return stops;
  }, [interpolator, steps]);

  const tickValues = useMemo(() => {
    const range = maxValue - minValue;
    const numTicks = 5;
    const ticks = [];
    for (let i = 0; i < numTicks; i++) {
      const value = minValue + (range * i) / (numTicks - 1);
      ticks.push(value);
    }
    return ticks;
  }, [minValue, maxValue]);

  return (
    <div className="legend-gradient">
      <svg
        className="legend-gradient__svg"
        width="100%"
        height="20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {gradientStops.map((stop, index) => (
              <stop
                key={index}
                offset={stop.offset}
                stopColor={stop.color}
                stopOpacity="1"
              />
            ))}
          </linearGradient>
        </defs>
        <rect
          x="0"
          y="10"
          width="100%"
          height="20"
          fill={`url(#${gradientId})`}
          rx="2"
        />
      </svg>

      <div className="legend-gradient__labels">
        {tickValues.map((value, index) => {
          const position = ((value - minValue) / (maxValue - minValue)) * 100;
          return (
            <div
              key={index}
              className="legend-gradient__label"
              style={{ left: `${position}%` }}
            >
              <div className="legend-gradient__tick" />
              <span className="legend-gradient__value">
                {value.toFixed(1)}
                {units && ` ${units}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Helper function to get D3 color scheme by name
 */
export const getD3ColorScheme = (
  schemeName: string
): ((t: number) => string) => {
  const schemes: Record<string, ((t: number) => string)> = {
    viridis: d3.interpolateViridis,
    inferno: d3.interpolateInferno,
    magma: d3.interpolateMagma,
    plasma: d3.interpolatePlasma,
    warm: d3.interpolateWarm,
    cool: d3.interpolateCool,
    cubehelix: d3.interpolateCubehelixDefault,
    rainbow: d3.interpolateRainbow,
    sinebow: d3.interpolateSinebow,
    turbo: d3.interpolateTurbo,
    blues: d3.interpolateBlues,
    greens: d3.interpolateGreens,
    greys: d3.interpolateGreys,
    oranges: d3.interpolateOranges,
    purples: d3.interpolatePurples,
    reds: d3.interpolateReds,
    bugn: d3.interpolateBuGn,
    bupu: d3.interpolateBuPu,
    gnbu: d3.interpolateGnBu,
    orrd: d3.interpolateOrRd,
    pubu: d3.interpolatePuBu,
    pubugn: d3.interpolatePuBuGn,
    purd: d3.interpolatePuRd,
    rdpu: d3.interpolateRdPu,
    ylgn: d3.interpolateYlGn,
    ylgnbu: d3.interpolateYlGnBu,
    ylorbr: d3.interpolateYlOrBr,
    ylorrd: d3.interpolateYlOrRd,
  };

  return schemes[schemeName.toLowerCase()] || d3.interpolateViridis;
};
