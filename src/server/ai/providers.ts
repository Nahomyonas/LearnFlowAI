import type {
  GenerateOutlineRequest,
  RecommendGoalsRequest,
  RecommendGoalsResponse,
  AssessLearnerLevelRequest,
  AssessLearnerLevelResponse,
  AnalyzePrerequisitesRequest,
  AnalyzePrerequisitesResponse,
} from '@/contracts/ai';

export type ModelTokens = { in?: number; out?: number };

export interface AiProvider {
  name: string;

  /**
   * Generate a course outline JSON. Must match aiOutlineContract shape.
   */
  generateOutline(input: GenerateOutlineRequest): Promise<{ raw: unknown; tokens?: ModelTokens }>;

  /**
   * Recommend learning goals based on course topic and details.
   */
  recommendLearningGoals(input: RecommendGoalsRequest): Promise<Omit<RecommendGoalsResponse, 'tokens'> & { tokens?: ModelTokens }>;

  /**
   * Assess learner level based on checked prerequisites.
   */
  assessLearnerLevel(input: AssessLearnerLevelRequest): Promise<Omit<AssessLearnerLevelResponse, 'tokens'> & { tokens?: ModelTokens }>;

  /**
   * Analyze and recommend prerequisites for a course topic.
   */
  analyzePrerequisites(input: AnalyzePrerequisitesRequest): Promise<Omit<AnalyzePrerequisitesResponse, 'tokens'> & { tokens?: ModelTokens }>;

  /**
   * Generate lesson content for a given lesson.
   */
  generateLessonContent(input: import('@/contracts/ai').GenerateLessonContentRequest): Promise<Omit<import('@/contracts/ai').GenerateLessonContentResponse, 'tokens'> & { tokens?: ModelTokens }>;

}