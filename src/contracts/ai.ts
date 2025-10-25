import { z } from "zod";

// ============================================================================
// AI Generate Outline
// ============================================================================

export const GenerateOutlineRequestSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(200, "Topic too long"),
  details: z.string().max(10_000, "Details too long").optional(),
  learnerLevel: z.enum(["novice", "intermediate", "advanced"]).optional(),
  targetDifficulty: z.enum(["easy", "standard", "rigorous", "expert"]).optional(),
  goals: z.array(z.string().min(1).max(200)).max(10).optional(),
});

export type GenerateOutlineRequest = z.infer<typeof GenerateOutlineRequestSchema>;

// ============================================================================
// AI Recommend Learning Goals
// ============================================================================

export const RecommendGoalsRequestSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(200, "Topic too long"),
  details: z.string().max(10_000, "Details too long").optional(),
});

export const RecommendGoalsResponseSchema = z.object({
  goals: z.array(z.string()),
  tokens: z.object({
    input: z.number(),
    output: z.number(),
    total: z.number(),
  }).optional(),
});

export type RecommendGoalsRequest = z.infer<typeof RecommendGoalsRequestSchema>;
export type RecommendGoalsResponse = z.infer<typeof RecommendGoalsResponseSchema>;

// ============================================================================
// AI Assess Learner Level
// ============================================================================

export const PrerequisiteSchema = z.object({
  text: z.string().min(1, "Prerequisite text required"),
  checked: z.boolean(),
});

export const AssessLearnerLevelRequestSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(200, "Topic too long"),
  details: z.string().max(10_000, "Details too long").optional(),
  prerequisites: z.array(PrerequisiteSchema).min(1, "At least one prerequisite required"),
});

export const AssessLearnerLevelResponseSchema = z.object({
  level: z.enum(["novice", "intermediate", "advanced"]),
  explanation: z.string(),
  tokens: z.object({
    input: z.number(),
    output: z.number(),
    total: z.number(),
  }).optional(),
});

// ============================================================================
// AI Analyze Prerequisites
// ============================================================================

export const AnalyzePrerequisitesRequestSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(200, "Topic too long"),
  details: z.string().max(10_000, "Details too long").optional(),
});

export const AnalyzePrerequisitesResponseSchema = z.object({
  prerequisites: z.array(z.string()),
  tokens: z.object({
    input: z.number(),
    output: z.number(),
    total: z.number(),
  }).optional(),
});

export type Prerequisite = z.infer<typeof PrerequisiteSchema>;
export type AssessLearnerLevelRequest = z.infer<typeof AssessLearnerLevelRequestSchema>;
export type AssessLearnerLevelResponse = z.infer<typeof AssessLearnerLevelResponseSchema>;
export type AnalyzePrerequisitesRequest = z.infer<typeof AnalyzePrerequisitesRequestSchema>;
export type AnalyzePrerequisitesResponse = z.infer<typeof AnalyzePrerequisitesResponseSchema>;

// ============================================================================
// AI Generate Lesson Content
// ============================================================================

export const GenerateLessonContentRequestSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(200, "Topic too long"),
  moduleTitle: z.string().min(1, "Module title is required").max(200, "Module title too long"),
  lessonTitle: z.string().min(1, "Lesson title is required").max(200, "Lesson title too long"),
  details: z.string().max(10_000, "Details too long").optional(),
  learnerLevel: z.enum(["novice", "intermediate", "advanced"]).optional(),
  targetDifficulty: z.enum(["easy", "standard", "rigorous", "expert"]).optional(),
});

export const GenerateLessonContentResponseSchema = z.object({
  content: z.string().min(1, "Content is required"),
  tokens: z.object({
    input: z.number(),
    output: z.number(),
    total: z.number(),
  }).optional(),
});

export type GenerateLessonContentRequest = z.infer<typeof GenerateLessonContentRequestSchema>;
export type GenerateLessonContentResponse = z.infer<typeof GenerateLessonContentResponseSchema>;
