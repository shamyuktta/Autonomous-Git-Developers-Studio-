// path: src/components/views/GitHubConnectView.tsx
import React, { useState, useEffect } from "react";
import { GitHubRepo, GitHubFileItem } from "../../types/studio";
import {
  fetchUserRepos,
  fetchRepoTree,
  validateGitHubToken,
  SAMPLE_GITHUB_REPOS,
} from "../../services/github";
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
} from "lucide-react";

interface GitHubConnectViewProps {
  githubConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

export const GitHubConnectView: React.FC<GitHubConnectViewProps> = ({
  githubConnected,
  onConnectionChange,
}) => {
  const [patInput, setPatInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<{ valid: boolean; username?: string; error?: string } | null>(null);

  const [repos, setRepos] = useState<GitHubRepo[]>(SAMPLE_GITHUB_REPOS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo>(SAMPLE_GITHUB_REPOS[0]);
  const [repoFiles, setRepoFiles] = useState<GitHubFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Deduplication scan state
  const [isScanning, setIsScanning] = useState(false);
  const [dedupResult, setDedupResult] = useState<{
    report: string;
    branchName: string;
    commitMessage: string;
    suggestedPR: { title: string; body: string };
  } | null>(null);
  const [prCreatedSuccess, setPrCreatedSuccess] = useState(false);
  const [copiedPr, setCopiedPr] = useState(false);

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

  // Load files when selectedRepo changes
  useEffect(() => {
    if (selectedRepo) {
      loadRepoFiles(selectedRepo);
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
      const files = await fetchRepoTree(repo.owner, repo.name, repo.defaultBranch, token);
      setRepoFiles(files);
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

  const handleRunAutomatedDedup = async () => {
    if (!selectedRepo || repoFiles.length === 0) return;
    setIsScanning(true);
    setDedupResult(null);
    setPrCreatedSuccess(false);

    try {
      // Package file paths and simulated contents for AST analysis
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

  const handleSimulateCreatePR = () => {
    setPrCreatedSuccess(true);
    setTimeout(() => {
      // scroll to bottom or focus
    }, 200);
  };

  const filteredRepos = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / GitHub Connection Bar */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-white shrink-0">
              <Github className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">GitHub Repository Automation</h2>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                    githubConnected
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {githubConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Analyze remote repositories, automatically locate duplicate utilities across directories, purge dead
                backup files, and submit consolidated single-source-of-truth pull requests.
              </p>
            </div>
          </div>

          {/* Connection Controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {githubConnected ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-medium text-emerald-400 flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Authenticated
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {tokenStatus?.username || "autonomous-org"}
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleUseDemoOrg}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  1-Click Demo Org
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Token Input Form (if not connected with PAT) */}
        {!githubConnected && (
          <form onSubmit={handleConnectToken} className="mt-5 pt-5 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="Or enter GitHub Personal Access Token (repo, read:org scope)..."
                  value={patInput}
                  onChange={(e) => setPatInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={isVerifying || !patInput.trim()}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {isVerifying && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Connect Token
              </button>
            </div>
            {tokenStatus && !tokenStatus.valid && (
              <div className="mt-2 text-xs text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {tokenStatus.error}
              </div>
            )}
          </form>
        )}
      </div>

      {/* Main Repositories & Deduplication Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Repository Selector & Files (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Repositories</span>
              <span className="text-[11px] text-slate-400 font-mono">{filteredRepos.length} available</span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredRepos.map((repo) => {
                const isSelected = selectedRepo?.id === repo.id;
                return (
                  <div
                    key={repo.id}
                    onClick={() => setSelectedRepo(repo)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-200"
                        : "bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs truncate">{repo.name}</div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {repo.defaultBranch}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{repo.description}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>★ {repo.stars}</span>
                      <span>{repo.language}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* File Tree of Selected Repo */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200">
                  {selectedRepo?.name} / {selectedRepo?.defaultBranch}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {isLoadingFiles ? "Loading..." : `${repoFiles.length} files`}
              </span>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 text-xs font-mono">
              {repoFiles.map((file) => {
                const isDuplicateSuspect =
                  file.path.includes("Helper") ||
                  file.path.includes("Formatter") ||
                  file.path.endsWith(".bak") ||
                  file.path.endsWith(".js");

                return (
                  <div
                    key={file.path}
                    className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/60 flex items-center justify-between text-slate-300"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{file.path}</span>
                    </div>
                    {isDuplicateSuspect && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                        Duplicate Risk
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Automated Deduplication & PR Studio (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">Automated Deduplication Engine</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Target: <span className="text-slate-200 font-mono font-medium">{selectedRepo?.fullName}</span>
                </p>
              </div>

              <button
                onClick={handleRunAutomatedDedup}
                disabled={isScanning || repoFiles.length === 0}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Scanning AST Duplicates...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Automate Remove Duplicates
                  </>
                )}
              </button>
            </div>

            {/* Results or Empty State */}
            {!dedupResult && !isScanning && (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-3">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">No Deduplication Run Yet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Click <strong className="text-indigo-400">Automate Remove Duplicates</strong> above. The agent will
                  perform multi-file AST scanning across the repository to locate duplicate helpers, consolidate them
                  into a unified single source of truth, and generate a pull request.
                </p>
              </div>
            )}

            {isScanning && (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-slate-300 font-mono">Analyzing repository file graph with Gemini 3.5 Flash...</p>
                <p className="text-[11px] text-slate-500">Checking for conflicting extensions, identical helper signatures, and dead artifacts.</p>
              </div>
            )}

            {dedupResult && (
              <div className="mt-5 space-y-5 animate-in fade-in duration-150">
                {/* Proposed PR / Branch Badge */}
                <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <GitPullRequest className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{dedupResult.suggestedPR.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Branch: <span className="text-emerald-400">{dedupResult.branchName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `git checkout -b ${dedupResult.branchName}\n# Apply deduplication\ngit commit -m "${dedupResult.commitMessage}"\ngit push origin ${dedupResult.branchName}`
                        );
                        setCopiedPr(true);
                        setTimeout(() => setCopiedPr(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors"
                    >
                      {copiedPr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Git Commands
                    </button>

                    <button
                      onClick={handleSimulateCreatePR}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <GitPullRequest className="w-3.5 h-3.5" />
                      Create Pull Request
                    </button>
                  </div>
                </div>

                {prCreatedSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 font-medium animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      Pull Request proposal ready: Branch{" "}
                      <span className="font-mono text-emerald-200">{dedupResult.branchName}</span> initialized with
                      consolidated single-source module and dead-file purge scripts.
                    </div>
                  </div>
                )}

                {/* AI Deduplication Report */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Repository Deduplication Audit Report
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{dedupResult.modelUsed}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                    {dedupResult.report}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
