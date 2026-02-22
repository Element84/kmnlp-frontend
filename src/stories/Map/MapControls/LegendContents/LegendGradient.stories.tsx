import type { Meta, StoryObj } from "@storybook/react";
import { LegendGradient } from "./index";

const meta = {
  title: "Map/LegendContents/LegendGradient",
  component: LegendGradient,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LegendGradient>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ViridisGradient: Story = {
  args: {
    colorScheme: "viridis",
    minValue: 0,
    maxValue: 100,
    units: "%",
  },
};

export const InfernoTemperature: Story = {
  args: {
    colorScheme: "inferno",
    minValue: -5,
    maxValue: 35,
    units: "°C",
  },
};

export const TurboDepth: Story = {
  args: {
    colorScheme: "turbo",
    minValue: 0,
    maxValue: 5000,
    units: "m",
  },
};

export const CoolTemperature: Story = {
  args: {
    colorScheme: "cool",
    minValue: 10,
    maxValue: 30,
    units: "°C",
  },
};

export const BluesToGreensChlorophyll: Story = {
  args: {
    colorScheme: "ylgnbu",
    minValue: 0,
    maxValue: 10,
    units: "mg/m³",
  },
};

export const RedsPollution: Story = {
  args: {
    colorScheme: "reds",
    minValue: 0,
    maxValue: 500,
    units: "ppm",
  },
};

export const RainbowSpectrum: Story = {
  args: {
    colorScheme: "rainbow",
    minValue: 400,
    maxValue: 700,
    units: "nm",
  },
};

export const PlasmaFineSteps: Story = {
  args: {
    colorScheme: "plasma",
    minValue: 0,
    maxValue: 1,
    steps: 256,
  },
};

export const MagmaCoarseSteps: Story = {
  args: {
    colorScheme: "magma",
    minValue: 0,
    maxValue: 100,
    units: "%",
    steps: 10,
  },
};

export const WarmGradient: Story = {
  args: {
    colorScheme: "warm",
    minValue: 0,
    maxValue: 50,
    units: "°C",
  },
};

export const CubehelixDefault: Story = {
  args: {
    colorScheme: "cubehelix",
    minValue: 0,
    maxValue: 100,
  },
};

export const Sinebow: Story = {
  args: {
    colorScheme: "sinebow",
    minValue: 0,
    maxValue: 360,
    units: "°",
  },
};
