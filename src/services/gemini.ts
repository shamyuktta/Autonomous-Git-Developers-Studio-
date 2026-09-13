// path: src/services/gemini.ts
import { SystemHealth } from "../types/studio";

export async function checkSystemHealth(): Promise<SystemHealth> {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) throw new Error(`Health check returned ${res.status}`);
    return await res.json();
  } catch {
    return {
      status: "offline",
      hasApiKey: false,
      models: {
        highThinking: "gemini-3.1-pro-preview",
        general: "gemini-3.5-flash",
        fast: "gemini-3.1-flash-lite",
      },
    };
  }
}

export async function analyzeArchitecture(
  codebase: string | object,
  prompt?: string,
  context?: string
): Promise<{ result: string; modelUsed: string }> {
  const res = await fetch("/api/gemini/architecture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codebase, prompt, context }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Server request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function debugRootCause(
  errorLog: string,
  codeSnippet: string,
  filePath?: string
): Promise<{ result: string; modelUsed: string }> {
  const res = await fetch("/api/gemini/debug", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ errorLog, codeSnippet, filePath }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Server request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function scanDeduplication(
  files: Array<{ path: string; content: string }>
): Promise<{ result: string; modelUsed: string }> {
  const res = await fetch("/api/gemini/deduplicate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Server request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fastLint(
  code: string,
  language: string = "typescript"
): Promise<{ result: string; modelUsed: string }> {
  const res = await fetch("/api/gemini/fast-lint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Server request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function refactorCode(
  currentCode: string,
  instructions: string,
  targetPath?: string
): Promise<{ result: string; modelUsed: string }> {
  const res = await fetch("/api/gemini/refactor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentCode, instructions, targetPath }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Server request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function debugProjectFiles(
  files: Array<{ name: string; path: string; content: string }>,
  issueDescription?: string,
  focusFile?: string
): Promise<{
  markdown: string;
  suggestions: any[];
  modelUsed: string;
  filesAnalyzedCount: number;
  timestamp: number;
}> {
  const res = await fetch("/api/gemini/project-debug", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files, issueDescription, focusFile }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Server request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function automateGitHubDedup(
  repoFullName: string,
  files: Array<{ path: string; content?: string }>
): Promise<{
  report: string;
  branchName: string;
  commitMessage: string;
  modelUsed: string;
  suggestedPR: { title: string; body: string };
}> {
  const res = await fetch("/api/github/automate-dedup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoFullName, files }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Server request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function testVSCodeEndpoint(prompt: string): Promise<any> {
  const res = await fetch("/api/vscode/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer agent-bridge-local-token",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "VS Code bridge request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function generateProductionCode(params: {
  prompt: string;
  modelId?: string;
  language?: string;
  architectureStyle?: string;
  includeTests?: boolean;
  targetPath?: string;
}): Promise<{
  modelUsed: string;
  backendEngine: string;
  targetPath: string;
  code: string;
  markdown: string;
  timestamp: number;
}> {
  const res = await fetch("/api/gemini/generate-production", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Generation failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function generateReadme(params: {
  projectFiles: Array<{ path: string }>;
  projectTitle?: string;
  techStack?: string;
  existingReadme?: string;
}): Promise<{
  readmeMarkdown: string;
  recommendations: Array<{
    id: string;
    title: string;
    category: "architecture" | "setup" | "security" | "tests" | "badges";
    severity: "critical" | "recommended" | "optional";
    description: string;
  }>;
  timestamp: number;
}> {
  const res = await fetch("/api/gemini/generate-readme", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "README generation failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function modifyFileWithAI(params: {
  filePath: string;
  currentContent: string;
  prompt: string;
  modelId?: string;
}): Promise<{
  filePath: string;
  modifiedCode: string;
  commitMessage: string;
  explanation: string;
  timestamp: number;
}> {
  const res = await fetch("/api/ai/modify-file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "AI file modification failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return await res.json();
}



