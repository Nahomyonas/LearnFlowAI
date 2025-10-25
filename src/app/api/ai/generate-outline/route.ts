import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/db/client'
import { courseBriefs, briefEvents } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { getAiProvider } from '@/server/ai/ai-provider-factory'
import { aiOutlineContract } from '@/contracts/ai-outline'
import { z } from 'zod'

const requestSchema = z.object({
  briefId: z.string().uuid(),
})

/**
 * POST /api/ai/generate-outline
 * 
 * Generates an AI outline for a course brief.
 * 
 * Request body:
 * - briefId: UUID of the brief
 * 
 * Response:
 * - 200: { moduleCount, lessonCount, aiEventId }
 * - 403: Not authenticated
 * - 404: Brief not found
 * - 409: Brief already has an outline or is committed
 * - 422: Validation error (missing topic or invalid data)
 * - 429: Rate limit exceeded (not implemented yet)
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
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: 'Invalid request', details: parsed.error.issues } },
        { status: 422 }
      )
    }

    const { briefId } = parsed.data

    // 3. Fetch brief with ownership check
    const [brief] = await db
      .select()
      .from(courseBriefs)
      .where(
        and(
          eq(courseBriefs.id, briefId),
          eq(courseBriefs.ownerUserId, session.user.id),
          isNull(courseBriefs.deletedAt)
        )
      )
      .limit(1)

    if (!brief) {
      return NextResponse.json(
        { error: { message: 'Brief not found' } },
        { status: 404 }
      )
    }

    // 4. Check if brief is in a valid state
    if (brief.modeState === 'committed') {
      return NextResponse.json(
        { error: { message: 'Brief already committed' } },
        { status: 409 }
      )
    }

    if (brief.planOutline) {
      return NextResponse.json(
        { error: { message: 'Brief already has an outline' } },
        { status: 409 }
      )
    }

    // 5. Validate required fields
    if (!brief.topic?.trim()) {
      return NextResponse.json(
        { error: { message: 'Brief must have a topic' } },
        { status: 422 }
      )
    }

    // 6. Generate outline with AI provider
    const aiProvider = getAiProvider()
    const { raw: outline, tokens } = await aiProvider.generateOutline({
      topic: brief.topic,
      details: brief.details || undefined,
      goals: (brief.goals as string[]) || undefined,
    })

    // 7. Validate AI output against contract
    const validated = aiOutlineContract.safeParse(outline)
    if (!validated.success) {
      console.error('[generate-outline] AI output validation failed:', validated.error)
      return NextResponse.json(
        { error: { message: 'AI generated invalid outline structure' } },
        { status: 500 }
      )
    }

    // 8. Calculate counts
    const moduleCount = validated.data.modules.length
    const lessonCount = validated.data.modules.reduce(
      (sum, mod) => sum + mod.lessons.length,
      0
    )

    // 9. Save outline to brief and create event
    await db.transaction(async (tx) => {
      // Update brief with outline
      await tx
        .update(courseBriefs)
        .set({
          planOutline: validated.data as any,
          modeState: 'outline_ready',
          updatedAt: new Date(),
          version: brief.version + 1,
        })
        .where(eq(courseBriefs.id, briefId))

      // Create event
      await tx.insert(briefEvents).values({
        briefId,
        actor: 'bot',
        type: 'gen_outline',
        payload: {
          provider: aiProvider.name,
          moduleCount,
          lessonCount,
          tokens,
        },
      })
    })

    // 10. Get the event ID for response
    const [event] = await db
      .select({ id: briefEvents.id })
      .from(briefEvents)
      .where(eq(briefEvents.briefId, briefId))
      .orderBy(briefEvents.createdAt)
      .limit(1)

    return NextResponse.json({
      moduleCount,
      lessonCount,
      aiEventId: event?.id,
    })
  } catch (error: any) {
    console.error('[generate-outline] Error:', error)
    return NextResponse.json(
      { error: { message: error.message || 'Internal server error' } },
      { status: 500 }
    )
  }
}
