# 02 Chat and Map with In Progress Request

## Overview
Shows the application during an active query processing state, demonstrating how all three main components work together during request processing.

## Three Main Components During Processing

### 1. Chat Management Controls
- **State**: Normal operation, ready to access chat management if needed
- **Position**: Top-left corner of chat view
- **Functionality**: Available but not primary focus during processing

### 2. Chat View (Active Conversation)
- **Content**: Shows active conversation and processing status
- **User Query Display**:
  - Message: "What are the trends in plastic waste accumulation in the Gulf of Mexico over the past five years?"
  - Styling: Light gray background bubble at top of chat area
  - Typography: Standard user input formatting

- **Progress Indicator Panel**:
  - Title: "Process (3 steps) - In Progress"  
  - Background: White card with blue left border accent
  - Collapse Icon: Chevron up (expandable/collapsible)
  - Progress Steps:
    1. ✅ "Checking for data associated with Gulf of Mexico betwe..." (completed - green checkmark)
    2. ✅ "Conducting analysis over identified datasets" (completed - green checkmark) 
    3. 🔵 "Geocoding Gulf of Mexico data" (in progress - blue circle with loading state)
    4. ⭕ "Geocoding Gulf of Mexico data" (pending - gray circle outline)

- **Input Area (Processing State)**:
  - Text field: Still shows "Enter Prompt..." placeholder
  - Buttons: "Select AOI" button visible, Submit button changed to blue square (processing state)

### 3. Map View (With Selection)
- **Geographic Selection**: Blue polygon visible in Gulf of Mexico area  
- **State**: Shows user's area of interest selection
- **Controls**: All map controls remain accessible and positioned identically
- **Visual Feedback**: Clear indication of selected region for query processing

## Map Changes
- **Geographic Selection**: Blue polygon shape visible in Gulf of Mexico area
- **Same Controls**: All map controls remain visible and positioned identically
- **Selected Area**: Shows user has selected a region of interest

## UI States
- **Loading Indicators**: Blue circle for active step
- **Completed States**: Green checkmarks with connecting lines
- **Processing Button**: Submit button shows different state (blue square instead of up arrow)

## Key Interactions
- **Real-time Progress**: Step-by-step process visualization
- **Collapsible Panel**: Progress section can be collapsed/expanded  
- **Area Selection**: Visual feedback on map for selected region
- **Status Communication**: Clear visual hierarchy for process states

## Color Coding
- **Success**: Green (#28A745) for completed steps
- **In Progress**: Blue (#0076D6) for active step
- **Pending**: Gray for future steps
- **Selected Area**: Blue (#0076D6) polygon overlay on map