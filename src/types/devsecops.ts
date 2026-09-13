// path: src/types/devsecops.ts

export interface AgentReviewFinding {
  id: string;
  agent: "architecture" | "security" | "performance" | "style";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  filePath: string;
  lineNumber?: number;
  suggestedPatch?: string;
  painPointCategory: "broken-imports" | "repo-bloat" | "dead-code" | "leaked-secrets" | "config-drift" | "merge-conflict" | "bad-commit" | "pr-fatigue";
  applied?: boolean;
}

export interface MultiAgentReviewResult {
  id: string;
  prTitle: string;
  prSummary: string;
  riskScore: number; // 0 - 100 (higher = riskier)
  testedOn: string;
  agents: {
    architecture: {
      status: "passed" | "flagged" | "failed";
      summary: string;
      deadCodeFiles: string[];
      brokenImportsCount: number;
    };
    security: {
      status: "passed" | "flagged" | "failed";
      summary: string;
      secretsScanned: number;
      leaksDetected: number;
    };
    performance: {
      status: "passed" | "flagged" | "failed";
      summary: string;
      estimatedBundleImpactKB: number;
      memoryRiskScore: number;
    };
    prSynthesizer: {
      readyForMerge: boolean;
      markdownPRDescription: string;
      suggestedCommitMessage: string;
      breakingChanges: string[];
    };
  };
  findings: AgentReviewFinding[];
}

export interface PipelineStageStep {
  id: string;
  name: string;
  command: string;
  status: "pending" | "running" | "success" | "failed" | "skipped";
  durationMs: number;
  outputLog: string[];
  error?: string;
}

export interface CIPipelineRun {
  id: string;
  trigger: "manual" | "push" | "pull_request" | "agent_hook";
  branch: string;
  commitSha: string;
  status: "queued" | "running" | "passed" | "failed";
  startedAt: number;
  finishedAt?: number;
  stages: {
    id: string;
    name: string;
    steps: PipelineStageStep[];
  }[];
  artifacts: {
    name: string;
    size: string;
    url?: string;
  }[];
}

export interface DraftSnapshot {
  id: string;
  timestamp: number;
  fileId: string;
  filePath: string;
  content: string;
  cursorPosition?: { line: number; ch: number };
  tag?: string;
}

export interface AutoSaveState {
  isSaving: boolean;
  lastSavedAt: number;
  isDirty: boolean;
  activeDraftsCount: number;
}

export interface SlashCommand {
  command: string;
  label: string;
  description: string;
  icon: string;
  category: "review" | "security" | "refactor" | "git" | "diagnostics";
  execute: (context: {
    activeFileContent: string;
    filePath: string;
    language: string;
  }) => Promise<string | void>;
}

export interface PerformanceMetrics {
  renderDurationMs: number;
  domNodeCount: number;
  memoryHeapUsedMB: number;
  memoryHeapTotalMB: number;
  fpsEstimate: number;
  bundleSizes: {
    vendor: number; // KB
    app: number; // KB
    styles: number; // KB
  };
  cacheHitRatePct: number;
}
