// path: src/components/views/ProductionCodeGenView.tsx
import React, { useState } from "react";
import { AVAILABLE_AI_MODELS } from "../../data/models";
import { generateProductionCode } from "../../services/gemini";
import { saveActivity, recordFileAccess } from "../../services/history";
import { recordUsage } from "../../services/usageTracker";
import { AIModelSpec, VirtualFile, ModelConfigSettings } from "../../types/studio";
import { ModelUsageDashboard } from "./ModelUsageDashboard";
import {
  Sparkles,
  Cpu,
  Layers,
  Code2,
  CheckCircle2,
  Copy,
  Check,
  Download,
  ArrowRight,
  RefreshCw,
  FileCheck2,
  Sliders,
  ShieldCheck,
  ChevronDown,
  BarChart3,
  Filter,
  Settings2,
} from "lucide-react";

interface ProductionCodeGenViewProps {
  onPushToWorkspace: (file: VirtualFile) => void;
  onNavigateToWorkspace: () => void;
}

const TEMPLATE_PROMPTS = [
  {
    title: "Token Bucket Rate Limiter",
    prompt: "Implement an in-memory Token Bucket rate limiter with sliding window replenishment, thread-safe mutex concurrency, and custom error types for HTTP 429 Too Many Requests.",
    lang: "typescript",
    arch: "Clean Architecture",
  },
  {
    title: "Distributed Cache with LRU & TTL",
    prompt: "Design a high-performance LRU cache with per-key TTL eviction, O(1) get and set operations using a doubly-linked list and hash map, with automatic background cleanup timers.",
    lang: "typescript",
    arch: "Hexagonal / Ports & Adapters",
  },
  {
    title: "Zero-Dependency JWT & OAuth Validator",
    prompt: "Build an asymmetric JWT token validator that verifies RS256 signatures, checks issuer, audience, and exp timestamps without heavy external libraries, with strict payload typing.",
    lang: "typescript",
    arch: "Functional / Monadic",
  },
  {
    title: "Event-Driven Message Bus with Retry Backoff",
    prompt: "Implement a typed EventEmitter message bus with exponential retry backoff, Dead Letter Queue (DLQ), and idempotent event delivery guarantees.",
    lang: "typescript",
    arch: "Microservice",
  },
];

export const ProductionCodeGenView: React.FC<ProductionCodeGenViewProps> = ({
  onPushToWorkspace,
  onNavigateToWorkspace,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<"generator" | "telemetry">("generator");
  const [providerFilter, setProviderFilter] = useState<string>("All");
  const [selectedModel, setSelectedModel] = useState<AIModelSpec>(AVAILABLE_AI_MODELS[0]);
  const [language, setLanguage] = useState<string>("typescript");
  const [archStyle, setArchStyle] = useState<string>("Clean Architecture");
  const [includeTests, setIncludeTests] = useState<boolean>(true);
  const [prompt, setPrompt] = useState<string>(TEMPLATE_PROMPTS[0].prompt);
  const [targetPath, setTargetPath] = useState<string>("src/services/RateLimiter.ts");

  // Advanced Model Parameters Configuration Panel
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [config, setConfig] = useState<ModelConfigSettings>({
    temperature: 0.2,
    topP: 0.95,
    maxTokens: 4096,
    reasoningEffort: "high",
    systemPersona: "Staff Full-Stack Architect",
    taskType: "architecture",
  });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [pushedSuccess, setPushedSuccess] = useState<boolean>(false);

  const [generatedOutput, setGeneratedOutput] = useState<{
    code: string;
    markdown: string;
    modelUsed: string;
    targetPath: string;
  } | null>(null);

  const handleApplyTemplate = (tmpl: (typeof TEMPLATE_PROMPTS)[0]) => {
    setPrompt(tmpl.prompt);
    setLanguage(tmpl.lang);
    setArchStyle(tmpl.arch);
    const slug = tmpl.title.replace(/[^a-zA-Z0-9]/g, "");
    setTargetPath(`src/services/${slug}.ts`);
  };

  const filteredModels = AVAILABLE_AI_MODELS.filter((m) => {
    if (providerFilter === "All") return true;
    return m.provider.toLowerCase().includes(providerFilter.toLowerCase());
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedOutput(null);
    setPushedSuccess(false);

    const startTime = Date.now();
    try {
      const res = await generateProductionCode({
        prompt: prompt.trim(),
        modelId: selectedModel.id,
        language,
        architectureStyle: archStyle,
        includeTests,
        targetPath: targetPath.trim() || undefined,
      });

      const latency = Date.now() - startTime;
      setGeneratedOutput(res);

      // Record to history and telemetry
      saveActivity({
        type: "ai-generate",
        title: `Generated ${language} module with ${selectedModel.name} (${selectedModel.version})`,
        filePath: res.targetPath,
        modelUsed: `${selectedModel.name} ${selectedModel.version}`,
        snapshotContent: res.code,
      });

      recordFileAccess({
        path: res.targetPath,
        name: res.targetPath.split("/").pop() || res.targetPath,
      });

      recordUsage({
        provider: selectedModel.provider,
        modelName: `${selectedModel.name} (${selectedModel.version})`,
        promptTokens: Math.round(prompt.length / 3.8),
        completionTokens: Math.round(res.code.length / 3.8),
        latencyMs: latency,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePushToWorkspace = () => {
    if (!generatedOutput) return;
    const file: VirtualFile = {
      id: `gen-${Date.now()}`,
      path: generatedOutput.targetPath,
      name: generatedOutput.targetPath.split("/").pop() || generatedOutput.targetPath,
      content: generatedOutput.code,
      language: language === "typescript" || language === "react" ? "typescript" : "javascript",
    };

    onPushToWorkspace(file);
    setPushedSuccess(true);
    setTimeout(() => setPushedSuccess(false), 3000);
  };

  const handleDownload = () => {
    if (!generatedOutput) return;
    const blob = new Blob([generatedOutput.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = generatedOutput.targetPath.split("/").pop() || "module.ts";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            AI Production Code Assistant
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-model synthesis, advanced configuration panels, and real-time usage telemetry.
          </p>
        </div>

        {/* View switcher: Generator vs Telemetry */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveMainTab("generator")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeMainTab === "generator"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code Generator
          </button>
          <button
            onClick={() => setActiveMainTab("telemetry")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeMainTab === "telemetry"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Usage Dashboard
          </button>
        </div>
      </div>

      {activeMainTab === "telemetry" ? (
        <ModelUsageDashboard />
      ) : (
        <>
          {/* Model Configuration & Selection Banner */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800">
              {/* Provider Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-xs font-semibold text-slate-400 mr-1.5 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Provider:
                </span>
                {["All", "Google", "Anthropic", "Meta", "OpenAI"].map((prov) => (
                  <button
                    key={prov}
                    onClick={() => setProviderFilter(prov)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      providerFilter === prov
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>

              {/* Advanced Config Toggle Button */}
              <button
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  isConfigOpen
                    ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                    : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
                Model Configuration Panel
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isConfigOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Collapsible Model Configuration Panel */}
            {isConfigOpen && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs animate-in fade-in duration-150">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Temperature (Determinism)</span>
                    <span className="font-mono text-indigo-400">{config.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">0.0 for strict logic, 0.7 for creative algorithms</div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Top-P Nucleus Sampling</span>
                    <span className="font-mono text-indigo-400">{config.topP}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={config.topP}
                    onChange={(e) => setConfig({ ...config, topP: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">Probability mass threshold</div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">System Persona Archetype</label>
                  <select
                    value={config.systemPersona}
                    onChange={(e) => setConfig({ ...config, systemPersona: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="Staff Full-Stack Architect">Staff Full-Stack Architect</option>
                    <option value="Principal Security Auditor">Principal Security Auditor</option>
                    <option value="High-Performance Systems Lead">High-Performance Systems Lead</option>
                    <option value="Frontend Craft & Accessibility Lead">Frontend Craft & UI Lead</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Target Task Specialization</label>
                  <select
                    value={config.taskType}
                    onChange={(e) => setConfig({ ...config, taskType: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="architecture">Architecture & Concurrency</option>
                    <option value="backend">REST & GraphQL Backend API</option>
                    <option value="frontend">Responsive React Components</option>
                    <option value="database">Database & Schema Migrations</option>
                    <option value="security">Security & Cryptography</option>
                  </select>
                </div>
              </div>
            )}

            {/* Model Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {filteredModels.map((m) => {
                const isSelected = selectedModel.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-indigo-600/15 border-indigo-500/60 shadow-sm shadow-indigo-500/10"
                        : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-xs text-white truncate">{m.name}</span>
                        {m.badge && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{m.version}</div>
                      <div className="text-[11px] text-slate-300 mt-1 line-clamp-1">{m.category}</div>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-500 font-mono">{m.provider}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Studio Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Configuration & Prompt Input (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                  Generation Specifications
                </span>

                {/* Quick Templates */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Archetype Quick Templates</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TEMPLATE_PROMPTS.map((t) => (
                      <button
                        key={t.title}
                        type="button"
                        onClick={() => handleApplyTemplate(t)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white text-[11px] transition-colors"
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language & Architecture Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="typescript">TypeScript</option>
                      <option value="react">React TSX</option>
                      <option value="nodejs">Node.js Express</option>
                      <option value="python">Python</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Architecture Style</label>
                    <select
                      value={archStyle}
                      onChange={(e) => setArchStyle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Clean Architecture">Clean Architecture</option>
                      <option value="Functional / Monadic">Functional / Monadic</option>
                      <option value="Hexagonal / Ports & Adapters">Hexagonal / Ports</option>
                      <option value="Microservice">Microservice</option>
                      <option value="Domain-Driven Design">Domain-Driven Design</option>
                    </select>
                  </div>
                </div>

                {/* Target Path */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Destination Path</label>
                  <input
                    type="text"
                    value={targetPath}
                    onChange={(e) => setTargetPath(e.target.value)}
                    placeholder="e.g. src/services/PaymentService.ts"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Prompt */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Component Requirements & Logic</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                    placeholder="Describe your component logic, interfaces, algorithms, and resilience guarantees..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                  />
                </div>

                {/* Test Suite Checkbox */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-slate-300 font-medium">Include Automated Unit Test Suite</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeTests}
                    onChange={(e) => setIncludeTests(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 focus:outline-none"
                  />
                </div>

                {/* Action button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating via {selectedModel.name}...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Production Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Generated Output (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 min-h-[520px] flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-semibold text-slate-200 font-mono">
                        {generatedOutput ? generatedOutput.targetPath : "Waiting for generation..."}
                      </span>
                    </div>

                    {generatedOutput && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedOutput.code);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2000);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          Copy Code
                        </button>
                        <button
                          onClick={handleDownload}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Save File
                        </button>
                        <button
                          onClick={handlePushToWorkspace}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          Push to Workspace
                        </button>
                      </div>
                    )}
                  </div>

                  {pushedSuccess && (
                    <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        File pushed into active Code Studio workspace tree!
                      </div>
                      <button
                        onClick={onNavigateToWorkspace}
                        className="underline text-emerald-200 font-semibold"
                      >
                        Open Workspace Editor →
                      </button>
                    </div>
                  )}

                  {/* Empty state */}
                  {!generatedOutput && !isGenerating && (
                    <div className="py-24 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-3">
                        <Code2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200">Production Code Studio</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                        Select a provider and model, tweak your parameters in the Configuration Panel, and click{" "}
                        <strong className="text-indigo-400">Generate Production Code</strong>.
                      </p>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="py-24 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                      <p className="text-xs text-slate-300 font-mono">
                        Synthesizing code via {selectedModel.name} ({selectedModel.version})...
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Enforcing strict TypeScript, {config.systemPersona} guidelines, and 0% placeholders.
                      </p>
                    </div>
                  )}

                  {/* Code output */}
                  {generatedOutput && (
                    <div className="mt-4 space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Generated Production Code</span>
                        <span className="font-mono text-[10px] text-indigo-400">{generatedOutput.modelUsed}</span>
                      </div>
                      <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-96 leading-relaxed">
                        {generatedOutput.code}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
