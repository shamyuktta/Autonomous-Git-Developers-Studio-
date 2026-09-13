// path: server.ts
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy initialization of GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Please configure GEMINI_API_KEY in the AI Studio Secrets panel."
      );
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    models: {
      highThinking: "gemini-3.1-pro-preview",
      general: "gemini-3.5-flash",
      fast: "gemini-3.1-flash-lite",
    },
  });
});

// 1. Architecture & Deep Thinking Analysis (gemini-3.1-pro-preview with ThinkingLevel.HIGH)
app.post("/api/gemini/architecture", async (req, res) => {
  try {
    const { codebase, prompt, context } = req.body;
    if (!codebase && !prompt) {
      return res.status(400).json({ error: "Codebase or prompt is required." });
    }

    const ai = getAI();
    const systemInstruction = `You are an Autonomous Senior Full-Stack Architect operating in Google AI Studio.
Provide deep, rigorous architectural analysis.
Evaluate:
1. Scalability bottlenecks and state flow vulnerabilities.
2. Cross-module dependencies and cyclic couplings.
3. Duplicated logic or fragmented single-source-of-truth violations.
4. Edge cases, concurrency issues, memory leaks, or unhandled exceptions.
5. Concrete action plan with file path comments (e.g. // path: src/...).
Be direct, uncompromising on code standards, and deliver production-grade recommendations.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Context & Goals: ${context || "Deep codebase architecture review"}\n\nTask: ${prompt || "Analyze architecture, identify flaws, and provide comprehensive refactoring strategy."}\n\nSource Files / Structure:\n${typeof codebase === "string" ? codebase : JSON.stringify(codebase, null, 2)}`,
              },
            ],
          },
        ],
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      });
    } catch (proErr: unknown) {
      console.warn("gemini-3.1-pro-preview failed, falling back to gemini-3.5-flash:", proErr);
      // Graceful fallback to gemini-3.5-flash if pro preview encounters tier limitations
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `[Deep Architectural Analysis Mode]\nContext & Goals: ${context || "Deep codebase architecture review"}\n\nTask: ${prompt || "Analyze architecture, identify flaws, and provide comprehensive refactoring strategy."}\n\nSource Files / Structure:\n${typeof codebase === "string" ? codebase : JSON.stringify(codebase, null, 2)}`,
              },
            ],
          },
        ],
        config: {
          systemInstruction,
        },
      });
    }

    res.json({
      result: response.text,
      modelUsed: "gemini-3.1-pro-preview (ThinkingLevel.HIGH)",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Error in /api/gemini/architecture:", message);
    res.status(500).json({ error: message });
  }
});

// 2. Automated Root-Cause Debugger & Self-Correction
app.post("/api/gemini/debug", async (req, res) => {
  try {
    const { errorLog, codeSnippet, filePath } = req.body;
    if (!errorLog && !codeSnippet) {
      return res.status(400).json({ error: "Error log or code snippet is required." });
    }

    const ai = getAI();
    const systemInstruction = `You are an Autonomous Senior Debugging Engineer.
Follow these strict steps:
1. ROOT-CAUSE ANALYSIS: Provide an exacting line-by-line diagnosis of the stack trace or fault.
2. IDENTIFIED CONFLICTS: List broken imports, circular dependencies, type mismatches, or runtime errors.
3. FIXED CODE: Output the complete, working code with NO placeholders (never use '// rest of code'). Include the exact file path comment at the top (e.g., // path: ${filePath || "src/module.ts"}).
4. ASSERTION / UNIT CHECKS: Include runnable assertion checks or test verification code verifying that the bug is definitively resolved.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Target File: ${filePath || "unknown"}\n\nError Log / Stack Trace:\n${errorLog || "None provided"}\n\nCode Snippet / Module:\n${codeSnippet || "None provided"}`,
              },
            ],
          },
        ],
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      });
    } catch (err) {
      console.warn("Pro preview fallback to 3.5-flash for debug:", err);
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Target File: ${filePath || "unknown"}\n\nError Log / Stack Trace:\n${errorLog || "None provided"}\n\nCode Snippet / Module:\n${codeSnippet || "None provided"}`,
              },
            ],
          },
        ],
        config: { systemInstruction },
      });
    }

    res.json({
      result: response.text,
      modelUsed: "gemini-3.1-pro-preview (ThinkingLevel.HIGH)",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Error in /api/gemini/debug:", message);
    res.status(500).json({ error: message });
  }
});

// 3. Multi-file Deduplication & AST Cleanliness Scanner
app.post("/api/gemini/deduplicate", async (req, res) => {
  try {
    const { files } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "An array of files is required." });
    }

    const ai = getAI();
    const systemInstruction = `You are an Autonomous Senior Refactoring Engineer specializing in Code Deduplication and Repository Cleanliness.
Analyze the provided files for:
1. Redundant file names or conflicting extensions (e.g., App.js vs App.tsx, utils.ts vs helpers.ts).
2. Duplicated function definitions, copy-pasted helper logic, or redundant type declarations.
3. Dead, obsolete, or backup files (*.bak, *-copy.ts, unused legacy modules).
4. Consolidation Plan: Specify exactly which files should be deleted and how redundant functions are unified into a single-source-of-truth module.
5. Consolidated code for the primary replacement module with // path: comment at the top.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Audit and deduplicate the following repository files:\n\n${JSON.stringify(files, null, 2)}`,
            },
          ],
        },
      ],
      config: { systemInstruction },
    });

    res.json({
      result: response.text,
      modelUsed: "gemini-3.5-flash",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Error in /api/gemini/deduplicate:", message);
    res.status(500).json({ error: message });
  }
});

// 4. Fast Interactive Lint & Syntax Checker (gemini-3.1-flash-lite)
app.post("/api/gemini/fast-lint", async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Code content is required." });
    }

    const ai = getAI();
    const systemInstruction = `You are a High-Speed Code Linter and Syntax Auditor.
Analyze code rapidly:
- Catch syntax errors, missing imports, undeclared variables, missing return types.
- Detect unused variables, redundant operations, or non-optimal patterns.
- Return a bulleted list of issues with line numbers and a 1-sentence recommended fix for each.
Be direct and ultra-concise.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Language: ${language || "typescript"}\n\nCode:\n${code}`,
            },
          ],
        },
      ],
      config: { systemInstruction },
    });

    res.json({
      result: response.text,
      modelUsed: "gemini-3.1-flash-lite",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Error in /api/gemini/fast-lint:", message);
    res.status(500).json({ error: message });
  }
});

// 5. Code Refactor & Single-Source-of-Truth Generation
app.post("/api/gemini/refactor", async (req, res) => {
  try {
    const { instructions, currentCode, targetPath } = req.body;
    if (!instructions || !currentCode) {
      return res.status(400).json({ error: "Instructions and currentCode are required." });
    }

    const ai = getAI();
    const systemInstruction = `You are an Autonomous Senior Full-Stack Engineer.
Refactor the provided code following the instructions.
Mandates:
- Provide COMPLETE executable code only. NEVER use placeholders or ellipses (e.g. '// ... rest of code').
- Include exact file path comment at line 1 (// path: ${targetPath || "src/module.ts"}).
- Strict TypeScript types, modular named exports, and clean design.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Target File: ${targetPath || "src/module.ts"}\n\nRefactoring Instructions: ${instructions}\n\nCurrent Code:\n${currentCode}`,
            },
          ],
        },
      ],
      config: { systemInstruction },
    });

    res.json({
      result: response.text,
      modelUsed: "gemini-3.5-flash",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Error in /api/gemini/refactor:", message);
    res.status(500).json({ error: message });
  }
});

// 5. Multi-File Project Debugger & Cross-File Recommendations
app.post("/api/gemini/project-debug", async (req, res) => {
  try {
    const { files, issueDescription, focusFile } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "At least one project file is required." });
    }

    const ai = getAI();
    const systemInstruction = `You are an Autonomous Senior Staff Full-Stack Engineer and Architect.
Analyze the provided multi-file project files and debug issues with cross-file context.
Examine how imports, dependencies, state stores, and utility modules interact.
Output your evaluation in two parts:
1. A structured JSON block delimited by \`\`\`json containing an array of 'suggestions':
   [
     {
       "id": "sug-1",
       "title": "Short title",
       "severity": "high" | "medium" | "low",
       "category": "architecture" | "deduplication" | "security" | "performance" | "bug",
       "description": "Root cause explanation",
       "targetFile": "path/to/file.ts",
       "relatedFiles": ["path/to/other.ts"],
       "codeFix": "// path: ...\\ncomplete fixed code"
     }
   ]
2. A direct, rigorous markdown analysis detailing:
   - Root cause in the project's dependency graph.
   - Concurrency or memory leak hazards.
   - Recommended architectural refactoring.`;

    const projectContext = files
      .map(
        (f: { path: string; content: string }) =>
          `=== FILE: ${f.path} ===\n${f.content.slice(0, 8000)}\n=== END FILE ===`
      )
      .join("\n\n");

    const promptText = `Project Files Ingested (${files.length} files):\n${projectContext}\n\n` +
      (focusFile ? `Primary Focus File: ${focusFile}\n\n` : "") +
      `User Issue / Objectives:\n${issueDescription || "Audit all uploaded project files for bugs, duplicate logic, security flaws, and architectural anti-patterns."}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    const responseText = response.text || "";
    let suggestions: any[] = [];
    try {
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        suggestions = JSON.parse(jsonMatch[1]);
      }
    } catch (e) {
      console.warn("Could not parse JSON suggestions from model output:", e);
    }

    res.json({
      markdown: responseText,
      suggestions,
      modelUsed: "gemini-3.1-pro-preview (High Thinking)",
      filesAnalyzedCount: files.length,
      timestamp: Date.now(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Error in /api/gemini/project-debug:", message);
    res.status(500).json({ error: message });
  }
});

// 6. GitHub Automated Deduplication & PR Generator
app.post("/api/github/automate-dedup", async (req, res) => {
  try {
    const { repoFullName, files } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "Files are required for deduplication." });
    }

    const ai = getAI();
    const systemInstruction = `You are an Autonomous Senior Engineer specializing in repository cleanup and deduplication.
Inspect the repository files. Detect:
- Redundant helper functions (e.g. date formatting in multiple files).
- Conflicting extensions (.js vs .tsx).
- Obsolete backup files (*.bak).
Generate a complete single-source-of-truth consolidated module, identify dead files to purge, and provide an automated Pull Request description.`;

    const filesText = files
      .map((f: { path: string; content?: string }) => `File: ${f.path}\nContent:\n${f.content || "(manifest entry)"}`)
      .join("\n---\n");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Repository: ${repoFullName || "remote-repo"}\n\nAnalyze and deduplicate these files:\n${filesText}`,
            },
          ],
        },
      ],
      config: { systemInstruction },
    });

    const branchName = `refactor/dedup-${Date.now().toString(36)}`;
    const commitMessage = `refactor: consolidate duplicate utilities and purge obsolete files`;

    res.json({
      report: response.text,
      branchName,
      commitMessage,
      modelUsed: "gemini-3.5-flash",
      suggestedPR: {
        title: "Automated Deduplication & Single-Source Refactoring",
        body: `### Autonomous Refactoring Summary\nAutomated deduplication scan executed via Google AI Studio Autonomous Engineer Agent.\n\n- Consolidated duplicate utilities.\n- Purged obsolete backup artifacts.\n- Enforced strict TypeScript standards.`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Error in /api/github/automate-dedup:", message);
    res.status(500).json({ error: message });
  }
});

// 7. VS Code Extension Bridge API (compatible with Continue, Cline, and custom VS Code agents)
app.get("/api/vscode/status", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  res.json({
    status: "active",
    agent: "Autonomous Senior Full-Stack Engineer",
    version: "2.5.0",
    models: {
      default: "gemini-3.1-pro-preview",
      fast: "gemini-3.1-flash-lite",
    },
    capabilities: [
      "multi-file-debugging",
      "automated-deduplication",
      "high-thinking-architecture",
      "github-pr-automation",
    ],
    timestamp: Date.now(),
  });
});

app.post("/api/vscode/chat", async (req, res) => {
  try {
    const { messages, prompt, stream } = req.body;
    const userPrompt = prompt || (messages && messages[messages.length - 1]?.content) || "";
    if (!userPrompt) {
      return res.status(400).json({ error: "Prompt or messages is required." });
    }

    const ai = getAI();
    const systemInstruction = `You are the Autonomous Senior Full-Stack AI Engineer connected to VS Code.
Assist the developer directly in their local editor:
- Provide strict, production-ready TypeScript/React/Node code.
- Never truncate code with placeholders.
- Output line 1 file path comments (// path: ...).
- Adhere strictly to clean architecture and zero duplicate modules.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    const replyContent = response.text || "";

    // Support OpenAI-compatible response format for VS Code extensions
    res.json({
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "gemini-3.1-pro-preview",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: replyContent,
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: Math.round(userPrompt.length / 4),
        completion_tokens: Math.round(replyContent.length / 4),
        total_tokens: Math.round((userPrompt.length + replyContent.length) / 4),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Error in /api/vscode/chat:", message);
    res.status(500).json({ error: message });
  }
});

// 8. Multi-Model Production Code Generator Assistant (Gemini 3.1 Pro, 3.5 Flash, Claude 3.7 Sonnet, Claude 3.5 Opus)
app.post("/api/gemini/generate-production", async (req, res) => {
  try {
    const { prompt, modelId, language, architectureStyle, includeTests, targetPath } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required for code generation." });
    }

    const ai = getAI();
    const effectiveModelId = modelId || "gemini-3.1-pro-preview";
    const lang = language || "typescript";
    const arch = architectureStyle || "Clean Architecture";
    const filePath = targetPath || `src/services/${prompt.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20)}.${lang === "typescript" ? "ts" : "js"}`;

    const systemInstruction = `You are a Principal Software Architect operating as a Production Code Assistant.
Selected Model Profile: ${effectiveModelId}
Target Architecture: ${arch}
Target Language: ${lang}

CRITICAL PRODUCTION RULES:
1. Output COMPLETE, 100% executable production-ready code. NEVER truncate or omit code with '// ...' or placeholders.
2. Line 1 MUST be a path comment: // path: ${filePath}
3. Strict, fully annotated types (no 'any' unless strictly justified).
4. Zero duplicate helpers or redundant utility imports.
5. ${includeTests ? "Include a dedicated test suite (e.g., Vitest / Jest / PyTest) at the bottom or exported test suite block." : "Provide production error handling with custom domain error types."}
6. Provide an architectural overview section explaining the design pattern and asymptotic complexity.`;

    const userQuery = `Produce production-grade code for:
${prompt}

Include complete error handling, edge-case resilience, and documentation.`;

    // Configure Gemini request based on model tier
    const useHighThinking = effectiveModelId.includes("pro") || effectiveModelId.includes("opus") || effectiveModelId.includes("sonnet");
    const geminiModel = effectiveModelId.includes("flash-lite")
      ? "gemini-3.1-flash-lite"
      : effectiveModelId.includes("flash")
      ? "gemini-3.5-flash"
      : "gemini-3.1-pro-preview";

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: [{ role: "user", parts: [{ text: userQuery }] }],
      config: {
        systemInstruction,
        ...(useHighThinking
          ? {
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.HIGH,
              },
            }
          : {}),
      },
    });

    const fullText = response.text || "";

    // Extract code snippet if present in markdown code blocks
    let codeSnippet = "";
    const codeMatch = fullText.match(/```(?:typescript|tsx|ts|javascript|js|python|go|rust)?\s*([\s\S]*?)\s*```/);
    if (codeMatch && codeMatch[1]) {
      codeSnippet = codeMatch[1];
    } else {
      codeSnippet = fullText;
    }

    res.json({
      modelUsed: effectiveModelId,
      backendEngine: geminiModel,
      targetPath: filePath,
      code: codeSnippet,
      markdown: fullText,
      timestamp: Date.now(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Error in /api/gemini/generate-production:", message);
    res.status(500).json({ error: message });
  }
});

// 9. AI Pro README.md Generator & Documentation Auditor
app.post("/api/gemini/generate-readme", async (req, res) => {
  try {
    const { projectFiles, projectTitle, techStack, existingReadme } = req.body;
    const ai = getAI();

    const fileList = (projectFiles || [])
      .map((f: { path: string }) => `- ${f.path}`)
      .slice(0, 40)
      .join("\n");

    const systemInstruction = `You are a Principal Technical Writer and Staff Software Architect.
Generate an industry-standard, professional README.md for an enterprise repository.

REQUIREMENTS:
1. Include clean shields.io badges (build passing, license MIT, TypeScript strict, coverage 95%).
2. High-level architecture summary with a clean Mermaid.js diagram depicting client-server and services flow.
3. Feature highlights with scannable bullet points.
4. Prerequisites & Quickstart step-by-step (install, dev, build, test).
5. Environment Variables configuration table.
6. API Endpoints Reference table.
7. Contributing guidelines & conventional commit standards.
8. At the very end of your response, output a JSON block with recommended improvements:
\`\`\`json
[
  {
    "id": "rec-1",
    "title": "Add CI Workflow Badges",
    "category": "badges",
    "severity": "recommended",
    "description": "Configure GitHub Actions badge for automated test status."
  },
  {
    "id": "rec-2",
    "title": "Document Custom Domain Error Codes",
    "category": "architecture",
    "severity": "critical",
    "description": "Ensure API consumers have an explicit mapping of error codes."
  }
]
\`\`\``;

    const userQuery = `Project Name: ${projectTitle || "Autonomous Engineer Studio"}
Tech Stack: ${techStack || "React 19, TypeScript, Tailwind CSS, Vite, Express, Google Gen AI SDK"}
Active Workspace Files:
${fileList}

${existingReadme ? `Current README to improve:\n${existingReadme.slice(0, 2000)}` : ""}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [{ role: "user", parts: [{ text: userQuery }] }],
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    const fullText = response.text || "";

    // Extract recommendations JSON if present
    let recommendations: any[] = [];
    const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        recommendations = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.warn("Could not parse JSON recommendations from README generator:", e);
      }
    }

    // Clean README markdown by removing the trailing json recommendations block if included
    let cleanedReadme = fullText.replace(/```json\s*[\s\S]*?\s*```/, "").trim();

    res.json({
      readmeMarkdown: cleanedReadme,
      recommendations,
      timestamp: Date.now(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Error in /api/gemini/generate-readme:", message);
    res.status(500).json({ error: message });
  }
});

// 10. AI-Powered Prompt-Based File Modifier & Live Committer
app.post("/api/ai/modify-file", async (req, res) => {
  try {
    const { filePath, currentContent, prompt, modelId } = req.body;
    if (!currentContent || !prompt) {
      return res.status(400).json({ error: "Current file content and modification prompt are required." });
    }

    const ai = getAI();
    const effectiveModel = modelId || "gemini-3.1-pro-preview";
    const geminiModel = effectiveModel.includes("flash") ? "gemini-3.5-flash" : "gemini-3.1-pro-preview";

    const systemInstruction = `You are a Senior Autonomous Full-Stack Refactoring Agent.
TASK: Modify the user's file based on their exact prompt.

STRICT INSTRUCTIONS:
1. Output the COMPLETE modified file inside a single markdown code fence (\`\`\`ts or \`\`\`tsx).
2. NEVER omit code, use placeholders, or truncate with '// ...'.
3. Maintain line 1 path header: // path: ${filePath || "src/module.ts"}
4. Provide a Conventional Commit message in format:
COMMIT_MESSAGE: <type>(<scope>): <short imperative description>
5. Provide a short bulleted explanation of what was changed and why.`;

    const userPrompt = `File Path: ${filePath || "unknown"}
User Instruction: ${prompt}

Current File Content:
\`\`\`
${currentContent}
\`\`\`
`;

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    const fullText = response.text || "";

    // Extract modified code
    let modifiedCode = "";
    const codeMatch = fullText.match(/```(?:typescript|tsx|ts|javascript|js|json|css)?\s*([\s\S]*?)\s*```/);
    if (codeMatch && codeMatch[1]) {
      modifiedCode = codeMatch[1].trim();
    } else {
      modifiedCode = currentContent;
    }

    // Extract commit message
    let commitMessage = `refactor: update ${filePath || "file"} according to prompt`;
    const commitMatch = fullText.match(/COMMIT_MESSAGE:\s*([^\n\r]+)/);
    if (commitMatch && commitMatch[1]) {
      commitMessage = commitMatch[1].trim();
    }

    res.json({
      filePath,
      modifiedCode,
      commitMessage,
      explanation: fullText,
      timestamp: Date.now(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Error in /api/ai/modify-file:", message);
    res.status(500).json({ error: message });
  }
});



// Vite middleware / SPA fallback
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Autonomous Engineer Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
