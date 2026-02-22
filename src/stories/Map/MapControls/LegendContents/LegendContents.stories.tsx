import type { Meta, StoryObj } from "@storybook/react";
import { LegendTable, LegendGradient, getD3ColorScheme } from "./index";
import * as d3 from "d3";

// Combined example component
const CombinedLegend = () => (
  <div style={{ padding: "20px", maxWidth: "400px" }}>
    <h3 style={{ marginBottom: "16px" }}>Sea Surface Temperature</h3>
    <LegendGradient
      colorScheme="inferno"
      minValue={15}
      maxValue={30}
      units="°C"
    />
    <div style={{ marginTop: "24px" }}>
      <h4 style={{ marginBottom: "12px", fontSize: "14px" }}>Measurements</h4>
      <LegendTable
        items={[
          { name: "Current", color: "#DC2626", value: "25.3°C" },
          { name: "Average", color: "#3B82F6", value: "22.1°C" },
          { name: "Historical", color: "#10B981", value: "20.5°C" },
        ]}
      />
    </div>
  </div>
);

// LegendTable Stories
const tableMeta = {
  title: "Map/LegendContents/LegendTable",
  component: LegendTable,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LegendTable>;

export default tableMeta;
type TableStory = StoryObj<typeof tableMeta>;

export const DiscreteTable: TableStory = {
  args: {
    items: [
      { name: "High Pollution", color: "#DC2626", value: "100+" },
      { name: "Medium Pollution", color: "#F59E0B", value: "50-100" },
      { name: "Low Pollution", color: "#22C55E", value: "0-50" },
    ],
  },
};

export const OceanData: TableStory = {
  args: {
    items: [
      { name: "Temperature", color: "#EF4444", value: "25°C" },
      { name: "Salinity", color: "#3B82F6", value: "35 PSU" },
      { name: "Chlorophyll", color: "#10B981", value: "2.5 mg/m³" },
      { name: "Dissolved O₂", color: "#06B6D4", value: "8.2 mg/L" },
    ],
  },
};

// LegendGradient Stories
const gradientMeta = {
  title: "Map/LegendContents/LegendGradient",
  component: LegendGradient,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LegendGradient>;

type GradientStory = StoryObj<typeof gradientMeta>;

export const ViridisGradient: GradientStory = {
  args: {
    colorScheme: "viridis",
    minValue: 0,
    maxValue: 100,
    units: "%",
  },
};

export const InfernoTemperature: GradientStory = {
  args: {
    colorScheme: "inferno",
    minValue: -5,
    maxValue: 35,
    units: "°C",
  },
};

export const TurboDepth: GradientStory = {
  args: {
    colorScheme: "turbo",
    minValue: 0,
    maxValue: 5000,
    units: "m",
  },
};

export const CoolTemperature: GradientStory = {
  args: {
    colorScheme: "cool",
    minValue: 10,
    maxValue: 30,
    units: "°C",
  },
};

export const BluesToGreensChlorophyll: GradientStory = {
  args: {
    colorScheme: "ylgnbu",
    minValue: 0,
    maxValue: 10,
    units: "mg/m³",
  },
};

export const RedsPollution: GradientStory = {
  args: {
    colorScheme: "reds",
    minValue: 0,
    maxValue: 500,
    units: "ppm",
  },
};

export const RainbowSpectrum: GradientStory = {
  args: {
    colorScheme: "rainbow",
    minValue: 400,
    maxValue: 700,
    units: "nm",
  },
};

export const FineGradientSteps: GradientStory = {
  args: {
    colorScheme: "plasma",
    minValue: 0,
    maxValue: 1,
    steps: 256, // More steps for smoother gradient
  },
};

export const CoarseGradientSteps: GradientStory = {
  args: {
    colorScheme: "magma",
    minValue: 0,
    maxValue: 100,
    units: "%",
    steps: 10, // Fewer steps for banded appearance
  },
};

// Combined Example
export const CombinedExample = {
  render: () => <CombinedLegend />,
  parameters: {
    docs: {
      description: {
        story: "Example showing both LegendGradient and LegendTable used together for a complete legend.",
      },
    },
  },
};
