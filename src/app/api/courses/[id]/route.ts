export const runtime = "nodejs";

import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { courses } from "@/db/schema";
import { requireUserId }  from "@/lib/auth";
import { UpdateCourseSchema } from "@/contracts/courses";

// weak ETag based on updated_at timestamp
function etagFromUpdatedAt(date: Date | null) {
  const tag = date ? new Date(date).getTime().toString() : "0";
  return `W/"${tag}"`;
}
function parseIfMatch(req: Request) {
  const h = req.headers.get("if-match");
  if (!h) return null;
  const m = /^W\/"(\d+)"$/.exec(h.trim());
  return m ? Number(m[1]) : null;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();
  params = await params

  const [row] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, params.id), eq(courses.ownerUserId, userId)))
    .limit(1);

  if (!row) {
    return Response.json({ error: { code: "NOT_FOUND", message: "Course not found" } }, { status: 404 });
  }

  const res = Response.json({
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    status: row.status,
    visibility: row.visibility,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  });
  res.headers.set("ETag", etagFromUpdatedAt(row.updatedAt));
  return res;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();

  const ifMatch = parseIfMatch(req);
  if (ifMatch === null) {
    return Response.json(
      { error: { code: "PRECONDITION_REQUIRED", message: 'PATCH requires If-Match: W/"<updated_at_ms>"' } },
      { status: 428 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON body" } }, { status: 400 });
  }

  const parsed = UpdateCourseSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "BAD_REQUEST", details: parsed.error.format() } },
      { status: 400 }
    );
  }
  const patch = parsed.data;

  // load current
  const [current] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, params.id), eq(courses.ownerUserId, userId)))
    .limit(1);

  if (!current) {
    return Response.json({ error: { code: "NOT_FOUND", message: "Course not found" } }, { status: 404 });
  }

  // version check with updated_at
  const currentTag = current.updatedAt ? new Date(current.updatedAt).getTime() : 0;
  if (currentTag !== ifMatch) {
    return Response.json(
      { error: { code: "CONFLICT", message: "Version mismatch", details: { expected: currentTag, got: ifMatch } } },
      { status: 409 }
    );
  }

  const now = new Date();
  const [updated] = await db
    .update(courses)
    .set({
      title: patch.title ?? current.title,
      summary: patch.summary ?? current.summary,
      status: (patch.status as any) ?? current.status,
      visibility: (patch.visibility as any) ?? current.visibility,
      updatedAt: now,
      goals: patch.goals !== undefined ? patch.goals : current.goals,
    })
    .where(eq(courses.id, current.id))
    .returning();

  const res = Response.json({
    id: updated.id,
    title: updated.title,
    slug: updated.slug,
    summary: updated.summary,
    status: updated.status,
    visibility: updated.visibility,
    created_at: updated.createdAt,
    updated_at: updated.updatedAt,
    goals: updated.goals,
  });
  res.headers.set("ETag", etagFromUpdatedAt(updated.updatedAt));
  return res;
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const userId = await requireUserId();

  // soft delete pattern recommended; if you don't have deletedAt guard in list, you can hard delete for now
  const [row] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, params.id), eq(courses.ownerUserId, userId)))
    .limit(1);

  if (!row) {
    return Response.json({ error: { code: "NOT_FOUND", message: "Course not found" } }, { status: 404 });
  }

  // hard delete for MVP (you can switch to soft delete later)
  await db.delete(courses).where(eq(courses.id, row.id));

  return Response.json({ ok: true }, { status: 200 });
}
