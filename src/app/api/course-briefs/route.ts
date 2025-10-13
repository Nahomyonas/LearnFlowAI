// app/api/course-briefs/route.ts
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { courseBriefs } from "@/db/schema";
import { requireUserId } from "@/libs/auth";
import { CreateCourseBriefSchema } from "@/contracts/briefs";

// Optional: tiny validator for GET query (?mode_state=..., ?limit=...)
const ListQuerySchema = z.object({
  mode_state: z
    .enum([
      "collecting",
      "ready_for_outline",
      "outline_ready",
      "outcomes_ready",
      "committed",
      "abandoned",
    ])
    .optional(),
  limit: z.coerce.number().int().positive().max(50).optional(), // default 20
});

export async function GET(req: Request) {
  const userId = await requireUserId();

  // validate query params
  const url = new URL(req.url);
  const parsed = ListQuerySchema.safeParse({
    mode_state: url.searchParams.get("mode_state") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return Response.json(
      { error: { code: "BAD_REQUEST", details: parsed.error.format() } },
      { status: 400 }
    );
  }
  const { mode_state, limit = 20 } = parsed.data;

  // build where clause
  const where = mode_state
    ? and(eq(courseBriefs.ownerUserId, userId), eq(courseBriefs.modeState, mode_state))
    : eq(courseBriefs.ownerUserId, userId);

  // select a few useful fields
  const items = await db
    .select({
      id: courseBriefs.id,
      topic: courseBriefs.topic,
      source: courseBriefs.source,
      mode_state: courseBriefs.modeState,
      created_at: courseBriefs.createdAt,
      updated_at: courseBriefs.updatedAt,
    })
    .from(courseBriefs)
    .where(where)
    .orderBy(desc(courseBriefs.createdAt))
    .limit(limit);

  return Response.json({ items });
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

  // validate payload with Zod
  const parsed = CreateCourseBriefSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "BAD_REQUEST", details: parsed.error.format() } },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // insert into DB
  const [inserted] = await db
    .insert(courseBriefs)
    .values({
      ownerUserId: userId,
      source: data.source,
      topic: data.topic ?? null,
      details: data.details ?? null,
      learnerLevel: (data.learner_level as any) ?? null,
      targetDifficulty: (data.target_difficulty as any) ?? null,
      goals: data.goals ?? null,
      // mode_state defaults to 'collecting' via schema
    })
    .returning({ id: courseBriefs.id, mode_state: courseBriefs.modeState });

  return Response.json(
    { id: inserted.id, mode_state: inserted.mode_state },
    { status: 201 }
  );
}
