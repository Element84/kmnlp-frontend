# 01 General Layout

## Overview
This is the main application layout showing the complete interface with the three main components: chat management controls, chat view, and map view.

## Layout Structure

### Header
- NOAA logo positioned in top-left
- "Map View" button in top-right with X close icon. This can toggle display of the map or close it.
- Clean header with light background

### Three Main Components

#### 1. Chat Management Controls (Top-Left)
- **Position**: Upper left corner, overlaid on the chat view
- **Elements**:
  - Chat management side panel toggle button (hamburger/folder icon)
  - "New Chat" button (blue outline)
- **Functionality**: These controls trigger the chat management popover for managing conversation history

#### 2. Chat View (Left Panel)
- **Width**: Approximately 25-30% of viewport (can be collapsed to ~50px)
- **Background**: Light gray/white
- **Content**:
  - Main conversation area (center section, currently empty in this layout)
  - "Enter Prompt..." text input field (bottom)
  - "Select AOI" button (blue outline)
  - "Submit" button (dark blue) with up arrow
- **Collapsible**: Can be minimized using the blue collapse arrow on the map edge

#### 3. Map View (Main Area)
- **Width**: Approximately 70-75% of viewport (expands when chat is collapsed)
- **Content**: Interactive map showing Gulf of Mexico region with cities (Mobile, Pensacola, Panama City, etc.)
- **Controls** (right side):
  - Area of interest tool button
  - Area search button
  - Map layer options button
  - More options button
  - Zoom in button (+)
  - Zoom out button (-)
  - Marquee zoom button (magnifying glass icon)
- **Additional Elements**:
  - Blue collapse arrow button on left edge (for collapsing chat view)
  - Data visualization legend toggle (bottom left)

## Color Scheme
- **Header**: Light gray/white background
- **Sidebar**: Light gray/white background
- **Map**: Natural geographic colors (green land, blue water)
- **Buttons**: Blue primary (#0076D6), dark gray secondary
- **Text**: Dark gray/black

## Interactive Elements
- Collapsible sidebar (arrow button on map edge)
- Map navigation controls
- Input field for prompts
- Multiple button types with NOAA styling
- Toggle controls for map features

## Key Features
- Split-pane layout with resizable sections
- Federal/NOAA branding compliance
- Accessibility-friendly button sizing
- Clear visual hierarchy
- Geographic focus on Gulf of Mexico region
