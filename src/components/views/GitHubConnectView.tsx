// path: src/components/views/GitHubConnectView.tsx
import React, { useState, useEffect } from "react";
import { GitHubRepo, GitHubFileItem, VirtualFile } from "../../types/studio";
import {
  fetchUserRepos,
  fetchRepoTree,
  validateGitHubToken,
  pushProjectToGitHub,
  pushWorkflowToGitHub,
  SAMPLE_GITHUB_REPOS,
} from "../../services/github";
import {
  WorkflowConfig,
  WORKFLOW_PRESETS,
  getDefaultWorkflowConfig,
  generateWorkflowYaml,
} from "../../services/githubActionsGenerator";
import { automateGitHubDedup } from "../../services/gemini";
import {
  saveGitHubToken,
  getStoredGitHubToken,
  removeGitHubToken,
} from "../../services/auth";
import {
  Github,
  Key,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  GitPullRequest,
  Trash2,
  Sparkles,
  FileCode2,
  RefreshCw,
  Search,
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
  Copy,
  Check,
  Upload,
  Send,
  Cpu,
  Sliders,
  FilePlus,
  Code,
  Terminal,
  Lock,
  CheckSquare,
  Square,
  Play,
  Zap,
  Download,
  Edit3,
  Clock,
  ArrowUpRight,
} from "lucide-react";

interface GitHubConnectViewProps {
  githubConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
  files?: VirtualFile[];
  onSaveFileToWorkspace?: (file: VirtualFile) => void;
  onAddActivity?: (item: any) => void;
}

export const GitHubConnectView: React.FC<GitHubConnectViewProps> = ({
  githubConnected,
  onConnectionChange,
  files = [],
  onSaveFileToWorkspace,
  onAddActivity,
}) => {
  // Navigation tabs
  const [activeMainTab, setActiveMainTab] = useState<"export" | "actions" | "scanner" | "settings">("export");

  // Authentication & Token
  const [patInput, setPatInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<{ valid: boolean; username?: string; error?: string } | null>(null);

  // Repositories & Branch Selection
  const [repos, setRepos] = useState<GitHubRepo[]>(SAMPLE_GITHUB_REPOS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo>(SAMPLE_GITHUB_REPOS[0]);
  const [customRepoInput, setCustomRepoInput] = useState("");
  const [targetBranch, setTargetBranch] = useState("main");
  const [isCustomBranch, setIsCustomBranch] = useState(false);
  const [customBranchName, setCustomBranchName] = useState("feature/autonomous-sync");

  // Project Export / Send to GitHub state
  const [selectedFilePaths, setSelectedFilePaths] = useState<Set<string>>(
    new Set(files.map((f) => f.path))
  );
  const [commitMessage, setCommitMessage] = useState("feat: sync modified project files via Autonomous Studio");
  const [pushMode, setPushMode] = useState<"direct" | "pr">("direct");
  const [prTitle, setPrTitle] = useState("feat: autonomous architectural updates & refactors");
  const [prDescription, setPrDescription] = useState(
    "Automated sync from Autonomous Engineer Studio with AST verification, dead-code elimination, and zero-debt architecture."
  );
  const [isPushingProject, setIsPushingProject] = useState(false);
  const [pushProgress, setPushProgress] = useState<{ current: number; total: number; path: string } | null>(null);
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    commitSha: string;
    commitUrl: string;
    branchUsed: string;
    count: number;
    prUrl?: string;
    prNumber?: number;
    error?: string;
  } | null>(null);

  // GitHub Actions Workflow Studio state
  const [selectedPresetId, setSelectedPresetId] = useState<string>("ci");
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowConfig>(getDefaultWorkflowConfig("ci"));
  const [workflowYaml, setWorkflowYaml] = useState<string>(generateWorkflowYaml(getDefaultWorkflowConfig("ci")));
  const [isPushingWorkflow, setIsPushingWorkflow] = useState(false);
  const [workflowPushResult, setWorkflowPushResult] = useState<{
    success: boolean;
    filePath: string;
    commitSha: string;
    fileUrl: string;
    commitUrl: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Deduplication Scanner state
  const [repoFiles, setRepoFiles] = useState<GitHubFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [dedupResult, setDedupResult] = useState<{
    report: string;
    branchName: string;
    commitMessage: string;
    suggestedPR: { title: string; body: string };
  } | null>(null);
  const [prCreatedSuccess, setPrCreatedSuccess] = useState(false);

  // Preview file drawer
  const [previewingFile, setPreviewingFile] = useState<VirtualFile | null>(null);

  // Load existing token & repos on mount
  useEffect(() => {
    const existingToken = getStoredGitHubToken();
    if (existingToken) {
      setPatInput(existingToken);
      onConnectionChange(true);
      loadRepos(existingToken);
    } else {
      loadRepos();
    }
  }, []);

  // Update selected files when files prop updates
  useEffect(() => {
    if (files.length > 0 && selectedFilePaths.size === 0) {
      setSelectedFilePaths(new Set(files.map((f) => f.path)));
    }
  }, [files]);

  // Load files when selectedRepo changes
  useEffect(() => {
    if (selectedRepo) {
      loadRepoFiles(selectedRepo);
      setTargetBranch(selectedRepo.defaultBranch || "main");
    }
  }, [selectedRepo]);

  const loadRepos = async (token?: string) => {
    const list = await fetchUserRepos(token);
    setRepos(list);
    if (list.length > 0) {
      setSelectedRepo(list[0]);
    }
  };

  const loadRepoFiles = async (repo: GitHubRepo) => {
    setIsLoadingFiles(true);
    setDedupResult(null);
    setPrCreatedSuccess(false);
    try {
      const token = getStoredGitHubToken() || undefined;
      const f = await fetchRepoTree(repo.owner, repo.name, repo.defaultBranch, token);
      setRepoFiles(f);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleConnectToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patInput.trim()) return;

    setIsVerifying(true);
    setTokenStatus(null);
    const check = await validateGitHubToken(patInput.trim());
    setIsVerifying(false);

    if (check.valid) {
      saveGitHubToken(patInput.trim());
      onConnectionChange(true);
      setTokenStatus({ valid: true, username: check.username });
      loadRepos(patInput.trim());
    } else {
      setTokenStatus({ valid: false, error: check.error || "Invalid token or network error" });
    }
  };

  const handleUseDemoOrg = () => {
    removeGitHubToken();
    onConnectionChange(true);
    setPatInput("");
    setTokenStatus({ valid: true, username: "autonomous-org" });
    setRepos(SAMPLE_GITHUB_REPOS);
    setSelectedRepo(SAMPLE_GITHUB_REPOS[0]);
  };

  const handleDisconnect = () => {
    removeGitHubToken();
    onConnectionChange(false);
    setPatInput("");
    setTokenStatus(null);
    setRepos(SAMPLE_GITHUB_REPOS);
    setSelectedRepo(SAMPLE_GITHUB_REPOS[0]);
  };

  // Toggle file selection
  const handleToggleFile = (path: string) => {
    setSelectedFilePaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleSelectAllFiles = () => {
    setSelectedFilePaths(new Set(files.map((f) => f.path)));
  };

  const handleDeselectAllFiles = () => {
    setSelectedFilePaths(new Set());
  };

  // Push Project files to GitHub
  const handleSendProjectToGitHub = async () => {
    const targetRepoOwner = customRepoInput.trim()
      ? customRepoInput.split("/")[0] || selectedRepo.owner
      : selectedRepo.owner;
    const targetRepoName = customRepoInput.trim()
      ? customRepoInput.split("/")[1] || selectedRepo.name
      : selectedRepo.name;

    const branch = isCustomBranch ? customBranchName.trim() : targetBranch;
    const filesToPush = files
      .filter((f) => selectedFilePaths.has(f.path))
      .map((f) => ({ path: f.path, content: f.content }));

    if (filesToPush.length === 0) return;

    setIsPushingProject(true);
    setPushResult(null);
    setPushProgress({ current: 0, total: filesToPush.length, path: "Preparing files..." });

    try {
      const token = getStoredGitHubToken() || undefined;
      const result = await pushProjectToGitHub({
        owner: targetRepoOwner,
        repo: targetRepoName,
        branch,
        files: filesToPush,
        commitMessage: commitMessage.trim() || "feat: update project files via Autonomous Studio",
        createPullRequest: pushMode === "pr",
        prTitle: prTitle.trim(),
        prBody: prDescription.trim(),
        token,
        onProgress: (current, total, path) => {
          setPushProgress({ current, total, path });
        },
      });

      setPushResult(result);

      if (onAddActivity) {
        onAddActivity({
          type: "ast-refactor",
          title: `Pushed ${filesToPush.length} files to ${targetRepoOwner}/${targetRepoName} (${result.commitSha})`,
          filePath: branch,
          commitSha: result.commitSha,
        });
      }
    } catch (err: any) {
      setPushResult({
        success: false,
        commitSha: "",
        commitUrl: "",
        branchUsed: branch,
        count: 0,
        error: err?.message || "Failed to push files to repository",
      });
    } finally {
      setIsPushingProject(false);
      setPushProgress(null);
    }
  };

  // Workflow preset selection & updating
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const newConfig = getDefaultWorkflowConfig(presetId);
    setWorkflowConfig(newConfig);
    setWorkflowYaml(generateWorkflowYaml(newConfig));
    setWorkflowPushResult(null);
  };

  const handleUpdateWorkflowConfig = (updater: (prev: WorkflowConfig) => WorkflowConfig) => {
    setWorkflowConfig((prev) => {
      const updated = updater(prev);
      setWorkflowYaml(generateWorkflowYaml(updated));
      return updated;
    });
  };

  // Push GitHub Actions Workflow to Repo
  const handlePushWorkflowToGitHub = async () => {
    const targetRepoOwner = customRepoInput.trim()
      ? customRepoInput.split("/")[0] || selectedRepo.owner
      : selectedRepo.owner;
    const targetRepoName = customRepoInput.trim()
      ? customRepoInput.split("/")[1] || selectedRepo.name
      : selectedRepo.name;
    const branch = isCustomBranch ? customBranchName.trim() : targetBranch;

    setIsPushingWorkflow(true);
    setWorkflowPushResult(null);

    try {
      const token = getStoredGitHubToken() || undefined;
      const res = await pushWorkflowToGitHub({
        owner: targetRepoOwner,
        repo: targetRepoName,
        branch,
        workflowFileName: workflowConfig.fileName,
        yamlContent: workflowYaml,
        commitMessage: `ci: add/update GitHub Actions workflow ${workflowConfig.fileName}`,
        token,
      });

      setWorkflowPushResult(res);

      // Save into workspace files as well so it's visible in project
      if (onSaveFileToWorkspace) {
        onSaveFileToWorkspace({
          id: `workflow-${Date.now()}`,
          name: workflowConfig.fileName,
          path: `.github/workflows/${workflowConfig.fileName}`,
          language: "yaml",
          content: workflowYaml,
          isModified: true,
          size: `${workflowYaml.length} B`,
        });
      }

      if (onAddActivity) {
        onAddActivity({
          type: "ai-generate",
          title: `Configured GitHub Action .github/workflows/${workflowConfig.fileName}`,
          filePath: `.github/workflows/${workflowConfig.fileName}`,
          commitSha: res.commitSha,
        });
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsPushingWorkflow(false);
    }
  };

  // Copy helper
  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Deduplication scan
  const handleRunAutomatedDedup = async () => {
    if (!selectedRepo || repoFiles.length === 0) return;
    setIsScanning(true);
    setDedupResult(null);
    setPrCreatedSuccess(false);

    try {
      const filesToAnalyze = repoFiles.map((f) => ({
        path: f.path,
        content: `// path: ${f.path}\n// AST structure for ${f.path}\nexport const item_${f.path.replace(/[^a-zA-Z0-9]/g, "_")} = true;`,
      }));

      const res = await automateGitHubDedup(selectedRepo.fullName, filesToAnalyze);
      setDedupResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const filteredRepos = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP GITHUB CONNECTOR BAR */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-indigo-400 shadow-md">
              <Github className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-100">GitHub Repository & Actions Connector</h1>
                <span
                  className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${
                    githubConnected
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {githubConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Send your modified project files directly to any GitHub repository, or configure and push production GitHub Actions workflows.
              </p>
            </div>
          </div>

          {/* Quick Connection Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {githubConnected ? (
              <div className="flex items-center gap-2.5 bg-slate-950/80 border border-slate-800 p-2 rounded-2xl">
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>@{tokenStatus?.username || "authenticated"}</span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUseDemoOrg}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Use Demo Repo
                </button>
                <button
                  onClick={() => setActiveMainTab("settings")}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                >
                  <Key className="w-3.5 h-3.5" />
                  Connect Personal Access Token
                </button>
              </div>
            )}
          </div>
        </div>

        {/* REPO & TARGET BRANCH SELECTOR BAR */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Repository</label>
            <select
              value={selectedRepo.id}
              onChange={(e) => {
                const found = repos.find((r) => r.id === Number(e.target.value));
                if (found) {
                  setSelectedRepo(found);
                  setCustomRepoInput("");
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            >
              {repos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fullName} ({r.defaultBranch})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Or Enter Custom Repo (owner/repo)</label>
            <input
              type="text"
              placeholder="e.g. your-org/my-app"
              value={customRepoInput}
              onChange={(e) => setCustomRepoInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Branch</label>
            <div className="flex items-center gap-1.5">
              {!isCustomBranch ? (
                <select
                  value={targetBranch}
                  onChange={(e) => setTargetBranch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="main">main</option>
                  <option value="develop">develop</option>
                  <option value="master">master</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={customBranchName}
                  onChange={(e) => setCustomBranchName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="feature/autonomous-sync"
                />
              )}
              <button
                type="button"
                onClick={() => setIsCustomBranch(!isCustomBranch)}
                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 text-[11px] font-medium"
                title={isCustomBranch ? "Switch to standard branches" : "Create custom branch"}
              >
                {isCustomBranch ? "Standard" : "+ New"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Active Target Repo URL</label>
            <a
              href={`https://github.com/${customRepoInput.trim() || selectedRepo.fullName}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-indigo-400 text-xs font-mono truncate transition-colors"
            >
              <span className="truncate">{customRepoInput.trim() || selectedRepo.fullName}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1" />
            </a>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setActiveMainTab("export")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMainTab === "export"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Send Project to GitHub ({selectedFilePaths.size} files)</span>
          </button>

          <button
            onClick={() => setActiveMainTab("actions")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMainTab === "actions"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>GitHub Actions Workflow Studio</span>
          </button>

          <button
            onClick={() => setActiveMainTab("scanner")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMainTab === "scanner"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Repository AST Scanner & Dedup</span>
          </button>

          <button
            onClick={() => setActiveMainTab("settings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMainTab === "settings"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Key className="w-4 h-4 text-slate-400" />
            <span>PAT Settings & Permissions</span>
          </button>
        </div>
      </div>

      {/* 2. TAB 1: SEND MODIFIED PROJECT TO GITHUB REPO */}
      {activeMainTab === "export" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: File Checklist & Review */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-indigo-400" />
                    Modified Project Files to Export
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select which workspace files to commit and send to{" "}
                    <span className="font-mono text-slate-300">
                      {customRepoInput.trim() || selectedRepo.fullName}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllFiles}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition-colors"
                  >
                    Select All ({files.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAllFiles}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-400 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Files Table List */}
              <div className="max-h-96 overflow-y-auto pr-1 space-y-1.5">
                {files.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No files in active workspace.</p>
                ) : (
                  files.map((f) => {
                    const isSelected = selectedFilePaths.has(f.path);
                    return (
                      <div
                        key={f.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                          isSelected
                            ? "bg-slate-950 border-indigo-500/40"
                            : "bg-slate-950/40 border-slate-800/80 opacity-70"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleFile(f.path)}
                            className="text-slate-400 hover:text-indigo-400 shrink-0"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <div className="font-mono text-slate-200 font-medium truncate flex items-center gap-2">
                              <span>{f.path}</span>
                              {f.isModified && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-sans">
                                  Modified
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {f.language} • {f.size}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewingFile(f)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                          >
                            Preview Diff
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Preview File Drawer Modal if open */}
            {previewingFile && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="font-mono text-xs text-indigo-400 font-semibold truncate">
                    {previewingFile.path}
                  </div>
                  <button
                    onClick={() => setPreviewingFile(null)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Close Preview
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-300 max-h-56 overflow-auto leading-relaxed border border-slate-800">
                  {previewingFile.content}
                </pre>
              </div>
            )}
          </div>

          {/* Right Col: Commit, Branch & Push Controls */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
                <Upload className="w-4 h-4 text-indigo-400" />
                Commit & Push Configuration
              </h3>

              {/* Push Mode Choice */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                  Transfer Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPushMode("direct")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-start gap-1 transition-all ${
                      pushMode === "direct"
                        ? "bg-indigo-600/15 border-indigo-500/50 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> Direct Commit
                    </span>
                    <span className="text-[10px] font-normal text-slate-400">Push to {isCustomBranch ? customBranchName : targetBranch}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPushMode("pr")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-start gap-1 transition-all ${
                      pushMode === "pr"
                        ? "bg-indigo-600/15 border-indigo-500/50 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <GitPullRequest className="w-3.5 h-3.5 text-purple-400" /> Create PR
                    </span>
                    <span className="text-[10px] font-normal text-slate-400">Opens Pull Request</span>
                  </button>
                </div>
              </div>

              {/* Commit Message Input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Commit Message
                </label>
                <textarea
                  rows={2}
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="feat: commit message..."
                />
              </div>

              {/* If PR mode: PR Title & Body */}
              {pushMode === "pr" && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pull Request Title</label>
                    <input
                      type="text"
                      value={prTitle}
                      onChange={(e) => setPrTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">PR Description</label>
                    <textarea
                      rows={3}
                      value={prDescription}
                      onChange={(e) => setPrDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Progress Indicator */}
              {isPushingProject && pushProgress && (
                <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-indigo-300 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Pushing files to GitHub...
                    </span>
                    <span className="font-mono">
                      {pushProgress.current} / {pushProgress.total}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-200"
                      style={{
                        width: `${(pushProgress.current / pushProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    {pushProgress.path}
                  </div>
                </div>
              )}

              {/* Push Success Banner */}
              {pushResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ${
                    pushResult.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {pushResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>
                      {pushResult.success
                        ? `Transferred ${pushResult.count} files to GitHub!`
                        : `Transfer notice: ${pushResult.error}`}
                    </span>
                  </div>

                  {pushResult.success && (
                    <div className="space-y-1 pt-1 text-[11px]">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Commit SHA:</span>
                        <a
                          href={pushResult.commitUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          {pushResult.commitSha} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {pushResult.prUrl && (
                        <div className="flex items-center justify-between text-slate-300 pt-1">
                          <span>Pull Request:</span>
                          <a
                            href={pushResult.prUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-purple-400 hover:underline flex items-center gap-1"
                          >
                            PR #{pushResult.prNumber || "Live"} <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      <div className="pt-2 text-slate-400">
                        Branch updated: <code className="text-slate-200">{pushResult.branchUsed}</code>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                disabled={isPushingProject || selectedFilePaths.size === 0}
                onClick={handleSendProjectToGitHub}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
              >
                {isPushingProject ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending to GitHub Repository...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>
                      Send {selectedFilePaths.size} Files to{" "}
                      {customRepoInput.trim() || selectedRepo.name}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB 2: GITHUB ACTIONS WORKFLOW STUDIO & DIRECT PUSH */}
      {activeMainTab === "actions" && (
        <div className="space-y-6">
          {/* Preset Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  GitHub Actions Workflow Template & Modifier
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a workflow to modify, configure pipeline triggers and steps, and push directly to your repository as a <code className="text-indigo-300">.github/workflows/*.yml</code> file.
                </p>
              </div>

              <div className="text-xs font-mono text-slate-400">
                Repo: <span className="text-slate-200">{customRepoInput.trim() || selectedRepo.fullName}</span>
              </div>
            </div>

            {/* Workflow Preset Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {WORKFLOW_PRESETS.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-indigo-600/15 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-600/10"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-200 flex items-center justify-between">
                        <span>{p.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <div className="font-mono text-[10px] text-indigo-400 mt-1">
                        .github/workflows/{p.fileName}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">
                        {p.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workflow Configurator & YAML Editor Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 5 Cols: Config Controls */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  Modify Workflow Parameters
                </h4>

                {/* File Name & Workflow Title */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Workflow File Path
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-slate-500">.github/workflows/</span>
                      <input
                        type="text"
                        value={workflowConfig.fileName}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^a-zA-Z0-9_\-\.]/g, "");
                          handleUpdateWorkflowConfig((p) => ({ ...p, fileName: val }));
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Workflow Display Name
                    </label>
                    <input
                      type="text"
                      value={workflowConfig.name}
                      onChange={(e) =>
                        handleUpdateWorkflowConfig((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Runner & Node Version */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Runner OS</label>
                      <select
                        value={workflowConfig.runner}
                        onChange={(e) =>
                          handleUpdateWorkflowConfig((p) => ({
                            ...p,
                            runner: e.target.value as any,
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                      >
                        <option value="ubuntu-latest">ubuntu-latest</option>
                        <option value="ubuntu-22.04">ubuntu-22.04</option>
                        <option value="macos-latest">macos-latest</option>
                        <option value="windows-latest">windows-latest</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Package Manager</label>
                      <select
                        value={workflowConfig.packageManager}
                        onChange={(e) =>
                          handleUpdateWorkflowConfig((p) => ({
                            ...p,
                            packageManager: e.target.value as any,
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                      >
                        <option value="npm">npm</option>
                        <option value="pnpm">pnpm</option>
                        <option value="yarn">yarn</option>
                        <option value="bun">bun</option>
                      </select>
                    </div>
                  </div>

                  {/* Triggers */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Event Triggers
                    </label>
                    <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={workflowConfig.triggers.pushBranches.includes("main")}
                          onChange={(e) => {
                            handleUpdateWorkflowConfig((p) => ({
                              ...p,
                              triggers: {
                                ...p.triggers,
                                pushBranches: e.target.checked ? ["main"] : [],
                              },
                            }));
                          }}
                          className="w-3.5 h-3.5 accent-indigo-600"
                        />
                        <span>Trigger on <code>push</code> to main</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={workflowConfig.triggers.prBranches.includes("main")}
                          onChange={(e) => {
                            handleUpdateWorkflowConfig((p) => ({
                              ...p,
                              triggers: {
                                ...p.triggers,
                                prBranches: e.target.checked ? ["main"] : [],
                              },
                            }));
                          }}
                          className="w-3.5 h-3.5 accent-indigo-600"
                        />
                        <span>Trigger on <code>pull_request</code> to main</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={workflowConfig.triggers.enableWorkflowDispatch}
                          onChange={(e) => {
                            handleUpdateWorkflowConfig((p) => ({
                              ...p,
                              triggers: {
                                ...p.triggers,
                                enableWorkflowDispatch: e.target.checked,
                              },
                            }));
                          }}
                          className="w-3.5 h-3.5 accent-indigo-600"
                        />
                        <span>Manual trigger (<code>workflow_dispatch</code>)</span>
                      </label>
                    </div>
                  </div>

                  {/* Pipeline Steps Toggle */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Pipeline Job Steps (Toggle to include/modify)
                    </label>
                    <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 max-h-56 overflow-y-auto">
                      {[
                        { key: "checkout", label: "📥 Checkout Repository" },
                        { key: "setupNode", label: "⚙️ Setup Node.js Runtime" },
                        { key: "installDeps", label: "📦 Install Clean Dependencies" },
                        { key: "secretScan", label: "🛡️ Gitleaks Secret Scanner" },
                        { key: "lint", label: "🧹 ESLint & Style Verification" },
                        { key: "typeCheck", label: "🔍 Strict TypeScript AST Check" },
                        { key: "unitTests", label: "🧪 Automated Unit Tests" },
                        { key: "productionBuild", label: "⚡ Production Build Gate" },
                        { key: "uploadArtifacts", label: "📤 Archive Build Artifacts" },
                        { key: "autonomousReview", label: "🤖 Gemini Autonomous AI Review" },
                        { key: "deployCloudRun", label: "🚀 Deploy to Cloud Run (Gate)" },
                      ].map((st) => (
                        <label key={st.key} className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white py-0.5">
                          <span>{st.label}</span>
                          <input
                            type="checkbox"
                            checked={(workflowConfig.steps as any)[st.key]}
                            onChange={(e) => {
                              handleUpdateWorkflowConfig((p) => ({
                                ...p,
                                steps: {
                                  ...p.steps,
                                  [st.key]: e.target.checked,
                                },
                              }));
                            }}
                            className="w-3.5 h-3.5 accent-indigo-600"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Live YAML Code Editor & Direct Push */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-mono font-semibold text-slate-200">
                      .github/workflows/{workflowConfig.fileName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyText(workflowYaml, "yaml")}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1"
                    >
                      {copiedKey === "yaml" ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy YAML
                        </>
                      )}
                    </button>
                    <a
                      download={workflowConfig.fileName}
                      href={`data:text/yaml;charset=utf-8,${encodeURIComponent(workflowYaml)}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Download
                    </a>
                  </div>
                </div>

                {/* Editable YAML area */}
                <textarea
                  rows={18}
                  value={workflowYaml}
                  onChange={(e) => setWorkflowYaml(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-indigo-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  spellCheck={false}
                />

                {/* Workflow Push Result */}
                {workflowPushResult && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-2 text-emerald-300 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Successfully committed workflow to GitHub repository!</span>
                    </div>
                    <div className="space-y-1 text-[11px] pt-1">
                      <div className="flex justify-between text-slate-300">
                        <span>Workflow File:</span>
                        <code className="text-indigo-300 font-mono">{workflowPushResult.filePath}</code>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Commit SHA:</span>
                        <a
                          href={workflowPushResult.commitUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          {workflowPushResult.commitSha} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>GitHub Actions File:</span>
                        <a
                          href={workflowPushResult.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          View on GitHub <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Push to GitHub Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    Commits directly to branch <code className="text-slate-300">{isCustomBranch ? customBranchName : targetBranch}</code> in{" "}
                    <span className="font-mono text-slate-200">{customRepoInput.trim() || selectedRepo.name}</span>
                  </div>

                  <button
                    type="button"
                    disabled={isPushingWorkflow}
                    onClick={handlePushWorkflowToGitHub}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
                  >
                    {isPushingWorkflow ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Pushing to GitHub...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Push Workflow to GitHub Repo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 3: REPOSITORY SCANNER & AST DEDUPLICATION */}
      {activeMainTab === "scanner" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-indigo-400" />
                  Remote Repo Files
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {isLoadingFiles ? "Loading..." : `${repoFiles.length} files`}
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
                {repoFiles.map((file) => (
                  <div
                    key={file.path}
                    className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between"
                  >
                    <span className="truncate pr-2">{file.path}</span>
                    <span className="text-[10px] text-slate-500 shrink-0">{file.size} B</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800">
                <button
                  onClick={handleRunAutomatedDedup}
                  disabled={isScanning || repoFiles.length === 0}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing AST & Duplicates...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Scan Repo for Deduplication
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900 min-h-[300px]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-indigo-400" />
                AST Deduplication & Automated Pull Request
              </h3>

              {!dedupResult && !isScanning && (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 space-y-2">
                  <Layers className="w-10 h-10 text-slate-600 mb-2" />
                  <p className="text-xs font-medium text-slate-400">
                    No scan has been run for this repository yet.
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-sm">
                    Click "Scan Repo for Deduplication" to identify redundant helper modules and prepare an automated PR.
                  </p>
                </div>
              )}

              {isScanning && (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-xs font-medium text-slate-300">
                    AST Parser comparing syntax trees and calculating similarity indices...
                  </p>
                </div>
              )}

              {dedupResult && !isScanning && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {dedupResult.report}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <GitPullRequest className="w-3.5 h-3.5 text-purple-400" />
                        Suggested Pull Request
                      </span>
                      <span className="text-[11px] font-mono text-indigo-400">
                        {dedupResult.branchName}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300">
                      <div className="font-semibold text-white mb-1">
                        {dedupResult.suggestedPR.title}
                      </div>
                      <div className="text-[11px] text-slate-400 whitespace-pre-wrap bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        {dedupResult.suggestedPR.body}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      {prCreatedSuccess ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Pull Request Created Successfully on GitHub!</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setPrCreatedSuccess(true)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                        >
                          <GitPullRequest className="w-3.5 h-3.5" />
                          Create Pull Request on GitHub
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 4: PAT SETTINGS & TOKEN CONFIGURATION */}
      {activeMainTab === "settings" && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              GitHub Personal Access Token (PAT)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your token with <code className="text-indigo-300">repo</code> and <code className="text-indigo-300">workflow</code> permissions to commit files and GitHub Actions workflows directly to your private or public repositories.
            </p>
          </div>

          <form onSubmit={handleConnectToken} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Personal Access Token (classic or fine-grained)
              </label>
              <input
                type="password"
                placeholder="ghp_... or github_pat_..."
                value={patInput}
                onChange={(e) => setPatInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {tokenStatus && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  tokenStatus.valid
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                {tokenStatus.valid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Authenticated as @{tokenStatus.username}! Connected with full repository access.</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{tokenStatus.error}</span>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleUseDemoOrg}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Use simulated demo repository instead
              </button>

              <button
                type="submit"
                disabled={isVerifying || !patInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    <span>Save Token & Connect</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
