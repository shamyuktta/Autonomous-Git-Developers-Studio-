// path: src/data/mockUsage.ts
import { ProviderUsageTelemetry } from "../types/studio";

export const INITIAL_PROVIDER_TELEMETRY: ProviderUsageTelemetry[] = [
  {
    provider: "Google DeepMind",
    modelName: "Gemini 3.1 Pro (v2026-03)",
    requestCount: 38,
    promptTokens: 142800,
    completionTokens: 89400,
    avgLatencyMs: 680,
    costEstimateUsd: 0.18,
  },
  {
    provider: "Anthropic",
    modelName: "Claude 3.5 Sonnet (v20241022)",
    requestCount: 26,
    promptTokens: 98400,
    completionTokens: 64200,
    avgLatencyMs: 920,
    costEstimateUsd: 0.74,
  },
  {
    provider: "Google DeepMind",
    modelName: "Gemini 3.5 Flash",
    requestCount: 64,
    promptTokens: 210500,
    completionTokens: 115000,
    avgLatencyMs: 310,
    costEstimateUsd: 0.04,
  },
  {
    provider: "Meta AI",
    modelName: "Llama 3.3 70B",
    requestCount: 14,
    promptTokens: 42000,
    completionTokens: 28900,
    avgLatencyMs: 540,
    costEstimateUsd: 0.02,
  },
  {
    provider: "OpenAI",
    modelName: "GPT-4o (v2024-11-20)",
    requestCount: 19,
    promptTokens: 76500,
    completionTokens: 41200,
    avgLatencyMs: 810,
    costEstimateUsd: 0.48,
  },
];
