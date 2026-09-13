// path: src/components/views/FileUploadDebuggerView.tsx
import React, { useState } from "react";
import { debugProjectFiles } from "../../services/gemini";
import { ProjectSuggestion } from "../../types/studio";
import {
  UploadCloud,
  FileCode2,
  Bug,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldAlert,
  Zap,
  Code2,
  Trash2,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";

interface UploadedProjectFile {
  name: string;
  path: string;
  content: string;
  size: number;
}

const SAMPLE_PROJECT_FILES: UploadedProjectFile[] = [
  {
    name: "PaymentProcessor.ts",
    path: "src/services/PaymentProcessor.ts",
    content: `// path: src/services/PaymentProcessor.ts
import { formatCurrency } from "../utils/formatters";
import { logTransaction } from "../helpers/logger";
import { OrderState } from "../stores/orderStore";

export class PaymentProcessor {
  private activeOrders: Map<string, any> = new Map();

  // BUG: Memory leak - activeOrders never pruned on completion
  public async processOrder(orderId: string, amount: number) {
    this.activeOrders.set(orderId, { amount, startedAt: Date.now() });
    
    // Concurrent race condition on shared order state
    const currentStatus = OrderState.getStatus(orderId);
    if (currentStatus === "PENDING") {
      OrderState.setStatus(orderId, "PROCESSING");
      await new Promise((resolve) => setTimeout(resolve, 100));
      OrderState.setStatus(orderId, "COMPLETED");
    }
    
    logTransaction(orderId, formatCurrency(amount));
    return { success: true };
  }
}
`,
    size: 820,
  },
  {
    name: "orderStore.ts",
    path: "src/stores/orderStore.ts",
    content: `// path: src/stores/orderStore.ts
// Unprotected global singleton state subject to race conditions
export const OrderState = {
  statusMap: new Map<string, string>(),

  getStatus(orderId: string): string {
    return this.statusMap.get(orderId) || "PENDING";
  },

  setStatus(orderId: string, status: string): void {
    this.statusMap.set(orderId, status);
  },
  
  // Notice: missing clear or mutex locks for concurrent updates
};
`,
    size: 430,
  },
  {
    name: "formatters.ts",
    path: "src/utils/formatters.ts",
    content: `// path: src/utils/formatters.ts
// Duplicate formatter logic conflicting with helpers/currency.ts
export function formatCurrency(amount: number): string {
  return "$" + amount.toFixed(2);
}

export function formatDate(date: Date): string {
  return date.toISOString();
}
`,
    size: 260,
  },
];

export const FileUploadDebuggerView: React.FC = () => {
  const [projectFiles, setProjectFiles] = useState<UploadedProjectFile[]>(SAMPLE_PROJECT_FILES);
  const [selectedFile, setSelectedFile] = useState<UploadedProjectFile>(SAMPLE_PROJECT_FILES[0]);
  const [issueQuery, setIssueQuery] = useState(
    "Detect concurrency race conditions, memory leaks in the activeOrders map, and duplicate formatter logic across sibling files."
  );
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugResult, setDebugResult] = useState<{
    markdown: string;
    suggestions: ProjectSuggestion[];
    modelUsed: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"suggestions" | "analysis">("suggestions");
  const [appliedSuggestionId, setAppliedSuggestionId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // File Upload Handlers (supports multi-file & drag-and-drop)
  const handleFilesUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const newFile: UploadedProjectFile = {
          name: file.name,
          path: file.webkitRelativePath || `src/${file.name}`,
          content: text,
          size: file.size,
        };

        setProjectFiles((prev) => {
          const filtered = prev.filter((p) => p.path !== newFile.path);
          return [...filtered, newFile];
        });

        setSelectedFile(newFile);
      };
      reader.readAsText(file);
    });
  };

  const handleRunProjectDebug = async () => {
    if (projectFiles.length === 0) return;
    setIsDebugging(true);
    setDebugResult(null);

    try {
      const result = await debugProjectFiles(
        projectFiles,
        issueQuery,
        selectedFile?.path
      );
      setDebugResult(result);
      if (result.suggestions && result.suggestions.length > 0) {
        setActiveTab("suggestions");
      } else {
        setActiveTab("analysis");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDebugging(false);
    }
  };

  const handleApplyFix = (suggestion: ProjectSuggestion) => {
    if (!suggestion.codeFix) return;

    // Update the target file in memory
    setProjectFiles((prev) =>
      prev.map((f) => {
        if (f.path === suggestion.targetFile || f.name === suggestion.targetFile) {
          return { ...f, content: suggestion.codeFix! };
        }
        return f;
      })
    );

    if (selectedFile.path === suggestion.targetFile || selectedFile.name === suggestion.targetFile) {
      setSelectedFile((prev) => ({ ...prev, content: suggestion.codeFix! }));
    }

    setAppliedSuggestionId(suggestion.id);
    setTimeout(() => setAppliedSuggestionId(null), 3000);
  };

  const handleRemoveFile = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = projectFiles.filter((f) => f.path !== path);
    setProjectFiles(remaining);
    if (selectedFile.path === path && remaining.length > 0) {
      setSelectedFile(remaining[0]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Bug className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Multi-File Project Debugger</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Cross-File Context Aware
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Upload your project files or entire folders. Unlike traditional single-file linters, Gemini 3.1 Pro evaluates
                the full relationship between your imports, sibling utility files, state stores, and provides exact recommendations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer transition-colors flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              <span>Upload Project Files</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFilesUpload(e.target.files)}
              />
            </label>

            <button
              onClick={() => setProjectFiles(SAMPLE_PROJECT_FILES)}
              className="px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 text-xs transition-colors"
              title="Reset to Sample Project"
            >
              Reset Sample
            </button>
          </div>
        </div>

        {/* Issue / Query Input */}
        <div className="mt-5 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={issueQuery}
              onChange={(e) => setIssueQuery(e.target.value)}
              placeholder="Specify what bug or architectural pattern to investigate (or leave blank for full audit)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={handleRunProjectDebug}
            disabled={isDebugging || projectFiles.length === 0}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isDebugging ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Auditing Project Files...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run Cross-File Debugger
              </>
            )}
          </button>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ingested Project Files (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Ingested Project Files</span>
              <span className="text-[11px] text-slate-400 font-mono">{projectFiles.length} files loaded</span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {projectFiles.map((file) => {
                const isSelected = selectedFile?.path === file.path;
                return (
                  <div
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                        : "bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/40 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileCode2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-medium truncate">{file.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{file.path}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">{Math.round(file.size / 10) / 100} kb</span>
                      <button
                        onClick={(e) => handleRemoveFile(file.path, e)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove file from debug context"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFilesUpload(e.dataTransfer.files);
              }}
              className="mt-3 p-4 border border-dashed border-slate-800 hover:border-slate-700 rounded-xl text-center cursor-pointer transition-colors bg-slate-950/40"
            >
              <UploadCloud className="w-5 h-5 text-slate-500 mx-auto mb-1" />
              <div className="text-xs text-slate-400 font-medium">Drop more files or code here</div>
              <div className="text-[10px] text-slate-500">Supports .ts, .tsx, .js, .json, .css</div>
            </div>
          </div>

          {/* Active File Preview */}
          {selectedFile && (
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-200 font-mono truncate">{selectedFile.path}</span>
                <span className="text-[10px] text-slate-400 font-mono">Focus Active</span>
              </div>
              <textarea
                value={selectedFile.content}
                onChange={(e) => {
                  const updated = e.target.value;
                  setSelectedFile((prev) => ({ ...prev, content: updated }));
                  setProjectFiles((prev) =>
                    prev.map((f) => (f.path === selectedFile.path ? { ...f, content: updated } : f))
                  );
                }}
                className="w-full h-56 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Right: AI Diagnosis & Actionable Project Suggestions (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Project Diagnosis & Recommendations</h3>
                {debugResult?.suggestions && debugResult.suggestions.length > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {debugResult.suggestions.length} recommendations
                  </span>
                )}
              </div>

              {debugResult && (
                <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl text-xs font-medium">
                  <button
                    onClick={() => setActiveTab("suggestions")}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      activeTab === "suggestions"
                        ? "bg-slate-800 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Actionable Fixes
                  </button>
                  <button
                    onClick={() => setActiveTab("analysis")}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      activeTab === "analysis"
                        ? "bg-slate-800 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Full Deep Analysis
                  </button>
                </div>
              )}
            </div>

            {/* Empty State */}
            {!debugResult && !isDebugging && (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-3">
                  <Bug className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">Ready to Debug Project Files</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Click <strong className="text-emerald-400">Run Cross-File Debugger</strong>. Gemini 3.1 Pro (High Thinking)
                  will model the inter-module relationships between your files, identify memory leaks and concurrency
                  flaws, and provide one-click code fixes.
                </p>
              </div>
            )}

            {isDebugging && (
              <div className="py-20 text-center space-y-3">
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-slate-300 font-mono">Running cross-file AST & dependency graph analysis...</p>
                <p className="text-[11px] text-slate-500">Evaluating imports, state singletons, and sibling utility overlaps.</p>
              </div>
            )}

            {/* Suggestions Tab */}
            {debugResult && activeTab === "suggestions" && (
              <div className="mt-5 space-y-4 animate-in fade-in duration-150">
                {appliedSuggestionId && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Target file updated in memory with verified production fix.
                  </div>
                )}

                {debugResult.suggestions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No structured items parsed; view the full deep thinking analysis in the next tab.
                  </div>
                ) : (
                  debugResult.suggestions.map((sug) => {
                    const isHigh = sug.severity === "high";
                    return (
                      <div
                        key={sug.id}
                        className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                                isHigh
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              }`}
                            >
                              {sug.severity} severity
                            </span>
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {sug.category}
                            </span>
                          </div>

                          <span className="text-xs text-slate-400 font-mono">Target: {sug.targetFile}</span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white">{sug.title}</h4>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{sug.description}</p>
                        </div>

                        {sug.relatedFiles && sug.relatedFiles.length > 0 && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <span>Related Sibling Files:</span>
                            {sug.relatedFiles.map((rf) => (
                              <span key={rf} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                                {rf}
                              </span>
                            ))}
                          </div>
                        )}

                        {sug.codeFix && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Recommended Production Code
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(sug.codeFix!);
                                    setCopiedCodeId(sug.id);
                                    setTimeout(() => setCopiedCodeId(null), 2000);
                                  }}
                                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 border border-slate-700 transition-colors"
                                >
                                  {copiedCodeId === sug.id ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  Copy
                                </button>
                                <button
                                  onClick={() => handleApplyFix(sug)}
                                  className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  Apply Fix to File
                                </button>
                              </div>
                            </div>
                            <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-emerald-300 font-mono overflow-x-auto max-h-56 leading-relaxed">
                              {sug.codeFix}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Analysis Tab */}
            {debugResult && activeTab === "analysis" && (
              <div className="mt-5 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Architecture & Root Cause Analysis</span>
                  <span className="font-mono text-[10px]">{debugResult.modelUsed}</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {debugResult.markdown}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
