import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAiProvider } from "@/server/ai/ai-provider-factory";
import { AssessLearnerLevelRequestSchema } from "@/contracts/ai";

/**
 * POST /api/ai/assess-level
 * 
 * Assesses learner level based on checked prerequisites.
 * 
 * Request body:
 * - topic: string (required)
 * - details: string (optional)
 * - prerequisites: Array<{ text: string, checked: boolean }> (required)
 * 
 * Response:
 * - 200: { level: "novice" | "intermediate" | "advanced", explanation: string }
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
    const parsed = AssessLearnerLevelRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: 'Invalid request', details: parsed.error.issues } },
        { status: 422 }
      )
    }

    const { topic, details, prerequisites } = parsed.data

    // 3. Get AI provider and assess level
    const aiProvider = getAiProvider()
    const { level, explanation } = await aiProvider.assessLearnerLevel({
      topic,
      details,
      prerequisites,
    })

    return NextResponse.json({ level, explanation })
  } catch (error: any) {
    console.error('[assess-level] Error:', error)
    return NextResponse.json(
      { error: { message: error.message || 'Internal server error' } },
      { status: 500 }
    )
  }
}
