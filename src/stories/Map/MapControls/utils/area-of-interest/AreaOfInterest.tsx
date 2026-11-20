import * as React from "react";
import { useEffect, useCallback } from "react";
import { AreaOfInterestProps } from "./types";

export const AreaOfInterest: React.FC<AreaOfInterestProps> = ({
  isActive,
  onCancel,
}) => {
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onCancel?.();
        break;
      case 'Enter':
        // Could be used to complete polygon if we have enough points
        // This would be handled by the map component
        break;
    }
  }, [isActive, onCancel]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, handleKeyDown]);

  // This component doesn't render anything visible itself
  // The polygon drawing is handled by the map component
  // This component serves as a controller for the drawing state
  return null;
};

export default AreaOfInterest;