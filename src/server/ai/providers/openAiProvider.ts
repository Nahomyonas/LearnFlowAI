import OpenAI from "openai";
import type { AiProvider, ModelTokens } from "@/server/ai/providers";
import type {
  GenerateOutlineRequest,
  RecommendGoalsRequest,
  RecommendGoalsResponse,
  AssessLearnerLevelRequest,
  AssessLearnerLevelResponse,
  AnalyzePrerequisitesRequest,
  AnalyzePrerequisitesResponse,
  GenerateLessonContentRequest,
  GenerateLessonContentResponse,
} from "@/contracts/ai";
import {
  SYSTEM_PROMPTS,
  buildGenerateOutlinePrompt,
  buildGenerateLessonContentPrompt,
  buildRecommendGoalsPrompt,
  buildAssessLearnerLevelPrompt,
  buildAnalyzePrerequisitesPrompt,
} from "@/server/ai/prompts";

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }

  return openaiClient;
}

/**
 * Call OpenAI Chat Completions API with structured JSON output
 */
async function callOpenAI(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  responseFormat: "json_object" | "text" = "json_object"
): Promise<{ content: string; tokens?: ModelTokens }> {
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const completion = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    response_format: { type: responseFormat },
  });

  const content = completion.choices[0]?.message?.content || "";
  const tokens: ModelTokens | undefined = completion.usage
    ? {
        in: completion.usage.prompt_tokens,
        out: completion.usage.completion_tokens,
      }
    : undefined;

  return { content, tokens };
}

export const OpenAiProvider: AiProvider = {
  name: "openai",

  async generateOutline(input: GenerateOutlineRequest) {
    const { content, tokens } = await callOpenAI(
      [
        { role: "system", content: SYSTEM_PROMPTS.curriculumDesigner },
        { role: "user", content: buildGenerateOutlinePrompt(input) },
      ],
      "json_object"
    );

    const raw = JSON.parse(content);
    return { raw, tokens };
  },

  async generateLessonContent(input: GenerateLessonContentRequest) {
    const { content, tokens } = await callOpenAI(
      [
        { role: "system", content: SYSTEM_PROMPTS.educator },
        { role: "user", content: buildGenerateLessonContentPrompt(input) },
      ],
      "json_object"
    );

    const parsed = JSON.parse(content);
    return {
      content: parsed.content || "",
      tokens,
    };
  },

  async recommendLearningGoals(input: RecommendGoalsRequest) {
    const { content, tokens } = await callOpenAI(
      [
        { role: "system", content: SYSTEM_PROMPTS.educationalConsultant },
        { role: "user", content: buildRecommendGoalsPrompt(input) },
      ],
      "json_object"
    );

    const parsed = JSON.parse(content);
    return {
      goals: parsed.goals || [],
      tokens,
    };
  },

  async assessLearnerLevel(input: AssessLearnerLevelRequest) {
    const { content, tokens } = await callOpenAI(
      [
        { role: "system", content: SYSTEM_PROMPTS.learningAdvisor },
        { role: "user", content: buildAssessLearnerLevelPrompt(input) },
      ],
      "json_object"
    );

    const parsed = JSON.parse(content);
    return {
      level: parsed.level || "novice",
      explanation: parsed.explanation || "",
      tokens,
    };
  },

  async analyzePrerequisites(input: AnalyzePrerequisitesRequest) {
    const { content, tokens } = await callOpenAI(
      [
        { role: "system", content: SYSTEM_PROMPTS.curriculumAnalyst },
        { role: "user", content: buildAnalyzePrerequisitesPrompt(input) },
      ],
      "json_object"
    );

    const parsed = JSON.parse(content);
    return {
      prerequisites: parsed.prerequisites || [],
      tokens,
    };
  },
};
