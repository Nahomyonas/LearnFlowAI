export const runtime = "nodejs";

import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db/client";
import { courses } from "@/db/schema";
import { requireUserId } from "@/lib/auth";
import { CreateCourseSchema, ListCoursesQuerySchema}from "@/contracts/courses";
import { slugify } from "@/lib/slug";


// Query params for listing user’s courses
// Supports optional filtering by status, search query, and limit
export async function GET(req: Request) {
  const userId = await requireUserId();

  // validate query params
  const url = new URL(req.url);
  const parsed = ListCoursesQuerySchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    query: url.searchParams.get("query") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return Response.json(
      { error: { code: "BAD_REQUEST", details: parsed.error.format() } },
      { status: 400 }
    );
  }
  const { status, query, limit = 20 } = parsed.data;

  const base = eq(courses.ownerUserId, userId);
  const byStatus = status ? eq(courses.status, status) : undefined;
  const bySearch =
    query && query.trim().length > 0
      ? or(ilike(courses.title, `%${query}%`), ilike(courses.summary, `%${query}%`))
      : undefined;

  // build where clause
  const where =
    byStatus && bySearch
      ? and(base, byStatus, bySearch)
      : byStatus
      ? and(base, byStatus)
      : bySearch
      ? and(base, bySearch)
      : base;

  
  const items = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      status: courses.status,
      visibility: courses.visibility,
      updated_at: courses.updatedAt,
    })
    .from(courses)
    .where(where)
    .orderBy(desc(courses.updatedAt))
    .limit(limit);

  return Response.json({ items }, { status: 200 });
}

export async function POST(req: Request) {
  const userId = await requireUserId();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const parsed = CreateCourseSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "BAD_REQUEST", details: parsed.error.format() } },
      { status: 400 }
    );
  }
  const { title, summary } = parsed.data;

  // Generate unique slug (retry once with random suffix if needed)
  const baseSlug = slugify(title);
  let finalSlug = baseSlug;

  const [conflict] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.slug, finalSlug))
    .limit(1);

  if (conflict) {
    finalSlug = `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;
  }

  const [inserted] = await db
    .insert(courses)
    .values({
      ownerUserId: userId,
      title,
      slug: finalSlug,
      summary: summary ?? null,
      // visibility/status default in schema: private/draft
    })
    .returning({
      id: courses.id,
      slug: courses.slug,
      status: courses.status,
    });

  return Response.json(
    { id: inserted.id, slug: inserted.slug, status: inserted.status },
    { status: 201 }
  );
}
