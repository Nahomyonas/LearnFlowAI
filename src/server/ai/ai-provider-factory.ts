import { AI_PROVIDER } from "@/config/ai";
import type { AiProvider } from "./providers";
import { MockAiProvider } from "@/server/ai/providers/mockProvider";
// import { OpenAIProvider } from "./providers/openai"; // later

export function getAiProvider(): AiProvider {
  switch (AI_PROVIDER) {
    // case "openai": return OpenAIProvider;
    default:
      return MockAiProvider;
  }
}
