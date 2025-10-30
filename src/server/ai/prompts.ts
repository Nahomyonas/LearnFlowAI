/**
 * AI Prompts for LearnFlow AI
 * 
 * This module contains all prompt templates used by AI providers.
 * Prompts are organized by feature and can be easily modified or A/B tested.
 */

import type {
  GenerateOutlineRequest,
  GenerateLessonContentRequest,
  RecommendGoalsRequest,
  AssessLearnerLevelRequest,
  AnalyzePrerequisitesRequest,
} from "@/contracts/ai";

// ============================================================================
// System Prompts - Define AI assistant personality and role
// ============================================================================

export const SYSTEM_PROMPTS = {
  curriculumDesigner: `You are an expert curriculum designer and educational content creator. Your task is to generate well-structured course outlines that are pedagogically sound and engaging.`,
  
  educator: `You are an expert educator who creates engaging, clear, and comprehensive lesson content. Your lessons are well-structured with examples, explanations, and actionable takeaways.`,
  
  educationalConsultant: `You are an expert educational consultant who helps learners define clear, achievable learning goals. Your goals are specific, measurable, and aligned with industry standards.`,
  
  learningAdvisor: `You are an expert learning advisor who assesses a learner's readiness for a course based on their prerequisite knowledge. Provide honest, encouraging feedback.`,
  
  curriculumAnalyst: `You are an expert curriculum designer who identifies essential prerequisites for courses. Your prerequisites are realistic, specific, and necessary for success.`,
} as const;

// ============================================================================
// Generate Course Outline
// ============================================================================

export function buildGenerateOutlinePrompt(input: GenerateOutlineRequest): string {
  const { topic, details, learnerLevel, targetDifficulty, goals } = input;

  return `Create a comprehensive course outline for the following:

**Topic:** ${topic}
${details ? `**Details:** ${details}` : ""}
${learnerLevel ? `**Learner Level:** ${learnerLevel}` : ""}
${targetDifficulty ? `**Target Difficulty:** ${targetDifficulty}` : ""}
${goals && goals.length > 0 ? `**Learning Goals:**\n${goals.map((g, i) => `${i + 1}. ${g}`).join("\n")}` : ""}

Generate a course outline with 3-6 modules. Each module should have 2-5 lessons. Return your response as a JSON object with this structure:

{
  "courseTitle": "A compelling title for the course",
  "courseSummary": "A 2-3 sentence summary of what the course covers",
  "modules": [
    {
      "title": "Module title",
      "summary": "Brief description of what this module covers",
      "lessons": [
        { "title": "Lesson title" }
      ]
    }
  ]
}

Make the titles descriptive and engaging. Ensure the course flows logically from foundational concepts to advanced topics.`;
}

// ============================================================================
// Generate Lesson Content
// ============================================================================

export function buildGenerateLessonContentPrompt(input: GenerateLessonContentRequest): string {
  const { topic, moduleTitle, lessonTitle, details, learnerLevel, targetDifficulty } = input;

  return `Create detailed lesson content for the following:

**Course Topic:** ${topic}
**Module:** ${moduleTitle}
**Lesson:** ${lessonTitle}
${details ? `**Additional Context:** ${details}` : ""}
${learnerLevel ? `**Learner Level:** ${learnerLevel}` : ""}
${targetDifficulty ? `**Target Difficulty:** ${targetDifficulty}` : ""}

Generate comprehensive lesson content in Markdown format. Structure the lesson with:
- A brief introduction
- Key concepts explained clearly
- Practical examples or code snippets where relevant
- Step-by-step explanations
- Summary and key takeaways

The content should be ${learnerLevel || "intermediate"}-level and ${targetDifficulty || "standard"} difficulty. Make it engaging and easy to follow.

Return your response as a JSON object with this structure:
{
  "content": "Full lesson content in markdown format"
}`;
}

// ============================================================================
// Recommend Learning Goals
// ============================================================================

export function buildRecommendGoalsPrompt(input: RecommendGoalsRequest): string {
  const { topic, details } = input;

  return `Recommend 3-5 learning goals for a course on the following:

**Topic:** ${topic}
${details ? `**Details:** ${details}` : ""}

Generate learning goals that are:
- Specific and actionable
- Measurable or demonstrable
- Appropriate for the subject matter
- Progressive in difficulty
- Relevant to real-world applications

IMPORTANT: Each goal must be no more than 200 characters in length.

Return your response as a JSON object with this structure:
{
  "goals": [
    "Goal 1 description (max 200 characters)",
    "Goal 2 description (max 200 characters)",
    "Goal 3 description (max 200 characters)"
  ]
}`;
}

// ============================================================================
// Assess Learner Level
// ============================================================================

export function buildAssessLearnerLevelPrompt(input: AssessLearnerLevelRequest): string {
  const { topic, details, prerequisites } = input;

  const checkedCount = prerequisites.filter((p) => p.checked).length;
  const totalCount = prerequisites.length;
  const percentage = (checkedCount / totalCount) * 100;

  return `Assess the learner's level for a course on the following topic:

**Topic:** ${topic}
${details ? `**Details:** ${details}` : ""}

**Prerequisites Assessment:**
The learner has met ${checkedCount} out of ${totalCount} prerequisites (${percentage.toFixed(0)}%):

${prerequisites
  .map((p, i) => `${i + 1}. ${p.checked ? "✓" : "✗"} ${p.text}`)
  .join("\n")}

Based on this assessment, determine if the learner is:
- "novice": 0-39% prerequisites met
- "intermediate": 40-74% prerequisites met  
- "advanced": 75-100% prerequisites met

Provide an encouraging explanation that acknowledges their current level and what they can expect from the course.

Return your response as a JSON object with this structure:
{
  "level": "novice" | "intermediate" | "advanced",
  "explanation": "2-3 sentences explaining their readiness and what to expect"
}`;
}

// ============================================================================
// Analyze Prerequisites
// ============================================================================

export function buildAnalyzePrerequisitesPrompt(input: AnalyzePrerequisitesRequest): string {
  const { topic, details } = input;

  return `Identify 4-7 key prerequisites for a course on the following:

**Topic:** ${topic}
${details ? `**Details:** ${details}` : ""}

Generate prerequisites that are:
- Essential foundational knowledge or skills
- Specific and clearly defined
- Realistic for learners to assess themselves
- Ordered from most basic to more advanced

Return your response as a JSON object with this structure:
{
  "prerequisites": [
    "Prerequisite 1 description",
    "Prerequisite 2 description",
    "Prerequisite 3 description"
  ]
}`;
}
