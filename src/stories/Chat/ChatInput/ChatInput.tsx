import React, { useEffect, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import "./chat-input.scss";
import { Icon } from "@trussworks/react-uswds";
import { AreaOfInterestPill } from "../AreaOfInterestPill";
import {
  appliedAOIAtom,
  systemModelsAtom,
  modelsDropdownOpenAtom,
  modelsDropdownDropUpAtom,
} from "../../../store/atoms";
import { apiClient } from "../../../services/api-client";
export interface ChatInputProps {
  placeholder?: string;
  isProcessing?: boolean;
  disabled?: boolean;
  handleSubmit?: (e: React.FormEvent) => void;
  onSelectAOI?: () => void;
  onRemoveAOI?: () => void;
  onCancel?: () => void;
  setPrompt: (value: string) => void;
  prompt: string;
  isMapViewOpen?: boolean;
}

export const ChatInput = ({
  placeholder = "Enter Prompt...",
  isProcessing = false,
  disabled = false,
  handleSubmit,
  onSelectAOI,
  onRemoveAOI,
  onCancel,
  setPrompt,
  prompt,
  isMapViewOpen = false,
}: ChatInputProps) => {
  const appliedAOI = useAtomValue(appliedAOIAtom);
  const setAppliedAOI = useSetAtom(appliedAOIAtom);
  const [isModelsDropdownOpen, setIsModelsDropdownOpen] = useAtom(
    modelsDropdownOpenAtom,
  );
  const [dropUp, setDropUp] = useAtom(modelsDropdownDropUpAtom);
  const [models, setModels] = useAtom(systemModelsAtom);
  const modelsButtonRef = useRef<HTMLButtonElement>(null);

  // Estimated dropdown height used to decide whether it fits below the button.
  const MODELS_DROPDOWN_ESTIMATED_HEIGHT = 320;

  // Fetch the available system models on initial load.
  useEffect(() => {
    let isMounted = true;

    apiClient
      .getSystemModels()
      .then((fetchedModels) => {
        if (isMounted) {
          setModels(fetchedModels);
        }
      })
      .catch((error) => {
        console.error("[ChatInput] Failed to load system models:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && handleSubmit) {
      e.preventDefault();
      const formEvent = e as unknown as React.FormEvent;
      handleSubmit(formEvent);
    }
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onCancel?.();
  };

  const handleRemoveAOI = () => {
    console.log("[Jotai AOI] Removing AOI from chat input");
    setAppliedAOI(null);
    onRemoveAOI?.();
  };

  const toggleModelsDropdown = () => {
    const willOpen = !isModelsDropdownOpen;

    if (willOpen) {
      // Open above the button when the map is open, or when there isn't
      // enough room below (e.g. the chat input sits near the bottom of the window).
      const rect = modelsButtonRef.current?.getBoundingClientRect();
      const spaceBelow = rect ? window.innerHeight - rect.bottom : Infinity;
      setDropUp(isMapViewOpen || spaceBelow < MODELS_DROPDOWN_ESTIMATED_HEIGHT);
    }

    setIsModelsDropdownOpen(willOpen);
  };

  return (
    <div className="chat-input radius-lg">
      <form onSubmit={handleSubmit} className="chat-input__form">
        <div className="chat-input__field-container">
          {/* TO DO: Change to USWDS text input */}
          {appliedAOI?.name && (
            <div className="font-body-2xs padding-bottom-1 margin-bottom-1 border-bottom-1px border-base-lighter">
              Active Area of Interest:
              <AreaOfInterestPill
                label={appliedAOI.name}
                onRemove={handleRemoveAOI}
              />{" "}
            </div>
          )}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isProcessing}
            className="chat-input__field"
            rows={1}
          />
        </div>

        <div className="chat-input__actions flex-justify">
          <button
            type="button"
            onClick={onSelectAOI}
            disabled={disabled}
            className="chat-input__aoi-button bg-error-alert"
          >
            Select AOI
          </button>
          <div className="display-flex flex-row ">
            {models.length > 0 && (
              <div className="position-relative padding-right-1">
                <button
                  ref={modelsButtonRef}
                  type="button"
                  onClick={toggleModelsDropdown}
                  disabled={disabled}
                  className="chat-input__models-button display-flex flex-align-center"
                  aria-expanded={isModelsDropdownOpen}
                  aria-haspopup="dialog"
                  aria-controls="chat-input-models-info"
                >
                  <Icon.InfoOutline size={3} className="margin-right-1" />
                  Models{" "}
                  {isModelsDropdownOpen ? (
                    <Icon.ExpandLess size={3} className="text-base-primary" />
                  ) : (
                    <Icon.ExpandMore size={3} className="text-base-primary" />
                  )}
                </button>
                {isModelsDropdownOpen && (
                  <div
                    id="chat-input-models-info"
                    role="dialog"
                    aria-label="Backend models"
                    className={`chat-input__models-dropdown  bg-white shadow-3 border-1px border-base-light radius-md padding-2 ${dropUp ? "chat-input__models-dropdown--above" : ""}`}
                  >
                    <p className="chat-input__models-heading margin-0 margin-bottom-2 font-body-xs text-base-dark">
                      Backend models used for responses
                    </p>
                    <ul className="usa-list usa-list--unstyled margin-0">
                      {models.map((model) => (
                        <li
                          key={model.name}
                          className="chat-input__models-item margin-bottom-2"
                        >
                          <p className="margin-0 font-body-sm text-bold text-base-darker">
                            {model.name}
                          </p>
                          <p className="margin-0 font-body-sm text-base-dark">
                            {model.description}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {isProcessing ? (
              <button
                type="button"
                onClick={handleCancelClick}
                className="chat-input__submit chat-input__submit--cancel"
                aria-label="Stop request"
              >
                <span className="chat-input__stop-icon">■</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={disabled || !prompt.trim()}
                className="chat-input__submit"
                aria-label="Submit prompt"
              >
                <Icon.ArrowUpward
                  width={16}
                  height={16}
                  className="text-base-lightest"
                />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
