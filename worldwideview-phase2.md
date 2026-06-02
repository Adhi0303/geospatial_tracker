# Phase 2 Real-Time Data Framework

## Overview
Phase 2 focuses on building the core infrastructure for live data streaming and internal event propagation. This consists of a WebSocket streaming service and a modular DataBus for plugin communication.

## Project Type
**WEB / BACKEND** (Next.js Monorepo & Node.js Service)

## Success Criteria
- `packages/databus` created and exporting a Pub/Sub implementation.
- `services/websocket` created and running a Socket.IO server.
- The `GlobeViewer` is rendered on the `apps/web` frontend.
- Frontend successfully connects to the WebSocket service.

## Tech Stack
- **Event Bus:** TypeScript, RxJS (or custom EventEmitter)
- **Streaming:** Node.js, Socket.IO, Express
- **Frontend Integration:** Next.js, Socket.IO-Client

## File Structure
```
worldwideview-ai/
├── apps/
│   └── web/ (Integration)
├── packages/
│   └── databus/ (New)
└── services/
    └── websocket/ (New)
```

## Task Breakdown

### 1. Create DataBus Package
- **Agent:** `frontend-specialist`
- **Skill:** `react-best-practices`
- **Priority:** P1
- **Dependencies:** None
- **INPUT→OUTPUT→VERIFY:** 
  - Input: Empty `packages/databus` folder.
  - Output: Configured package with an Event Bus class.
  - Verify: Transpiles without errors.

### 2. Create WebSocket Service
- **Agent:** `backend-specialist`
- **Skill:** `nodejs-best-practices`
- **Priority:** P1
- **Dependencies:** None
- **INPUT→OUTPUT→VERIFY:** 
  - Input: Empty `services/websocket` folder.
  - Output: Node.js Express + Socket.IO server.
  - Verify: Server boots and accepts connections on a specific port (e.g., 8080).

### 3. Integrate Globe & Sockets in Web App
- **Agent:** `frontend-specialist`
- **Skill:** `react-best-practices`
- **Priority:** P0
- **Dependencies:** Tasks 1 & 2
- **INPUT→OUTPUT→VERIFY:** 
  - Input: `apps/web` base setup.
  - Output: `page.tsx` rendering the Globe and connecting to the WebSocket.
  - Verify: Map displays in browser; browser console shows "Connected to WebSocket".

## Phase X: Verification
- [ ] Run `pnpm run build`
- [ ] Run `pnpm run lint`
- [ ] Start dev server `pnpm run dev` (starts both web app and websocket service)
- [ ] Manual verification of real-time connection
