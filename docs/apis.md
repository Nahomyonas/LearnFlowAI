git# API Endpoints

This document describes the main API endpoints for LearnFlowAI.

## Courses
- `GET /api/courses` — List courses for the authenticated user. Supports filtering by status, search query, and limit.
- `POST /api/courses` — Create a new course. Requires a title and optional summary. Returns the created course.
- `GET /api/courses/[id]` — Get details for a specific course.
- `PATCH /api/courses/[id]` — Update a course (not implemented in all files yet).
- `DELETE /api/courses/[id]` — Soft-delete a course (sets `deletedAt`).

## Course Briefs
- `GET /api/course-briefs` — List course briefs for the authenticated user.
- `POST /api/course-briefs` — Create a new course brief.
- `GET /api/course-briefs/[id]` — Get details for a specific brief.
- `PATCH /api/course-briefs/[id]` — Inline editing with ETag support.
- `POST /api/course-briefs/[id]/commit` — Commit a brief to a course.

## Course Modules
- `GET /api/modules?course_id=...` — List modules for a course, ordered by position.
- `POST /api/modules` — Create a new module for a course.
- `GET /api/modules/[id]` — Get details for a specific module.
- `PATCH /api/modules/[id]` — Update a module.
- `DELETE /api/modules/[id]` — Soft-delete a module.

## Auth
- `POST /api/auth/signin` — Sign in with credentials.
- `POST /api/auth/signout` — Sign out.
- `GET /api/auth/session` — Get current session info.

## Health
- `GET /api/db-health` — Check database connectivity.

## Lessons (planned)
- `POST /api/lessons` — Create a lesson for a module.
- `GET /api/lessons?module_id=...` — List lessons for a module.
- `GET/PATCH/DELETE /api/lessons/[id]` — Manage individual lessons.

---
All endpoints require authentication unless otherwise noted. Most endpoints support soft-delete filtering (`deletedAt IS NULL`).
