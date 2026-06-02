# Phase 1 Foundation

## Overview
Re-initializing the project as **WorldWideView AI**, transitioning from a small backend/frontend architecture into an enterprise-scale Next.js + CesiumJS monorepo. This phase focuses purely on setting up the structural foundation, authentication, and the basic 3D globe.

## Project Type
**WEB** (Next.js Monorepo)

## Success Criteria
- Old backend/frontend directories removed.
- Monorepo initialized (Turborepo/pnpm workspaces).
- Next.js application (`apps/web`) boots successfully.
- CesiumJS globe (`packages/globe`) renders locally.
- Authentication (`packages/auth`) and database schema (`database/prisma`) are configured.

## Tech Stack
- **Framework:** Next.js 14/15, React, TypeScript
- **Monorepo:** Turborepo / pnpm
- **Styling:** Tailwind CSS, Shadcn UI
- **Visualization:** CesiumJS, Resium
- **Auth & DB:** Auth.js, Prisma, PostgreSQL

## File Structure
```
worldwideview-ai/
├── apps/
│   └── web/
├── packages/
│   ├── globe/
│   ├── auth/
│   └── ui/
├── database/
│   └── prisma/
├── package.json
└── turbo.json
```

## Task Breakdown

### 1. Cleanup Old Code
- **Agent:** `orchestrator`
- **Skill:** `bash-linux` (or powershell equivalent)
- **Priority:** P0
- **Dependencies:** None
- **INPUT→OUTPUT→VERIFY:** 
  - Input: Current `backend` and `frontend` folders.
  - Output: Folders deleted.
  - Verify: Directories no longer exist.

### 2. Initialize Monorepo
- **Agent:** `frontend-specialist`
- **Skill:** `nodejs-best-practices`
- **Priority:** P1
- **Dependencies:** Task 1
- **INPUT→OUTPUT→VERIFY:** 
  - Input: Empty root directory.
  - Output: `package.json` with workspaces configured.
  - Verify: `pnpm install` runs without errors.

### 3. Setup Next.js App
- **Agent:** `frontend-specialist`
- **Skill:** `react-best-practices`
- **Priority:** P1
- **Dependencies:** Task 2
- **INPUT→OUTPUT→VERIFY:** 
  - Input: Monorepo root.
  - Output: `apps/web` initialized.
  - Verify: `pnpm run dev` starts the server on port 3000.

### 4. Setup Globe Package
- **Agent:** `frontend-specialist`
- **Skill:** `react-best-practices`
- **Priority:** P2
- **Dependencies:** Task 2
- **INPUT→OUTPUT→VERIFY:** 
  - Input: Monorepo root.
  - Output: `packages/globe` with CesiumJS components.
  - Verify: Component exports successfully and can be imported in `apps/web`.

### 5. Setup Auth and Database
- **Agent:** `security-auditor` & `database-architect`
- **Skill:** `database-design`
- **Priority:** P1
- **Dependencies:** Task 2
- **INPUT→OUTPUT→VERIFY:** 
  - Input: Monorepo root.
  - Output: `database/prisma` schema and `packages/auth` setup.
  - Verify: Prisma client generates successfully.

## Phase X: Verification
- [ ] Run `pnpm run build`
- [ ] Run `pnpm run lint`
- [ ] Start dev server `pnpm run dev`
- [ ] Manual verification of Globe UI
