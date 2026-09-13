// path: src/components/views/MultiAgentCodeReviewView.tsx
import React, { useState } from "react";
import { VirtualFile } from "../../types/studio";
import { MultiAgentReviewResult, AgentReviewFinding } from "../../types/devsecops";
import { runMultiAgentReview } from "../../services/multiAgentReview";
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  RefreshCw,
  GitPullRequest,
  Terminal,
  ArrowRight,
  Zap,
} from "lucide-react";

interface MultiAgentCodeReviewViewProps {
  files: VirtualFile[];
  onApplyPatch?: (filePath: string, patch: string) => void;
}

export const MultiAgentCodeReviewView: React.FC<MultiAgentCodeReviewViewProps> = ({
  files,
  onApplyPatch,
}) => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<MultiAgentReviewResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "pr_summary" | "findings">("overview");

  const handleStartReview = async () => {
    setIsReviewing(true);
    try {
      const payload = files.map((f) => ({ path: f.path, content: f.content }));
      const result = await runMultiAgentReview({ files: payload });
      setReviewResult(result);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <GitPullRequest className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-100">Multi-Agent Code Review & PR Assistant</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                4 Specialized Autonomous Agents
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-400 max-w-2xl">
              Parallel evaluation for Architecture (dead code/broken imports), Security (Gitleaks/token leakage), Performance, and Automated PR Summarization.
            </p>
          </div>

          <button
            onClick={handleStartReview}
            disabled={isReviewing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all shrink-0"
          >
            {isReviewing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running 4-Agent Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Multi-Agent Review</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "overview"
                ? "bg-slate-800 text-indigo-300 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Agent Matrix Overview
          </button>
          <button
            onClick={() => setActiveTab("pr_summary")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "pr_summary"
                ? "bg-slate-800 text-indigo-300 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Automated PR Description & Commit
          </button>
          <button
            onClick={() => setActiveTab("findings")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "findings"
                ? "bg-slate-800 text-indigo-300 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Findings & Auto-Patches ({reviewResult?.findings.length || 0})
          </button>
        </div>
      </div>

      {/* Main Review View */}
      {reviewResult ? (
        <div className="space-y-6">
          {/* TAB 1: Agent Matrix Overview */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Agent 1: Architecture */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {reviewResult.agents.architecture.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100">Architecture & Imports Agent</h3>
                  <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                    {reviewResult.agents.architecture.summary}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>Broken Imports:</span>
                  <span className="text-emerald-400">
                    {reviewResult.agents.architecture.brokenImportsCount} detected
                  </span>
                </div>
              </div>

              {/* Agent 2: Security */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {reviewResult.agents.security.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100">DevSecOps & Secrets Agent</h3>
                  <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                    {reviewResult.agents.security.summary}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>Secrets Scanned:</span>
                  <span className="text-emerald-400">
                    {reviewResult.agents.security.secretsScanned} tokens
                  </span>
                </div>
              </div>

              {/* Agent 3: Performance */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {reviewResult.agents.performance.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100">Performance & Bundle Agent</h3>
                  <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                    {reviewResult.agents.performance.summary}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>Bundle Impact:</span>
                  <span className="text-indigo-400">
                    ~{reviewResult.agents.performance.estimatedBundleImpactKB} KB
                  </span>
                </div>
              </div>

              {/* Agent 4: PR Synthesizer */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    READY TO MERGE
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100">PR Synthesis Agent</h3>
                  <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                    Automated Conventional Commit title and PR write-up generated.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>Risk Score:</span>
                  <span className="text-emerald-400">{reviewResult.riskScore} / 100</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Automated PR Description */}
          {activeTab === "pr_summary" && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="text-xs font-bold text-slate-200">Generated Pull Request Markdown</div>
                <button
                  onClick={() =>
                    handleCopy(reviewResult.agents.prSynthesizer.markdownPRDescription, "pr_desc")
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
                >
                  {copiedKey === "pr_desc" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-indigo-300">
                Suggested Commit Message:{" "}
                <span className="text-slate-100 font-bold">
                  {reviewResult.agents.prSynthesizer.suggestedCommitMessage}
                </span>
              </div>

              <pre className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed border border-slate-800 whitespace-pre-wrap">
                {reviewResult.agents.prSynthesizer.markdownPRDescription}
              </pre>
            </div>
          )}

          {/* TAB 3: Findings & Patches */}
          {activeTab === "findings" && (
            <div className="space-y-3">
              {reviewResult.findings.map((f) => (
                <div
                  key={f.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                          f.severity === "critical"
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : f.severity === "warning"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {f.severity}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200">{f.title}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{f.filePath}</span>
                  </div>

                  <p className="text-xs text-slate-400">{f.description}</p>

                  {f.suggestedPatch && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400">
                      Suggested Fix: <code>{f.suggestedPatch}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <GitPullRequest className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">No Review Run Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click <strong>Run Multi-Agent Review</strong> above to trigger the 4-agent parallel review pipeline across all workspace files.
          </p>
        </div>
      )}
    </div>
  );
};
