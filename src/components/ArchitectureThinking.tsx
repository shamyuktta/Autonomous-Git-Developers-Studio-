// path: src/components/ArchitectureThinking.tsx
import React, { useState } from "react";
import { Sparkles, Play, ShieldAlert, Cpu, ArrowRight, CheckCircle2, Copy, Check, Loader2 } from "lucide-react";
import { VirtualFile } from "../types/studio";
import { analyzeArchitecture } from "../services/gemini";

interface ArchitectureThinkingProps {
  files: VirtualFile[];
  selectedFile: VirtualFile | null;
  onApplyCodeSnippet?: (filePath: string, code: string) => void;
}

export const ArchitectureThinking: React.FC<ArchitectureThinkingProps> = ({
  files,
  selectedFile,
  onApplyCodeSnippet,
}) => {
  const [prompt, setPrompt] = useState(
    "Perform a deep architectural review of the system. Analyze scalability bottlenecks, cyclic couplings, single-source-of-truth violations, and generate a step-by-step refactoring action plan."
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRunArchitecture = async () => {
    setLoading(true);
    setError(null);
    try {
      const codebasePayload = files.map((f) => ({
        path: f.path,
        content: f.content,
      }));

      const res = await analyzeArchitecture(
        codebasePayload,
        prompt,
        selectedFile ? `Focused target file: ${selectedFile.path}` : "Full repository scope"
      );

      setResult(res.result);
      setModelUsed(res.modelUsed);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to execute architectural analysis");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 flex flex-col h-full overflow-hidden">
      {/* Title & Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-950/70 border border-purple-800/60 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-100">Deep Architecture & System Reasoning</h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                gemini-3.1-pro-preview
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-purple-400">
                ThinkingLevel.HIGH
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Exhaustive dependency graphing, edge-case modeling, and memory scale evaluation without token truncation.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunArchitecture}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>High Thinking Reasoning...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Deep Audit</span>
            </>
          )}
        </button>
      </div>

      {/* Audit Scope / Prompt Config */}
      <div className="mt-4 space-y-2 shrink-0">
        <label className="text-xs font-mono text-zinc-400 flex items-center justify-between">
          <span>Architectural Audit Directive:</span>
          <span className="text-zinc-500 text-[11px]">Scope: {files.length} repository modules</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 outline-none focus:border-purple-500 font-mono resize-none"
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <div>
            <span className="font-semibold">Analysis Notice:</span> {error}
          </div>
        </div>
      )}

      {/* Result Stream / Markdown View */}
      <div className="mt-4 flex-1 bg-zinc-950 border border-zinc-800/90 rounded-lg p-4 overflow-y-auto flex flex-col">
        {result ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-purple-300">
                <CheckCircle2 className="w-4 h-4 text-purple-400" /> Model: {modelUsed || "gemini-3.1-pro-preview"}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Blueprint"}</span>
              </button>
            </div>
            <div className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
              {result}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 space-y-2">
            <Cpu className="w-8 h-8 opacity-40" />
            <p className="text-xs font-mono">Click &apos;Run Deep Audit&apos; to execute High Thinking architectural analysis.</p>
            <p className="text-[11px] text-zinc-600 max-w-md text-center">
              Evaluates AST couplings, state flow bottlenecks, and generates complete, non-truncated action plans.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
