export const runtime = "nodejs";

import { db } from "@/db/client";
import { sql } from "drizzle-orm";

export async function GET() {
  const now = await db.execute(sql`select now() as now`);
  return Response.json({ ok: true, now: now.rows?.[0]?.now ?? null });
}
 