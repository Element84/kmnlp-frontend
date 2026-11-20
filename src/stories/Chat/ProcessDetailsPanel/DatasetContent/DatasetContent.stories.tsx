import type { Meta, StoryObj } from '@storybook/react';
import { DatasetContent } from './index';
import type { DatasetInfo } from '../ProcessDetailsPanel';

const meta: Meta<typeof DatasetContent> = {
  title: 'Chat/DatasetContent',
  component: DatasetContent,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A component that displays expandable dataset information with metadata, external links, and descriptions. Uses USWDS utility classes for styling.',
      },
    },
  },
  argTypes: {
    datasets: {
      description: 'Array of dataset information to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleDatasets: DatasetInfo[] = [
  {
    name: "Gulf of Mexico Coastal Ocean Observing System (GCOOS) Open GIS Data",
    title: "Gulf of Mexico Coastal Ocean Observing System (GCOOS) Open GIS Data",
    description: "CoralTemp is derived from three different but related 5km daily gap-free SST data sets and provides an internally consistent SST product that stretches from 1985 to present: OSTIA Sea Surface Temperature Reanalysis (1985-2002), Geo-Polar Blended Night-only Sea Surface Temperature Reanalysis (2002-2016), Geo-Polar Blended Night-only Sea Surface Temperature Near Real-Time (2017 to present).",
    datasetPageUrl: "https://data.noaa.gov/dataset/gcoos-open-gis-data",
    temporalCoverage: "1985-01-01 to 2024-12-01",
    spatialCoverage: "Global",
    variables: ["analysed_sst", "sea_ice_area_fraction"]
  },
  {
    name: "Gulf of Mexico Open Data Platform",
    title: "Gulf of Mexico Open Data Platform",
    description: "CoralTemp is derived from three different but related 5km daily gap-free SST data sets and provides an internally consistent SST product that stretches from 1985 to present: OSTIA Sea Surface Temperature Reanalysis (1985-2002), Geo-Polar Blended Night-only Sea Surface Temperature Reanalysis (2002-2016), Geo-Polar Blended Night-only Sea Surface Temperature Near Real-Time (2017 to present).",
    variables: [],
  }
];

export const Default: Story = {
  args: {
    datasets: sampleDatasets,
  },
};

export const SingleDataset: Story = {
  args: {
    datasets: [sampleDatasets[0]],
  },
};

export const MinimalDataset: Story = {
  args: {
    datasets: [
      {
        name: "Basic Ocean Temperature Dataset",
        title: "Basic Ocean Temperature Dataset",
        description: "A simple dataset with minimal metadata for testing purposes.",
        variables: [],
      }
    ] as DatasetInfo[],
  },
};

export const NoDatasets: Story = {
  args: {
    datasets: [],
  },
};