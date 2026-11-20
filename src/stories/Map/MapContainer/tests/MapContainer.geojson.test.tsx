import { render } from "@testing-library/react";
import MapContainer from "../MapContainer";
import { DEFAULT_VIEWPORT } from "../types";

// Sample GeoJSON AOIs
const AOIS = {
  tokyo: {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [139.56, 35.9],
          [139.92, 35.9],
          [139.92, 35.52],
          [139.56, 35.52],
          [139.56, 35.9],
        ],
      ],
    },
    properties: { name: "Tokyo" },
  },
  florida: {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-87.6349, 30.396],
          [-80.0314, 30.396],
          [-80.0314, 24.3963],
          [-87.6349, 24.3963],
          [-87.6349, 30.396],
        ],
      ],
    },
    properties: { name: "Florida" },
  },
  blackSea: {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [27.0, 47.0],
          [41.7, 47.0],
          [41.7, 41.0],
          [27.0, 41.0],
          [27.0, 47.0],
        ],
      ],
    },
    properties: { name: "Black Sea" },
  },
  moorea: {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-149.9, -17.45],
          [-149.75, -17.45],
          [-149.75, -17.55],
          [-149.9, -17.55],
          [-149.9, -17.45],
        ],
      ],
    },
    properties: { name: "Moorea, Tahiti" },
  },
};

describe("MapContainer GeoJSON AOI rendering", () => {
  it("renders Tokyo AOI GeoJSON", () => {
    const { getByTestId } = render(
      <MapContainer
        geocodeAOI={AOIS.tokyo}
        viewport={DEFAULT_VIEWPORT}
        onViewportChange={() => {}}
        cogInfos={[]}
      />,
    );
    // Replace with actual assertion for your map library
    expect(getByTestId("geojson-layer")).toBeInTheDocument();
  });

  it("renders Florida AOI GeoJSON", () => {
    const { getByTestId } = render(
      <MapContainer
        geocodeAOI={AOIS.florida}
        viewport={DEFAULT_VIEWPORT}
        onViewportChange={() => {}}
        cogInfos={[]}
      />,
    );
    expect(getByTestId("geojson-layer")).toBeInTheDocument();
  });

  it("renders Black Sea AOI GeoJSON", () => {
    const { getByTestId } = render(
      <MapContainer
        geocodeAOI={AOIS.blackSea}
        viewport={DEFAULT_VIEWPORT}
        onViewportChange={() => {}}
        cogInfos={[]}
      />,
    );
    expect(getByTestId("geojson-layer")).toBeInTheDocument();
  });

  it("renders Moorea, Tahiti AOI GeoJSON", () => {
    const { getByTestId } = render(
      <MapContainer
        geocodeAOI={AOIS.moorea}
        viewport={DEFAULT_VIEWPORT}
        onViewportChange={() => {}}
        cogInfos={[]}
      />,
    );
    expect(getByTestId("geojson-layer")).toBeInTheDocument();
  });
});
