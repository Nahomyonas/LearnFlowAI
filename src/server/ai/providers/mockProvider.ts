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
  async generateLessonContent({ topic, moduleTitle, lessonTitle, details, learnerLevel, targetDifficulty }) {
    const t = (topic || "").trim();
    const m = (moduleTitle || "").trim();
    const l = (lessonTitle || "").trim();
    const d = (details || "").trim();
    const level = learnerLevel || "intermediate";
    const diff = targetDifficulty || "standard";

    // Seeded RNG for stable output
    const rand = mulberry32(hashString(t + m + l + d + level + diff));

    // Generate a deterministic but varied lesson content
    const intro = `Welcome to the lesson "${l}" in the module "${m}" for the course "${t}".`;
    const context = d ? `\n\nContext: ${d}` : "";
    const levelMsg = `\n\nThis lesson is tailored for ${level} learners at a ${diff} difficulty.`;
    const sections = [
      "Key Concepts",
      "Step-by-Step Explanation",
      "Practical Example",
      "Summary & Next Steps",
    ];
    const bullets = [
      `• Understand the main idea behind ${l}`,
      `• Learn how ${l} applies to real-world scenarios`,
      `• Avoid common mistakes in ${l}`,
      `• Practice with a hands-on exercise`,
    ];
    const sectionContent = sections.map((section, i) => `\n\n### ${section}\n${bullets[i % bullets.length]}`);
    const outro = `\n\nCongratulations on completing the lesson!`;

    // Compose the content
    const content = [intro, context, levelMsg, ...sectionContent, outro].join("");

    // Fake token accounting
    const inTokens = Math.round(30 + rand() * 40);
    const outTokens = Math.round(200 + rand() * 100);

    return {
      content,
      tokens: { in: inTokens, out: outTokens },
    };
  },

  async recommendLearningGoals({ topic, details }) {
    const t = (topic || "").trim();
    const d = (details || "").trim();

    // Seeded RNG for stable output
    const rand = mulberry32(hashString(t + d));

    // Generate 3-5 learning goals
    const goalCount = clamp(Math.round(3 + rand() * 2), 3, 5);

    const goalTemplates = [
      `Understand the core concepts and fundamentals of ${t}`,
      `Apply ${t} principles through practical exercises`,
      `Build real-world projects using ${t}`,
      `Master advanced techniques in ${t}`,
      `Develop problem-solving skills with ${t}`,
      `Create production-ready solutions using ${t}`,
      `Analyze and optimize ${t} implementations`,
      `Debug and troubleshoot ${t} applications`,
    ];

    // Pick goals deterministically based on topic
    const goals = Array.from({ length: goalCount }).map((_, i) => {
      const templateIndex = (hashString(t + i) % goalTemplates.length);
      return goalTemplates[templateIndex].slice(0, 200);
    });

    // Fake token accounting
    const inTokens = Math.round(20 + rand() * 30);
    const outTokens = Math.round(50 + goals.length * 15);

    return {
      goals,
      tokens: { in: inTokens, out: outTokens },
    };
  },

  async assessLearnerLevel({ topic, details, prerequisites }) {
    const t = (topic || "").trim();
    const d = (details || "").trim();

    // Calculate percentage of prerequisites checked
    const totalPrereqs = prerequisites.length;
    const checkedCount = prerequisites.filter((p) => p.checked).length;
    const percentage = totalPrereqs > 0 ? (checkedCount / totalPrereqs) * 100 : 0;

    // Seeded RNG for consistent output
    const rand = mulberry32(hashString(t + d + checkedCount));

    // Determine level based on percentage with some randomness for edge cases
    let level: "novice" | "intermediate" | "advanced";
    let explanation: string;

    if (percentage >= 75) {
      level = "advanced";
      explanation = `You have strong foundational knowledge with ${checkedCount} out of ${totalPrereqs} prerequisites met. You're ready to dive into advanced ${t} concepts and build on your existing expertise.`;
    } else if (percentage >= 40) {
      level = "intermediate";
      explanation = `You have some prerequisite knowledge with ${checkedCount} out of ${totalPrereqs} prerequisites met. This course will build on what you know while introducing new ${t} concepts at a moderate pace.`;
    } else {
      level = "novice";
      explanation = `You're just getting started with ${checkedCount} out of ${totalPrereqs} prerequisites met. This course will cover ${t} fundamentals from the ground up, ensuring you have a solid foundation.`;
    }

    // Fake token accounting
    const inTokens = Math.round(30 + rand() * 40);
    const outTokens = Math.round(40 + rand() * 30);

    return {
      level,
      explanation,
      tokens: { in: inTokens, out: outTokens },
    };
  },

  async analyzePrerequisites({ topic, details }) {
    const t = (topic || "").trim();
    const d = (details || "").trim();

    // Seeded RNG for stable output
    const rand = mulberry32(hashString(t + d));

    // Generate 4-7 prerequisites
    const prereqCount = clamp(Math.round(4 + rand() * 3), 4, 7);

    const prereqTemplates = [
      `Basic understanding of ${t} fundamentals`,
      `Familiarity with related concepts and terminology`,
      `Prior experience with similar tools or technologies`,
      `Understanding of core programming principles`,
      `Knowledge of basic computer operations`,
      `Experience with text editors or development environments`,
      `Fundamental math or logic skills`,
      `Problem-solving and analytical thinking abilities`,
      `Comfort with learning new technical concepts`,
      `Access to necessary tools and resources`,
    ];

    // Pick prerequisites deterministically based on topic
    const prerequisites = Array.from({ length: prereqCount }).map((_, i) => {
      const templateIndex = (hashString(t + "prereq" + i) % prereqTemplates.length);
      let prereq = prereqTemplates[templateIndex];
      
      // Make some prerequisites more specific to the topic
      if (i === 0 && t) {
        prereq = `Basic understanding of ${t} concepts`;
      } else if (i === 1 && t) {
        prereq = `Familiarity with ${t} terminology and ecosystem`;
      }
      
      return prereq.slice(0, 200);
    });

    // Fake token accounting
    const inTokens = Math.round(20 + rand() * 30);
    const outTokens = Math.round(40 + prerequisites.length * 10);

    return {
      prerequisites,
      tokens: { in: inTokens, out: outTokens },
    };
  },
};
