import './viewport-warning.scss';

export interface ViewportWarningProps {
  /** Custom className for styling */
  className?: string;
}

/**
 * ViewportWarning component displays when the browser window is smaller 
 * than the USWDS desktop breakpoint (1024px). It shows the NOAA logo
 * and message indicating the application requires a desktop computer.
 */
export const ViewportWarning = ({
  className = '',
}: ViewportWarningProps) => {
  return (
    <div className={`viewport-warning ${className}`}>
      <div className="viewport-warning__content">
        {/* NOAA Logo SVG */}
        <div className="viewport-warning__logo">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="NOAA Logo"
          >
            <circle cx="100" cy="100" r="100" fill="url(#gradient)" />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#162E51" />
                <stop offset="50%" stopColor="#0076D6" />
                <stop offset="100%" stopColor="#2491FF" />
              </linearGradient>
            </defs>
            {/* NOAA text */}
            <text
              x="100"
              y="85"
              textAnchor="middle"
              fill="white"
              fontSize="24"
              fontWeight="bold"
              fontFamily="OpenSans, Arial, sans-serif"
            >
              NOAA
            </text>
            {/* Stylized wave/bird shape */}
            <path
              d="M50 130 Q75 110 100 130 Q125 110 150 130 Q125 150 100 130 Q75 150 50 130 Z"
              fill="white"
              opacity="0.9"
            />
          </svg>
        </div>

        {/* Warning Message */}
        <div className="viewport-warning__message">
          <p className="viewport-warning__text">
            Currently, the application is not available for mobile devices.
          </p>
          <p className="viewport-warning__subtext">
            Try to use a desktop computer
          </p>
        </div>
      </div>
    </div>
  );
};