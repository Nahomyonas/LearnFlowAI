import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAiProvider } from "@/server/ai/ai-provider-factory";
import { RecommendGoalsRequestSchema } from "@/contracts/ai";

/**
 * POST /api/ai/recommend-goals
 * 
 * Recommends learning goals based on course topic and details.
 * 
 * Request body:
 * - topic: string (required)
 * - details: string (optional)
 * 
 * Response:
 * - 200: { goals: string[] }
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
    const parsed = RecommendGoalsRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: 'Invalid request', details: parsed.error.issues } },
        { status: 422 }
      )
    }

    const { topic, details } = parsed.data

    // 3. Get AI provider and recommend goals
    const aiProvider = getAiProvider()
    const { goals } = await aiProvider.recommendLearningGoals({
      topic,
      details,
    })

    return NextResponse.json({ goals })
  } catch (error: any) {
    console.error('[recommend-goals] Error:', error)
    return NextResponse.json(
      { error: { message: error.message || 'Internal server error' } },
      { status: 500 }
    )
  }
}
