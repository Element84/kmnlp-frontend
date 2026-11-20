import type { Meta, StoryObj } from '@storybook/react';
import { ProcessDetailsPanel } from './ProcessDetailsPanel';
import type { DatasetMetadata, Step } from '../../../types/api';

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
      description: 'Details about the process steps to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleResults: DatasetMetadata[] = [
  {
    content_type: "DatasetMetadata",
    title: "Gulf of Mexico Coastal Ocean Observing System (GCOOS) Open GIS Data",
    description: "CoralTemp is derived from three different but related 5km daily gap-free SST data sets and provides an internally consistent SST product that stretches from 1985 to present: OSTIA Sea Surface Temperature Reanalysis (1985-2002), Geo-Polar Blended Night-only Sea Surface Temperature Reanalysis (2002-2016), Geo-Polar Blended Night-only Sea Surface Temperature Near Real-Time (2017 to present).",
    temporal_coverage: "1985-01-01 to 2024-12-01",
    spatial_coverage: "Global",
    variables: ["analysed_sst", "sea_ice_area_fraction"],
    landing_page: "https://data.noaa.gov/dataset/gcoos-open-gis-data",
  },
  {
    content_type: "DatasetMetadata",
    title: "Gulf of Mexico Open Data Platform",
    description: "CoralTemp is derived from three different but related 5km daily gap-free SST data sets and provides an internally consistent SST product that stretches from 1985 to present: OSTIA Sea Surface Temperature Reanalysis (1985-2002), Geo-Polar Blended Night-only Sea Surface Temperature Reanalysis (2002-2016), Geo-Polar Blended Night-only Sea Surface Temperature Near Real-Time (2017 to present).",
    temporal_coverage: "1985-01-01 to 2024-12-01",
    spatial_coverage: "Global",
    variables: [],
    landing_page: null,
  },
];

const makeStep = (
  status: Step["status"],
  results: DatasetMetadata[],
): Step[] => [
  {
    id: "step-1",
    title: "Checking for data associated with Gulf of Mexico between 2020-2025",
    status,
    outcome_summary: null,
    progress_updates: null,
    details: {
      content_type: "StepDetails",
      content: {
        content_type: "DatasetSearchDetails",
        query: "Gulf of Mexico data 2020-2025",
        results,
      },
    },
  },
];

const sampleStepDetails: Step[] = makeStep("success", sampleResults);

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
    stepDetails: makeStep("in_progress", sampleResults),
  },
};

export const Failed: Story = {
  args: {
    isOpen: true,
    stepDetails: makeStep("failure", sampleResults),
  },
};

export const SingleDataset: Story = {
  args: {
    isOpen: true,
    stepDetails: makeStep("success", [sampleResults[0]]),
  },
};

export const NoDatasets: Story = {
  args: {
    isOpen: true,
    stepDetails: [
      {
        id: "step-2",
        title: "Processing climate data models",
        status: "success",
        outcome_summary: null,
        progress_updates: null,
        details: {
          content_type: "StepDetails",
          content: {
            content_type: "DatasetSearchDetails",
            query: "climate data models",
            results: [],
          },
        },
      },
    ],
  },
};

export const WithMinimalDataset: Story = {
  args: {
    isOpen: true,
    stepDetails: [
      {
        id: "step-3",
        title: "Analyzing sea surface temperatures",
        status: "success",
        outcome_summary: null,
        progress_updates: null,
        details: {
          content_type: "StepDetails",
          content: {
            content_type: "DatasetSearchDetails",
            query: "sea surface temperatures",
            results: [
              {
                content_type: "DatasetMetadata",
                title: "Basic Ocean Temperature Dataset",
                description: "A simple dataset with minimal metadata for testing purposes.",
                temporal_coverage: "",
                spatial_coverage: "",
                variables: [],
                landing_page: null,
              },
            ],
          },
        },
      },
    ],
  },
};
