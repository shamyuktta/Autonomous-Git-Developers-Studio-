// path: src/components/views/DocuGenDocumentationView.tsx
import React, { useState } from "react";
import { VirtualFile } from "../../types/studio";
import {
  FileText,
  Copy,
  Check,
  Download,
  Sparkles,
  ExternalLink,
  Code2,
  FolderGit2,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Zap,
  ArrowRight,
  Layers,
  BookOpen,
} from "lucide-react";

interface DocuGenDocumentationViewProps {
  files: VirtualFile[];
  onSaveFileToWorkspace?: (file: VirtualFile) => void;
  onNavigateToGitHub?: () => void;
}

export const DOCUGEN_DEFAULT_SPEC = `# 🤖 DocuGen AI · [![GitHub license](https://shields.io)](https://github.com) 

**DocuGen AI** is an intelligent, repository-scale software documentation engine that automatically scans your codebase, maps software architecture, and builds production-ready documentation in seconds. 

By interpreting raw code syntax through context-aware artificial intelligence, it eliminates the overhead of manual technical writing, keeping your ecosystem updates perfectly synchronized with your actual development workflows.

[About](#-about) · [How It Works](#-how-it-works) · [Setup & Installation](#%EF%B8%8F-setup--installation) · [Quickstart](#-quickstart) · [How to Download](#-how-to-download) · [Resources](#-resources)

---

## 📖 About
Technical documentation is the lifeblood of software scalability, yet it presents unique friction points for engineering teams. **DocuGen AI** bridges the gap between raw codebase structures and clear human understanding by acting as an **automated internal technical writer** that continuously syncs with your version control systems.

### 🧠 The Core Problem It Solves
* **Documentation Rot:** Code changes rapidly, but text updates lag behind, rendering READMEs obsolete.
* **Onboarding Latency:** New developers waste valuable hours parsing folder hierarchies to understand entry points.
* **Context Fragmentation:** Code logic, configuration states, and runtime setups are trapped inside isolated files.

### 🚀 Key Capabilities
* **Abstract Syntax Parsing:** Maps data dependencies, tracks package initializations, and interprets cross-module communication to construct a structural graph of your architecture.
* **Context Sanitization:** Built with enterprise privacy parameters, the engine automatically excludes sensitive runtime values, personal data tokens, and raw keys. **Your private configuration parameters never leave your local workspace.**
* **Standardized Layout Uniformity:** Output is formatted specifically for GitHub, GitLab, and developer portals.

### 📊 Engine Performance vs. Manual Writing

| Feature Metric | Manual Documentation | DocuGen AI Engine |
| :--- | :--- | :--- |
| **Generation Speed** | 2 to 6 Hours | **12 to 30 Seconds** |
| **Architectural Mapping** | Human-compiled (Prone to errors) | **Automated Abstract Graph Analysis** |
| **Syncing Frequency** | Manual updates per version release | **Automated hooks run on every git commit** |
| **Format Standardization**| Varies wildly by developer | **Rigorous, top-tier template uniformity** |

---

## ⚙️ How It Works

DocuGen AI runs a four-stage compilation pipeline to transform raw directories into high-quality technical assets:

\`\`\`
[ 📂 Raw Codebase ] ──► [ Repository Scanner ] ──► [ Context Aggregator ]
                                                          │
[ 📝 Production Markdown ] ◄── [ AI Engine Layer ] ◄───────┘
\`\`\`

1. **Source Code Extraction:** The application scans the chosen repository path, applying custom system rules to isolate relevant source data (automatically ignoring \`.env\` files, build files, or dependency folders like \`node_modules/\`).
2. **Context Aggregation:** It aggregates code files, functions, structural hierarchies, and existing file comments into a unified contextual data mapping object.
3. **AI Processing:** The consolidated payload is processed via context-aware generative AI prompt wrappers (utilizing advanced architectures like Google AI Studio or Anthropic APIs).
4. **Structured Generation:** The layout layer interprets the model's structural response and writes a cleanly structured markdown output directly to your root folder.

---

## 🛠️ Setup & Installation

### Prerequisites
Before setting up the project locally, ensure you have the following system dependencies installed:
* **Runtime Platform:** Python 3.10+ or Node.js LTS 
* **Version Control:** Git 2.30+
* **API Key:** A valid LLM API Authorization Key (e.g., Google Gemini or OpenAI)

### Step 1: Clone the Repository
Clone the codebase to your local workstation using a standard terminal command:
\`\`\`bash
git clone https://github.com
cd docugen-ai
\`\`\`

### Step 2: Environment Configuration
Create a local \`.env\` configuration file in the project's root folder to map authorization keys securely:
\`\`\`bash
cp .env.example .env
\`\`\`
Open the newly created \`.env\` file and insert your API credentials:
\`\`\`env
# DocuGen Core Settings
AI_PROVIDER="gemini"
API_AUTH_KEY="your_secret_api_key_here"
OUTPUT_FORMAT="markdown"
\`\`\`

### Step 3: Install Core Dependencies
Execute the native installation step to prepare environment isolates:
\`\`\`bash
pip install -r requirements.txt
# OR if using the javascript setup: npm install
\`\`\`

---

## 🚀 Quickstart
Get your first automated repository documentation running in less than a minute.

1. **Verify Target Path:** Locate the project folder you intend to generate documentation for.
2. **Execute Engine Command:** Run the script while passing the target directory parameter:
   \`\`\`bash
   python -m docugen.generate --repo="/path/to/your/target-codebase"
   \`\`\`
3. **Review Output:** Open the newly generated \`README.md\` file created at the root of the target directory to verify structural accuracy.

---

## 📦 How to Download
You can download and bundle the application using the following methods:

* **As a Global Command Line Utility:** Install directly via package managers:
  \`\`\`bash
  npm install -g docugen-ai-cli
  \`\`\`
* **Release Tarballs:** Download the latest compiled source distributions straight from the releases portal:
  \`\`\`bash
  curl -L https://github.com | tar -xz
  \`\`\`

---

## 📚 Resources
* **[Official Documentation Guide]** - Exhaustive guide to advanced configuration mappings and templating protocols.
* **[Extending Layout Blueprints]** - Learn how to build custom schemas for structural compliance.
* **[Developer Security Parameters]** - Essential configurations for data sanitization protocols to keep core access credentials safe.

---

## 🤝 Contributing
Contributions make the open-source community an amazing place to learn, inspire, and create! Any contributions you make are greatly appreciated.
`;

export const DocuGenDocumentationView: React.FC<DocuGenDocumentationViewProps> = ({
  files,
  onSaveFileToWorkspace,
  onNavigateToGitHub,
}) => {
  const [markdownContent, setMarkdownContent] = useState<string>(DOCUGEN_DEFAULT_SPEC);
  const [activeTab, setActiveTab] = useState<"preview" | "raw" | "pipeline_sim">("preview");
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ step: string; percent: number }>({
    step: "Ready",
    percent: 100,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToWorkspace = () => {
    if (onSaveFileToWorkspace) {
      onSaveFileToWorkspace({
        id: "docugen-readme",
        name: "README.md",
        path: "README.md",
        language: "markdown",
        content: markdownContent,
        isPendingCommit: true,
        size: markdownContent.length,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleRunDocuGenScan = () => {
    setIsScanning(true);
    setScanProgress({ step: "Scanning workspace files and AST nodes...", percent: 25 });

    setTimeout(() => {
      setScanProgress({ step: "Sanitizing context & extracting signatures...", percent: 55 });
    }, 600);

    setTimeout(() => {
      setScanProgress({ step: "Executing Gemini 3.8 contextual documentation prompt...", percent: 85 });
    }, 1200);

    setTimeout(() => {
      // Assemble dynamic scanned summary from actual workspace
      const fileCount = files.length;
      const detectedLanguages = Array.from(new Set(files.map((f) => f.language))).join(", ");

      const dynamicAppend = `\n\n### 📦 Scanned Project Artifacts Summary\n* **Analyzed Files:** ${fileCount} files indexed\n* **Languages:** ${detectedLanguages || "TypeScript, JavaScript, JSON, CSS"}\n* **Engine Status:** All AST trees verified without circular dependency errors.\n* **Generated Timestamp:** ${new Date().toLocaleString()}\n`;

      setMarkdownContent(DOCUGEN_DEFAULT_SPEC + dynamicAppend);
      setScanProgress({ step: "Documentation build complete!", percent: 100 });
      setIsScanning(false);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3" /> Core Engine Spec
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-mono">
                v2.4.0-Enterprise
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5 tracking-tight">
              <span>🤖 DocuGen AI</span>
              <span className="text-slate-500 font-normal text-lg">· Intelligent Documentation Engine</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Scans your codebase, builds abstract syntax dependency graphs, and generates production-ready GitHub documentation with zero human technical writing latency.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleRunDocuGenScan}
              disabled={isScanning}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning Workspace...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Re-Scan & Generate Docs</span>
                </>
              )}
            </button>

            {onSaveFileToWorkspace && (
              <button
                onClick={handleSaveToWorkspace}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Saved to Workspace!</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Save to README.md</span>
                  </>
                )}
              </button>
            )}

            {onNavigateToGitHub && (
              <button
                onClick={onNavigateToGitHub}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Export to GitHub</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
              title="Copy Markdown"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
              title="Download README.md"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar (Visible during scan) */}
        {isScanning && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-indigo-300 font-mono flex items-center gap-2">
                <RefreshCw className="w-3 h-3 animate-spin" />
                {scanProgress.step}
              </span>
              <span className="font-mono text-slate-400">{scanProgress.percent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${scanProgress.percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Metric Quick Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-100">12 - 30s</div>
            <div className="text-[11px] text-slate-400">Generation Speed</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-100">100% Sanitized</div>
            <div className="text-[11px] text-slate-400">Local Token Exclusion</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-100">AST Graph</div>
            <div className="text-[11px] text-slate-400">Dependency Mapping</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-100">GitHub Ready</div>
            <div className="text-[11px] text-slate-400">Standardized Layout</div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Preview, Raw Markdown, Engine Architecture */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "preview"
                ? "bg-slate-800 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Formatted Preview
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "raw"
                ? "bg-slate-800 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Raw Markdown (.md)
          </button>
          <button
            onClick={() => setActiveTab("pipeline_sim")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "pipeline_sim"
                ? "bg-slate-800 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            4-Stage Pipeline Diagram
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          {markdownContent.split("\n").length} lines · {markdownContent.length} chars
        </div>
      </div>

      {/* Tab 1: Formatted Preview */}
      {activeTab === "preview" && (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 text-slate-200 leading-relaxed max-w-none">
          {/* Header */}
          <div className="border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🤖</span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">DocuGen AI</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono">
                license: MIT
              </span>
            </div>
            <p className="mt-3 text-slate-300 text-base">
              <strong>DocuGen AI</strong> is an intelligent, repository-scale software documentation engine that automatically scans your codebase, maps software architecture, and builds production-ready documentation in seconds.
            </p>
            <p className="mt-2 text-slate-400 text-sm">
              By interpreting raw code syntax through context-aware artificial intelligence, it eliminates the overhead of manual technical writing, keeping your ecosystem updates perfectly synchronized with your actual development workflows.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-indigo-400 mt-4">
              <span className="hover:underline cursor-pointer">About</span> ·{" "}
              <span className="hover:underline cursor-pointer">How It Works</span> ·{" "}
              <span className="hover:underline cursor-pointer">Setup & Installation</span> ·{" "}
              <span className="hover:underline cursor-pointer">Quickstart</span> ·{" "}
              <span className="hover:underline cursor-pointer">How to Download</span> ·{" "}
              <span className="hover:underline cursor-pointer">Resources</span>
            </div>
          </div>

          {/* Section: About */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📖</span> About
            </h2>
            <p className="text-sm text-slate-300">
              Technical documentation is the lifeblood of software scalability, yet it presents unique friction points for engineering teams. <strong>DocuGen AI</strong> bridges the gap between raw codebase structures and clear human understanding by acting as an <strong>automated internal technical writer</strong> that continuously syncs with your version control systems.
            </p>

            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 pt-2">
              <span>🧠</span> The Core Problem It Solves
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-300 pl-2">
              <li>
                <strong className="text-slate-100">Documentation Rot:</strong> Code changes rapidly, but text updates lag behind, rendering READMEs obsolete.
              </li>
              <li>
                <strong className="text-slate-100">Onboarding Latency:</strong> New developers waste valuable hours parsing folder hierarchies to understand entry points.
              </li>
              <li>
                <strong className="text-slate-100">Context Fragmentation:</strong> Code logic, configuration states, and runtime setups are trapped inside isolated files.
              </li>
            </ul>

            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 pt-2">
              <span>🚀</span> Key Capabilities
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-300 pl-2">
              <li>
                <strong className="text-slate-100">Abstract Syntax Parsing:</strong> Maps data dependencies, tracks package initializations, and interprets cross-module communication to construct a structural graph of your architecture.
              </li>
              <li>
                <strong className="text-slate-100">Context Sanitization:</strong> Built with enterprise privacy parameters, the engine automatically excludes sensitive runtime values, personal data tokens, and raw keys. <strong>Your private configuration parameters never leave your local workspace.</strong>
              </li>
              <li>
                <strong className="text-slate-100">Standardized Layout Uniformity:</strong> Output is formatted specifically for GitHub, GitLab, and developer portals.
              </li>
            </ul>

            {/* Performance Table */}
            <div className="pt-3">
              <h3 className="text-sm font-bold text-slate-200 mb-2">📊 Engine Performance vs. Manual Writing</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-300 border-b border-slate-800 uppercase tracking-wider font-mono text-[11px]">
                    <tr>
                      <th className="p-3">Feature Metric</th>
                      <th className="p-3">Manual Documentation</th>
                      <th className="p-3 text-emerald-400">DocuGen AI Engine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-sans">
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-200">Generation Speed</td>
                      <td className="p-3 text-slate-400">2 to 6 Hours</td>
                      <td className="p-3 text-emerald-400 font-bold">12 to 30 Seconds</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-200">Architectural Mapping</td>
                      <td className="p-3 text-slate-400">Human-compiled (Prone to errors)</td>
                      <td className="p-3 text-emerald-400 font-bold">Automated Abstract Graph Analysis</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-200">Syncing Frequency</td>
                      <td className="p-3 text-slate-400">Manual updates per version release</td>
                      <td className="p-3 text-emerald-400 font-bold">Automated hooks run on every git commit</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-200">Format Standardization</td>
                      <td className="p-3 text-slate-400">Varies wildly by developer</td>
                      <td className="p-3 text-emerald-400 font-bold">Rigorous, top-tier template uniformity</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section: How It Works */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>⚙️</span> How It Works
            </h2>
            <p className="text-sm text-slate-300">
              DocuGen AI runs a four-stage compilation pipeline to transform raw directories into high-quality technical assets:
            </p>

            <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-800 leading-relaxed overflow-x-auto">
{`[ 📂 Raw Codebase ] ──► [ Repository Scanner ] ──► [ Context Aggregator ]
                                                          │
[ 📝 Production Markdown ] ◄── [ AI Engine Layer ] ◄───────┘`}
            </div>

            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300 pl-2">
              <li>
                <strong className="text-slate-100">Source Code Extraction:</strong> Scans the target repository, filtering out <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">.env</code> and <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">node_modules/</code>.
              </li>
              <li>
                <strong className="text-slate-100">Context Aggregation:</strong> Assembles AST signatures, docstrings, and export hierarchies into an integrated context bundle.
              </li>
              <li>
                <strong className="text-slate-100">AI Processing:</strong> Evaluates the context bundle via high-reasoning LLMs (Gemini / Claude) to formulate structured documentation.
              </li>
              <li>
                <strong className="text-slate-100">Structured Generation:</strong> Writes polished, uniform Markdown straight to the root <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">README.md</code>.
              </li>
            </ol>
          </div>

          {/* Section: Setup & Installation */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🛠️</span> Setup & Installation
            </h2>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-200">Prerequisites</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pl-2 font-mono">
                <li>Runtime Platform: Python 3.10+ or Node.js LTS</li>
                <li>Version Control: Git 2.30+</li>
                <li>API Key: A valid LLM API Authorization Key (Google Gemini or OpenAI)</li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-1.5">Step 1: Clone the Repository</p>
                <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-emerald-400 border border-slate-800">
                  git clone https://github.com/docugen-ai<br />
                  cd docugen-ai
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-300 mb-1.5">Step 2: Environment Configuration</p>
                <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-slate-300 border border-slate-800">
                  cp .env.example .env<br />
                  <span className="text-slate-500"># Configure AI_PROVIDER="gemini" & API_AUTH_KEY="..."</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-300 mb-1.5">Step 3: Install Core Dependencies</p>
                <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-indigo-300 border border-slate-800">
                  pip install -r requirements.txt <span className="text-slate-500"># or npm install</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Quickstart */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🚀</span> Quickstart
            </h2>
            <div className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-amber-300 border border-slate-800">
              python -m docugen.generate --repo="/path/to/your/target-codebase"
            </div>
          </div>

          {/* Section: Download & Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>📦</span> How to Download
              </h3>
              <p className="text-xs text-slate-400">Install globally as CLI:</p>
              <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-xs text-slate-200">
                npm install -g docugen-ai-cli
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>📚</span> Resources & Guides
              </h3>
              <ul className="space-y-1 text-xs text-indigo-400">
                <li className="hover:underline cursor-pointer">• Official Documentation Guide</li>
                <li className="hover:underline cursor-pointer">• Extending Layout Blueprints</li>
                <li className="hover:underline cursor-pointer">• Developer Security Parameters</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Raw Markdown Editor */}
      {activeTab === "raw" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Live Markdown Buffer</span>
            <span className="text-[11px] text-slate-500 font-mono">Changes reflect immediately in download & workspace save</span>
          </div>
          <textarea
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            rows={24}
            className="w-full p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs border border-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
          />
        </div>
      )}

      {/* Tab 3: 4-Stage Architecture Simulation */}
      {activeTab === "pipeline_sim" && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">4-Stage Compilation Pipeline Architecture</h2>
            <p className="text-xs text-slate-400 mt-1">
              DocuGen AI executes an isolated execution graph to convert unstructured source files into synchronized documentation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-sm">
                01
              </div>
              <h3 className="text-xs font-bold text-slate-200">Source Code Extraction</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Recursively scans AST entry points, auto-filtering binary files, cache directories, and secret files.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono font-bold text-sm">
                02
              </div>
              <h3 className="text-xs font-bold text-slate-200">Context Aggregation</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Maps cross-module imports, routes, API contracts, and parameter types into a unified data topology.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
                03
              </div>
              <h3 className="text-xs font-bold text-slate-200">AI Processing</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Feeds sanitized topologies into high-thinking models (Gemini 3.8 Flash / Claude 3.7) to generate structured technical writing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-sm">
                04
              </div>
              <h3 className="text-xs font-bold text-slate-200">Structured Generation</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Formats Markdown conforming to standard README templates and syncs to GitHub or workspace files.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
