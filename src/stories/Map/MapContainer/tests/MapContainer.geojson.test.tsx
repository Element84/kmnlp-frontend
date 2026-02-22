import React from 'react';
import { render } from '@testing-library/react';
import MapContainer from '../MapContainer';

// Sample GeoJSON AOIs
const AOIS = {
  tokyo: {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [139.5600, 35.9000], [139.9200, 35.9000], [139.9200, 35.5200], [139.5600, 35.5200], [139.5600, 35.9000],
      ]],
    },
    properties: { name: 'Tokyo' },
  },
  florida: {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-87.6349, 30.3960], [-80.0314, 30.3960], [-80.0314, 24.3963], [-87.6349, 24.3963], [-87.6349, 30.3960],
      ]],
    },
    properties: { name: 'Florida' },
  },
  blackSea: {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [27.0, 47.0], [41.7, 47.0], [41.7, 41.0], [27.0, 41.0], [27.0, 47.0],
      ]],
    },
    properties: { name: 'Black Sea' },
  },
  moorea: {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-149.9000, -17.4500], [-149.7500, -17.4500], [-149.7500, -17.5500], [-149.9000, -17.5500], [-149.9000, -17.4500],
      ]],
    },
    properties: { name: 'Moorea, Tahiti' },
  },
};

describe('MapContainer GeoJSON AOI rendering', () => {
  it('renders Tokyo AOI GeoJSON', () => {
    const { getByTestId } = render(<MapContainer geocodeAOI={AOIS.tokyo} />);
    // Replace with actual assertion for your map library
    expect(getByTestId('geojson-layer')).toBeInTheDocument();
  });

  it('renders Florida AOI GeoJSON', () => {
    const { getByTestId } = render(<MapContainer geocodeAOI={AOIS.florida} />);
    expect(getByTestId('geojson-layer')).toBeInTheDocument();
  });

  it('renders Black Sea AOI GeoJSON', () => {
    const { getByTestId } = render(<MapContainer geocodeAOI={AOIS.blackSea} />);
    expect(getByTestId('geojson-layer')).toBeInTheDocument();
  });

  it('renders Moorea, Tahiti AOI GeoJSON', () => {
    const { getByTestId } = render(<MapContainer geocodeAOI={AOIS.moorea} />);
    expect(getByTestId('geojson-layer')).toBeInTheDocument();
  });
});
