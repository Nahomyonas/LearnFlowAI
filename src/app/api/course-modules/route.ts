// app/api/course-briefs/route.ts
import { z } from 'zod'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { courseModules, courses } from '@/db/schema'
import { requireUserId } from '@/libs/auth'
import { CreateCourseModuleSchema } from '@/contracts/course-modules'

// Optional: tiny validator for GET query (?mode_state=..., ?limit=...)
const ListQuerySchema = z.object({
  status: z.enum(['draft', 'published', 'archived']).optional(),
  limit: z.coerce.number().int().positive().max(50).optional(), // default 20
})

export async function GET(req: Request) {
  const userId = await requireUserId()

  // validate query params
  const url = new URL(req.url)
  const parsed = ListQuerySchema.safeParse({
    status: url.searchParams.get('status') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
  })
  if (!parsed.success) {
    return Response.json(
      { error: { code: 'BAD_REQUEST', details: parsed.error.format() } },
      { status: 400 }
    )
  }
  const { status, limit = 20 } = parsed.data

  // build where clause
  const where = status
    ? and(eq(courseModules.courseId, userId), eq(courseModules.status, status))
    : eq(courseModules.courseId, userId)

  // select a few useful fields
  const items = await db
    .select({
      id: courseModules.id,
      title: courseModules.title,
      summary: courseModules.summary,
      position: courseModules.position,
      status: courseModules.status,
    })
    .from(courseModules)
    .where(where)
    .orderBy(desc(courseModules.position))
    .limit(limit)

  return Response.json({ items })
}

export async function POST(req: Request) {
  const userId = await requireUserId()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json(
      { error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 }
    )
  }

  // validate with Zod
  const parsed = CreateCourseModuleSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "BAD_REQUEST", details: parsed.error.format() } },
      { status: 400 }
    );
  }
  const { courseId, title, summary } = parsed.data;

  // ensure the course exists and is owned by this user
  const [course] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.ownerUserId, userId)))
    .limit(1);

  if (!course) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Course not found" } },
      { status: 404 }
    );
  }

  // compute next position: (max position in this course) + 1
  const [last] = await db
    .select({ position: courseModules.position })
    .from(courseModules)
    .where(eq(courseModules.courseId, courseId))
    .orderBy(desc(courseModules.position))
    .limit(1);

  const nextPosition = (last?.position ?? 0) + 1;

  // insert the module
  const [inserted] = await db
    .insert(courseModules)
    .values({
      courseId: courseId,
      title,
      summary: summary ?? null,
      position: nextPosition,
      // status defaults to 'draft'
    })
    .returning({
      id: courseModules.id,
      position: courseModules.position,
      status: courseModules.status,
      created_at: courseModules.createdAt,
    });

  return Response.json(
    {
      id: inserted.id,
      position: inserted.position,
      status: inserted.status,
      created_at: inserted.created_at,
    },
    { status: 201 }
  );
}
