# NOAA KMNLP Front-End - AI Coding Agent Instructions

## Project Overview

React 18 + TypeScript + Vite application for NOAA's Knowledge Management NLP system. Federal government web app using USWDS design standards with chat interface and MapLibre-based geospatial visualization.

## Critical Architecture Patterns

### Three-Component Layout System

The app has a **specific three-component architecture** (not a typical sidebar + main):

1. **Chat Management Controls** (`ChatManagementControls`) - Dedicated left bar with "New Chat" and history toggle
2. **Chat View** (`ChatView`) - Main conversation interface that collapses/expands
3. **Map View** (`MapContainer`) - Geographic interface that grows when chat collapses

### Unified View State (CRITICAL)

The app uses a **single unified state** for layout, NOT separate boolean flags:

```typescript
type ViewState = "expanded" | "map-maximized" | "map-hidden";
```

- `expanded`: Default state - chat ~30% width, map ~70%
- `map-maximized`: Chat collapsed to 50px strip with **NO input controls**, map maximized
- `map-hidden`: Chat full width, map hidden (future)

**Key Rule**: When implementing layout changes, use `viewState` prop, NOT `isCollapsed` + `hideInputs`. See `src/stories/Chat/ChatView/ChatView.tsx` for reference implementation.

## API Integration Architecture

### Streaming Response Pattern

The backend uses **Server-Sent Events (SSE) streaming** via newline-delimited JSON:

```typescript
// Services follow this pattern:
// 1. apiClient.postToChat() returns ReadableStream
// 2. chatStreamHandler.processStream() parses line-by-line JSON
// 3. useChat hook converts to UI messages/process status
```

Files: `src/services/api-client.ts`, `src/services/chat-stream.ts`, `src/hooks/useChat.ts`

### User Session Management

Backend doesn't persist users - frontend generates temp user IDs on each app load:

- `userSessionManager.initializeSession()` called in `useChat` on mount
- User ID stored in `x-user-id` header for all API calls
- See `src/services/user-session.ts`

### Response Type Mapping

Backend sends `ChatResponse` with discriminated union content types:

- `Plan` → maps to `ProcessStatus` with steps in UI
- `Text` → maps to system message
- `BackendError` → maps to `ErrorState`
- Step status: `success` → `completed`, `failure` → `failed`

## Development Workflow

### Component Development with Storybook

**Always develop components in Storybook first**, not in main app:

```bash
yarn storybook  # Port 6006
```

- All components live in `src/stories/` organized by domain (Chat/, Map/, Layout/)
- Each component has `.tsx`, `.scss`, and `.stories.tsx` files
- Use MSW handlers in `src/mocks/handlers.ts` for API mocking in stories
- Import `src/index.scss` in `.storybook/preview.ts` for global styles

### Screenshot Testing

Automated visual testing via Playwright + Storybook:

```bash
yarn screenshots:all         # All components
yarn screenshots:chat        # Chat group only
yarn screenshots:map         # Map group only
yarn test:screenshots        # Run Playwright tests
```

Screenshots saved to `./temp/`. Uses `tests/screenshot-utils.ts` for component configurations.

### SCSS/USWDS Configuration

USWDS paths configured in `vite.config.ts` with alias `~uswds`. Custom NOAA theme in `src/NOAA-theme.scss`:

- Primary blues: `#0050D8`, `#0076D6`, `#2491FF`
- Typography: OpenSans (Light, Regular), Percolate icon font

**Always use SCSS**, not plain CSS. Use BEM methodology for class names.

## Testing Strategy

### MSW for API Mocking

All API interactions use MSW (Mock Service Worker):

- Handlers in `src/mocks/handlers.ts` mock backend endpoints
- Simulates streaming responses with delays
- Used in both Storybook and tests
- Run `yarn init-msw` if `public/mockServiceWorker.js` missing

### Test Commands

```bash
yarn test              # Run vitest in watch mode
yarn test:run          # Single run
yarn test:coverage     # With coverage report
```

### Terminal Command Timeouts

**Always use timeouts for long-running/blocking commands** to prevent terminal sessions from hanging indefinitely:

```bash
# Development servers (use background processes)
yarn dev               # Use isBackground=true in run_in_terminal
yarn storybook         # Use isBackground=true in run_in_terminal

# Build commands (use reasonable timeouts)
timeout 60 yarn build          # 1 minute timeout
timeout 60 yarn test:run       # 1 minute timeout
```

**Key Rule**: For blocking commands that could hang (dev servers, builds, installs), either:

1. Use `isBackground=true` for servers/watch modes
2. Use `timeout <seconds>` prefix for commands with known completion times
3. Use `Ctrl+C` detection patterns for interactive processes

## Key Files to Reference

### State Management

- `src/hooks/useChat.ts` - Chat messages, streaming, process status
- `src/hooks/useChatManagement.ts` - Chat history list
- `src/App.tsx` - Top-level state orchestration with viewState

### Type Definitions

- `src/types/api.ts` - Backend API types (generated from OpenAPI)
- `ChatResponse` uses discriminated unions on `content.content_type`

### Design Specifications

`designs/` folder has Figma mockup docs with paired `.png` and `.md` files:

- `04_chat_collapsed_map_maximized.md` - Shows map-maximized state
- `06_chat_management_visible.md` - Chat history popover pattern

## Common Pitfalls

1. **Don't create separate `isCollapsed` props** - use unified `viewState`
2. **Don't mock APIs with static data in components** - use MSW handlers
3. **Don't skip Storybook** - components should be developed there first
4. **Backend step status uses 'success'/'failure'** - map to 'completed'/'failed' in UI
5. **Yarn 4 with PnP** - use `yarn` not `npm`, respect `.yarnrc.yml` config

## Environment Variables

Set in `.env` or `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8000  # Backend API URL
VITE_ENABLE_MSW=false                    # Set to 'false' to use real backend (default: enabled in dev)
```

Access via `import.meta.env.VITE_*` in code (see `src/config/api.ts`).

**MSW Control**: By default, MSW is enabled in development. Set `VITE_ENABLE_MSW=false` to connect to real backend. MSW is automatically disabled in production builds.

## Deployment Architecture

### Build Once, Deploy Everywhere Pattern

This project uses **runtime configuration** for environment-agnostic builds:

1. **Build Phase (GitLab CI)**: Creates single artifact with placeholder config
2. **Deploy Phase (Terraform)**: Injects environment-specific configuration at deployment time
3. **Runtime**: Application reads from `window.APP_CONFIG` (injected by Terraform)

Key files:

- `public/config.js` - Runtime configuration template (replaced at deploy time)
- `src/config/api.ts` - Reads runtime config with fallback to build-time env vars
- `scripts/build.sh` - Creates environment-agnostic artifact
- `.gitlab-ci.yml` - CI/CD pipeline for building and uploading artifacts

**Priority**: `window.APP_CONFIG` (runtime) > `import.meta.env.VITE_*` (build-time) > defaults
