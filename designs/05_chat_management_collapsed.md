# 05 Chat Management Collapsed

## Overview
Shows the application with the chat management popover hidden/collapsed. This displays the standard three-component layout: chat management controls (minimized), chat view, and map view.

## Layout Structure

### Header
- **NOAA Logo**: Positioned in top-left
- **Map View Button**: Top-right with X close icon
- **Same Styling**: Consistent with other views

### Three Main Components

#### 1. Chat Management Controls (Collapsed State)
- **Position**: Upper left corner of chat view
- **Visibility**: Management controls visible but popover panel is closed
- **Elements**:
  - Chat management toggle button (hamburger/folder icon)
  - "New Chat" button
- **State**: Ready to trigger chat management popover when clicked

#### 2. Chat View (Main Left Panel)
- **Width**: Standard width (~25-30% viewport)
- **Background**: Light gray/white
- **Content**:
  - Main conversation area (empty/ready for new chat)
  - "Enter Prompt..." text field at bottom
  - "Select AOI" button (blue outline)  
  - Up arrow submit button (blue)
- **State**: Clean interface prepared for new input, no conversation history visible

#### 3. Map View (Main Area)
- **Width**: ~70-75% of viewport
- **Content**: Gulf Coast region with standard geographic features
- **Controls**: All map controls visible on right side
- **State**: No active polygon or selected area visible

## Collapsed State Features
- **Minimal Management UI**: Chat history/management hidden
- **Focus on Input**: Primary interaction is new prompt entry
- **Expandable Design**: Icons suggest management panel can be expanded
- **Clean Interface**: Uncluttered view for starting new conversations

## Navigation Elements
- **Sidebar Icons**: Multiple small icons indicating hidden features
- **Expand Controls**: Visual cues for revealing additional functionality
- **Consistent Branding**: NOAA styling maintained throughout

## User Flow
- **New Chat Mode**: Interface optimized for starting fresh conversations
- **Hidden History**: Previous chats accessible but not visually prominent
- **Map Integration**: Geographic selection tools remain available
- **Streamlined Experience**: Reduced cognitive load for new users

## Key Design Principles
- **Progressive Disclosure**: Advanced features hidden until needed
- **Clean Start**: Uncluttered interface for new interactions
- **Accessible Expansion**: Management features available on demand
- **Consistent Layout**: Core structure maintained across states