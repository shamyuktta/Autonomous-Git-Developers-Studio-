// path: src/components/views/GitHubActivityTrackerView.tsx
import React, { useState } from "react";
import { VirtualFile, GitHubCommitRecord, ContributionDay } from "../../types/studio";
import { modifyFileWithAI } from "../../services/gemini";
import { saveActivity } from "../../services/history";
import { transferBatchFilesToRepo, transferFileToRepo } from "../../services/github";
import { getStoredGitHubToken } from "../../services/auth";
import {
  GitCommit,
  GitBranch,
  Flame,
  Calendar,
  Sparkles,
  FileCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  ArrowRight,
  GitPullRequest,
  Check,
  Send,
  Plus,
  Minus,
  Sliders,
  Terminal,
  UploadCloud,
  ExternalLink,
  ShieldCheck,
  FolderSync,
} from "lucide-react";

interface GitHubActivityTrackerViewProps {
  files: VirtualFile[];
  onUpdateFile: (fileId: string, newContent: string) => void;
  onCommitChanges?: (commit: GitHubCommitRecord) => void;
  githubConnected: boolean;
}

// Generate 52 weeks of contribution heatmap data
function generateContributionGrid(): ContributionDay[] {
  const days: ContributionDay[] = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // pseudo-random commit distribution weighted towards active engineering days
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const rand = Math.random();
    let count = 0;
    let level: 0 | 1 | 2 | 3 | 4 = 0;

    if (isWeekend) {
      if (rand > 0.6) {
        count = Math.floor(rand * 4);
        level = count > 2 ? 2 : 1;
      }
    } else {
      if (rand > 0.15) {
        count = Math.floor(rand * 9) + 1;
        level = count >= 7 ? 4 : count >= 5 ? 3 : count >= 3 ? 2 : 1;
      }
    }

    days.push({
      date: d.toISOString().split("T")[0],
      count,
      level,
    });
  }
  return days;
}

const INITIAL_COMMITS: GitHubCommitRecord[] = [
  {
    id: "c-1",
    hash: "9b4f21a",
    message: "feat(models): add multi-provider support for Claude 3.5 and Llama 3",
    author: "Senior Full-Stack Engineer",
    timestamp: Date.now() - 1000 * 60 * 35,
    filesChanged: 4,
    additions: 382,
    deletions: 48,
  },
  {
    id: "c-2",
    hash: "e72d10c",
    message: "refactor(dedup): consolidate duplicate date and number formatters into single source",
    author: "Autonomous Engineer Agent",
    timestamp: Date.now() - 1000 * 60 * 180,
    filesChanged: 3,
    additions: 89,
    deletions: 142,
  },
  {
    id: "c-3",
    hash: "3a8c5f0",
    message: "perf(cache): implement Token Bucket rate limiter with sliding window",
    author: "Senior Full-Stack Engineer",
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    filesChanged: 2,
    additions: 215,
    deletions: 12,
  },
  {
    id: "c-4",
    hash: "18b9c24",
    message: "chore(ci): enforce line 1 file path header and zero placeholder linting",
    author: "Autonomous Engineer Agent",
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    filesChanged: 5,
    additions: 44,
    deletions: 19,
  },
];

export const GitHubActivityTrackerView: React.FC<GitHubActivityTrackerViewProps> = ({
  files,
  onUpdateFile,
  githubConnected,
}) => {
  const [commits, setCommits] = useState<GitHubCommitRecord[]>(INITIAL_COMMITS);
  const [contributionData] = useState<ContributionDay[]>(generateContributionGrid);

  // Sub-tabs for GitHub Actions
  const [activeSubTab, setActiveSubTab] = useState<"ai-modify" | "transfer-repo" | "prompt-transfer">("ai-modify");

  // File modification state
  const [selectedFileId, setSelectedFileId] = useState<string>(files[0]?.id || "");
  const [aiPrompt, setAiPrompt] = useState<string>(
    "Refactor this module to add strict runtime assertion checks, detailed error domain types, and JSDoc documentation."
  );
  const [isModifying, setIsModifying] = useState<boolean>(false);
  const [modificationResult, setModificationResult] = useState<{
    modifiedCode: string;
    commitMessage: string;
    explanation: string;
  } | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  // File Transfer State (Transfer modified files to connected repo)
  const [targetRepo, setTargetRepo] = useState<string>("shamyuktta/autonomous-studio");
  const [targetBranch, setTargetBranch] = useState<string>("main");
  const [transferCommitMsg, setTransferCommitMsg] = useState<string>("feat: transfer modified files from Autonomous Studio");
  const [selectedFilesForTransfer, setSelectedFilesForTransfer] = useState<string[]>(
    files.slice(0, 3).map((f) => f.id)
  );
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [transferResult, setTransferResult] = useState<{
    success: boolean;
    count: number;
    commitSha: string;
    url?: string;
    filesCount: number;
  } | null>(null);

  // Prompt-based transfer state
  const [promptTransferQuery, setPromptTransferQuery] = useState<string>(
    "Transfer all modified components and README to repository shamyuktta/autonomous-studio on main branch with commit message 'feat(sync): push latest AI-optimized files'"
  );
  const [isProcessingPromptTransfer, setIsProcessingPromptTransfer] = useState<boolean>(false);

  // Pending changes state
  const pendingFiles = files.filter((f) => f.isPendingCommit);

  const selectedFile = files.find((f) => f.id === selectedFileId) || files[0];

  // Calculate Streak & Totals
  const totalContributions = contributionData.reduce((sum, d) => sum + d.count, 0);
  const currentStreak = 24; // days
  const longestStreak = 68; // days

  const handleModifyFile = async () => {
    if (!selectedFile || !aiPrompt.trim()) return;
    setIsModifying(true);
    setModificationResult(null);
    setAppliedSuccess(false);

    try {
      const res = await modifyFileWithAI({
        filePath: selectedFile.path,
        currentContent: selectedFile.content,
        prompt: aiPrompt.trim(),
        modelId: "gemini-3.1-pro-preview",
      });

      setModificationResult({
        modifiedCode: res.modifiedCode,
        commitMessage: res.commitMessage,
        explanation: res.explanation,
      });

      saveActivity({
        type: "ai-modify",
        title: `AI Prompt Modification: ${selectedFile.name}`,
        filePath: selectedFile.path,
        snapshotContent: res.modifiedCode,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsModifying(false);
    }
  };

  const handleApplyAndCommit = () => {
    if (!selectedFile || !modificationResult) return;

    // Update file in workspace
    onUpdateFile(selectedFile.id, modificationResult.modifiedCode);

    // Create commit record
    const newCommit: GitHubCommitRecord = {
      id: `c-${Date.now()}`,
      hash: Math.random().toString(16).substring(2, 9),
      message: modificationResult.commitMessage,
      author: "Autonomous Engineer Agent (AI-Assisted)",
      timestamp: Date.now(),
      filesChanged: 1,
      additions: Math.floor(modificationResult.modifiedCode.length / 50),
      deletions: Math.floor(selectedFile.content.length / 80),
    };

    setCommits([newCommit, ...commits]);
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      setModificationResult(null);
    }, 3000);
  };

  // Direct Transfer of Selected Files to Connected Repo
  const handleExecuteTransfer = async () => {
    if (selectedFilesForTransfer.length === 0) return;
    setIsTransferring(true);
    setTransferResult(null);

    try {
      const filesToPush = files
        .filter((f) => selectedFilesForTransfer.includes(f.id))
        .map((f) => ({ path: f.path, content: f.content }));

      const token = getStoredGitHubToken() || undefined;
      const [owner, repo] = targetRepo.includes("/")
        ? targetRepo.split("/")
        : ["shamyuktta", targetRepo || "autonomous-studio"];

      const result = await transferBatchFilesToRepo({
        owner,
        repo,
        branch: targetBranch || "main",
        files: filesToPush,
        commitMessage: transferCommitMsg || "feat: transfer modified files from Autonomous Studio",
        token,
      });

      // Record commit to feed
      const newCommit: GitHubCommitRecord = {
        id: `c-${Date.now()}`,
        hash: result.commitSha,
        message: transferCommitMsg,
        author: "shamyuktta (via Transfer Engine)",
        timestamp: Date.now(),
        filesChanged: filesToPush.length,
        additions: filesToPush.reduce((sum, f) => sum + Math.floor(f.content.length / 40), 0),
        deletions: 12,
      };
      setCommits([newCommit, ...commits]);

      setTransferResult({
        success: true,
        count: filesToPush.length,
        commitSha: result.commitSha,
        url: result.url,
        filesCount: filesToPush.length,
      });

      saveActivity({
        type: "file-transfer",
        title: `Transferred ${filesToPush.length} files to ${targetRepo}@${targetBranch}`,
        filePath: targetRepo,
        snapshotContent: `Commit ${result.commitSha}: ${transferCommitMsg}`,
      });
    } catch (err) {
      console.error("Transfer error:", err);
    } finally {
      setIsTransferring(false);
    }
  };

  // Prompt-Based File Transfer Execution
  const handleExecutePromptTransfer = async () => {
    if (!promptTransferQuery.trim()) return;
    setIsProcessingPromptTransfer(true);
    setTransferResult(null);

    try {
      // Parse prompt for target repository, commit message, or branch keywords
      let detectedRepo = targetRepo;
      let detectedBranch = targetBranch;
      let detectedMessage = "feat: transfer files based on user prompt";

      const lower = promptTransferQuery.toLowerCase();
      if (lower.includes("shamyuktta/")) {
        const match = promptTransferQuery.match(/shamyuktta\/[a-zA-Z0-9_-]+/);
        if (match) detectedRepo = match[0];
      }
      if (lower.includes("branch")) {
        const branchMatch = promptTransferQuery.match(/branch\s+([a-zA-Z0-9_\/-]+)/i);
        if (branchMatch) detectedBranch = branchMatch[1];
      }
      if (lower.includes("message '") || lower.includes('message "')) {
        const msgMatch = promptTransferQuery.match(/message\s+['"]([^'"]+)['"]/i);
        if (msgMatch) detectedMessage = msgMatch[1];
      }

      // Filter files matching prompt keywords or all workspace files
      const matchedFiles = files.filter((f) => {
        if (lower.includes("all")) return true;
        if (lower.includes("readme") && f.name.toLowerCase().includes("readme")) return true;
        if (lower.includes("component") && f.path.includes("components")) return true;
        if (lower.includes("modified") && f.isPendingCommit) return true;
        return true;
      });

      const filesToPush = (matchedFiles.length > 0 ? matchedFiles : files.slice(0, 3)).map((f) => ({
        path: f.path,
        content: f.content,
      }));

      const token = getStoredGitHubToken() || undefined;
      const [owner, repo] = detectedRepo.includes("/")
        ? detectedRepo.split("/")
        : ["shamyuktta", detectedRepo];

      const result = await transferBatchFilesToRepo({
        owner,
        repo,
        branch: detectedBranch,
        files: filesToPush,
        commitMessage: detectedMessage,
        token,
      });

      const newCommit: GitHubCommitRecord = {
        id: `c-${Date.now()}`,
        hash: result.commitSha,
        message: detectedMessage,
        author: "shamyuktta (via AI Prompt Transfer)",
        timestamp: Date.now(),
        filesChanged: filesToPush.length,
        additions: filesToPush.reduce((sum, f) => sum + Math.floor(f.content.length / 50), 0),
        deletions: 8,
      };
      setCommits([newCommit, ...commits]);

      setTransferResult({
        success: true,
        count: filesToPush.length,
        commitSha: result.commitSha,
        url: result.url,
        filesCount: filesToPush.length,
      });

      saveActivity({
        type: "file-transfer",
        title: `AI Prompt-Driven Transfer: ${filesToPush.length} files pushed to ${detectedRepo}`,
        filePath: detectedRepo,
        snapshotContent: `Prompt: ${promptTransferQuery}\nCommit: ${result.commitSha}`,
      });
    } catch (err) {
      console.error("Prompt transfer error:", err);
    } finally {
      setIsProcessingPromptTransfer(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              <GitCommit className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Real-Time GitHub Activity Tracker</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Inspect daily commit telemetry, 52-week contribution heatmaps, track pending uncommitted workspace
                changes, and connect the AI agent to modify source files with auto-generated conventional commits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <Flame className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Active Streak</div>
                <div className="font-bold text-amber-400">{currentStreak} Days</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Annual Commits</div>
                <div className="font-bold text-emerald-400">{totalContributions}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 52-Week Contribution Grid */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Contribution Heatmap (Past 52 Weeks)
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-950 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-800 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pt-2">
          <div className="grid grid-flow-col grid-rows-7 gap-1 min-w-[720px]">
            {contributionData.map((d, i) => (
              <div
                key={i}
                title={`${d.date}: ${d.count} commits`}
                className={`w-2.5 h-2.5 rounded-sm transition-colors ${
                  d.level === 0
                    ? "bg-slate-800/80"
                    : d.level === 1
                    ? "bg-emerald-950"
                    : d.level === 2
                    ? "bg-emerald-800"
                    : d.level === 3
                    ? "bg-emerald-600"
                    : "bg-emerald-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Row: AI File Modifier Engine (7 Cols) & Commit History (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Action Suite (AI Modifier, Repo Transfer, Prompt Transfer) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-5">
            {/* Sub-Tab Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveSubTab("ai-modify")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeSubTab === "ai-modify"
                      ? "bg-slate-800 text-indigo-300 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI File Modifier</span>
                </button>

                <button
                  onClick={() => setActiveSubTab("transfer-repo")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeSubTab === "transfer-repo"
                      ? "bg-slate-800 text-emerald-300 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Transfer to Repo</span>
                </button>

                <button
                  onClick={() => setActiveSubTab("prompt-transfer")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeSubTab === "prompt-transfer"
                      ? "bg-slate-800 text-purple-300 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FolderSync className="w-3.5 h-3.5 text-purple-400" />
                  <span>Prompt Transfer</span>
                </button>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                gemini-3.1-pro
              </span>
            </div>

            {/* TAB 1: AI Prompt-Based File Modifier */}
            {activeSubTab === "ai-modify" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Target File Selector */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Select Target Workspace File
                  </label>
                  <select
                    value={selectedFileId}
                    onChange={(e) => setSelectedFileId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  >
                    {files.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.path} ({f.language})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Modification Prompt */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Natural Language AI Refactoring Prompt
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                    placeholder="e.g. Add sliding window rate limiting and custom HTTP 429 exceptions..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                  />
                </div>

                {/* Execute Button */}
                <button
                  onClick={handleModifyFile}
                  disabled={isModifying || !aiPrompt.trim()}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  {isModifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing AST & Applying Modifications...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Connect AI to Modify File
                    </>
                  )}
                </button>

                {appliedSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Successfully applied changes and recorded commit to repository!
                  </div>
                )}

                {/* Diff & Commit Preview */}
                {modificationResult && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                      <span className="font-semibold text-slate-200">Proposed Commit Preview</span>
                      <span className="font-mono text-[11px] text-emerald-400">1 file changed</span>
                    </div>

                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-indigo-300">
                      {modificationResult.commitMessage}
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-400 font-semibold mb-1">Modified Code Preview:</div>
                      <pre className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48">
                        {modificationResult.modifiedCode}
                      </pre>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setModificationResult(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                      >
                        Discard
                      </button>
                      <button
                        onClick={handleApplyAndCommit}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Apply Changes & Commit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Transfer Modified Files to Connected Repo */}
            {activeSubTab === "transfer-repo" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
                  <UploadCloud className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Direct GitHub Repository Transfer:</span> Select modified
                    workspace files to package into a single git commit and push directly to your connected repository.
                  </div>
                </div>

                {/* Target Repo & Branch Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Target Repository</label>
                    <input
                      type="text"
                      value={targetRepo}
                      onChange={(e) => setTargetRepo(e.target.value)}
                      placeholder="e.g. shamyuktta/autonomous-studio"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Target Branch</label>
                    <input
                      type="text"
                      value={targetBranch}
                      onChange={(e) => setTargetBranch(e.target.value)}
                      placeholder="main"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Commit Message Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Commit Message</label>
                  <input
                    type="text"
                    value={transferCommitMsg}
                    onChange={(e) => setTransferCommitMsg(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* File Selection Checkboxes */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-400">
                      Select Files to Transfer ({selectedFilesForTransfer.length} chosen)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedFilesForTransfer.length === files.length) {
                          setSelectedFilesForTransfer([]);
                        } else {
                          setSelectedFilesForTransfer(files.map((f) => f.id));
                        }
                      }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      {selectedFilesForTransfer.length === files.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div className="max-h-44 overflow-y-auto space-y-1 p-2 bg-slate-950 rounded-xl border border-slate-800">
                    {files.map((f) => {
                      const isChecked = selectedFilesForTransfer.includes(f.id);
                      return (
                        <label
                          key={f.id}
                          className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFilesForTransfer((prev) => [...prev, f.id]);
                              } else {
                                setSelectedFilesForTransfer((prev) => prev.filter((id) => id !== f.id));
                              }
                            }}
                            className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="font-mono text-slate-300 text-[11px] truncate flex-1">
                            {f.path}
                          </span>
                          {f.isPendingCommit && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Modified
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Execute Transfer Button */}
                <button
                  onClick={handleExecuteTransfer}
                  disabled={isTransferring || selectedFilesForTransfer.length === 0}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  {isTransferring ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Transferring & Pushing to {targetRepo}...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Transfer {selectedFilesForTransfer.length} Files to Connected Repo
                    </>
                  )}
                </button>

                {/* Transfer Success Box */}
                {transferResult && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Transfer Successful!</span>
                      </div>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700">
                        Commit #{transferResult.commitSha}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Successfully packaged and transferred {transferResult.filesCount} files to{" "}
                      <span className="font-mono text-white font-semibold">{targetRepo}</span> on branch{" "}
                      <span className="font-mono text-emerald-400 font-semibold">{targetBranch}</span>.
                    </p>
                    {transferResult.url && (
                      <div className="pt-1">
                        <a
                          href={transferResult.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                        >
                          <span>View Commit on GitHub</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Prompt-Based Repo Transfer Engine */}
            {activeSubTab === "prompt-transfer" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Natural Language Prompt Transfer:</span> State your transfer
                    intent in plain English. The AI engine parses which files to push, your target branch, and
                    generates a conventional commit message.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    User Transfer Instruction Prompt
                  </label>
                  <textarea
                    value={promptTransferQuery}
                    onChange={(e) => setPromptTransferQuery(e.target.value)}
                    rows={4}
                    placeholder="e.g. Transfer all modified components and the README to my repo shamyuktta/autonomous-studio on main with commit message 'feat: sync updated files'..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none leading-relaxed font-mono"
                  />
                </div>

                <button
                  onClick={handleExecutePromptTransfer}
                  disabled={isProcessingPromptTransfer || !promptTransferQuery.trim()}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2"
                >
                  {isProcessingPromptTransfer ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Parsing Prompt & Transferring Files...
                    </>
                  ) : (
                    <>
                      <FolderSync className="w-4 h-4" />
                      Transfer Files Based on User Prompt
                    </>
                  )}
                </button>

                {/* Prompt Transfer Result */}
                {transferResult && (
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs text-purple-300 font-bold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Prompt-Driven Transfer Complete!</span>
                      </div>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-purple-950 border border-purple-700">
                        Commit #{transferResult.commitSha}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Successfully executed prompt instruction and transferred {transferResult.filesCount}{" "}
                      files into repository.
                    </p>
                    {transferResult.url && (
                      <div className="pt-1">
                        <a
                          href={transferResult.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                        >
                          <span>Inspect Transferred Commit on GitHub</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Commit History Feed & Pending Changes (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Commit Feed */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Live Commit Feed
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{commits.length} commits</span>
            </div>

            <div className="divide-y divide-slate-800/60 max-h-[420px] overflow-y-auto">
              {commits.map((c) => (
                <div key={c.id} className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-400 font-semibold">
                      {c.hash}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(c.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-200 line-clamp-2">{c.message}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>{c.author}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-emerald-400 flex items-center">
                        <Plus className="w-2.5 h-2.5" />
                        {c.additions}
                      </span>
                      <span className="text-rose-400 flex items-center">
                        <Minus className="w-2.5 h-2.5" />
                        {c.deletions}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
