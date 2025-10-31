import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { eq, and, sql } from "drizzle-orm";
import { lessonCreateContract, lessonListQuery } from "@/contracts/lessons";
import { requireUserId } from "@/lib/auth";
import { courses, courseModules, lessons } from "@/db/schema"; // adjust names if different

// GET /api/lessons?module_id=...&limit=&offset=
export async function GET(req: NextRequest) {
  const userId = await requireUserId();
  const url = new URL(req.url);
  const q = lessonListQuery.safeParse(Object.fromEntries(url.searchParams));
  if (!q.success) {
    return NextResponse.json({ error: { message: "Invalid query", issues: q.error.issues }}, { status: 400 });
  }
  const { module_id, limit = 100, offset = 0 } = q.data;

  const rows = await db
    .select({
      id: lessons.id,
      moduleId: lessons.moduleId,
      title: lessons.title,
      status: lessons.status,
      generationStatus: lessons.generationStatus,
      position: lessons.position,
      content: lessons.content,
      updated_at: lessons.updatedAt,
    })
    .from(lessons)
    .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .innerJoin(courses, eq(courseModules.courseId, courses.id))
    .where(and(
      eq(lessons.moduleId, module_id),
      eq(courses.ownerUserId, userId),          
      // soft-delete filter lives in separate task
    ))
    .orderBy(lessons.position) // ascending
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ items: rows });
}

// POST /api/lessons
export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  const body = await req.json().catch(() => ({}));
  const parsed = lessonCreateContract.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: "Invalid body", issues: parsed.error.issues }}, { status: 400 });
  }
  const { moduleId, title, content } = parsed.data;

  // Ownership check: module belongs to user's course
  const mod = await db
    .select({ id: courseModules.id, courseId: courseModules.courseId })
    .from(courseModules)
    .innerJoin(courses, eq(courseModules.courseId, courses.id))
    .where(and(eq(courseModules.id, moduleId), eq(courses.ownerUserId, userId)))
    .limit(1);

  if (!mod.length) {
    return NextResponse.json({ error: { message: "Module not found or not owned" }}, { status: 404 });
  }

  // Compute next position in this module (max+1)
  const [maxRow] = await db
    .select({ maxPos: sql<number>`COALESCE(MAX(${lessons.position}), 0)` })
    .from(lessons)
    .where(eq(lessons.moduleId, moduleId));

  const nextPos = (maxRow?.maxPos ?? 0) + 1;

  const [inserted] = await db
    .insert(lessons)
    .values({
      moduleId,
      title,
      status: "draft",
      position: nextPos,
      // Ensure NOT NULL jsonb: default to empty object when missing
      content: content ?? {},
    })
    .returning({
      id: lessons.id,
      moduleId: lessons.moduleId,
      title: lessons.title,
      status: lessons.status,
      position: lessons.position,
      content: lessons.content,
      updated_at: lessons.updatedAt,
    });

  return NextResponse.json(inserted, { status: 201 });
}
