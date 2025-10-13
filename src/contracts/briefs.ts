import { z } from "zod";

export const CreateCourseBriefSchema = z.object({
  source: z.enum(["manual", "bot"]),
  topic: z.string().min(1).max(200).optional(),
  details: z.string().max(10_000).optional(),
  learner_level: z.enum(["novice", "intermediate", "advanced"]).optional(),
  target_difficulty: z.enum(["easy", "standard", "rigorous", "expert"]).optional(),
  goals: z.array(z.string().min(1).max(200)).max(10).optional(),
});

// allow partial edits; forbid changing source
export const UpdateCourseBriefSchema = z.object({
  topic: z.string().min(1).max(200).optional(),
  details: z.string().max(10_000).optional(),
  learner_level: z.enum(["novice", "intermediate", "advanced"]).optional(),
  target_difficulty: z.enum(["easy", "standard", "rigorous", "expert"]).optional(),
  goals: z.array(z.string().min(1).max(200)).max(10).optional(),
  // optional: allow state transition if you want (keep simple for now)
  // mode_state: z.enum(["collecting","ready_for_outline","outline_ready","outcomes_ready","committed","abandoned"]).optional(),
});

export type CreateCourseBriefInput = z.infer<typeof CreateCourseBriefSchema>;
