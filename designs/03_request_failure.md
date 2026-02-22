# 03 Request Failure

## Overview
Shows the application state when a processing request fails, demonstrating error handling across all three main components with error messaging and recovery options.

## Three Main Components During Error State

### 1. Chat Management Controls
- **State**: Normal operation, available for accessing other conversations if needed
- **Functionality**: Provides escape route to other chats or new conversation during error recovery

### 2. Chat View (Error State)
- **User Query Display**:
  - Same message: "What are the trends in plastic waste accumulation in the Gulf of Mexico over the past five years?"
  - Persistent display: User query remains visible at top for context

- **Failed Process Indicator**:
  - Title: "Process (3 steps) - Failed"
  - Background: White card with red left border (error state)
  - Collapse icon: Chevron up (still expandable)
  - Progress steps:
    1. ✅ "Checking for data associated with Gulf of Mexico betwe..." (completed - green checkmark)
    2. ✅ "Conducting analysis over identified datasets" (completed - green checkmark)
    3. ❌ "Geocoding Gulf of Mexico data" (failed - red X)
    4. ⭕ "Geocoding Gulf of Mexico data of Mexico data datadata as" (skipped - gray circle, text appears corrupted/cut off)

- **Error Details Section**:
  - "Details" button (light blue/gray)
  - Error message: "The geocoding process for the Gulf of Mexico data was unsuccessful."
  - Lorem ipsum text: Placeholder error details explaining the failure
  - Formatted text: Multiple paragraphs providing context about the error

- **User Feedback Options**:
  - Action icons: Copy, thumbs up, thumbs down, flag/report
  - Purpose: Allow user to provide feedback on the error/response

- **Input Area (Recovery State)**:
  - Text field: "Enter Prompt..." placeholder remains available
  - Buttons: "Select AOI" and up arrow submit button restored to normal state for retry

### 3. Map View (Preserved Context)
- **Same Selection**: Blue polygon remains showing previously selected area
- **State**: Map controls and view unchanged from previous state
- **Context Preservation**: Geographic selection maintained for potential retry

## Key UX Patterns
- **Clear Error Communication**: Red visual indicators and explicit messaging
- **Persistent Context**: User query and map selection remain visible
- **Recovery Options**: Input field available for retry
- **Feedback Mechanism**: Icons for user to report issues
- **Details Expansion**: Additional error information available on demand