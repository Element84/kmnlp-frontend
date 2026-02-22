import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { MapContainer, MapViewport, AreaOfInterest } from "./MapContainer";
import { MapControls } from "../MapControls";

const meta: Meta<typeof MapContainer> = {
  title: "Map/MapContainer",
  component: MapContainer,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Interactive map container using MapLibre GL JS for NOAA KMNLP application. Provides Gulf of Mexico focused mapping with area selection capabilities.",
      },
    },
  },
  argTypes: {
    viewport: {
      description: "Current map viewport configuration",
      control: "object",
    },
    collapsed: {
      description: "Whether chat view is collapsed (affects responsive sizing)",
      control: "boolean",
    },
    areaSelectionActive: {
      description: "Whether area selection mode is active",
      control: "boolean",
    },
    onViewportChange: {
      description: "Callback when viewport changes",
      action: "viewport-changed",
    },
    onAreaSelect: {
      description: "Callback when area is selected",
      action: "area-selected",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MapContainer>;

// Default Gulf of Mexico viewport - zoomed out to show entire Gulf
const gulfViewport: MapViewport = {
  latitude: 25.0,
  longitude: -89.0,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

// Interactive wrapper component for stories with state
const MapWithState = (args: any) => {
  const [viewport, setViewport] = useState<MapViewport>(
    args.viewport || gulfViewport
  );
  const [selectedArea, setSelectedArea] = useState<AreaOfInterest | null>(null);

  const handleViewportChange = (newViewport: MapViewport) => {
    setViewport(newViewport);
    args.onViewportChange?.(newViewport);
  };

  const handleAreaSelect = (area: AreaOfInterest) => {
    setSelectedArea(area);
    args.onAreaSelect?.(area);
  };

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <MapContainer
        {...args}
        viewport={viewport}
        onViewportChange={handleViewportChange}
        onAreaSelect={handleAreaSelect}
        selectedArea={selectedArea}
      />
    </div>
  );
};

export const Default: Story = {
  render: MapWithState,
  args: {
    viewport: gulfViewport,
    collapsed: false,
    areaSelectionActive: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default map view focused on Gulf of Mexico region with standard navigation controls.",
      },
    },
  },
};

export const ChatCollapsed: Story = {
  render: MapWithState,
  args: {
    viewport: gulfViewport,
    collapsed: true,
    areaSelectionActive: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Map view with chat panel collapsed, demonstrating responsive layout behavior when more screen space is available for the map.",
      },
    },
  },
};

export const AreaSelectionActive: Story = {
  render: MapWithState,
  args: {
    viewport: gulfViewport,
    collapsed: false,
    areaSelectionActive: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Map in area selection mode. Click on the map to select an area of interest. Cursor changes to crosshair and selection hint is displayed.",
      },
    },
  },
};

export const ZoomedIn: Story = {
  render: MapWithState,
  args: {
    viewport: {
      latitude: 29.3,
      longitude: -89.8,
      zoom: 9,
      pitch: 0,
      bearing: 0,
    },
    collapsed: false,
    areaSelectionActive: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Detailed view of a specific Gulf Coast area, demonstrating higher zoom level visualization suitable for detailed analysis.",
      },
    },
  },
};

export const WithRotation: Story = {
  render: MapWithState,
  args: {
    viewport: {
      latitude: 25.0,
      longitude: -89.0,
      zoom: 5,
      pitch: 45,
      bearing: 30,
    },
    collapsed: false,
    areaSelectionActive: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Map with 3D perspective enabled (pitch) and rotated view (bearing), showcasing advanced visualization capabilities.",
      },
    },
  },
};

// Full layout simulation story
const FullLayoutStory = () => {
  const [viewport, setViewport] = useState<MapViewport>(gulfViewport);
  const [collapsed, setCollapsed] = useState(false);
  const [areaSelectionActive, setAreaSelectionActive] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AreaOfInterest | null>(null);

  return (
    <div
      style={{
        display: "flex",
        height: "600px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Simulated chat panel */}
      <div
        style={{
          width: collapsed ? "50px" : "300px",
          background: "#f1f3f6",
          padding: "16px",
          borderRight: "1px solid #dcdee0",
          transition: "width 0.3s ease",
          overflow: "hidden",
        }}
      >
        <div style={{ minWidth: "250px" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#0076D6" }}>Chat View</h3>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              padding: "8px 16px",
              marginBottom: "8px",
              border: "1px solid #0076D6",
              background: "white",
              color: "#0076D6",
              borderRadius: "4px",
              cursor: "pointer",
              display: "block",
              width: "100%",
            }}
          >
            {collapsed ? "Expand" : "Collapse"} Chat
          </button>
          <button
            onClick={() => setAreaSelectionActive(!areaSelectionActive)}
            style={{
              padding: "8px 16px",
              border: "1px solid #0076D6",
              background: areaSelectionActive ? "#0076D6" : "white",
              color: areaSelectionActive ? "white" : "#0076D6",
              borderRadius: "4px",
              cursor: "pointer",
              display: "block",
              width: "100%",
            }}
          >
            {areaSelectionActive ? "Cancel" : "Select AOI"}
          </button>
          {selectedArea && (
            <div
              style={{
                marginTop: "16px",
                padding: "8px",
                background: "#e6f3ff",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              <strong>Area Selected:</strong>
              <br />
              Coordinates: {selectedArea.coordinates[0].length} points
            </div>
          )}
        </div>
      </div>

      {/* Map container */}
      <div style={{ flex: 1 }}>
        <MapContainer
          viewport={viewport}
          onViewportChange={setViewport}
          collapsed={collapsed}
          areaSelectionActive={areaSelectionActive}
          onAreaSelect={setSelectedArea}
          selectedArea={selectedArea}
        >
          <MapControls
            aoiActive={areaSelectionActive}
            onAOIToggle={() => setAreaSelectionActive(!areaSelectionActive)}
            onZoomIn={() =>
              setViewport((prev) => ({
                ...prev,
                zoom: Math.min(prev.zoom + 1, 22),
              }))
            }
            onZoomOut={() =>
              setViewport((prev) => ({
                ...prev,
                zoom: Math.max(prev.zoom - 1, 0),
              }))
            }
          />
        </MapContainer>
      </div>
    </div>
  );
};

export const FullLayoutSimulation: Story = {
  render: FullLayoutStory,
  parameters: {
    docs: {
      description: {
        story:
          "Complete layout simulation showing MapContainer integrated with a simulated chat panel. Demonstrates responsive behavior, area selection workflow, and state coordination between components.",
      },
    },
  },
};

// Custom map style story
export const CustomStyle: Story = {
  render: MapWithState,
  args: {
    viewport: gulfViewport,
    collapsed: false,
    areaSelectionActive: false,
    mapStyle: {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors",
        },
      },
      layers: [
        {
          id: "osm",
          type: "raster",
          source: "osm",
        },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Map with custom style configuration, demonstrating how to use alternative basemaps and styling. This example uses OpenStreetMap tiles directly.",
      },
    },
  },
};

// Error simulation story
const ErrorMapStory = () => {
  return (
    <div style={{ width: "100%", height: "600px" }}>
      <MapContainer
        viewport={gulfViewport}
        onViewportChange={() => {}}
        mapStyle="invalid-style-url"
        className="map-container--error"
      />
    </div>
  );
};

export const ErrorState: Story = {
  render: ErrorMapStory,
  parameters: {
    docs: {
      description: {
        story:
          "Map in error state with invalid style URL, demonstrating error handling and user feedback when map fails to load.",
      },
    },
  },
};

// Loading simulation story
const LoadingMapStory = () => {
  return (
    <div style={{ width: "100%", height: "600px" }}>
      <MapContainer
        viewport={gulfViewport}
        onViewportChange={() => {}}
        className="map-container--loading"
      />
    </div>
  );
};

export const LoadingState: Story = {
  render: LoadingMapStory,
  parameters: {
    docs: {
      description: {
        story:
          "Map in loading state, showing loading spinner and reduced opacity while map resources are being fetched.",
      },
    },
  },
};
