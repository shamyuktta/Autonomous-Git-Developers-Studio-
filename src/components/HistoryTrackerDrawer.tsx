// path: src/components/HistoryTrackerDrawer.tsx
import React, { useState } from "react";
import { HistoryActivityItem, VirtualFile } from "../types/studio";
import {
  History,
  X,
  FileCode,
  Sparkles,
  Bug,
  Layers,
  Clock,
  Trash2,
  ArrowRight,
  RotateCcw,
  Check,
  Copy,
} from "lucide-react";

interface HistoryTrackerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activities: HistoryActivityItem[];
  recentFiles: Array<{ path: string; name: string; timestamp: number }>;
  onOpenFileInWorkspace: (path: string) => void;
  onClearActivities: () => void;
}

export const HistoryTrackerDrawer: React.FC<HistoryTrackerDrawerProps> = ({
  isOpen,
  onClose,
  activities,
  recentFiles,
  onOpenFileInWorkspace,
  onClearActivities,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"recent" | "activities">("recent");
  const [selectedSnapshot, setSelectedSnapshot] = useState<HistoryActivityItem | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getIconForType = (type: HistoryActivityItem["type"]) => {
    switch (type) {
      case "ai-generate":
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      case "debug-fix":
        return <Bug className="w-3.5 h-3.5 text-amber-400" />;
      case "deduplicate":
        return <Layers className="w-3.5 h-3.5 text-emerald-400" />;
      case "ast-refactor":
        return <FileCode className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">History & Recent Files</h3>
              <p className="text-[10px] text-slate-400">Chronological activity audit</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1">
          <button
            onClick={() => {
              setActiveSubTab("recent");
              setSelectedSnapshot(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeSubTab === "recent"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Recent Files ({recentFiles.length})
          </button>
          <button
            onClick={() => setActiveSubTab("activities")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeSubTab === "activities"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Action Log ({activities.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeSubTab === "recent" && (
            <div className="space-y-2">
              {recentFiles.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">No recently opened files.</div>
              ) : (
                recentFiles.map((rf) => (
                  <div
                    key={rf.path}
                    onClick={() => {
                      onOpenFileInWorkspace(rf.path);
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-medium text-slate-200 group-hover:text-white truncate font-mono">
                          {rf.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate font-mono">{rf.path}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-500 font-mono">{formatTimeAgo(rf.timestamp)}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeSubTab === "activities" && !selectedSnapshot && (
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Audit Trail</span>
                <button
                  onClick={onClearActivities}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">No activity logged yet.</div>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {getIconForType(act.type)}
                        <span className="text-xs font-medium text-slate-200">{act.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatTimeAgo(act.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span className="truncate max-w-[200px]">{act.filePath}</span>
                      {act.modelUsed && <span className="text-indigo-400">{act.modelUsed}</span>}
                    </div>

                    {act.snapshotContent && (
                      <button
                        onClick={() => setSelectedSnapshot(act)}
                        className="mt-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold text-left flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> View Snapshot Diff
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Snapshot Inspector */}
          {selectedSnapshot && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedSnapshot(null)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  ← Back to Activities
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedSnapshot.snapshotContent || "");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy Code
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="font-semibold text-white">{selectedSnapshot.title}</div>
                <div className="text-[10px] text-slate-400 font-mono">{selectedSnapshot.filePath}</div>
              </div>

              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-80 leading-relaxed">
                {selectedSnapshot.snapshotContent}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
