// path: src/services/usageTracker.ts
import { ProviderUsageTelemetry } from "../types/studio";
import { INITIAL_PROVIDER_TELEMETRY } from "../data/mockUsage";

const TELEMETRY_STORAGE_KEY = "autonomous_engineer_usage_telemetry";

export function getStoredTelemetry(): ProviderUsageTelemetry[] {
  try {
    const raw = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    if (!raw) return INITIAL_PROVIDER_TELEMETRY;
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROVIDER_TELEMETRY;
  }
}

export function recordUsage(params: {
  provider: string;
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  costUsd?: number;
}): void {
  try {
    const list = getStoredTelemetry();
    const existingIndex = list.findIndex(
      (item) => item.provider === params.provider && item.modelName.includes(params.modelName)
    );

    if (existingIndex >= 0) {
      const item = list[existingIndex];
      item.requestCount += 1;
      item.promptTokens += params.promptTokens;
      item.completionTokens += params.completionTokens;
      item.avgLatencyMs = Math.round((item.avgLatencyMs + params.latencyMs) / 2);
      item.costEstimateUsd += params.costUsd || 0.005;
      list[existingIndex] = item;
    } else {
      list.push({
        provider: params.provider,
        modelName: params.modelName,
        requestCount: 1,
        promptTokens: params.promptTokens,
        completionTokens: params.completionTokens,
        avgLatencyMs: params.latencyMs,
        costEstimateUsd: params.costUsd || 0.005,
      });
    }

    localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Could not record usage telemetry", e);
  }
}

export function resetTelemetry(): void {
  try {
    localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(INITIAL_PROVIDER_TELEMETRY));
  } catch (e) {
    console.warn("Could not reset telemetry", e);
  }
}
