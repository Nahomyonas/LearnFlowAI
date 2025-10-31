export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAiProvider } from "@/server/ai/ai-provider-factory";
import { db } from "@/db/client";
import { and, eq } from "drizzle-orm";
import { courses, courseModules, lessons, courseBriefs } from "@/db/schema";
import { GenerateCourseContentRequestSchema } from "@/contracts/ai";

/**
 * POST /api/ai/generate-lesson-content
 *
 * Generates and persists AI content for ALL lessons in a committed course.
 *
 * Request body:
 * - courseId: string (uuid, required)
 *
 * Response (immediate, non-blocking):
 * - 202: { ok: true }
 * - 403: Not authenticated
 * - 404: Course not found (or not owned)
 * - 422: Validation error
 * - 500: Server error
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { message: 'Not authenticated' } },
        { status: 403 }
      )
    }

    // 2. Parse and validate request body
    const body = await req.json().catch(() => ({}))
    const parsed = GenerateCourseContentRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: 'Invalid request', details: parsed.error.issues } },
        { status: 422 }
      )
    }

  const { courseId } = parsed.data
  const BATCH_SIZE = 3 // keep batching logic server-side

    // 3. Ensure course exists and is owned by the requester
    const [courseRow] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.ownerUserId, session.user.id)))
      .limit(1)

    if (!courseRow) {
      return NextResponse.json(
        { error: { message: 'Course not found' } },
        { status: 404 }
      )
    }

    // 4. Fire-and-forget background generation
    ;(async () => {
      try {
        const aiProvider = getAiProvider()
        const rows = await db
          .select({
            lessonId: lessons.id,
            lessonTitle: lessons.title,
            moduleTitle: courseModules.title,
            courseTitle: courses.title,
            courseSummary: courses.summary,
            briefDetails: courseBriefs.details,
            learnerLevel: courseBriefs.learnerLevel,
            targetDifficulty: courseBriefs.targetDifficulty,
          })
          .from(lessons)
          .innerJoin(courseModules, eq(lessons.moduleId, courseModules.id))
          .innerJoin(courses, eq(courseModules.courseId, courses.id))
          .leftJoin(courseBriefs, eq(courses.briefId, courseBriefs.id))
          .where(and(eq(courses.id, courseId), eq(courses.ownerUserId, session.user.id)))

        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
          const batch = rows.slice(i, i + BATCH_SIZE)
          await Promise.all(
            batch.map(async (r) => {
              try {
                // Mark as generating
                await db
                  .update(lessons)
                  .set({ generationStatus: 'generating', updatedAt: new Date() })
                  .where(eq(lessons.id, r.lessonId))

                const { content } = await aiProvider.generateLessonContent({
                  topic: r.courseTitle || 'Course',
                  moduleTitle: r.moduleTitle,
                  lessonTitle: r.lessonTitle,
                  details: (r.briefDetails as string | null) ?? (r.courseSummary as string | null) ?? undefined,
                  learnerLevel: (r.learnerLevel as any) ?? undefined,
                  targetDifficulty: (r.targetDifficulty as any) ?? undefined,
                })

                // Mark as generated and save content
                await db
                  .update(lessons)
                  .set({ content, generationStatus: 'generated', updatedAt: new Date() })
                  .where(eq(lessons.id, r.lessonId))
              } catch (e: any) {
                console.error('[generate-lesson-content] Lesson failed', r.lessonId, e)
                // Mark as failed
                await db
                  .update(lessons)
                  .set({ generationStatus: 'failed', updatedAt: new Date() })
                  .where(eq(lessons.id, r.lessonId))
                  .catch((updateError) => {
                    console.error('[generate-lesson-content] Failed to update status to failed', r.lessonId, updateError)
                  })
              }
            })
          )
        }
      } catch (e) {
        console.error('[generate-lesson-content] Background task error', e)
      }
    })()

    // 5. Return immediately (do not wait for generation)
    return NextResponse.json({ ok: true }, { status: 202 })
  } catch (error: any) {
    console.error('[generate-lesson-content] Error:', error)
    return NextResponse.json(
      { error: { message: error.message || 'Internal server error' } },
      { status: 500 }
    )
  }
}
