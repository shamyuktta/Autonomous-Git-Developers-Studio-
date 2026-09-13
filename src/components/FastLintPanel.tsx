// path: src/components/FastLintPanel.tsx
import React, { useState } from "react";
import { Zap, Play, CheckCircle2, Copy, Check, Loader2 } from "lucide-react";
import { VirtualFile } from "../types/studio";
import { fastLint } from "../services/gemini";

interface FastLintPanelProps {
  selectedFile: VirtualFile | null;
}

export const FastLintPanel: React.FC<FastLintPanelProps> = ({ selectedFile }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRunLint = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fastLint(selectedFile.content, selectedFile.language);
      setResult(res.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Linting failed");
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
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-950/70 border border-amber-800/60 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-100">High-Speed Syntax & AST Lint</h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
                gemini-3.1-flash-lite
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Sub-second response time for syntax checks, dead imports, and micro-optimizations.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunLint}
          disabled={loading || !selectedFile}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Fast Linting...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Flash Lint</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-4 flex-1 bg-zinc-950 border border-zinc-800/90 rounded-lg p-4 overflow-y-auto flex flex-col">
        {result ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-amber-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400" /> Lint Target: {selectedFile?.path}
              </span>
              <button onClick={handleCopy} className="flex items-center gap-1 hover:text-zinc-200">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
              {result}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 space-y-2">
            <Zap className="w-8 h-8 opacity-40" />
            <p className="text-xs font-mono">Select a file and trigger Flash Lint for instantaneous audit.</p>
          </div>
        )}
      </div>
    </div>
  );
};
