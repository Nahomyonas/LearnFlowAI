import { z } from "zod";

export const lessonListQuery = z.object({
  module_id: z.string().uuid(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});


export const lessonCreateContract = z.object({
  moduleId: z.string().uuid(),
  title: z.string().min(1).max(200),
  content: z.any().optional(), 
});

export const lessonUpdateContract = z.object({
  title: z.string().min(1).max(200).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  content: z.any().optional(),
  position: z.number().int().min(1).optional(),
});

export type LessonCreateInput = z.infer<typeof lessonCreateContract>;
export type LessonUpdateInput = z.infer<typeof lessonUpdateContract>;
export type LessonListQuery = z.infer<typeof lessonListQuery>;
