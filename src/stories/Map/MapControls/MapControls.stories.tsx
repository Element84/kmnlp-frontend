import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { useState } from 'react';
import { MapControls } from '.';
import { MapContainer, MapViewport, AreaOfInterest } from '../MapContainer/MapContainer';
import { type BasemapType } from './utils/basemap-layer/types';
import { type LocationResult } from './utils/location-search/types';

const meta: Meta<typeof MapControls> = {
  title: 'Map/MapControls',
  component: MapControls,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The MapControls component provides a vertical toolbar for map interactions positioned on the right side of the map interface. 
It includes primary tools (Area of Interest selection, area search, layer options, more options), navigation controls (zoom in/out, marquee zoom), 
and utility features (full screen toggle).

## Features
- **Primary Tools**: AOI selection, area search, layer management, and additional options
- **Navigation Controls**: Zoom in/out and marquee zoom functionality  
- **Utility Controls**: Full screen toggle
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive Design**: Adapts to different screen sizes
- **Federal Compliance**: Follows NOAA design system and Section 508 guidelines

## Design System Integration
- Uses NOAA brand colors and spacing
- Consistent with federal design standards
- High contrast mode support
- Reduced motion support for accessibility

## Usage
Place within a MapContainer or map view area. The component will automatically position itself on the right side with proper z-index layering.
        `,
      },
    },
  },
  argTypes: {
    aoiActive: {
      control: 'boolean',
      description: 'Whether area of interest selection is currently active',
    },
    disabled: {
      control: 'boolean', 
      description: 'Whether all controls are disabled',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class name',
    },
  },
  args: {
    onAOIToggle: fn(),
    onAreaSearch: fn(),
    onLayerToggle: fn(),
    onMoreOptions: fn(),
    onZoomIn: fn(),
    onZoomOut: fn(),
    onMarqueeZoom: fn(),
    onFullScreen: fn(),
    onBasemapChange: fn(),
    onLocationSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    aoiActive: false,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default map controls in their normal state. Click any button to see interaction feedback.',
      },
    },
  },
};

export const AOIActive: Story = {
  args: {
    aoiActive: true,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Map controls with Area of Interest selection active. The AOI button shows the active state styling.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    aoiActive: false,
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Map controls in disabled state. All interactions are prevented and visual feedback indicates unavailability.',
      },
    },
  },
};

export const WithMapBackground: Story = {
  args: {
    aoiActive: false,
    disabled: false,
  },
  decorators: [
    (Story) => (
      <div 
        style={{
          position: 'relative',
          width: '100%',
          height: '600px',
          background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 50%, #1E4A72 100%)',
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `,
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Map controls shown against a simulated map background to demonstrate positioning and visual contrast.',
      },
    },
  },
};

// Integration component for showing MapControls with MapContainer

const MapWithControlsIntegration = (controlsProps: any) => {
  const [viewport, setViewport] = useState<MapViewport>({
    latitude: 25.0,
    longitude: -89.0,
    zoom: 4,
    pitch: 0,
    bearing: 0
  });
  const [aoiActive, setAoiActive] = useState(controlsProps.aoiActive || false);
  const [selectedArea, setSelectedArea] = useState<AreaOfInterest | null>(null);
  const [selectedBasemap, setSelectedBasemap] = useState<BasemapType>('light');

  const handleAOIToggle = () => {
    setAoiActive(!aoiActive);
  };

  const handleZoomIn = () => {
    setViewport(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, 22) }));
  };

  const handleZoomOut = () => {
    setViewport(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 0) }));
  };

  const handleAreaSelect = (area: AreaOfInterest) => {
    setSelectedArea(area);
    setAoiActive(false); // Deactivate after selection
  };

  const handleBasemapChange = (basemap: BasemapType) => {
    setSelectedBasemap(basemap);

  };

  const handleLocationSelect = (location: LocationResult) => {

    // In a real app, this would update the map viewport
    setViewport(prev => ({
      ...prev,
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
      zoom: 12
    }));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
      <MapContainer
        viewport={viewport}
        onViewportChange={setViewport}
        areaSelectionActive={aoiActive}
        onAreaSelect={handleAreaSelect}
        selectedArea={selectedArea}
        onBasemapChange={handleBasemapChange}
        collapsed={false}
      >
        <MapControls
          aoiActive={aoiActive}
          onAOIToggle={handleAOIToggle}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}

          onBasemapChange={handleBasemapChange}
          selectedBasemap={selectedBasemap}
          onLocationSelect={handleLocationSelect}
          {...controlsProps}
        />
      </MapContainer>
      
      {/* Status indicator */}
      {aoiActive && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0, 118, 214, 0.9)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 1001
        }}>
          🎯 Click on the map to select an area of interest
        </div>
      )}
      
      {selectedArea && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(33, 200, 52, 0.9)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 1001
        }}>
          ✅ Area selected! {selectedArea.coordinates[0].length} coordinates
        </div>
      )}
    </div>
  );
};

export const InteractionExample: Story = {
  render: MapWithControlsIntegration,
  args: {
    aoiActive: false,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete integration of MapControls with MapContainer. Click the AOI button (top-left in controls) to activate area selection, then click on the map. Use zoom controls to navigate. This demonstrates the full interactive workflow.',
      },
    },
  },
};