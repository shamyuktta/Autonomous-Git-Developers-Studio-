// path: src/types/studio.ts

export type ModelTier = "high-thinking" | "general" | "fast";

export type ThemeMode = "dark" | "light" | "midnight";

export interface VirtualFile {
  id: string;
  path: string;
  name: string;
  content: string;
  language: string;
  isDeadFile?: boolean;
  isDuplicate?: boolean;
  duplicateOf?: string;
  tags?: string[];
  size?: number;
  isPendingCommit?: boolean;
  pendingDiff?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "Staff Full-Stack Engineer" | "Principal Architect" | "DevOps Lead" | "Security Specialist";
  avatar: string;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
  phone?: string;
  githubConnected?: boolean;
  githubUsername?: string;
  token?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  private: boolean;
  description: string;
  stars: number;
  updatedAt: string;
  language: string;
}

export interface GitHubFileItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url?: string;
}

export interface GitHubMetricsData {
  repoName: string;
  totalFiles: number;
  linesOfCode: number;
  duplicateDebtPercentage: number;
  duplicateFilesCount: number;
  deadFilesCount: number;
  testCoverageEstimate: number;
  stars: number;
  openPRs: number;
  commitFrequency: string;
  languages: Array<{
    name: string;
    percentage: number;
    color: string;
  }>;
  healthGrade: "A+" | "A" | "B" | "C" | "D";
}

export interface ProjectSuggestion {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  category: "architecture" | "deduplication" | "security" | "performance" | "bug";
  description: string;
  targetFile: string;
  relatedFiles?: string[];
  codeFix?: string;
}

export interface AIModelSpec {
  id: string;
  name: string;
  version: string;
  provider: "Google DeepMind" | "Anthropic" | "Meta AI" | "OpenAI";
  category: "Architectural Reasoning" | "Fast Production Code" | "Sub-Second AST" | "Complex Mathematical Systems" | "Open Foundation Model";
  contextWindow: string;
  strengths: string[];
  recommendedFor: string;
  badge?: string;
}

export interface ModelConfigSettings {
  temperature: number;
  topP: number;
  maxTokens: number;
  reasoningEffort: "high" | "medium" | "low";
  systemPersona: string;
  taskType: "architecture" | "backend" | "frontend" | "database" | "security";
}

export interface ProviderUsageTelemetry {
  provider: string;
  modelName: string;
  requestCount: number;
  promptTokens: number;
  completionTokens: number;
  avgLatencyMs: number;
  costEstimateUsd: number;
}

export interface ReadmeAuditRecommendation {
  id: string;
  title: string;
  category: "architecture" | "setup" | "security" | "tests" | "badges";
  severity: "critical" | "recommended" | "optional";
  description: string;
  suggestedMarkdown?: string;
}

export interface GitHubCommitRecord {
  id: string;
  hash: string;
  message: string;
  author: string;
  timestamp: number;
  filesChanged: number;
  additions: number;
  deletions: number;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GitHubIssueComment {
  id: string;
  author: string;
  avatarUrl: string;
  body: string;
  createdAt: string;
}

export interface GitHubIssueItem {
  id: string | number;
  number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  author: string;
  authorAvatar: string;
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  labels: Array<{ name: string; color: string; description?: string }>;
  assignee?: { login: string; avatarUrl: string };
  priority?: "critical" | "high" | "medium" | "low";
  comments?: GitHubIssueComment[];
}

export interface ProjectDependencyItem {
  name: string;
  version: string;
  latestVersion: string;
  type: "dependency" | "devDependency";
  category: "AI & LLM Engine" | "Core Framework" | "UI & Animation" | "Server & Routing" | "Build & Tooling" | "Utilities";
  description: string;
  license: string;
  bundleSize: string;
  isOutdated: boolean;
  vulnerabilities: number;
  homepage?: string;
}

export interface FileTransferRecord {
  id: string;
  filePath: string;
  repoName: string;
  branch: string;
  commitSha: string;
  commitMessage: string;
  status: "pending" | "transferring" | "success" | "failed";
  transferredAt: number;
  promptUsed?: string;
}

export interface HistoryActivityItem {
  id: string;
  type: "file-open" | "file-upload" | "ai-generate" | "debug-fix" | "deduplicate" | "ast-refactor" | "readme-gen" | "ai-modify" | "file-transfer";
  title: string;
  filePath: string;
  timestamp: number;
  modelUsed?: string;
  snapshotContent?: string;
  meta?: Record<string, any>;
}

export interface VSCodeBridgeConfig {
  endpointUrl: string;
  apiKey: string;
  model: string;
  status: "connected" | "listening" | "disconnected";
  connectedAt?: number;
  requestsHandled: number;
}

export interface SystemHealth {
  status: string;
  hasApiKey: boolean;
  models: {
    highThinking: string;
    general: string;
    fast: string;
  };
}
