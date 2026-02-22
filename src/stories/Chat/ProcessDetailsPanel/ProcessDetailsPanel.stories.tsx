import type { Meta, StoryObj } from '@storybook/react';
import { ProcessDetailsPanel } from './ProcessDetailsPanel';

const meta: Meta<typeof ProcessDetailsPanel> = {
  title: 'Chat/ProcessDetailsPanel',
  component: ProcessDetailsPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A sliding side panel that displays detailed information about process steps, including datasets, metadata, and external links. Matches the NOAA design system with USWDS styling.',
      },
    },
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the panel is visible',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when panel is closed',
    },
    stepDetails: {
      description: 'Details about the process step to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleStepDetails = {
  stepNumber: 1,
  title: "Checking for data associated with Gulf of Mexico between 2020-2025",
  status: "completed" as const,
  datasets: [
    {
      name: "Gulf of Mexico Coastal Ocean Observing System (GCOOS) Open GIS Data",
      description: "CoralTemp is derived from three different but related 5km daily gap-free SST data sets and provides an internally consistent SST product that stretches from 1985 to present: OSTIA Sea Surface Temperature Reanalysis (1985-2002), Geo-Polar Blended Night-only Sea Surface Temperature Reanalysis (2002-2016), Geo-Polar Blended Night-only Sea Surface Temperature Near Real-Time (2017 to present).",
      datasetPageUrl: "https://data.noaa.gov/dataset/gcoos-open-gis-data",
      temporalCoverage: "1985-01-01 to 2024-12-01",
      spatialCoverage: "Global",
      variables: ["analysed_sst", "sea_ice_area_fraction"]
    },
    {
      name: "Gulf of Mexico Open Data Platform",
      description: "CoralTemp is derived from three different but related 5km daily gap-free SST data sets and provides an internally consistent SST product that stretches from 1985 to present: OSTIA Sea Surface Temperature Reanalysis (1985-2002), Geo-Polar Blended Night-only Sea Surface Temperature Reanalysis (2002-2016), Geo-Polar Blended Night-only Sea Surface Temperature Near Real-Time (2017 to present).",
      bucketUrl: "https://s3.amazonaws.com/noaa-gom-data",
    }
  ]
};

export const Default: Story = {
  args: {
    isOpen: true,
    stepDetails: sampleStepDetails,
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    stepDetails: sampleStepDetails,
  },
};

export const InProgress: Story = {
  args: {
    isOpen: true,
    stepDetails: {
      ...sampleStepDetails,
      status: "in_progress",
    },
  },
};

export const Failed: Story = {
  args: {
    isOpen: true,
    stepDetails: {
      ...sampleStepDetails,
      status: "failed",
    },
  },
};

export const SingleDataset: Story = {
  args: {
    isOpen: true,
    stepDetails: {
      ...sampleStepDetails,
      datasets: [sampleStepDetails.datasets![0]]
    },
  },
};

export const NoDatasets: Story = {
  args: {
    isOpen: true,
    stepDetails: {
      stepNumber: 2,
      title: "Processing climate data models",
      status: "completed",
      datasets: []
    },
  },
};

export const WithMinimalDataset: Story = {
  args: {
    isOpen: true,
    stepDetails: {
      stepNumber: 3,
      title: "Analyzing sea surface temperatures",
      status: "completed",
      datasets: [
        {
          name: "Basic Ocean Temperature Dataset",
          description: "A simple dataset with minimal metadata for testing purposes.",
        }
      ]
    },
  },
};