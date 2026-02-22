import React from "react";
import "./loading-indicator.scss";

export interface LoadingIndicatorProps {
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Pulsing circular loading indicator
 * Uses NOAA primary blue color with smooth pulse animation
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  className = "",
}) => {
  return (
    <div className={`loading-indicator ${className}`}>
      <div className="loading-indicator__circle" />
    </div>
  );
};
