import type { Meta, StoryObj } from '@storybook/react-vite';
import { LocationSearch } from './LocationSearch';

const meta: Meta<typeof LocationSearch> = {
  title: 'Map/MapControls/LocationSearch',
  component: LocationSearch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A location search component that provides live search functionality for geographic locations. Users can type to search and click on results to navigate to specific locations.',
      },
    },
  },
  argTypes: {
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text for the search input',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Whether the search is currently loading',
    },
    isVisible: {
      control: { type: 'boolean' },
      description: 'Whether the component is visible',
    },
    maxResults: {
      control: { type: 'number' },
      description: 'Maximum number of results to display',
    },
    onLocationSelect: {
      action: 'location-selected',
      description: 'Callback when a location is selected',
    },
    onSearchChange: {
      action: 'search-changed',
      description: 'Callback when search input changes',
    },
    position: {
      control: { type: 'select' },
      options: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'dropdown'],
      description: 'Position variant for different contexts',
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
    placeholder: 'Search locations...',
    isVisible: true,
    maxResults: 10,
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    placeholder: 'Find places in the Gulf of Mexico...',
    isVisible: true,
    maxResults: 10,
  },
};

export const Loading: Story = {
  args: {
    placeholder: 'Search locations...',
    isVisible: true,
    isLoading: true,
    maxResults: 10,
  },
};

export const LimitedResults: Story = {
  args: {
    placeholder: 'Search locations...',
    isVisible: true,
    maxResults: 3,
  },
};

export const TopLeftPosition: Story = {
  args: {
    placeholder: 'Search locations...',
    isVisible: true,
    position: 'top-left',
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: '300px', width: '500px', background: '#f0f0f0' }}>
        <Story />
      </div>
    ),
  ],
};

export const BottomRightPosition: Story = {
  args: {
    placeholder: 'Search locations...',
    isVisible: true,
    position: 'bottom-right',
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: '300px', width: '500px', background: '#f0f0f0' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithCustomStyling: Story = {
  args: {
    placeholder: 'Search Gulf locations...',
    isVisible: true,
    className: 'margin-4',
  },
};