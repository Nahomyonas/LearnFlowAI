import { z } from "zod";

/**
 * POST /api/courses
 * Used when a user manually creates a new course (not from a brief)
 */
export const CreateCourseSchema = z.object({
  title: z.string().min(1, "Title is required").max(140, "Title too long"),
  summary: z.string().max(1000, "Summary too long").optional(),
});

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;

/**
 * GET /api/courses
 * Query params for listing user’s courses
 */
export const ListCoursesQuerySchema = z.object({
  status: z.enum(["draft", "published", "archived"]).optional(),
  query: z.string().max(100).optional(), // optional search term
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export type ListCoursesQuery = z.infer<typeof ListCoursesQuerySchema>;

/**
 * GET /api/courses/[id]
 * Query params for listing user’s courses
 */
export const UpdateCourseSchema = z.object({
  title: z.string().min(1, "Title is required").max(140, "Title too long").optional(),
  summary: z.string().max(1000).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  visibility: z.enum(["private", "unlisted", "public"]).optional(),
});

export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>;