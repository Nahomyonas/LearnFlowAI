import { z } from 'zod'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { courseBriefs } from '@/db/schema'
import { requireUserId } from '@/lib/auth'
import { UpdateCourseBriefSchema } from '@/contracts/briefs'

const IF_MATCH_REGEX = /^W\/"(\d+)"$/

function etagFromVersion(version: number) {
  return `W/"${version}"`
}

function parseIfMatch(req: Request) {
  const h = req.headers.get('if-match')
  if (!h) return null
  const m = IF_MATCH_REGEX.exec(h.trim())
  return m ? Number(m[1]) : null
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const userId = await requireUserId()
  const [row] = await db
    .select()
    .from(courseBriefs)
    .where(
      and(eq(courseBriefs.id, params.id), eq(courseBriefs.ownerUserId, userId))
    )
    .limit(1)

  if (!row) {
    return Response.json(
      { error: { code: 'NOT_FOUND', message: 'Brief not found' } },
      { status: 404 }
    )
  }

  const res = Response.json({
    id: row.id,
    topic: row.topic,
    details: row.details,
    source: row.source,
    learner_level: row.learnerLevel,
    target_difficulty: row.targetDifficulty,
    goals: row.goals,
    planOutline: row.planOutline,
    mode_state: row.modeState,
    version: row.version,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  })
  res.headers.set('ETag', etagFromVersion(row.version))
  return res
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = await requireUserId()

  // parse and validate body
  const expectedVersion = parseIfMatch(req)
  if (expectedVersion === null) {
    return Response.json(
      {
        error: {
          code: 'PRECONDITION_REQUIRED',
          message: 'PATCH requires If-Match: W/"<version>"',
        },
      },
      { status: 428 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json(
      { error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 }
    )
  }
  const parsed = UpdateCourseBriefSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: { code: 'BAD_REQUEST', details: parsed.error.format() } },
      { status: 400 }
    )
  }
  const patch = parsed.data

  const [current] = await db
    .select()
    .from(courseBriefs)
    .where(
      and(eq(courseBriefs.id, params.id), eq(courseBriefs.ownerUserId, userId))
    )
    .limit(1)

  if (!current) {
    return Response.json(
      { error: { code: 'NOT_FOUND', message: 'Brief not found' } },
      { status: 404 }
    )
  }

  if (current.version !== expectedVersion) {
    return Response.json(
      {
        error: {
          code: 'CONFLICT',
          message: 'Version mismatch',
          details: { expected: current.version, got: expectedVersion },
        },
      },
      { status: 409 }
    )
  }

    const nextVersion = current.version + 1;
  const [updated] = await db
    .update(courseBriefs)
    .set({
      topic: patch.topic ?? current.topic,
      details: patch.details ?? current.details,
      learnerLevel: (patch.learner_level as any) ?? current.learnerLevel,
      targetDifficulty: (patch.target_difficulty as any) ?? current.targetDifficulty,
      goals: patch.goals ?? current.goals,
      version: nextVersion,
      updatedAt: new Date(),
    })
    .where(eq(courseBriefs.id, current.id))
    .returning();

  const res = Response.json({
    id: updated.id,
    topic: updated.topic,
    details: updated.details,
    source: updated.source,
    learner_level: updated.learnerLevel,
    target_difficulty: updated.targetDifficulty,
    goals: updated.goals,
    mode_state: updated.modeState,
    version: updated.version,
    created_at: updated.createdAt,
    updated_at: updated.updatedAt,
  });
  res.headers.set("ETag", etagFromVersion(updated.version));
  return res;
}
