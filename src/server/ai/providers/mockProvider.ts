import type { AiProvider } from "@/server/ai/providers";

export const MockAiProvider: AiProvider = {
  name: "mock",

  async generateOutline({ topic, details, goals }) {
    // Super small but schema-compliant payload for fast end-to-end testing.
    // You can randomize module/lesson counts later if you want variety.
    const t = topic?.trim() || "Untitled Course";
    const summary =
      details?.trim() ||
      "Auto-generated draft summary. Replace with real provider output later.";

    return {
      raw: {
        courseTitle: t,
        courseSummary: summary,
        modules: [
          {
            title: "Module 1: Foundations",
            summary: "Get oriented with key concepts.",
            lessons: [{ title: "Lesson 1: Overview" }],
          },
          {
            title: "Module 2: Core Skills",
            summary: "Hands-on practice to build fluency.",
            lessons: [{ title: "Lesson 1: First steps" }],
          },
        ],
      },
      tokens: { in: 0, out: 0 }, // useful shape parity with real providers
    };
  },
};
