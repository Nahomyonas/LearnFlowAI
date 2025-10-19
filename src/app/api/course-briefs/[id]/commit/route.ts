export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { courseBriefs, briefEvents, courses } from "@/db/schema";
import { requireUserId } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await requireUserId();
  const {id} = await params;  // brief ID

  // 1) Load brief with owner guard
  const [brief] = await db
    .select()
    .from(courseBriefs)
    .where(and(eq(courseBriefs.id, id), eq(courseBriefs.ownerUserId, userId)))
    .limit(1);

  if (!brief) {
    return Response.json({ error: { code: "NOT_FOUND", message: "Brief not found" } }, { status: 404 });
  }

  // 2) Already committed? (1:1)
  if (brief.committedCourseId) {
    return Response.json(
      { error: { code: "CONFLICT", message: "Brief already committed", details: { courseId: brief.committedCourseId } } },
      { status: 409 }
    );
  }

  // Optional state guard (enable later if you gate by stage)
  // if (brief.modeState !== "outcomes_ready") {
  //   return Response.json({ error: { code: "BAD_STATE", message: "Brief not ready to commit" } }, { status: 400 });
  // }

  const title = brief.topic ?? "Untitled Course";
  const baseSlug = slugify(title);
  const goals = Array.isArray(brief.goals)
  ? (brief.goals).map(String).filter(Boolean)
  : null

  try {
    const result = await db.transaction(async (tx) => {
      // ensure unique slug (simple one-retry strategy)
      let finalSlug = baseSlug;
      const [exists] = await tx
        .select({ id: courses.id })
        .from(courses)
        .where(eq(courses.slug, finalSlug))
        .limit(1);
      if (exists) finalSlug = `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;

      // 3) Create course (link brief on course side)
      const [course] = await tx
        .insert(courses)
        .values({
          ownerUserId: userId,
          title,
          slug: finalSlug,
          summary: brief.details ? String(brief.details).slice(0, 200) : null,
          briefId: brief.id,
          goals: goals
          // visibility/status default via schema
        })
        .returning({ id: courses.id, status: courses.status });

      // 4) Update brief with back-link + state
      await tx
        .update(courseBriefs)
        .set({ committedCourseId: course.id, modeState: "committed", updatedAt: new Date() })
        .where(eq(courseBriefs.id, brief.id));

      // 5) Log event
      await tx.insert(briefEvents).values({
        briefId: brief.id,
        actor: "user",
        type: "commit",
        payload: { courseId: course.id },
      });

      return course;
    });

    return Response.json({ course_id: result.id, status: result.status }, { status: 201 });
  } catch (e: any) {
    // unique constraint collisions on either side will land here
    return Response.json(
      { error: { code: "CONFLICT", message: "Commit failed (possibly already linked)", details: String(e?.message || e) } },
      { status: 409 }
    );
  }
}
