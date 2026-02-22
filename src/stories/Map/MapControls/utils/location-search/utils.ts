import { LocationResult } from './types';

// Sample Gulf of Mexico locations for backward compatibility and examples
export const MOCK_LOCATIONS: LocationResult[] = [
  {
    id: 'gulf-shores',
    name: 'Gulf Shores',
    subtitle: 'Alabama, United States - Coastal Research Station',
    coordinates: { latitude: 30.2460, longitude: -87.7008 },
    bbox: { north: 30.3, south: 30.2, east: -87.6, west: -87.8 }
  },
  {
    id: 'gulf-mexico',
    name: 'Gulf of Mexico',
    subtitle: 'Central Basin - Deep Water Research Area',
    coordinates: { latitude: 25.0, longitude: -89.0 },
    bbox: { north: 30.0, south: 18.0, east: -80.0, west: -98.0 }
  },
  {
    id: 'galveston-bay',
    name: 'Galveston Bay',
    subtitle: 'Texas, United States - Marine Ecosystem Study Area',
    coordinates: { latitude: 29.3013, longitude: -94.7977 },
    bbox: { north: 29.5, south: 29.1, east: -94.6, west: -95.0 }
  }
];

// Nominatim API response interface
interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  importance: number;
  boundingbox: [string, string, string, string]; // [south, north, west, east]
  type: string;
  category: string;
  class: string;
}

/**
 * Parse Nominatim result into LocationResult format
 */
const parseNominatimResult = (result: NominatimResult): LocationResult => {
  const displayParts = result.display_name.split(', ');
  const name = displayParts[0];
  const subtitle = displayParts.slice(1).join(', ');
  
  return {
    id: `${result.osm_type}-${result.osm_id}`,
    name,
    subtitle,
    coordinates: {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    },
    bbox: {
      south: parseFloat(result.boundingbox[0]),
      north: parseFloat(result.boundingbox[1]),
      west: parseFloat(result.boundingbox[2]),
      east: parseFloat(result.boundingbox[3]),
    }
  };
};

/**
 * Search locations worldwide using Nominatim (OpenStreetMap) geocoding API
 * @param query - Search query
 * @param maxResults - Maximum number of results to return
 * @returns Promise resolving to matching locations
 */
export const searchLocations = async (
  query: string, 
  maxResults: number = 10
): Promise<LocationResult[]> => {
  // Return Gulf of Mexico sample locations when no query is provided
  if (!query.trim()) {
    return MOCK_LOCATIONS;
  }
  
  // Start searching with just 1 character to make it more responsive
  if (query.length < 1) {
    return [];
  }


  try {
    // Build Nominatim API URL with better parameters
    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      limit: Math.min(maxResults, 15).toString(),
      addressdetails: '1',
      'accept-language': 'en',
      // Remove extratags and namedetails to reduce payload size and improve speed
    });

    const url = `https://nominatim.openstreetmap.org/search?${params}`;
    console.log('Nominatim API URL:', url); // Debug log
    
    // Add headers for proper attribution and rate limiting
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NOAA-KMNLP-Frontend/1.0 (noaa-frontend)', // Simplified user agent
      },
    });

    console.log('API Response status:', response.status); // Debug log

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
    }

    const results: NominatimResult[] = await response.json();
    console.log('Raw API results:', results.length, 'locations found'); // Debug log
    
    if (!results || results.length === 0) {
      console.log('No results from Nominatim API');
      return [];
    }
    
    const parsedResults = results
      .map(parseNominatimResult)
      .sort((a, b) => {
        // Prioritize results that start with the query
        const aNameMatch = a.name.toLowerCase().startsWith(query.toLowerCase());
        const bNameMatch = b.name.toLowerCase().startsWith(query.toLowerCase());
        
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        
        // Secondary sort by name length (shorter names often more relevant)
        return a.name.length - b.name.length;
      })
      .slice(0, maxResults);
      
    console.log('Parsed results:', parsedResults); // Debug log
    return parsedResults;
      
  } catch (error) {
    console.error('Nominatim API search failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      query: query,
      timestamp: new Date().toISOString()
    });
    
    // Fallback to limited local search if API fails
    console.log('Falling back to local search');
    return searchLocationsFallback(query, maxResults);
  }
};

/**
 * Fallback search using basic locations when API is unavailable
 */
const searchLocationsFallback = async (
  query: string, 
  maxResults: number = 10
): Promise<LocationResult[]> => {
  const fallbackLocations: LocationResult[] = [
    {
      id: 'fallback-1',
      name: 'Gulf of Mexico',
      subtitle: 'Ocean, North America',
      coordinates: { latitude: 25.0, longitude: -90.0 },
      bbox: { north: 30.0, south: 18.0, east: -80.0, west: -98.0 }
    },
    {
      id: 'fallback-2',
      name: 'Atlantic Ocean',
      subtitle: 'Ocean',
      coordinates: { latitude: 14.0, longitude: -25.0 },
    },
    {
      id: 'fallback-3',
      name: 'Pacific Ocean',
      subtitle: 'Ocean',
      coordinates: { latitude: 0.0, longitude: -160.0 },
    },
    {
      id: 'fallback-4',
      name: 'Caribbean Sea',
      subtitle: 'Sea, Americas',
      coordinates: { latitude: 15.0, longitude: -75.0 },
    },
    {
      id: 'fallback-5',
      name: 'Bering Sea',
      subtitle: 'Sea, North Pacific',
      coordinates: { latitude: 60.0, longitude: -175.0 },
    }
  ];

  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
  
  const lowercaseQuery = query.toLowerCase();
  
  return fallbackLocations
    .filter(location => 
      location.name.toLowerCase().includes(lowercaseQuery) ||
      location.subtitle.toLowerCase().includes(lowercaseQuery)
    )
    .slice(0, maxResults);
};

/**
 * Debounced search function
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};