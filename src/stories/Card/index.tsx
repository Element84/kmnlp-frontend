import React from "react";
import { Icon } from "@trussworks/react-uswds";

export interface CardProps {
  title: string;
  subtitle?: string;
  onClick?: () => void;
  showArrow?: boolean;
  className?: string;
  children?: React.ReactNode;
  isExpanded?: boolean;
  expandable?: boolean;
}

export const Card = ({
  title,
  subtitle,
  onClick,
  showArrow = true,
  className = "",
  children,
  isExpanded = false,
  expandable = false,
}: CardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  // Determine which icon to show
  const showChevron = expandable;
  const showNavigateArrow = !expandable && showArrow;

  return (
    <div
      className={`bg-white border-1px border-base-lighter radius-md overflow-hidden ${className}`}
    >
      <div
        className={`padding-2 display-flex flex-column ${
          onClick ? "cursor-pointer hover:bg-base-lightest " : ""
        }`}
        style={{
          transition: "all 0.2s ease",
        }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={
          onClick ? `${title}${subtitle ? `, ${subtitle}` : ""}` : undefined
        }
        aria-expanded={expandable ? isExpanded : undefined}
      >
        <div className="display-flex flex-align-center flex-justify width-full">
          <div className="display-flex flex-column flex-1">
            <div className="font-sans-sm text-bold text-base-darkest margin-y-0 line-height-sans-3">
              {title}
            </div>
            {subtitle && (
              <div className="font-sans-sm text-normal text-base margin-top-05 line-height-sans-3">
                {subtitle}
              </div>
            )}
          </div>
          {showNavigateArrow && (
            <div className="display-flex flex-align-center text-base-light margin-left-1">
              <Icon.NavigateNext size={3} />
            </div>
          )}
          {showChevron && (
            <div className="display-flex flex-align-center text-base-dark margin-left-1">
              <Icon.ExpandLess
                size={3}
                style={{
                  transition: "transform 0.2s ease",
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </div>
          )}
        </div>
      </div>
      {expandable && isExpanded && children && (
        <div className="padding-2 bg-white border-top-1px border-base-lighter">
          {children}
        </div>
      )}
    </div>
  );
};
