import type { Meta, StoryObj } from "@storybook/react";
import { MapLegend } from "./mapLegend";

const meta = {
  title: "Map/MapLegend",
  component: MapLegend,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MapLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample pollution data
const sampleItems = [
  { name: "Pollution type 1", color: "#1E3A8A", value: 123 },
  { name: "Pollution type 2", color: "#F59E0B", value: 456 },
  { name: "Pollution type 3", color: "#F97316", value: 789 },
  { name: "Pollution type 4", color: "#22C55E", value: 234 },
];

export const TableCollapsed: Story = {
  args: {
    content: {
      type: "table",
      items: sampleItems,
    },
    defaultOpen: false,
    title: "Pollution Types",
  },
};

export const TableExpanded: Story = {
  args: {
    content: {
      type: "table",
      items: sampleItems,
    },
    defaultOpen: true,
    title: "Pollution Types",
  },
};

export const GradientExpanded: Story = {
  args: {
    content: {
      type: "gradient",
      colorScheme: "inferno",
      minValue: 15,
      maxValue: 30,
      units: "°C",
    },
    defaultOpen: true,
    title: "Sea Surface Temperature",
  },
};

export const GradientViridis: Story = {
  args: {
    content: {
      type: "gradient",
      colorScheme: "viridis",
      minValue: 0,
      maxValue: 100,
      units: "%",
    },
    defaultOpen: true,
    title: "Water Quality Index",
  },
};

export const CustomTitle: Story = {
  args: {
    content: {
      type: "table",
      items: sampleItems,
    },
    defaultOpen: true,
    title: "Water Quality Indicators",
  },
};

export const ManyItems: Story = {
  args: {
    content: {
      type: "table",
      items: [
        { name: "Temperature Anomaly", color: "#DC2626", value: 45 },
        { name: "Salinity Level", color: "#2563EB", value: 32 },
        { name: "Chlorophyll-a", color: "#16A34A", value: 78 },
        { name: "Dissolved Oxygen", color: "#0891B2", value: 92 },
        { name: "pH Level", color: "#7C3AED", value: 8.2 },
        { name: "Turbidity", color: "#CA8A04", value: 15 },
      ],
    },
    defaultOpen: true,
    title: "Ocean Measurements",
  },
};

export const StringValues: Story = {
  args: {
    content: {
      type: "table",
      items: [
        { name: "Temperature", color: "#EF4444", value: "High" },
        { name: "Pressure", color: "#3B82F6", value: "Normal" },
        { name: "Humidity", color: "#10B981", value: "Low" },
      ],
    },
    defaultOpen: true,
    title: "Weather Conditions",
  },
};

export const DepthGradient: Story = {
  args: {
    content: {
      type: "gradient",
      colorScheme: "turbo",
      minValue: 0,
      maxValue: 5000,
      units: "m",
    },
    defaultOpen: true,
    title: "Ocean Depth",
  },
};

export const GradientWithDegreesCelsius: Story = {
  args: {
    content: {
      type: "gradient",
      colorScheme: "inferno",
      minValue: -5,
      maxValue: 35,
      units: "degrees_Celsius",
    },
    defaultOpen: true,
    title: "Temperature (from degrees_Celsius)",
  },
};

export const GradientWithDegreesFahrenheit: Story = {
  args: {
    content: {
      type: "gradient",
      colorScheme: "warm",
      minValue: 20,
      maxValue: 100,
      units: "degrees_Fahrenheit",
    },
    defaultOpen: true,
    title: "Temperature (from degrees_Fahrenheit)",
  },
};
