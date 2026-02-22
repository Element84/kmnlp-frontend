import React, { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import "./chat-input.scss";
import { Button, Icon, TextInput } from "@trussworks/react-uswds";
import { AreaOfInterestPill } from "../AreaOfInterestPill";
import { appliedAOIAtom } from "../../../store/atoms";

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
}: ChatInputProps) => {
  const appliedAOI = useAtomValue(appliedAOIAtom);
  const setAppliedAOI = useSetAtom(appliedAOIAtom);

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
    console.log('[Jotai AOI] Removing AOI from chat input');
    setAppliedAOI(null);
    onRemoveAOI?.();
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

        <div className="chat-input__actions">
          <button
            type="button"
            onClick={onSelectAOI}
            disabled={disabled}
            className="chat-input__aoi-button bg-error-alert"
          >
            Select AOI
          </button>

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
      </form>
    </div>
  );
};
