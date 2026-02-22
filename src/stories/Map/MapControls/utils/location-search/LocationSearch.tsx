import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { LocationSearchProps, LocationResult, LocationSearchState } from "./types";
import { searchLocations, debounce } from "./utils";
import "./location-search.scss";

export const LocationSearch: React.FC<LocationSearchProps> = ({
  placeholder = "Search locations...",
  isLoading: externalLoading = false,
  isVisible = true,
  maxResults = 10,
  onLocationSelect,
  onSearchChange,
  results: externalResults,
  className = "",
  position = "dropdown",
}) => {
  const [state, setState] = useState<LocationSearchState>({
    query: "",
    results: [],
    isLoading: false,
    isOpen: false,
    selectedIndex: -1
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use external results if provided, otherwise use internal results
  const displayResults = externalResults || state.results;
  const isLoading = externalLoading || state.isLoading;

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!externalResults) {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
          const results = await searchLocations(query, maxResults);
          setState(prev => ({ 
            ...prev, 
            results, 
            isLoading: false,
            isOpen: query.trim().length > 0
          }));
        } catch (error) {
          console.error('Location search error:', error);
          setState(prev => ({ ...prev, isLoading: false, results: [] }));
        }
      }
    }, 300),
    [externalResults, maxResults]
  );

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setState(prev => ({ 
      ...prev, 
      query, 
      selectedIndex: -1,
      isOpen: query.trim().length > 0
    }));
    
    onSearchChange?.(query);
    
    if (query.trim()) {
      debouncedSearch(query);
    } else {
      setState(prev => ({ ...prev, results: [], isOpen: false }));
    }
  };

  // Handle location selection
  const handleLocationSelect = (location: LocationResult) => {
    setState(prev => ({ 
      ...prev, 
      query: location.name, 
      isOpen: false,
      selectedIndex: -1
    }));
    onLocationSelect?.(location);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!state.isOpen || displayResults.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setState(prev => ({
          ...prev,
          selectedIndex: Math.min(prev.selectedIndex + 1, displayResults.length - 1)
        }));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setState(prev => ({
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, -1)
        }));
        break;
      case 'Enter':
        event.preventDefault();
        if (state.selectedIndex >= 0 && displayResults[state.selectedIndex]) {
          handleLocationSelect(displayResults[state.selectedIndex]);
        }
        break;
      case 'Escape':
        setState(prev => ({ ...prev, isOpen: false, selectedIndex: -1 }));
        inputRef.current?.blur();
        break;
    }
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setState(prev => ({ ...prev, isOpen: false, selectedIndex: -1 }));
      }
    };

    if (state.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [state.isOpen]);

  // Handle input focus
  const handleInputFocus = () => {
    if (state.query.trim() && displayResults.length > 0) {
      setState(prev => ({ ...prev, isOpen: true }));
    }
  };

  if (!isVisible) {
    return null;
  }

  const containerClasses = [
    "location-search",
    position && `location-search--${position}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={containerRef} className={containerClasses}>
      <div className="location-search__container position-relative width-full">
        {/* Search Input */}
        <div className="location-search__input-wrapper position-relative">
          <div className="location-search__icon position-absolute top-0 left-0 height-full display-flex flex-align-center padding-left-105">
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-base-darker"
            >
              <path
                d="M8.5 3C5.46243 3 3 5.46243 3 8.5C3 11.5376 5.46243 14 8.5 14C9.83879 14 11.0659 13.5217 12.0196 12.7266L16.6464 17.3536L17.3536 16.6464L12.7266 12.0196C13.5217 11.0659 14 9.83879 14 8.5C14 5.46243 11.5376 3 8.5 3ZM4 8.5C4 6.01472 6.01472 4 8.5 4C10.9853 4 13 6.01472 13 8.5C13 10.9853 10.9853 13 8.5 13C6.01472 13 4 10.9853 4 8.5Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={state.query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="usa-input location-search__input padding-left-4 padding-right-105 radius-md border-1px border-base-lighter font-body-sm height-5"
            aria-label="Search for locations"
            aria-expanded={state.isOpen}
            aria-haspopup="listbox"
            role="combobox"
            autoComplete="off"
          />
          {isLoading && (
            <div className="location-search__loading position-absolute top-0 right-0 height-full display-flex flex-align-center padding-right-105">
              <div 
                className="location-search__spinner border-2px border-base-lighter radius-pill"
                aria-label="Loading search results"
              ></div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {state.isOpen && displayResults.length > 0 && (
          <div
            ref={resultsRef}
            className="location-search__results bg-white border-1px border-base-lighter radius-md shadow-2 position-absolute width-full z-top"
            role="listbox"
            aria-label="Search results"
          >
            {displayResults.map((location, index) => (
              <button
                key={location.id}
                type="button"
                className={`
                  location-search__result
                  display-block width-full text-left border-0 bg-transparent
                  padding-x-2 padding-y-105 cursor-pointer
                  ${index === state.selectedIndex ? 'location-search__result--selected' : ''}
                  ${index === displayResults.length - 1 ? '' : 'border-bottom-1px border-base-lighter'}
                `.trim().replace(/\s+/g, ' ')}
                onClick={() => handleLocationSelect(location)}
                role="option"
                aria-selected={index === state.selectedIndex}
              >
                <div className="location-search__result-name font-body-sm text-bold text-ink">
                  {location.name}
                </div>
                <div className="location-search__result-subtitle font-body-xs text-base-dark">
                  {location.subtitle}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {state.isOpen && !isLoading && state.query.trim() && displayResults.length === 0 && (
          <div className="location-search__results bg-white border-1px border-base-lighter radius-md shadow-2 position-absolute width-full z-top">
            <div className="padding-2 text-center text-base-dark font-body-xs">
              No locations found for "{state.query}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSearch;