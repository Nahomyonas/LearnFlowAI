import {z} from "zod";

const trimmed = (min: number, max: number) =>
  z.string().transform(s => s.trim()).pipe(z.string().min(min).max(max));

export const aiLessonStub = z.object({
  title: trimmed(3, 140),
});

export const aiModuleDraft = z.object({
  title: trimmed(3, 120),
  summary: z
    .string()
    .transform(s => s.trim())
    .pipe(z.string().max(500))
    .optional()
    .nullable(),
  lessons: z.array(aiLessonStub).min(1).max(20),
});

export const aiOutlineContract = z.object({
  courseTitle: trimmed(3, 140),
  courseSummary: trimmed(1, 600),
  modules: z.array(aiModuleDraft).min(1).max(20),
});

export type AiLessonStub = z.infer<typeof aiLessonStub>;
export type AiModuleDraft = z.infer<typeof aiModuleDraft>;
export type AiOutline = z.infer<typeof aiOutlineContract>;


