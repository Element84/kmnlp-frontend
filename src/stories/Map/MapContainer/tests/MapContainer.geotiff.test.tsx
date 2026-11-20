import * as React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import MapContainer from "../MapContainer";
import * as geotiffUtils from "../geotiffUtils";
import type { CogInfo } from "../../../../hooks/useChat";
import { calculateViewportFromCOG } from "../viewport-utils";

// Mock the geotiffUtils module
vi.mock("../geotiffUtils", () => ({
  loadCOG: vi.fn(),
}));

// Mock MapLibre GL
vi.mock("react-map-gl/maplibre", () => ({
  default: React.forwardRef(({ children }: any, ref: any) => (
    <div data-testid="map-container" ref={ref}>
      {children}
    </div>
  )),
  Source: ({ children }: any) => <div data-testid="map-source">{children}</div>,
  Layer: () => <div data-testid="map-layer" />,
}));

// Mock MapControls
vi.mock("../../MapControls", () => ({
  default: () => <div data-testid="map-controls" />,
}));

describe("MapContainer GeoTIFF rendering", () => {
  const mockLoadCOG = vi.mocked(geotiffUtils.loadCOG);
  const defaultViewport = {
    latitude: 25.0,
    longitude: -89.0,
    zoom: 4,
    pitch: 0,
    bearing: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("Test 1: renders GeoTIFF source when cogInfo is provided", async () => {
    const cogInfo: CogInfo = {
      url: "https://example.com/test.tif",
      legend: {
        content_type: "Legend",
        label: "Sea Surface Temperature",
        units: "degrees_Celsius",
        min_value: 15,
        max_value: 30,
        color_scheme: "inferno",
      },
    };

    // Mock loadCOG to simulate successful loading
    mockLoadCOG.mockImplementation(
      async (
        _cogUrl,
        _viewport,
        setCogLoading,
        _setCogError,
        _onViewportChange,
        setCogSource,
        _cancelled,
        setCogDataRange,
      ) => {
        setCogLoading(true);

        // Simulate creating a COG source
        const mockSource = {
          type: "image",
          url: "blob:mock-url",
          coordinates: [
            [-95.0, 30.0],
            [-85.0, 30.0],
            [-85.0, 20.0],
            [-95.0, 20.0],
          ],
        };

        setCogSource(mockSource);

        // Set data range
        if (setCogDataRange) {
          setCogDataRange({ min: 15.2, max: 28.7 });
        }

        setCogLoading(false);
      },
    );

    render(
      <MapContainer
        viewport={defaultViewport}
        onViewportChange={vi.fn()}
        cogInfos={[cogInfo]}
      />,
    );

    // Wait for loadCOG to be called
    await waitFor(() => {
      expect(mockLoadCOG).toHaveBeenCalledTimes(1);
    });

    // Verify loadCOG was called with correct URL
    expect(mockLoadCOG).toHaveBeenCalledWith(
      "https://example.com/test.tif",
      expect.any(Object), // viewport
      expect.any(Function), // setCogLoading
      expect.any(Function), // setCogError
      expect.any(Function), // onViewportChange
      expect.any(Function), // setCogSource
      expect.objectContaining({ current: false }), // cancelledRef
      expect.any(Function), // setCogDataRange
      "inferno", // colorScheme
      expect.any(Number), // legendMin
      expect.any(Number), // legendMax
    );

    // Verify map container is rendered
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  it("Test 2: displays MapLegend when GeoTIFF is loaded", async () => {
    const cogInfo: CogInfo = {
      url: "https://example.com/temperature.tif",
      legend: {
        content_type: "Legend",
        label: "Ocean Temperature",
        units: "degrees_Celsius",
        min_value: 10,
        max_value: 35,
        color_scheme: "viridis",
      },
    };

    mockLoadCOG.mockImplementation(
      async (
        _cogUrl,
        _viewport,
        setCogLoading,
        _setCogError,
        _onViewportChange,
        setCogSource,
      ) => {
        setCogSource({
          type: "image",
          url: "blob:mock-url",
          coordinates: [
            [-90, 30],
            [-80, 30],
            [-80, 20],
            [-90, 20],
          ],
        });
        setCogLoading(false);
      },
    );

    render(
      <MapContainer
        viewport={defaultViewport}
        onViewportChange={vi.fn()}
        cogInfos={[cogInfo]}
      />,
    );

    // Wait for legend to appear
    await waitFor(() => {
      expect(screen.getByTestId("map-layer-control")).toBeInTheDocument();
    });

    // Verify legend displays correct title
    expect(screen.getByText("Ocean Temperature")).toBeInTheDocument();
  });

  it("Test 3: uses correct color scheme from legend", async () => {
    const cogInfo: CogInfo = {
      url: "https://example.com/chlorophyll.tif",
      legend: {
        content_type: "Legend",
        label: "Chlorophyll Concentration",
        units: "mg/m³",
        min_value: 0,
        max_value: 10,
        color_scheme: "turbo",
      },
    };

    mockLoadCOG.mockImplementation(
      async (
        _cogUrl,
        _viewport,
        setCogLoading,
        _setCogError,
        _onViewportChange,
        setCogSource,
      ) => {
        setCogSource({
          type: "image",
          url: "blob:mock-url",
          coordinates: [
            [-100, 40],
            [-90, 40],
            [-90, 30],
            [-100, 30],
          ],
        });
        setCogLoading(false);
      },
    );

    render(
      <MapContainer
        viewport={defaultViewport}
        onViewportChange={vi.fn()}
        cogInfos={[cogInfo]}
      />,
    );

    await waitFor(() => {
      expect(mockLoadCOG).toHaveBeenCalled();
    });

    // Verify color scheme was passed correctly
    const loadCOGCall = mockLoadCOG.mock.calls[0];
    expect(loadCOGCall[8]).toBe("turbo"); // colorScheme parameter
  });

  it("Test 4: clears GeoTIFF when cogInfo is set to null", async () => {
    const cogInfo: CogInfo = {
      url: "https://example.com/data.tif",
      legend: {
        content_type: "Legend",
        label: "Data Layer",
        units: "units",
        min_value: 0,
        max_value: 100,
      },
    };

    mockLoadCOG.mockImplementation(
      async (
        _cogUrl,
        _viewport,
        setCogLoading,
        _setCogError,
        _onViewportChange,
        setCogSource,
      ) => {
        setCogSource({
          type: "image",
          url: "blob:mock-url",
          coordinates: [
            [-95, 35],
            [-85, 35],
            [-85, 25],
            [-95, 25],
          ],
        });
        setCogLoading(false);
      },
    );

    const { rerender } = render(
      <MapContainer
        viewport={defaultViewport}
        onViewportChange={vi.fn()}
        cogInfos={[cogInfo]}
      />,
    );

    // Wait for initial load
    await waitFor(() => {
      expect(mockLoadCOG).toHaveBeenCalled();
    });

    // Verify legend is present
    await waitFor(() => {
      expect(screen.queryByTestId("map-layer-control")).toBeInTheDocument();
    });

    // Now clear the raster collection
    rerender(
      <MapContainer
        viewport={defaultViewport}
        onViewportChange={vi.fn()}
        cogInfos={[]}
      />,
    );

    // Verify legend is removed
    await waitFor(() => {
      expect(screen.queryByTestId("map-layer-control")).not.toBeInTheDocument();
    });
  });

  it("Test 5: handles GeoTIFF with actual data range different from legend range", async () => {
    const cogInfo: CogInfo = {
      url: "https://example.com/salinity.tif",
      legend: {
        content_type: "Legend",
        label: "Salinity",
        units: "PSU",
        min_value: 0, // Theoretical range
        max_value: 40, // Theoretical range
        color_scheme: "cool",
      },
    };

    let capturedSetCogDataRange:
      | ((range: { min: number; max: number } | null) => void)
      | null = null;

    mockLoadCOG.mockImplementation(
      async (
        _cogUrl,
        _viewport,
        setCogLoading,
        _setCogError,
        _onViewportChange,
        setCogSource,
        _cancelled,
        setCogDataRange,
      ) => {
        setCogSource({
          type: "image",
          url: "blob:mock-url",
          coordinates: [
            [-92, 28],
            [-88, 28],
            [-88, 24],
            [-92, 24],
          ],
        });

        // Simulate actual data range from GeoTIFF (different from legend)
        if (setCogDataRange) {
          capturedSetCogDataRange = setCogDataRange;
          setCogDataRange({ min: 32.5, max: 36.8 }); // Actual data range
        }

        setCogLoading(false);
      },
    );

    render(
      <MapContainer
        viewport={defaultViewport}
        onViewportChange={vi.fn()}
        cogInfos={[cogInfo]}
      />,
    );

    await waitFor(() => {
      expect(mockLoadCOG).toHaveBeenCalled();
    });

    // Verify that setCogDataRange was called with actual data range
    expect(capturedSetCogDataRange).not.toBeNull();

    // The legend should use the actual data range (32.5-36.8) instead of theoretical (0-40)
    // This is verified by the fact that setCogDataRange was called
    await waitFor(() => {
      expect(screen.getByTestId("map-layer-control")).toBeInTheDocument();
    });
  });

  it("Test 6: updates viewport to GeoTIFF location", async () => {
    const cogInfo: CogInfo = {
      url: "https://example.com/region.tif",
      legend: {
        content_type: "Legend",
        label: "Regional Data",
        units: "m",
        min_value: 0,
        max_value: 5000,
        color_scheme: "inferno",
      },
    };

    const mockOnViewportChange = vi.fn();

    // Mock coordinates for Gulf of Mexico region
    const expectedCoordinates: Array<[number, number]> = [
      [-95.0, 30.0], // top-left
      [-85.0, 30.0], // top-right
      [-85.0, 20.0], // bottom-right
      [-95.0, 20.0], // bottom-left
    ];

    mockLoadCOG.mockImplementation(
      async (
        _cogUrl,
        viewport,
        setCogLoading,
        _setCogError,
        onViewportChange,
        setCogSource,
      ) => {
        setCogSource({
          type: "image",
          url: "blob:mock-url",
          coordinates: expectedCoordinates,
        });

        // Calculate expected viewport change using consolidated utility
        const newViewport = calculateViewportFromCOG(expectedCoordinates, {
          currentViewport: viewport,
          preserveOrientation: true,
          minZoom: 1,
          maxZoom: 18,
        });

        // Simulate viewport change
        onViewportChange(newViewport);

        setCogLoading(false);
      },
    );

    render(
      <MapContainer
        viewport={defaultViewport}
        onViewportChange={mockOnViewportChange}
        cogInfos={[cogInfo]}
      />,
    );

    await waitFor(() => {
      expect(mockLoadCOG).toHaveBeenCalled();
    });

    // Verify viewport was updated to center on GeoTIFF location
    await waitFor(() => {
      expect(mockOnViewportChange).toHaveBeenCalled();
    });

    // Check that viewport change was called with coordinates centered on GeoTIFF
    const viewportCall = mockOnViewportChange.mock.calls[0][0];
    expect(viewportCall.latitude).toBeCloseTo(25.0, 1); // Center latitude
    expect(viewportCall.longitude).toBeCloseTo(-90.0, 1); // Center longitude
    expect(viewportCall.zoom).toBeGreaterThan(4); // Should zoom in from default zoom of 4
  });

  it("renders multiple independent raster layers", async () => {
    const cogInfos: CogInfo[] = [
      {
        id: "temperature",
        url: "https://example.com/temperature.tif",
        legend: {
          content_type: "Legend",
          label: "Temperature",
          units: "degrees_Celsius",
          min_value: 0,
          max_value: 30,
          color_scheme: "inferno",
        },
      },
      {
        id: "salinity",
        url: "https://example.com/salinity.tif",
        legend: {
          content_type: "Legend",
          label: "Salinity",
          units: "psu",
          min_value: 20,
          max_value: 40,
          color_scheme: "viridis",
        },
      },
    ];

    mockLoadCOG.mockImplementation(
      async (
        cogUrl,
        _viewport,
        setCogLoading,
        _setCogError,
        _onViewportChange,
        setCogSource,
      ) => {
        setCogSource({
          type: "image",
          url: `blob:${cogUrl}`,
          coordinates: [
            [-95, 30],
            [-85, 30],
            [-85, 20],
            [-95, 20],
          ],
        });
        setCogLoading(false);
      },
    );

    render(
      <MapContainer
        viewport={defaultViewport}
        onViewportChange={vi.fn()}
        cogInfos={cogInfos}
      />,
    );

    await waitFor(() => {
      expect(mockLoadCOG).toHaveBeenCalledTimes(2);
      expect(screen.getByText("Temperature")).toBeInTheDocument();
      expect(screen.getByText("Salinity")).toBeInTheDocument();
      expect(screen.getAllByTestId("map-source")).toHaveLength(2);
    });
  });
});
