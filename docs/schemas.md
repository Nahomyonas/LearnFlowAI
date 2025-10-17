# Database Schemas

LearnFlowAI uses Drizzle ORM for schema management. Main tables:

## courses
- `id`: UUID, primary key
- `ownerUserId`: string, user who owns the course
- `title`: string
- `slug`: string, unique
- `summary`: string, optional
- `visibility`: enum ('private', 'unlisted', 'public')
- `status`: enum ('draft', 'published', 'archived')
- `deletedAt`: timestamp, nullable (soft-delete)
- `createdAt`, `updatedAt`: timestamps
- `briefId`: UUID, FK to courseBriefs
- `goals`: jsonb[], nullable (planned)

## courseBriefs
- `id`: UUID, primary key
- `ownerUserId`: string
- `source`: enum ('manual', 'bot')
- `modeState`: enum (various states)
- `topic`, `details`: string
- `learnerLevel`, `targetDifficulty`: enums
- `goals`, `prereqSuggestions`, `planOutline`, `planOutcomes`, `modelMetadata`: jsonb
- `version`: integer
- `committedCourseId`: UUID, FK to courses
- `createdAt`, `updatedAt`: timestamps

## briefEvents
- `id`: UUID, primary key
- `briefId`: UUID, FK to courseBriefs
- `actor`: enum ('user', 'bot')
- `type`: enum (various event types)
- `payload`: jsonb
- `createdAt`: timestamp

## modules
- `id`: UUID, primary key
- `courseId`: UUID, FK to courses
- `title`: string
- `summary`: string, optional
- `position`: integer
- `status`: enum
- `deletedAt`: timestamp, nullable
- `createdAt`, `updatedAt`: timestamps

## lessons (planned)
- `id`: UUID, primary key
- `moduleId`: UUID, FK to modules
- `title`: string
- `content`: jsonb
- `position`: integer
- `status`: enum
- `deletedAt`: timestamp, nullable
- `createdAt`, `updatedAt`: timestamps

---
All tables use soft-delete (`deletedAt`). Relations are defined using Drizzle's `relations()` API.
