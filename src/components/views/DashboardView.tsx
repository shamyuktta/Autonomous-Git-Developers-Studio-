// path: src/components/views/DashboardView.tsx
import React, { useEffect, useState } from "react";
import { UserProfile, SystemHealth } from "../../types/studio";
import { ActiveTab } from "../Navbar";
import { getRecentFiles } from "../../services/history";
import {
  Github,
  Bug,
  Terminal,
  Code2,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  ArrowRight,
  FileCheck2,
  Zap,
  Activity,
  FileCode,
  Keyboard,
  Clock,
  FileText,
  GitCommit,
} from "lucide-react";

interface DashboardViewProps {
  currentUser: UserProfile | null;
  onNavigate: (tab: ActiveTab) => void;
  systemHealth: SystemHealth | null;
  githubConnected: boolean;
  onOpenFileInWorkspace?: (path: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigate,
  systemHealth,
  githubConnected,
  onOpenFileInWorkspace,
}) => {
  const [recentFiles, setRecentFiles] = useState<Array<{ path: string; name: string; timestamp: number }>>([]);

  useEffect(() => {
    setRecentFiles(getRecentFiles());
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Autonomous Senior Full-Stack Workbench • High Thinking Enabled
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {currentUser?.name || "Senior Engineer"}
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Your centralized engineering workspace. Connected to Gemini 3.1 Pro (ThinkingLevel.HIGH),
            multi-model production code synthesis (Gemini, Claude 3.7 Sonnet & Opus), automated GitHub deduplication,
            and real-time VS Code bridge.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate("codegen")}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              AI Code Generator
            </button>
            <button
              onClick={() => onNavigate("readme")}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-2 border border-slate-700 transition-all"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              Pro README Generator
            </button>
            <button
              onClick={() => onNavigate("activity")}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-2 border border-slate-700 transition-all"
            >
              <GitCommit className="w-4 h-4 text-indigo-400" />
              GitHub Live Activity
            </button>
            <button
              onClick={() => onNavigate("github")}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-2 border border-slate-800 transition-all"
            >
              <Github className="w-4 h-4" />
              {githubConnected ? "GitHub Sync (Connected)" : "Connect GitHub Account"}
            </button>
          </div>
        </div>
      </div>

      {/* Core Workstations Grid (6 Pillars) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Engineering Workstations</h2>
            <p className="text-xs text-slate-400">Neat, modular workspaces tailored for senior engineering tasks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: AI Production Code Generator */}
          <div
            onClick={() => onNavigate("codegen")}
            className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-purple-500/40 transition-all cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  Gemini & Claude
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-100 group-hover:text-purple-300 transition-colors">
                AI Production Code Assistant
              </h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Generate 100% production-ready, non-truncated code with line 1 file paths, zero placeholders, and
                automated test suites. Supports Gemini 3.1 Pro, 3.5 Flash, Claude 3.7 Sonnet, and Claude 3.5 Opus.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-semibold text-purple-400 gap-1.5">
              Launch Code Generator <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: GitHub Repository Metrics */}
          <div
            onClick={() => onNavigate("metrics")}
            className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-cyan-500/40 transition-all cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Health Grade B
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                GitHub Repository Metrics
              </h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Visual code health scorecard quantifying Duplicate Debt Index (18.5%), dead <code className="text-slate-300">*.bak</code> artifacts,
                language breakdown, and continuous delivery cadence.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-semibold text-cyan-400 gap-1.5">
              View Repository Metrics <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: GitHub Sync & Auto-Dedup */}
          <div
            onClick={() => onNavigate("github")}
            className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-indigo-500/40 transition-all cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <Github className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  Auto-Deduplicate
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                GitHub Sync & Deduplication
              </h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Scan remote or imported repositories for redundant utility files, dead backups, and generate ready-to-merge
                refactor pull requests.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-semibold text-indigo-400 gap-1.5">
              Open GitHub Sync <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Multi-File Project Debugger */}
          <div
            onClick={() => onNavigate("debugger")}
            className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Bug className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Cross-File Graph
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                Cross-File Project Debugger
              </h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Drag-and-drop multiple project files or folders. Gemini examines imports, state leaks, and cyclic dependencies
                to deliver complete verified code fixes.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-semibold text-emerald-400 gap-1.5">
              Upload Files & Debug <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: VS Code Extension Bridge */}
          <div
            onClick={() => onNavigate("vscode")}
            className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-sky-500/40 transition-all cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                  <Terminal className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30">
                  IDE Extension
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-100 group-hover:text-sky-300 transition-colors">
                VS Code Agent Bridge
              </h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Connect your local Visual Studio Code directly to this Studio agent using Continue.dev, Cline, or Roo Code
                via our OpenAI-compatible endpoint.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-semibold text-sky-400 gap-1.5">
              Configure VS Code Bridge <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Code Studio */}
          <div
            onClick={() => onNavigate("workspace")}
            className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-violet-500/40 transition-all cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                  <Code2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30">
                  Sub-Second Lint
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-100 group-hover:text-violet-300 transition-colors">
                Clean Code Studio & Refactor
              </h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Dedicated editor with sub-second syntax checks via <code className="text-slate-300">gemini-3.1-flash-lite</code> and
                AST refactoring with guaranteed line 1 file paths.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-semibold text-violet-400 gap-1.5">
              Open Code Studio <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 7: AI Pro README.md Generator */}
          <div
            onClick={() => onNavigate("readme")}
            className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Architecture & Audit
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                AI Pro README.md Generator
              </h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Ingests workspace files to generate complete README.md with Mermaid diagrams, setup commands,
                environment variables table, and quality health audit recommendations.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-semibold text-emerald-400 gap-1.5">
              Generate Pro README <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 8: Real-Time GitHub Activity & Commits */}
          <div
            onClick={() => onNavigate("activity")}
            className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-indigo-500/40 transition-all cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <GitCommit className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  Daily Commits & Streak
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                GitHub Activity & AI Commits
              </h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                52-week contribution heatmaps, daily streak tracking, pending workspace changes, and natural language
                prompt-driven file modifications with auto-generated conventional commits.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-semibold text-indigo-400 gap-1.5">
              Open Activity Tracker <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Files & Productivity Shortcuts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Files (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Recent Files & History
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Press ⌘⇧H for audit</span>
            </div>

            <div className="mt-3 divide-y divide-slate-800/60">
              {recentFiles.slice(0, 4).map((f) => (
                <div
                  key={f.path}
                  onClick={() => {
                    if (onOpenFileInWorkspace) {
                      onOpenFileInWorkspace(f.path);
                    } else {
                      onNavigate("workspace");
                    }
                  }}
                  className="py-2.5 flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <FileCode className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    <div>
                      <div className="font-mono font-medium text-slate-200 group-hover:text-white">{f.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{f.path}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">Active</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Keyboard Shortcuts Quick Reference (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Speed Hotkeys
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Press ? for all</span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Command Palette</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
                  ⌘K
                </kbd>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Toggle Theme</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
                  ⌘T
                </kbd>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>History & Recents</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
                  ⌘⇧H
                </kbd>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>AI Code Generator</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
                  ⌘2
                </kbd>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>GitHub Metrics</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
                  ⌘4
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
