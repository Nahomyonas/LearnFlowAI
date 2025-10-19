import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { and, eq } from "drizzle-orm";
import { lessonUpdateContract } from "@/contracts/lessons";
import { requireUserId } from "@/lib/auth";
import { courses, courseModules, lessons } from "@/db/schema";

// weak ETag from updated_at
function weakEtag(d: Date | string | null | undefined) {
  const ts = d ? new Date(d).getTime() : Date.now();
  return `W/"${ts}"`;
}

// Load one lesson with ownership guard
async function loadOwnedLesson(lessonId: string, userId: string) {
  const rows = await db
    .select({
      id: lessons.id,
      moduleId: lessons.moduleId,
      title: lessons.title,
      status: lessons.status,
      position: lessons.position,
      content: lessons.content,
      updated_at: lessons.updatedAt,
    })
    .from(lessons)
    .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .innerJoin(courses, eq(courseModules.courseId, courses.id))
    .where(and(eq(lessons.id, lessonId), eq(courses.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

// GET /api/lessons/[id]
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const userId = await requireUserId();
  const item = await loadOwnedLesson(params.id, userId);
  if (!item) return NextResponse.json({ error: { message: "Not found" }}, { status: 404 });

  const etag = weakEtag(item.updated_at);
  const res = NextResponse.json(item);
  res.headers.set("ETag", etag);
  return res;
}

// PATCH /api/lessons/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await requireUserId();
  const current = await loadOwnedLesson(params.id, userId);
  if (!current) return NextResponse.json({ error: { message: "Not found" }}, { status: 404 });

  // optimistic concurrency with weak ETag
  const ifMatch = req.headers.get("if-match");
  const curTag = weakEtag(current.updated_at);
  if (ifMatch && ifMatch !== curTag) {
    return NextResponse.json({ error: { message: "Precondition failed" }}, { status: 412 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = lessonUpdateContract.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: "Invalid body", issues: parsed.error.issues }}, { status: 400 });
  }

  const data = parsed.data;

  // Prevent moving across modules here (keep it simple); allow in a future “reorder” endpoint
  if (data.position !== undefined && data.position < 1) {
    return NextResponse.json({ error: { message: "Invalid position" }}, { status: 400 });
  }

  const [updated] = await db
    .update(lessons)
    .set({
      title: data.title ?? current.title,
      status: (data.status as any) ?? current.status,
      content: data.content ?? current.content,
      position: data.position ?? current.position,
      updatedAt: new Date(),
    })
    .where(eq(lessons.id, current.id))
    .returning({
      id: lessons.id,
      moduleId: lessons.moduleId,
      title: lessons.title,
      status: lessons.status,
      position: lessons.position,
      content: lessons.content,
      updated_at: lessons.updatedAt,
    });

  const res = NextResponse.json(updated);
  res.headers.set("ETag", weakEtag(updated.updated_at));
  return res;
}

// DELETE /api/lessons/[id]  (hard delete for now)
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const userId = await requireUserId();
  const current = await loadOwnedLesson(params.id, userId);
  if (!current) return NextResponse.json({ error: { message: "Not found" }}, { status: 404 });

  await db.delete(lessons).where(eq(lessons.id, current.id));
  return NextResponse.json({ ok: true });
}
