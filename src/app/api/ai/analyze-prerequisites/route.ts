import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAiProvider } from "@/server/ai/ai-provider-factory";
import { AnalyzePrerequisitesRequestSchema } from "@/contracts/ai";

/**
 * POST /api/ai/analyze-prerequisites
 * 
 * Analyzes course topic and recommends prerequisite knowledge.
 * 
 * Request body:
 * - topic: string (required)
 * - details: string (optional)
 * 
 * Response:
 * - 200: { prerequisites: string[] }
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
    const parsed = AnalyzePrerequisitesRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: 'Invalid request', details: parsed.error.issues } },
        { status: 422 }
      )
    }

    const { topic, details } = parsed.data

    // 3. Get AI provider and analyze prerequisites
    const aiProvider = getAiProvider()
    const { prerequisites } = await aiProvider.analyzePrerequisites({
      topic,
      details,
    })

    return NextResponse.json({ prerequisites })
  } catch (error: any) {
    console.error('[analyze-prerequisites] Error:', error)
    return NextResponse.json(
      { error: { message: error.message || 'Internal server error' } },
      { status: 500 }
    )
  }
}
