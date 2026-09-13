// path: src/components/Header.tsx
import React from "react";
import { Cpu, Sparkles, Zap, ShieldCheck, FileCode, CheckCircle2, AlertCircle } from "lucide-react";
import { SystemHealth } from "../types/studio";

interface HeaderProps {
  systemHealth: SystemHealth | null;
  activeModelTier: "high-thinking" | "general" | "fast";
  onSelectTier: (tier: "high-thinking" | "general" | "fast") => void;
  fileCount: number;
  duplicateCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  systemHealth,
  activeModelTier,
  onSelectTier,
  fileCount,
  duplicateCount,
}) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 text-zinc-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title and Role */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
                Autonomous Senior Full-Stack Engineer
              </h1>
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-950/70 border border-emerald-700/50 text-emerald-300">
                AUTO-EXECUTE ACTIVE
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono flex items-center gap-2">
              <span>Production Environment</span>
              <span className="text-zinc-600">•</span>
              <span>Deduplication & Cleanliness Protocol</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-300 font-semibold">{fileCount} files in memory</span>
              {duplicateCount > 0 && (
                <span className="text-amber-400 font-medium">({duplicateCount} duplicates flagged)</span>
              )}
            </p>
          </div>
        </div>

        {/* Model Tier Selector Bar */}
        <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => onSelectTier("high-thinking")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeModelTier === "high-thinking"
                ? "bg-purple-950/80 text-purple-200 border border-purple-600/50 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
            title="gemini-3.1-pro-preview with ThinkingLevel.HIGH enabled"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>High Thinking</span>
            <span className="text-[10px] opacity-70 font-mono">3.1 Pro</span>
          </button>

          <button
            onClick={() => onSelectTier("general")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeModelTier === "general"
                ? "bg-blue-950/80 text-blue-200 border border-blue-600/50 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
            title="gemini-3.5-flash for general refactoring and deduplication"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span>General Tasks</span>
            <span className="text-[10px] opacity-70 font-mono">3.5 Flash</span>
          </button>

          <button
            onClick={() => onSelectTier("fast")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeModelTier === "fast"
                ? "bg-amber-950/80 text-amber-200 border border-amber-600/50 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
            title="gemini-3.1-flash-lite for rapid linting and micro-inspections"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>High Speed</span>
            <span className="text-[10px] opacity-70 font-mono">3.1 Flash-Lite</span>
          </button>
        </div>

        {/* API Connection Indicator */}
        <div className="flex items-center gap-2">
          {systemHealth?.hasApiKey ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gemini Ready</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>API Key in Settings</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
