export type ModelTokens = { in?: number; out?: number };

export interface AiProvider {
  name: string;

  /**
   * Generate a course outline JSON. Must match aiOutlineContract shape.
   */
  generateOutline(input: {
    topic: string;
    details?: string;
    goals?: string[];
    learnerLevel?: string;      // reserved for future
    targetDifficulty?: string;  // reserved for future
  }): Promise<{ raw: unknown; tokens?: ModelTokens }>;
}