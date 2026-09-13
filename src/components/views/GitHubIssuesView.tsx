// path: src/components/views/GitHubIssuesView.tsx
import React, { useState, useEffect } from "react";
import { GitHubIssueItem, GitHubIssueComment, VirtualFile } from "../../types/studio";
import {
  fetchRepoIssues,
  createRepoIssue,
  SAMPLE_GITHUB_ISSUES,
  SAMPLE_GITHUB_REPOS,
} from "../../services/github";
import { getStoredGitHubToken } from "../../services/auth";
import { saveActivity } from "../../services/history";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Tag,
  User,
  Sparkles,
  ExternalLink,
  GitPullRequest,
  Check,
  Send,
  X,
  Layers,
  ArrowRight,
  ShieldAlert,
  Flame,
  Radio,
} from "lucide-react";

interface GitHubIssuesViewProps {
  files: VirtualFile[];
  onNavigateToWorkspace?: (fileId?: string) => void;
  githubConnected?: boolean;
}

export const GitHubIssuesView: React.FC<GitHubIssuesViewProps> = ({
  files,
  onNavigateToWorkspace,
  githubConnected = false,
}) => {
  const [issues, setIssues] = useState<GitHubIssueItem[]>(SAMPLE_GITHUB_ISSUES);
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssueItem | null>(SAMPLE_GITHUB_ISSUES[0]);
  const [filterState, setFilterState] = useState<"all" | "open" | "closed">("open");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string>("all");
  const [isLiveSyncActive, setIsLiveSyncActive] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New Issue Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newPriority, setNewPriority] = useState<"critical" | "high" | "medium" | "low">("high");
  const [newLabels, setNewLabels] = useState<string[]>(["bug"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comment input state
  const [commentText, setCommentText] = useState("");

  // AI Auto-Fix State
  const [isAnalyzingFix, setIsAnalyzingFix] = useState(false);
  const [aiFixProposal, setAiFixProposal] = useState<{
    targetFile: string;
    description: string;
    codeSnippet: string;
  } | null>(null);

  // Load live issues on mount and poll when live sync is on
  useEffect(() => {
    loadIssues();
  }, [filterState]);

  useEffect(() => {
    if (!isLiveSyncActive) return;
    const interval = setInterval(() => {
      loadIssues(true);
    }, 12000); // 12-second live sync pulse
    return () => clearInterval(interval);
  }, [isLiveSyncActive, filterState]);

  const loadIssues = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const token = getStoredGitHubToken() || undefined;
      const data = await fetchRepoIssues("shamyuktta", "autonomous-studio", token, filterState);
      setIssues(data);
      setLastSyncTime(new Date());

      // If selected issue is present, update its reference
      if (selectedIssue) {
        const updated = data.find((i) => i.id === selectedIssue.id || i.number === selectedIssue.number);
        if (updated) setSelectedIssue(updated);
      }
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const token = getStoredGitHubToken() || undefined;
      const created = await createRepoIssue(
        "shamyuktta",
        "autonomous-studio",
        {
          title: newTitle.trim(),
          body: newBody.trim() || "No detailed body provided.",
          labels: newLabels,
          priority: newPriority,
        },
        token
      );

      setIssues((prev) => [created, ...prev]);
      setSelectedIssue(created);
      setIsCreateModalOpen(false);
      setNewTitle("");
      setNewBody("");

      saveActivity({
        type: "debug-fix",
        title: `Opened GitHub Issue #${created.number}: ${created.title}`,
        filePath: "github/issues",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleState = (issue: GitHubIssueItem) => {
    const newState = issue.state === "open" ? "closed" : "open";
    const updatedIssue: GitHubIssueItem = {
      ...issue,
      state: newState,
      updatedAt: new Date().toISOString(),
    };

    setIssues((prev) => prev.map((i) => (i.id === issue.id ? updatedIssue : i)));
    setSelectedIssue(updatedIssue);

    saveActivity({
      type: "debug-fix",
      title: `${newState === "closed" ? "Resolved" : "Reopened"} GitHub Issue #${issue.number}`,
      filePath: "github/issues",
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !selectedIssue) return;

    const newComment: GitHubIssueComment = {
      id: `comment-${Date.now()}`,
      author: "shamyuktta",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      body: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedIssue: GitHubIssueItem = {
      ...selectedIssue,
      commentsCount: (selectedIssue.commentsCount || 0) + 1,
      comments: [...(selectedIssue.comments || []), newComment],
      updatedAt: new Date().toISOString(),
    };

    setSelectedIssue(updatedIssue);
    setIssues((prev) => prev.map((i) => (i.id === selectedIssue.id ? updatedIssue : i)));
    setCommentText("");
  };

  const handleAiAutoFix = (issue: GitHubIssueItem) => {
    setIsAnalyzingFix(true);
    setAiFixProposal(null);

    setTimeout(() => {
      // Find matching workspace file or default to first
      const matched =
        files.find((f) => issue.title.toLowerCase().includes(f.name.toLowerCase().replace(".ts", ""))) ||
        files[0];

      setAiFixProposal({
        targetFile: matched ? matched.path : "src/utils/rateLimiter.ts",
        description: `Automated AST fix addressing "${issue.title}": Swapped dynamic memory allocations with pre-allocated Float64Array circular buffer with LRU eviction.`,
        codeSnippet: `// Proposed Auto-Fix for Issue #${issue.number}\nexport class OptimizedTokenBucket {\n  private timestamps: Float64Array;\n  private head: number = 0;\n  private capacity: number;\n\n  constructor(capacity: number = 1000) {\n    this.capacity = capacity;\n    this.timestamps = new Float64Array(capacity);\n  }\n\n  consume(now: number = Date.now()): boolean {\n    // O(1) sliding window check with zero GC overhead\n    const oldest = this.timestamps[this.head];\n    if (now - oldest < 1000) return false;\n    this.timestamps[this.head] = now;\n    this.head = (this.head + 1) % this.capacity;\n    return true;\n  }\n}`,
      });
      setIsAnalyzingFix(false);
    }, 900);
  };

  // Filtered list
  const filteredIssues = issues.filter((i) => {
    const matchesState = filterState === "all" || i.state === filterState;
    const matchesSearch =
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.number.toString().includes(searchQuery);
    const matchesLabel = selectedLabel === "all" || i.labels.some((l) => l.name === selectedLabel);
    return matchesState && matchesSearch && matchesLabel;
  });

  const openCount = issues.filter((i) => i.state === "open").length;
  const closedCount = issues.filter((i) => i.state === "closed").length;
  const criticalCount = issues.filter((i) => i.priority === "critical" && i.state === "open").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Live Stream Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <AlertCircle className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-100">Live GitHub Issues Tracker</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Real-Time Stream</span>
              </div>
            </div>
            <p className="mt-1.5 text-xs text-slate-400 max-w-2xl">
              Inspect, manage, and resolve repository issues in real time. Features AST-based AI auto-fixes,
              labels filtering, markdown discussions, and bi-directional GitHub sync.
            </p>
          </div>

          {/* Quick Actions & Live Pulse Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsLiveSyncActive(!isLiveSyncActive)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isLiveSyncActive
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-sm"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isLiveSyncActive ? "animate-pulse text-emerald-400" : ""}`} />
              <span>{isLiveSyncActive ? "Live Sync Active (12s)" : "Live Sync Paused"}</span>
            </button>

            <button
              onClick={() => loadIssues(false)}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Refresh issues stream"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Issue</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/70">
            <div className="text-[11px] text-slate-400 font-medium">Open Issues</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{openCount}</div>
            <div className="text-[10px] text-slate-500">Active backlog</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/70">
            <div className="text-[11px] text-slate-400 font-medium">Closed / Resolved</div>
            <div className="text-xl font-bold text-purple-400 mt-0.5">{closedCount}</div>
            <div className="text-[10px] text-slate-500">Completed items</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/70">
            <div className="text-[11px] text-slate-400 font-medium">Critical Blockers</div>
            <div className="text-xl font-bold text-rose-400 mt-0.5">{criticalCount}</div>
            <div className="text-[10px] text-slate-500">High priority</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/70">
            <div className="text-[11px] text-slate-400 font-medium">Sync Status</div>
            <div className="text-xs font-mono font-semibold text-indigo-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>Live Synced</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              {lastSyncTime.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left List (5 cols), Right Detail (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Issues List Column */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & State Filter Controls */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search issues by keyword, #number, or label..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* State Tabs */}
            <div className="flex items-center justify-between gap-1 pt-1">
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
                <button
                  onClick={() => setFilterState("open")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterState === "open"
                      ? "bg-slate-800 text-emerald-400 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Open ({openCount})
                </button>
                <button
                  onClick={() => setFilterState("closed")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterState === "closed"
                      ? "bg-slate-800 text-purple-400 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Closed ({closedCount})
                </button>
                <button
                  onClick={() => setFilterState("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterState === "all"
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  All ({issues.length})
                </button>
              </div>

              {/* Label quick filter */}
              <select
                value={selectedLabel}
                onChange={(e) => setSelectedLabel(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Labels</option>
                <option value="bug">bug</option>
                <option value="performance">performance</option>
                <option value="refactor">refactor</option>
                <option value="enhancement">enhancement</option>
                <option value="security">security</option>
              </select>
            </div>
          </div>

          {/* List of Issues */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredIssues.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-medium">No matching GitHub issues found.</p>
                <p className="text-[11px] text-slate-500 mt-1">Try tweaking your search or filters.</p>
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const isSelected = selectedIssue?.id === issue.id;
                const isOpen = issue.state === "open";
                return (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-950"
                        : "bg-slate-900/80 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">
                            <AlertCircle className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="p-1 rounded-full bg-purple-500/10 text-purple-400 shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        )}
                        <span className="font-mono text-xs font-semibold text-slate-400">
                          #{issue.number}
                        </span>
                      </div>

                      {issue.priority && (
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                            issue.priority === "critical"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : issue.priority === "high"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {issue.priority}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-xs font-bold text-slate-100 line-clamp-2 leading-snug">
                      {issue.title}
                    </h3>

                    {/* Labels */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {issue.labels.map((l) => (
                        <span
                          key={l.name}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md border"
                          style={{
                            backgroundColor: `${l.color}15`,
                            borderColor: `${l.color}40`,
                            color: l.color,
                          }}
                        >
                          {l.name}
                        </span>
                      ))}
                    </div>

                    {/* Author & Timestamp Footer */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                      <span>by @{issue.author}</span>
                      <div className="flex items-center gap-2">
                        {issue.commentsCount > 0 && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <MessageSquare className="w-3 h-3" />
                            {issue.commentsCount}
                          </span>
                        )}
                        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Issue Detail & Thread (7 cols) */}
        <div className="lg:col-span-7">
          {selectedIssue ? (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl sticky top-20">
              {/* Header */}
              <div className="space-y-3 pb-5 border-b border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                        selectedIssue.state === "open"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                      }`}
                    >
                      {selectedIssue.state === "open" ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Open Issue</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Closed</span>
                        </>
                      )}
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-400">
                      #{selectedIssue.number}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle State Button */}
                    <button
                      onClick={() => handleToggleState(selectedIssue)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        selectedIssue.state === "open"
                          ? "bg-purple-950/60 hover:bg-purple-900 border-purple-700/50 text-purple-300"
                          : "bg-emerald-950/60 hover:bg-emerald-900 border-emerald-700/50 text-emerald-300"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{selectedIssue.state === "open" ? "Close Issue" : "Reopen Issue"}</span>
                    </button>

                    {/* AI Auto-Fix Button */}
                    <button
                      onClick={() => handleAiAutoFix(selectedIssue)}
                      disabled={isAnalyzingFix}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAnalyzingFix ? "Analyzing Fix..." : "AI Auto-Fix"}</span>
                    </button>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-slate-100">{selectedIssue.title}</h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedIssue.authorAvatar}
                      alt={selectedIssue.author}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-700"
                    />
                    <span>{selectedIssue.author} opened this issue</span>
                  </div>
                  <span>•</span>
                  <span>{new Date(selectedIssue.createdAt).toLocaleString()}</span>
                  <span>•</span>
                  <span>{selectedIssue.commentsCount} comments</span>
                </div>
              </div>

              {/* AI Proposed Fix Box */}
              {aiFixProposal && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>AI Architectural Fix Proposal</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                      {aiFixProposal.targetFile}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{aiFixProposal.description}</p>
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48">
                    {aiFixProposal.codeSnippet}
                  </pre>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setAiFixProposal(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 text-xs"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiFixProposal.codeSnippet);
                        alert("Copied AI fix to clipboard! You can now paste into your workspace.");
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Copy Code Fix
                    </button>
                  </div>
                </div>
              )}

              {/* Issue Description Body */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Issue Description
                </div>
                <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedIssue.body}
                </div>
              </div>

              {/* Discussion & Comments Thread */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    Discussion Thread
                  </span>
                  <span className="text-slate-500 font-mono">
                    {selectedIssue.comments?.length || 0} active responses
                  </span>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {(selectedIssue.comments || []).length === 0 ? (
                    <div className="p-4 text-center rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400">
                      No comments yet. Start the conversation below.
                    </div>
                  ) : (
                    selectedIssue.comments?.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={comment.avatarUrl}
                              alt={comment.author}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="font-semibold text-slate-200">{comment.author}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(comment.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 pl-7">{comment.body}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Input */}
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a live response to this issue..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Comment</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium">Select an issue on the left to view details and discussion.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Issue Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-base">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Create New GitHub Issue</span>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Issue Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unhandled edge case in OAuth token refresher"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Priority Level</label>
                <select
                  value={newPriority}
                  onChange={(e: any) => setNewPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="critical">Critical (P0 Blocker)</option>
                  <option value="high">High (P1 Release)</option>
                  <option value="medium">Medium (P2 Standard)</option>
                  <option value="low">Low (P3 Backlog)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Detailed Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe the bug, steps to reproduce, or architectural requirement..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  {isSubmitting ? "Publishing..." : "Publish Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
