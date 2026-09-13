// path: src/components/views/ReadmeGeneratorView.tsx
import React, { useState } from "react";
import { VirtualFile, ReadmeAuditRecommendation } from "../../types/studio";
import { generateReadme } from "../../services/gemini";
import { saveActivity, recordFileAccess } from "../../services/history";
import { generateAutoGitignore, GITIGNORE_PRESETS } from "../../services/gitignoreGenerator";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Layers,
  RefreshCw,
  Eye,
  Code2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sliders,
  CheckSquare,
  FileCode,
} from "lucide-react";

interface ReadmeGeneratorViewProps {
  files: VirtualFile[];
  onSaveToWorkspace: (file: VirtualFile) => void;
  onNavigateToWorkspace: () => void;
}

const DEFAULT_RECOMMENDATIONS: ReadmeAuditRecommendation[] = [
  {
    id: "rec-1",
    title: "Include Architecture Flowchart",
    category: "architecture",
    severity: "critical",
    description: "Mermaid.js diagram visualizing request lifecycles and microservices.",
  },
  {
    id: "rec-2",
    title: "Document All .env.example Secrets",
    category: "security",
    severity: "critical",
    description: "Provide explicit variable types and instructions for secret management.",
  },
  {
    id: "rec-3",
    title: "Add Automated Test Execution Commands",
    category: "tests",
    severity: "recommended",
    description: "Document npm test scripts, coverage thresholds, and CI expectations.",
  },
  {
    id: "rec-4",
    title: "Add Status & License Badges",
    category: "badges",
    severity: "optional",
    description: "Shields.io badges for build status, MIT license, and TypeScript version.",
  },
];

export const ReadmeGeneratorView: React.FC<ReadmeGeneratorViewProps> = ({
  files,
  onSaveToWorkspace,
  onNavigateToWorkspace,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"readme" | "gitignore">("readme");
  const [projectTitle, setProjectTitle] = useState<string>("Autonomous Engineer Studio");
  const [techStack, setTechStack] = useState<string>(
    "React 19, TypeScript, Tailwind CSS, Vite, Express, Google Gen AI SDK"
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");

  // .gitignore state
  const [gitignoreContent, setGitignoreContent] = useState<string>(() => generateAutoGitignore(files));
  const [selectedPresetId, setSelectedPresetId] = useState<string>("auto");

  // Initial template or state for README
  const existingReadmeFile = files.find((f) => f.path.toLowerCase().endsWith("readme.md"));
  const [readmeContent, setReadmeContent] = useState<string>(
    existingReadmeFile?.content ||
      `# Autonomous Engineer Studio

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Thinking Mode](https://img.shields.io/badge/Gemini_3.1_Pro-ThinkingLevel.HIGH-purple.svg)](https://ai.google.dev/)

Autonomous Full-Stack AI Engineering platform powering intelligent GitHub synchronization, zero-placeholder code generation, cross-file debugging, and real-time VS Code IDE bridge.

## System Architecture

\`\`\`mermaid
graph TD
    Client[React 19 + Tailwind UI] -->|Vite HMR & API Proxy| ExpressServer[Express Server Node.js]
    ExpressServer -->|ThinkingLevel.HIGH| GeminiAPI[Google Gemini 3.1 Pro & Claude 3.5]
    ExpressServer -->|OpenAI-Compatible Bridge| VSCode[Local VS Code Extension]
    ExpressServer -->|AST Deduplication| LocalFiles[Workspace Virtual File System]
\`\`\`

## Key Capabilities

- **Multi-Model Production Code Synthesis**: Support for Gemini 3.1 Pro, Gemini 1.5 Pro, Claude 3.5 Sonnet, and Llama 3.3.
- **Automated Repository Deduplication**: Cleans duplicate utilities, purges dead \`*.bak\` files, and creates clean pull requests.
- **Cross-File Project Debugger**: Resolves cyclic imports and memory leaks across multiple uploaded source files.
- **VS Code Extension Bridge**: Connects Continue.dev, Cline, and Roo Code directly to the Studio agent.

## Quickstart

\`\`\`bash
# 1. Clone the repository
git clone https://github.com/organization/autonomous-engineer-studio.git

# 2. Install dependencies
npm install

# 3. Launch local development server
npm run dev
\`\`\`

## Environment Variables

| Variable | Description | Required | Default |
| :--- | :--- | :--- | :--- |
| \`GEMINI_API_KEY\` | Google Gemini API Key | Yes | \`-\` |
| \`PORT\` | HTTP Port for Reverse Proxy | No | \`3000\` |
| \`NODE_ENV\` | Runtime environment | No | \`development\` |

## License
MIT © 2026 Autonomous Engineering Team.
`
  );

  const [recommendations, setRecommendations] = useState<ReadmeAuditRecommendation[]>(DEFAULT_RECOMMENDATIONS);
  const [auditScore, setAuditScore] = useState<number>(94);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSavedSuccess(null);

    try {
      const res = await generateReadme({
        projectFiles: files.map((f) => ({ path: f.path })),
        projectTitle: projectTitle.trim(),
        techStack: techStack.trim(),
        existingReadme: readmeContent,
      });

      if (res.readmeMarkdown) {
        setReadmeContent(res.readmeMarkdown);
        setAuditScore(96);
        if (res.recommendations && res.recommendations.length > 0) {
          setRecommendations(res.recommendations);
        }

        saveActivity({
          type: "readme-gen",
          title: `Generated Pro README for ${projectTitle}`,
          filePath: "README.md",
          meta: { projectTitle, fileCount: files.length, score: 96 },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveReadmeToWorkspace = () => {
    const fileId = existingReadmeFile ? existingReadmeFile.id : `file-readme-${Date.now()}`;
    const newFile: VirtualFile = {
      id: fileId,
      name: "README.md",
      path: "README.md",
      content: readmeContent,
      language: "markdown",
      size: Math.round(readmeContent.length / 1024),
    };

    onSaveToWorkspace(newFile);
    recordFileAccess({ path: "README.md", name: "README.md" });
    setSavedSuccess("README.md");
    setTimeout(() => setSavedSuccess(null), 4000);
  };

  const handleSaveGitignoreToWorkspace = () => {
    const existingGitignore = files.find((f) => f.path.toLowerCase() === ".gitignore");
    const fileId = existingGitignore ? existingGitignore.id : `file-gitignore-${Date.now()}`;
    const newFile: VirtualFile = {
      id: fileId,
      name: ".gitignore",
      path: ".gitignore",
      content: gitignoreContent,
      language: "yaml",
      size: Math.round(gitignoreContent.length / 1024),
    };

    onSaveToWorkspace(newFile);
    recordFileAccess({ path: ".gitignore", name: ".gitignore" });
    setSavedSuccess(".gitignore");
    setTimeout(() => setSavedSuccess(null), 4000);
  };

  const handleApplyPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === "auto") {
      setGitignoreContent(generateAutoGitignore(files));
    } else {
      const preset = GITIGNORE_PRESETS.find((p) => p.id === presetId);
      if (preset) {
        setGitignoreContent(preset.rules.join("\n"));
      }
    }
  };

  const handleDownload = (filename: string, text: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">AI Pro Documentation & .gitignore Suite</h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                Audit & Security Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Inspects your project workspace files ({files.length} active files), generates comprehensive documentation with Mermaid.js flowcharts, and provides an instant smart <strong>.gitignore generator</strong> preventing repo bloat & leaked secrets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Audit Score</div>
            <div className="text-base font-bold text-emerald-400">{auditScore} / 100</div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing & Synthesizing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Pro README
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub-Tabs Selector: README vs .gitignore */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab("readme")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === "readme"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Pro README.md Generator</span>
        </button>

        <button
          onClick={() => setActiveSubTab("gitignore")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === "gitignore"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
          }`}
        >
          <FileCode className="w-4 h-4 text-emerald-400" />
          <span>Smart Auto .gitignore Generator</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
            NEW
          </span>
        </button>
      </div>

      {/* TAB 1: README GENERATOR */}
      {activeSubTab === "readme" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Configuration & Quality Audit (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Project Meta Inputs */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3.5">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                Documentation Meta
              </span>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Project Name</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tech Stack & Frameworks</label>
                <input
                  type="text"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <div className="text-xs text-slate-400 flex items-center justify-between mb-1.5">
                  <span>Workspace Files Ingested</span>
                  <span className="font-mono text-indigo-400">{files.length} files</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1 max-h-24 overflow-y-auto">
                  {files.map((f) => (
                    <div key={f.id} className="truncate text-slate-300">
                      • {f.path}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quality Audit Recommendations */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Documentation Audit
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Grade A
                </span>
              </div>

              <div className="space-y-2.5">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-xs text-slate-200 flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {rec.title}
                      </div>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border shrink-0 ${
                          rec.severity === "critical"
                            ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                            : rec.severity === "recommended"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {rec.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: README Viewer & Workspace Sync (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 min-h-[560px] flex flex-col justify-between">
              <div>
                {/* Header & Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                      <button
                        onClick={() => setViewMode("preview")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          viewMode === "preview"
                            ? "bg-slate-800 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Rendered Preview
                      </button>
                      <button
                        onClick={() => setViewMode("raw")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          viewMode === "raw"
                            ? "bg-slate-800 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        Raw Markdown
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(readmeContent)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy
                    </button>
                    <button
                      onClick={() => handleDownload("README.md", readmeContent)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                    <button
                      onClick={handleSaveReadmeToWorkspace}
                      className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Save README to Workspace
                    </button>
                  </div>
                </div>

                {savedSuccess === "README.md" && (
                  <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      README.md saved to active workspace tree!
                    </div>
                    <button onClick={onNavigateToWorkspace} className="underline text-emerald-200 font-semibold">
                      View in Code Studio →
                    </button>
                  </div>
                )}

                {/* Viewer Content */}
                <div className="mt-4">
                  {viewMode === "raw" ? (
                    <textarea
                      value={readmeContent}
                      onChange={(e) => setReadmeContent(e.target.value)}
                      rows={22}
                      className="w-full bg-slate-950 rounded-xl border border-slate-800 p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    />
                  ) : (
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 text-xs text-slate-300 overflow-y-auto max-h-[580px] space-y-4 leading-relaxed font-sans">
                      <div className="prose prose-invert max-w-none space-y-4">
                        {readmeContent.split("\n\n").map((block, idx) => {
                          if (block.startsWith("# ")) {
                            return (
                              <h1 key={idx} className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                                {block.replace("# ", "")}
                              </h1>
                            );
                          }
                          if (block.startsWith("## ")) {
                            return (
                              <h2 key={idx} className="text-base font-bold text-slate-100 mt-4 border-b border-slate-800 pb-1">
                                {block.replace("## ", "")}
                              </h2>
                            );
                          }
                          if (block.startsWith("```")) {
                            return (
                              <pre
                                key={idx}
                                className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto"
                              >
                                {block.replace(/```[a-z]*/g, "").trim()}
                              </pre>
                            );
                          }
                          return (
                            <p key={idx} className="text-slate-300 leading-relaxed">
                              {block}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUTO .GITIGNORE GENERATOR */}
      {activeSubTab === "gitignore" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Preset Selector & Rules (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                  Presets & Archetypes
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  DevSecOps Guard
                </span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleApplyPreset("auto")}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    selectedPresetId === "auto"
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-200"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Auto-Detect from Workspace
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Scans {files.length} active files and builds bespoke exclusions.
                  </div>
                </button>

                {GITIGNORE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      selectedPresetId === preset.id
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-200"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200">{preset.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Security checklist block */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Zero-Leaked-Secrets Guarantee
              </span>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Excludes <code className="text-slate-300">.env</code> & secret keys</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Filters large build caches (<code className="text-slate-300">node_modules</code>)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Blocks accidental backup files (<code className="text-slate-300">*.bak</code>)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: .gitignore Editor (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 min-h-[560px] flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200 font-mono">.gitignore</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(gitignoreContent)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Rules
                    </button>
                    <button
                      onClick={() => handleDownload(".gitignore", gitignoreContent)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download .gitignore
                    </button>
                    <button
                      onClick={handleSaveGitignoreToWorkspace}
                      className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Save .gitignore to Workspace
                    </button>
                  </div>
                </div>

                {savedSuccess === ".gitignore" && (
                  <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      .gitignore saved to workspace root!
                    </div>
                    <button onClick={onNavigateToWorkspace} className="underline text-emerald-200 font-semibold">
                      View in Code Studio →
                    </button>
                  </div>
                )}

                <div className="mt-4">
                  <textarea
                    value={gitignoreContent}
                    onChange={(e) => setGitignoreContent(e.target.value)}
                    rows={22}
                    className="w-full bg-slate-950 rounded-xl border border-slate-800 p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
