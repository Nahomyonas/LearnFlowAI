import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAiProvider } from "@/server/ai/ai-provider-factory";
import { GenerateLessonContentRequestSchema } from "@/contracts/ai";

/**
 * POST /api/ai/generate-lesson-content
 *
 * Generates lesson content for a given lesson.
 *
 * Request body:
 * - topic: string (required)
 * - moduleTitle: string (required)
 * - lessonTitle: string (required)
 * - details: string (optional)
 * - learnerLevel: "novice" | "intermediate" | "advanced" (optional)
 * - targetDifficulty: "easy" | "standard" | "rigorous" | "expert" (optional)
 *
 * Response:
 * - 200: { content: string }
 * - 403: Not authenticated
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
    const parsed = GenerateLessonContentRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: 'Invalid request', details: parsed.error.issues } },
        { status: 422 }
      )
    }

    // 3. Generate lesson content
    const aiProvider = getAiProvider()
    const { content } = await aiProvider.generateLessonContent(parsed.data)

    return NextResponse.json({ content })
  } catch (error: any) {
    console.error('[generate-lesson-content] Error:', error)
    return NextResponse.json(
      { error: { message: error.message || 'Internal server error' } },
      { status: 500 }
    )
  }
}
