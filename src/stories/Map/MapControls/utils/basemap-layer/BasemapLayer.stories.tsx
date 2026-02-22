import type { Meta, StoryObj } from '@storybook/react-vite';
import { BasemapLayer } from './BasemapLayer';

const meta: Meta<typeof BasemapLayer> = {
  title: 'Map/MapControls/BasemapLayer',
  component: BasemapLayer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A basemap layer selector component that allows users to choose between different map styles (Outdoors, Light, Dark, Satellite).',
      },
    },
  },
  argTypes: {
    selectedBasemap: {
      control: { type: 'select' },
      options: ['outdoors', 'light', 'dark', 'satellite'],
      description: 'Currently selected basemap type',
    },
    onBasemapChange: {
      action: 'basemap-changed',
      description: 'Callback when basemap selection changes',
    },
    isVisible: {
      control: { type: 'boolean' },
      description: 'Whether the component is visible',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS class name',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selectedBasemap: 'light',
    isVisible: true,
  },
};

export const OutdoorsSelected: Story = {
  args: {
    selectedBasemap: 'outdoors', 
    isVisible: true,
  },
};

export const DarkSelected: Story = {
  args: {
    selectedBasemap: 'dark',
    isVisible: true,
  },
};

export const SatelliteSelected: Story = {
  args: {
    selectedBasemap: 'satellite',
    isVisible: true,
  },
};

export const Hidden: Story = {
  args: {
    selectedBasemap: 'light',
    isVisible: false,
  },
};

export const WithCustomClass: Story = {
  args: {
    selectedBasemap: 'dark',
    isVisible: true,
    className: 'margin-4',
  },
};

export const TopLeftPosition: Story = {
  args: {
    selectedBasemap: 'outdoors',
    isVisible: true,
    position: 'top-left',
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: '300px', width: '400px', background: '#f0f0f0' }}>
        <Story />
      </div>
    ),
  ],
};

export const BottomRightPosition: Story = {
  args: {
    selectedBasemap: 'satellite',
    isVisible: true,
    position: 'bottom-right',
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: '300px', width: '400px', background: '#f0f0f0' }}>
        <Story />
      </div>
    ),
  ],
};