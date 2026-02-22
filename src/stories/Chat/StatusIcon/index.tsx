import "./status-icon.scss";

export type StatusType =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "success"
  | "failure"
  | "cancelled";

export interface StatusIconProps {
  status: StatusType;
  size?: "small" | "medium" | "large";
  animated?: boolean;
  className?: string;
}
// TO DO: implement svgr for ICons
const statusConfig = {
  pending: {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="10" cy="10" r="9" stroke="#8D9297" strokeWidth="2" />
      </svg>
    ),
    color: "var(--theme-color-base-light)",
    ariaLabel: "Pending",
  },
  in_progress: {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="10" cy="10" r="9" stroke="#0050D8" strokeWidth="2" />
      </svg>
    ),
    color: "var(--theme-color-primary)",
    ariaLabel: "In progress",
  },
  completed: {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="20" height="20" rx="10" fill="#21C834" />
        <path
          d="M14.1347 5.78694C14.3421 5.60086 14.618 5.49799 14.9043 5.50003C15.1906 5.50207 15.4649 5.60887 15.6692 5.79788C15.8736 5.9869 15.992 6.24335 15.9996 6.51312C16.0072 6.78289 15.9033 7.04488 15.7098 7.24381L9.83628 14.1674C9.73529 14.2699 9.61339 14.3522 9.47788 14.4093C9.34238 14.4665 9.19604 14.4972 9.04763 14.4998C8.89922 14.5024 8.75177 14.4768 8.61412 14.4244C8.47646 14.3721 8.35141 14.2941 8.24646 14.1952L4.35139 10.5238C4.24292 10.4286 4.15592 10.3137 4.09558 10.186C4.03523 10.0584 4.00279 9.9206 4.00017 9.78087C3.99756 9.64115 4.02483 9.50236 4.08035 9.37278C4.13588 9.24321 4.21853 9.1255 4.32337 9.02669C4.42821 8.92787 4.55309 8.84997 4.69056 8.79763C4.82803 8.7453 4.97528 8.71959 5.12352 8.72206C5.27176 8.72452 5.41796 8.75511 5.55338 8.81198C5.68881 8.86886 5.8107 8.95086 5.91177 9.0531L8.99426 11.9571L14.1067 5.81746L14.1347 5.78694Z"
          fill="#FAFAF9"
        />
      </svg>
    ),
    color: "var(--theme-color-success)",
    ariaLabel: "Completed",
  },
  success: {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="20" height="20" rx="10" fill="#21C834" />
        <path
          d="M14.1347 5.78694C14.3421 5.60086 14.618 5.49799 14.9043 5.50003C15.1906 5.50207 15.4649 5.60887 15.6692 5.79788C15.8736 5.9869 15.992 6.24335 15.9996 6.51312C16.0072 6.78289 15.9033 7.04488 15.7098 7.24381L9.83628 14.1674C9.73529 14.2699 9.61339 14.3522 9.47788 14.4093C9.34238 14.4665 9.19604 14.4972 9.04763 14.4998C8.89922 14.5024 8.75177 14.4768 8.61412 14.4244C8.47646 14.3721 8.35141 14.2941 8.24646 14.1952L4.35139 10.5238C4.24292 10.4286 4.15592 10.3137 4.09558 10.186C4.03523 10.0584 4.00279 9.9206 4.00017 9.78087C3.99756 9.64115 4.02483 9.50236 4.08035 9.37278C4.13588 9.24321 4.21853 9.1255 4.32337 9.02669C4.42821 8.92787 4.55309 8.84997 4.69056 8.79763C4.82803 8.7453 4.97528 8.71959 5.12352 8.72206C5.27176 8.72452 5.41796 8.75511 5.55338 8.81198C5.68881 8.86886 5.8107 8.95086 5.91177 9.0531L8.99426 11.9571L14.1067 5.81746L14.1347 5.78694Z"
          fill="#FAFAF9"
        />
      </svg>
    ),
    color: "var(--theme-color-success)",
    ariaLabel: "Completed",
  },
  failed: {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="20" height="20" rx="10" fill="#E41D3D" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.8334 5.34175L14.6584 4.16675L10.0001 8.82508L5.34175 4.16675L4.16675 5.34175L8.82508 10.0001L4.16675 14.6584L5.34175 15.8334L10.0001 11.1751L14.6584 15.8334L15.8334 14.6584L11.1751 10.0001L15.8334 5.34175Z"
          fill="white"
        />
      </svg>
    ),
    color: "var(--theme-color-error)",
    ariaLabel: "Failed",
  },
  failure: {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="20" height="20" rx="10" fill="#E41D3D" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.8334 5.34175L14.6584 4.16675L10.0001 8.82508L5.34175 4.16675L4.16675 5.34175L8.82508 10.0001L4.16675 14.6584L5.34175 15.8334L10.0001 11.1751L14.6584 15.8334L15.8334 14.6584L11.1751 10.0001L15.8334 5.34175Z"
          fill="white"
        />
      </svg>
    ),
    color: "var(--theme-color-error)",
    ariaLabel: "Failed",
  },
  cancelled: {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="10" cy="10" r="9" stroke="#8D9297" strokeWidth="2" />
        <line x1="6" y1="10" x2="14" y2="10" stroke="#8D9297" strokeWidth="2" />
      </svg>
    ),
    color: "var(--theme-color-base-dark)",
    ariaLabel: "Cancelled",
  },
};

export const StatusIcon = ({
  status,
  size = "medium",
  animated = false,
  className = "",
}: StatusIconProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={`status-icon status-icon--${status} status-icon--${size} ${
        animated && status === "in_progress" ? "status-icon--animated" : ""
      } ${className}`}
      role="img"
      aria-label={config.ariaLabel}
      style={{ color: config.color }}
    >
      {config.icon}
    </span>
  );
};
