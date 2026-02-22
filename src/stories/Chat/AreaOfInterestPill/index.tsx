import React from "react";
import "./area-of-interest-pill.scss";

export interface AreaOfInterestPillProps {
  /** The name/label of the area of interest */
  label: string;
  /** Callback when the remove button is clicked */
  onRemove?: () => void;
  /** Additional CSS class name */
  className?: string;
}

export const AreaOfInterestPill: React.FC<AreaOfInterestPillProps> = ({
  label,
  onRemove,
  className = "",
}) => {
  return (
    <div className={`display-inline-flex flex-align-center gap-05 padding-y-05 padding-x-105 bg-primary text-white radius-pill font-body-3xs  line-height-sans-3 text-no-wrap ${className} margin-x-1`}>
      <span className="usa-sr-only">{label}</span>
      <span aria-hidden="true">{label}</span>
      {onRemove && (
        <button
          type="button"
          className="display-flex flex-align-center flex-justify-center padding-0 margin-0 bg-transparent border-0 text-white cursor-pointer width-2 height-2 flex-shrink-0 hover:opacity-80"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default AreaOfInterestPill;
