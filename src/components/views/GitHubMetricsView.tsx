// path: src/components/views/GitHubMetricsView.tsx
import React from "react";
import { GitHubRepo, GitHubMetricsData } from "../../types/studio";
import {
  GitBranch,
  GitPullRequest,
  Star,
  Activity,
  Layers,
  FileCheck2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  PieChart,
} from "lucide-react";

interface GitHubMetricsViewProps {
  selectedRepo: GitHubRepo | null;
  onNavigateToDedup: () => void;
}

export const SAMPLE_METRICS: GitHubMetricsData = {
  repoName: "autonomous-org/fintech-core-api",
  totalFiles: 48,
  linesOfCode: 14250,
  duplicateDebtPercentage: 18.5,
  duplicateFilesCount: 6,
  deadFilesCount: 3,
  testCoverageEstimate: 84,
  stars: 142,
  openPRs: 2,
  commitFrequency: "4.2 commits/day",
  languages: [
    { name: "TypeScript", percentage: 72, color: "#3178c6" },
    { name: "React TSX", percentage: 18, color: "#61dafb" },
    { name: "CSS / Tailwind", percentage: 6, color: "#38bdf8" },
    { name: "JSON / Config", percentage: 4, color: "#f59e0b" },
  ],
  healthGrade: "B",
};

export const GitHubMetricsView: React.FC<GitHubMetricsViewProps> = ({
  selectedRepo,
  onNavigateToDedup,
}) => {
  const metrics = SAMPLE_METRICS;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Repository Health & Codebase Metrics</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-semibold">
                  AST Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Real-time code health audit for{" "}
                <span className="text-slate-200 font-mono font-medium">
                  {selectedRepo?.fullName || metrics.repoName}
                </span>
                . Quantifies duplicate debt, dead backup files, and architectural velocity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToDedup}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Automate Cleanup & PR
            </button>
          </div>
        </div>
      </div>

      {/* 4 Top Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Health Grade */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Health Grade</div>
            <div className="mt-1 text-2xl font-bold text-white flex items-center gap-2">
              Grade {metrics.healthGrade}
              <span className="text-xs font-normal text-amber-400 font-mono">Actionable</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Deduplication recommended</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xl">
            {metrics.healthGrade}
          </div>
        </div>

        {/* Card 2: Duplicate Debt Index */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Duplicate Debt</div>
            <div className="mt-1 text-2xl font-bold text-rose-400 flex items-center gap-2">
              {metrics.duplicateDebtPercentage}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">{metrics.duplicateFilesCount} duplicate files detected</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Dead Artifacts */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dead Artifacts</div>
            <div className="mt-1 text-2xl font-bold text-amber-400 flex items-center gap-2">
              {metrics.deadFilesCount} files
            </div>
            <div className="text-[11px] text-slate-500 mt-1">*.bak & unlinked modules</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trash2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Test Coverage */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Test Coverage</div>
            <div className="mt-1 text-2xl font-bold text-emerald-400 flex items-center gap-2">
              {metrics.testCoverageEstimate}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Automated unit test suite</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Language Distribution (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Language & File Type Composition
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{metrics.totalFiles} files total</span>
            </div>

            {/* Progress Stack Bar */}
            <div className="mt-5 h-3 w-full rounded-full bg-slate-950 overflow-hidden flex">
              {metrics.languages.map((l) => (
                <div
                  key={l.name}
                  style={{ width: `${l.percentage}%`, backgroundColor: l.color }}
                  title={`${l.name}: ${l.percentage}%`}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {metrics.languages.map((l) => (
                <div key={l.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                  <span className="text-slate-300 font-medium">{l.name}</span>
                  <span className="text-slate-500 font-mono text-[11px] ml-auto">{l.percentage}%</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Lines of Code Analyzed</span>
              <span className="font-mono text-slate-200 font-semibold">{metrics.linesOfCode.toLocaleString()} LOC</span>
            </div>
          </div>
        </div>

        {/* Right: Commit Cadence & Automated Recommendations (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Cadence & Continuous Delivery
              </span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active CI Pipeline
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Commit Frequency</span>
                <span className="font-mono text-slate-200 font-semibold">{metrics.commitFrequency}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Open Pull Requests</span>
                <span className="font-mono text-indigo-400 font-semibold">{metrics.openPRs} pending</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">GitHub Stargazers</span>
                <span className="font-mono text-amber-400 font-semibold">★ {metrics.stars}</span>
              </div>
            </div>

            <div className="mt-5 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Automate Deduplication Now</div>
                <div className="text-[11px] text-indigo-300">Purge 3 dead files and consolidate 6 duplicate utilities.</div>
              </div>
              <button
                onClick={onNavigateToDedup}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                Scan & Purge <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
