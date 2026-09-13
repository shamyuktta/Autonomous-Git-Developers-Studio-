// path: src/components/views/CICDPipelineView.tsx
import React, { useState } from "react";
import { CIPipelineRun, PipelineStageStep } from "../../types/devsecops";
import { executeMockPipeline, SAMPLE_WORKFLOW_YML, PRE_COMMIT_HOOK_SCRIPT } from "../../services/ciPipelineEngine";
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  ShieldCheck,
  FileCode,
  Download,
  Copy,
  Check,
  RefreshCw,
  GitBranch,
  GitCommit,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface CICDPipelineViewProps {
  onNavigateToGitHubActions?: () => void;
  onSaveWorkflowToWorkspace?: (file: {
    id: string;
    name: string;
    path: string;
    language: string;
    content: string;
    isModified: boolean;
    size: string;
  }) => void;
}

export const CICDPipelineView: React.FC<CICDPipelineViewProps> = ({
  onNavigateToGitHubActions,
  onSaveWorkflowToWorkspace,
}) => {
  const [pipeline, setPipeline] = useState<CIPipelineRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"pipeline" | "workflow_yml" | "pre_commit_hook">("pipeline");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<PipelineStageStep | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleRunPipeline = async () => {
    setIsRunning(true);
    try {
      const run = await executeMockPipeline("manual", "main", (updatedStep) => {
        setSelectedStep(updatedStep);
      });
      setPipeline(run);
      if (run.stages[0]?.steps[0]) {
        setSelectedStep(run.stages[0].steps[0]);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Cpu className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-100">Enterprise CI/CD & DevSecOps Pipeline</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                GitHub Actions Ready
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-400 max-w-2xl">
              Automated linting, strict TypeScript compilation, Gitleaks secret interception, and production build deployment verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunPipeline}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Pipeline...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Trigger CI/CD Pipeline
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pipeline Quick Nav Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "pipeline"
                ? "bg-slate-800 text-indigo-300 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Live Pipeline Execution
          </button>
          <button
            onClick={() => setActiveTab("workflow_yml")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "workflow_yml"
                ? "bg-slate-800 text-indigo-300 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            .github/workflows/ci-cd.yml
          </button>
          <button
            onClick={() => setActiveTab("pre_commit_hook")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "pre_commit_hook"
                ? "bg-slate-800 text-indigo-300 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Pre-Commit Secret Hook (.husky)
          </button>
        </div>
      </div>

      {/* View: Pipeline Execution */}
      {activeTab === "pipeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Stages & Steps */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Pipeline Stages
                  </h3>
                </div>
                {pipeline && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      pipeline.status === "passed"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    STATUS: {pipeline.status.toUpperCase()}
                  </span>
                )}
              </div>

              {!pipeline && !isRunning ? (
                <div className="p-8 text-center rounded-xl bg-slate-950 border border-dashed border-slate-800 space-y-3">
                  <Cpu className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    No active CI/CD execution. Click <strong>Trigger CI/CD Pipeline</strong> to run automated checks.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pipeline?.stages.map((stage) => (
                    <div
                      key={stage.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5"
                    >
                      <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                        <span>{stage.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {stage.steps.filter((s) => s.status === "success").length}/{stage.steps.length} Steps
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {stage.steps.map((step) => {
                          const isSelected = selectedStep?.id === step.id;
                          return (
                            <button
                              key={step.id}
                              onClick={() => setSelectedStep(step)}
                              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                                isSelected
                                  ? "bg-indigo-600/20 border border-indigo-500/40 text-indigo-200"
                                  : "hover:bg-slate-900 border border-transparent text-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {step.status === "success" && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                                {step.status === "running" && (
                                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                                )}
                                {step.status === "pending" && (
                                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                                )}
                                <span className="text-xs font-medium">{step.name}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500">
                                {step.durationMs ? `${step.durationMs}ms` : "-"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Real-time Step Log Console */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col h-full min-h-[420px]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>{selectedStep ? selectedStep.name : "Execution Console Log"}</span>
                </div>
                {selectedStep && (
                  <button
                    onClick={() => handleCopy(selectedStep.outputLog.join("\n"), "step_log")}
                    className="p-1 rounded text-slate-400 hover:text-white"
                    title="Copy step log"
                  >
                    {copiedKey === "step_log" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              <div className="flex-1 bg-slate-900/90 rounded-xl p-4 font-mono text-[11px] text-emerald-400 overflow-y-auto max-h-[380px] space-y-1.5 leading-relaxed">
                {selectedStep && selectedStep.outputLog.length > 0 ? (
                  selectedStep.outputLog.map((log, i) => (
                    <div key={i} className="whitespace-pre-wrap">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic">
                    Select a step or trigger pipeline to observe live runner diagnostics...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View: GitHub Actions Workflow */}
      {activeTab === "workflow_yml" && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-200 font-mono">.github/workflows/ci-cd.yml</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {onNavigateToGitHubActions && (
                <button
                  type="button"
                  onClick={onNavigateToGitHubActions}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold shadow-md shadow-indigo-600/20 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Modify in GitHub Actions Studio</span>
                </button>
              )}

              {onSaveWorkflowToWorkspace && (
                <button
                  type="button"
                  onClick={() => {
                    onSaveWorkflowToWorkspace({
                      id: "workflow-cicd",
                      name: "ci-cd.yml",
                      path: ".github/workflows/ci-cd.yml",
                      language: "yaml",
                      content: SAMPLE_WORKFLOW_YML,
                      isModified: true,
                      size: `${SAMPLE_WORKFLOW_YML.length} B`,
                    });
                    setSavedSuccess(true);
                    setTimeout(() => setSavedSuccess(false), 2500);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Saved to Workspace!</span>
                    </>
                  ) : (
                    <>
                      <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Save to Workspace</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => handleCopy(SAMPLE_WORKFLOW_YML, "workflow_yml")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors"
              >
                {copiedKey === "workflow_yml" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Workflow</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <pre className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed border border-slate-800">
            {SAMPLE_WORKFLOW_YML}
          </pre>
        </div>
      )}

      {/* View: Pre-Commit Hook Script */}
      {activeTab === "pre_commit_hook" && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">.husky/pre-commit (Gitleaks + TypeScript Interceptor)</span>
            </div>
            <button
              onClick={() => handleCopy(PRE_COMMIT_HOOK_SCRIPT, "pre_commit")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
            >
              {copiedKey === "pre_commit" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Hook Script</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800">
            {PRE_COMMIT_HOOK_SCRIPT}
          </pre>
        </div>
      )}
    </div>
  );
};
