# Key Files in LearnFlowAI

## API
- `src/app/api/courses/route.ts`: Course list/create endpoints
- `src/app/api/course-briefs/route.ts`: Brief list/create endpoints
- `src/app/api/course-modules/route.ts`: Module list/create endpoints
- `src/app/api/auth/[...all]/route.ts`: Auth endpoints
- `src/app/api/db-health/route.ts`: Health check

## Schemas
- `src/db/schema.ts`: Main database schema (courses, briefs, modules, events)
- `src/db/auth-schema.ts`: Auth-related tables (if present)

## Components
- `src/components/dashboard/DashboardClient.tsx`: Main dashboard UI

## Lib
- `src/lib/auth-client.ts`: Client-side auth helpers
- `src/lib/slug.ts`: Slug generation utility

## Config
- `drizzle.config.ts`: Drizzle ORM config
- `package.json`: Project dependencies and scripts
- `tsconfig.json`: TypeScript config and path aliases

## Docs
- `docs/`: Documentation folder (APIs, schemas, architecture, files)

---
For more details, see the other docs in this folder.
