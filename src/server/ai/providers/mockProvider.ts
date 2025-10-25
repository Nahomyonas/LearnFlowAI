import type { AiProvider } from "@/server/ai/providers";

// Simple deterministic PRNG so the same topic yields stable output (useful in tests)
function hashString(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function titleCase(s: string) {
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

export const MockAiProvider: AiProvider = {
  name: "mock",

  async generateOutline({ topic, details, goals }) {
    const t = (topic || "Untitled Course").trim();
    const goalList = Array.isArray(goals) ? goals.filter(Boolean) : [];

    // Seeded RNG for stable, but varied output across different topics
    const rand = mulberry32(hashString(t));

    // Decide module count based on goals length with a little randomness
    const baseModuleCount = goalList.length > 0 ? goalList.length : 3;
    const moduleCount = clamp(Math.round(baseModuleCount + rand() * 2), 2, 6);

    const cannedModules = [
      "Foundations",
      "Core Concepts",
      "Hands-on Practice",
      "Patterns & Techniques",
      "Project Workshop",
      "Review & Next Steps",
    ];

    const cannedLessonStarts = [
      "Overview",
      "Setup",
      "Basics",
      "Deep Dive",
      "Walkthrough",
      "Examples",
      "Checklist",
      "Recap",
    ];

    const modules = Array.from({ length: moduleCount }).map((_, i) => {
      const labelFromGoal = goalList[i % Math.max(1, goalList.length)] || cannedModules[i % cannedModules.length];
      const moduleTitleRaw = `Module ${i + 1}: ${labelFromGoal}`;
      const moduleSummary = `Learn ${labelFromGoal.toLowerCase()} in the context of ${t}.`;

      // 1-5 lessons, bias to 3-4
      const lessonCount = clamp(1 + Math.floor(rand() * 5), 1, 5);
      const lessons = Array.from({ length: lessonCount }).map((__, j) => {
        const stem = cannedLessonStarts[(i + j) % cannedLessonStarts.length];
        const raw = `${stem} ${t}`.slice(0, 120);
        return { title: `Lesson ${j + 1}: ${titleCase(raw)}` };
      });

      return {
        title: moduleTitleRaw.slice(0, 120),
        summary: moduleSummary.slice(0, 500),
        lessons,
      };
    });

    const summaryText =
      (details && details.trim()) ||
      `An AI-drafted outline for ${t}, covering fundamentals, core skills, and practical exercises.`;

    // Fake token accounting to match real provider shape
    const inTokens = Math.round(50 + rand() * 100);
    const outTokens = 200 + modules.reduce((acc, m) => acc + m.lessons.length * 10, 0);

    return {
      raw: {
        courseTitle: t,
        courseSummary: summaryText.slice(0, 600),
        modules,
      },
      tokens: { in: inTokens, out: outTokens },
    };
  },
};
