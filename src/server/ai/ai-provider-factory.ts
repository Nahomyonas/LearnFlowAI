import { AI_PROVIDER } from "@/config/ai";
import type { AiProvider } from "./providers";
import { MockAiProvider } from "@/server/ai/providers/mockProvider";
import { OpenAiProvider } from "@/server/ai/providers/openAiProvider";

export function getAiProvider(): AiProvider {
  switch (AI_PROVIDER) {
    case "openai":
      return OpenAiProvider;
    case "mock":
      return MockAiProvider;
    default:
      return MockAiProvider;
  }
}
