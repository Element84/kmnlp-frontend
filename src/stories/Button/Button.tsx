// import "./button.css";
import { Button, Icon } from "@trussworks/react-uswds";
import "./button.scss";

export interface ButtonProps {
  /** Button contents */
  label: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Whether the map is currently open */
  isMapOpen?: boolean;
}

/** Primary UI component for user interaction */
export const NOAAButton = ({
  label,
  onClick,
  isMapOpen = false,
}: ButtonProps) => {
  return (
    <Button
      type={"button"}
      className={`${isMapOpen ? "noaa-button__outlined" : "noaa-button"}`}
      onClick={onClick}
    >
      {isMapOpen ? (
        <Icon.Close size={3} />
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.5732 1.01642C18.6539 1.03644 18.7296 1.07418 18.7939 1.12677C18.8583 1.17956 18.9107 1.24584 18.9463 1.32111C18.9819 1.3964 19.0001 1.47903 19 1.56232V17.3123C18.9999 17.4423 18.9545 17.5683 18.8721 17.6688C18.7896 17.7692 18.6753 17.8386 18.5479 17.8641L12.9229 18.9891C12.8501 19.0036 12.7749 19.0036 12.7021 18.9891L7.1875 17.8865L1.67285 18.9891C1.59144 19.0053 1.50733 19.0033 1.42676 18.9832C1.34615 18.9631 1.27034 18.9255 1.20605 18.8729C1.14174 18.8202 1.08933 18.7537 1.05371 18.6785C1.01809 18.6033 1.00005 18.5205 1 18.4373V2.68732C1.00008 2.55732 1.04548 2.43137 1.12793 2.33087C1.21037 2.23042 1.32472 2.16104 1.45215 2.13556L7.07715 1.01056C7.14993 0.996012 7.22507 0.996012 7.29785 1.01056L12.8125 2.1131L18.3271 1.01056C18.4086 0.99418 18.4926 0.99648 18.5732 1.01642ZM7.75 16.8514L12.25 17.7518V3.14825L7.75 2.24884V16.8514Z"
            fill="#0050D8"
          />
        </svg>
      )}
      {label}
    </Button>
  );
};
