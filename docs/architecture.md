# Architecture Overview

LearnFlowAI is a modular, full-stack application for course authoring and adaptive learning. Key architectural features:

## Tech Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Next.js API routes, Drizzle ORM, PostgreSQL
- **Auth:** Better Auth (with Drizzle adapter)
- **Testing:** Vitest

## Structure
- `src/app/api/` — API routes for all resources (courses, modules, briefs, etc.)
- `src/db/` — Database schema definitions and Drizzle client
- `src/components/` — React components (dashboard, forms, etc.)
- `src/lib/` — Utility libraries (auth, slug, etc.)
- `drizzle.config.ts` — Drizzle migration/config
- `docs/` — Documentation

## Data Model
- **Course** → **Module** → **Lesson** (planned)
- **CourseBrief**: Draft/AI-generated course plans, can be committed to a Course
- **Events**: Track changes and actions on briefs
- **Soft-delete**: All major tables support soft-delete via `deletedAt`

## API Design
- RESTful endpoints, mostly resource-based
- Auth required for all mutating endpoints
- ETag-based concurrency for PATCH (planned)
- Filtering, pagination, and search supported

## Extensibility
- New resources (e.g., lessons) can be added by extending schema and API
- Modular code structure for easy maintenance
- Schema and API changes managed via Drizzle migrations

## Security
- Auth enforced via Better Auth middleware
- Ownership checks for all resource mutations
- Soft-delete prevents accidental data loss

## Testing
- Unit tests for API endpoints using Vitest
- Database cleanup and mocking for isolation

---
This architecture supports rapid iteration, clear separation of concerns, and future expansion for adaptive learning features.
