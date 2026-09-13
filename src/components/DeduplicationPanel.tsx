// path: src/components/DeduplicationPanel.tsx
import React, { useState } from "react";
import { Layers, Play, CheckCircle2, Copy, Check, Loader2, Trash2, ArrowRight, ShieldCheck } from "lucide-react";
import { VirtualFile } from "../types/studio";
import { scanDeduplication } from "../services/gemini";

interface DeduplicationPanelProps {
  files: VirtualFile[];
  onExecuteConsolidation: (
    primaryPath: string,
    primaryCode: string,
    filesToDelete: string[]
  ) => void;
  onPurgeDeadFiles: () => void;
}

export const DeduplicationPanel: React.FC<DeduplicationPanelProps> = ({
  files,
  onExecuteConsolidation,
  onPurgeDeadFiles,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const deadFiles = files.filter(
    (f) => f.isDeadFile || f.path.endsWith(".bak") || f.path.includes("-copy")
  );
  const duplicateFiles = files.filter((f) => f.isDuplicate);

  const handleRunScan = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = files.map((f) => ({
        path: f.path,
        content: f.content,
      }));
      const res = await scanDeduplication(payload);
      setResult(res.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Deduplication audit failed");
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

  // Extract consolidated code and primary path from the response
  const extractConsolidatedInfo = (text: string) => {
    const pathMatch = text.match(/\/\/ path:\s*([^\n\r]+)/);
    const codeMatch = text.match(/```(?:typescript|tsx|ts|javascript|js)?\n([\s\S]*?)```/);

    const primaryPath = pathMatch ? pathMatch[1].trim() : "src/utils.ts";
    const primaryCode = codeMatch ? codeMatch[1] : null;

    // Redundant files to delete
    const filesToDelete = files
      .filter((f) => f.path === "src/helpers.ts" || f.path === "src/App.js" || f.path.endsWith(".bak"))
      .map((f) => f.path);

    return { primaryPath, primaryCode, filesToDelete };
  };

  const consolidatedInfo = result ? extractConsolidatedInfo(result) : null;

  const handleApplyConsolidation = () => {
    if (!consolidatedInfo?.primaryCode) return;
    onExecuteConsolidation(
      consolidatedInfo.primaryPath,
      consolidatedInfo.primaryCode,
      consolidatedInfo.filesToDelete
    );
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-950/70 border border-blue-800/60 text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-100">Deduplication & Cleanliness Protocol</h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60">
                Single-Source-of-Truth
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Identifies redundant modules (App.js vs App.tsx, utils.ts vs helpers.ts), purges dead files, and unifies shared logic.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunScan}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Scanning Repository...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Audit & Consolidate</span>
            </>
          )}
        </button>
      </div>

      {/* Flagged Duplicates & Dead Files Summary Strip */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Duplicate Patterns</span>
            <p className="text-sm font-semibold text-amber-400 font-mono mt-0.5">
              {duplicateFiles.length} Flagged
            </p>
          </div>
          <span className="text-xs text-zinc-500 font-mono">utils.ts ↔ helpers.ts</span>
        </div>

        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Obsolete / Dead Files</span>
            <p className="text-sm font-semibold text-red-400 font-mono mt-0.5">
              {deadFiles.length} Found (*.bak, legacy)
            </p>
          </div>
          {deadFiles.length > 0 && (
            <button
              onClick={onPurgeDeadFiles}
              className="text-xs px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Purge All</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-950/50 border border-red-800/60 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Results & Consolidation Plan */}
      <div className="mt-4 flex-1 bg-zinc-950 border border-zinc-800/90 rounded-lg p-4 overflow-y-auto flex flex-col">
        {result ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-blue-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Deduplication Analysis Complete
              </span>
              <div className="flex items-center gap-2">
                {consolidatedInfo?.primaryCode && (
                  <button
                    onClick={handleApplyConsolidation}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-[11px] shadow-sm transition-colors"
                    title="Write consolidated module to workspace and remove redundant files"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Apply Consolidation to {consolidatedInfo.primaryPath}</span>
                  </button>
                )}
                <button onClick={handleCopy} className="flex items-center gap-1 hover:text-zinc-200">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
              {result}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 space-y-2">
            <Layers className="w-8 h-8 opacity-40" />
            <p className="text-xs font-mono">Click &apos;Audit & Consolidate&apos; to scan workspace for duplicate logic.</p>
            <p className="text-[11px] text-zinc-600 max-w-md text-center">
              Consolidates duplicate functions into single-source-of-truth modules and purges conflicting filenames.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
