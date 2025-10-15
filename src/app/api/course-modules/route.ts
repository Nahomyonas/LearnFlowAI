export const runtime = "nodejs";

import { z } from 'zod'
import { and, desc, eq, asc } from 'drizzle-orm'
import { db } from '@/db/client'
import { courseModules, courses } from '@/db/schema'
import { requireUserId } from '@/lib/auth'
import { CreateCourseModuleSchema } from '@/contracts/course-modules'

// Optional: tiny validator for GET query (?mode_state=..., ?limit=...)
const ListModulesQuery = z.object({
  course_id: z.string().uuid(),
  limit: z.coerce.number().int().positive().max(200).optional(),
});

export async function GET(req: Request) {
  const userId = await requireUserId();

  const url = new URL(req.url);
  const parsed = ListModulesQuery.safeParse({
    course_id: url.searchParams.get("course_id") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return Response.json(
      { error: { code: "BAD_REQUEST", details: parsed.error.format() } },
      { status: 400 }
    );
  }
  const { course_id, limit = 200 } = parsed.data;

  // ownership guard (course must belong to user)
  const [course] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(and(eq(courses.id, course_id), eq(courses.ownerUserId, userId)))
    .limit(1);
  if (!course) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Course not found" } },
      { status: 404 }
    );
  }

  const items = await db
    .select({
      id: courseModules.id,
      title: courseModules.title,
      summary: courseModules.summary,
      position: courseModules.position,
      status: courseModules.status,
      updated_at: courseModules.updatedAt,
    })
    .from(courseModules)
    .where(eq(courseModules.courseId, course_id))
    .orderBy(asc(courseModules.position))
    .limit(limit);

  return Response.json({ items }, { status: 200 });
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
