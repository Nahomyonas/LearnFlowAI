import { z } from "zod";

export const CreateCourseModuleSchema = z.object({
    courseId: z.string().uuid("Invalid course ID"),
    title: z.string().min(1, "Title is required").max(140, "Title too long"),
    summary: z.string().max(1000, "Summary too long").optional(),
    });

export type CreateCourseModuleInput = z.infer<typeof CreateCourseModuleSchema>;
