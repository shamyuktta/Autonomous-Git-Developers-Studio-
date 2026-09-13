// path: src/App.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Navbar, ActiveTab } from "./components/Navbar";
import { AuthModal } from "./components/AuthModal";
import { CommandPalette } from "./components/CommandPalette";
import { KeyboardShortcutsModal } from "./components/KeyboardShortcutsModal";
import { HistoryTrackerDrawer } from "./components/HistoryTrackerDrawer";
import { DashboardView } from "./components/views/DashboardView";
import { ProductionCodeGenView } from "./components/views/ProductionCodeGenView";
import { GitHubConnectView } from "./components/views/GitHubConnectView";
import { GitHubMetricsView } from "./components/views/GitHubMetricsView";
import { FileUploadDebuggerView } from "./components/views/FileUploadDebuggerView";
import { VSCodeBridgeView } from "./components/views/VSCodeBridgeView";
import { WorkspaceEditorView } from "./components/views/WorkspaceEditorView";
import { ReadmeGeneratorView } from "./components/views/ReadmeGeneratorView";
import { GitHubActivityTrackerView } from "./components/views/GitHubActivityTrackerView";
import { GitHubIssuesView } from "./components/views/GitHubIssuesView";
import { ProjectDependenciesView } from "./components/views/ProjectDependenciesView";
import { CICDPipelineView } from "./components/views/CICDPipelineView";
import { MultiAgentCodeReviewView } from "./components/views/MultiAgentCodeReviewView";
import { PerformanceDashboardView } from "./components/views/PerformanceDashboardView";
import { ProfileDashboardView } from "./components/views/ProfileDashboardView";
import { LoginPageView } from "./components/views/LoginPageView";
import { Footer } from "./components/Footer";
import { ConnectModal } from "./components/ConnectModal";
import { UserProfile, SystemHealth, VirtualFile, ThemeMode } from "./types/studio";
import { getStoredUser, clearUserSession, getStoredGitHubToken } from "./services/auth";
import { checkSystemHealth } from "./services/gemini";
import {
  getStoredActivities,
  getRecentFiles,
  clearActivities,
  recordFileAccess,
  saveActivity,
} from "./services/history";
import { getStoredTheme, saveTheme, applyThemeToDocument } from "./services/theme";
import { SAMPLE_PROJECTS } from "./data/sampleProjects";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const [githubConnected, setGithubConnected] = useState(false);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("dark");

  // History & activities
  const [activities, setActivities] = useState(getStoredActivities());
  const [recentFiles, setRecentFiles] = useState(getRecentFiles());

  // Workspace files state
  const [files, setFiles] = useState<VirtualFile[]>(SAMPLE_PROJECTS[0].files);
  const [activeFileId, setActiveFileId] = useState<string>(SAMPLE_PROJECTS[0].files[0].id);

  // Toast notifications
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "info" | "alert";
  } | null>(null);

  const showNotification = useCallback(
    (message: string, type: "success" | "info" | "alert" = "success") => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
    },
    []
  );

  // Theme switcher cycle
  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const nextTheme: ThemeMode = prev === "dark" ? "light" : prev === "light" ? "midnight" : "dark";
      saveTheme(nextTheme);
      showNotification(`Switched theme to ${nextTheme.toUpperCase()}`, "info");
      return nextTheme;
    });
  }, [showNotification]);

  // Initial setup
  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
    if (!user) {
      setIsAuthModalOpen(true);
    }

    const savedTheme = getStoredTheme();
    setTheme(savedTheme);
    applyThemeToDocument(savedTheme);

    const ghToken = getStoredGitHubToken();
    if (ghToken || user?.githubConnected) {
      setGithubConnected(true);
    }

    checkSystemHealth().then(setSystemHealth).catch(console.error);
    setActivities(getStoredActivities());
    setRecentFiles(getRecentFiles());
  }, []);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when focused in input/textarea (unless Cmd key is held)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "t") {
        e.preventDefault();
        handleToggleTheme();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setActivities(getStoredActivities());
        setRecentFiles(getRecentFiles());
        setIsHistoryDrawerOpen((prev) => !prev);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        if (e.key === "1") {
          e.preventDefault();
          setActiveTab("dashboard");
        } else if (e.key === "2") {
          e.preventDefault();
          setActiveTab("codegen");
        } else if (e.key === "3") {
          e.preventDefault();
          setActiveTab("github");
        } else if (e.key === "4") {
          e.preventDefault();
          setActiveTab("metrics");
        } else if (e.key === "5") {
          e.preventDefault();
          setActiveTab("debugger");
        } else if (e.key === "6") {
          e.preventDefault();
          setActiveTab("vscode");
        } else if (e.key === "7") {
          e.preventDefault();
          setActiveTab("workspace");
        } else if (e.key === "8") {
          e.preventDefault();
          setActiveTab("readme");
        } else if (e.key === "9") {
          e.preventDefault();
          setActiveTab("activity");
        }
      }

      if (!isInput && (e.key === "?" || (e.shiftKey && e.key === "/"))) {
        e.preventDefault();
        setIsShortcutsModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleToggleTheme]);

  const handleLogout = () => {
    clearUserSession();
    setCurrentUser(null);
    setGithubConnected(false);
    setActiveTab("dashboard");
    showNotification("Signed out of session. Please sign in to continue.", "info");
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.githubConnected) {
      setGithubConnected(true);
    }
    showNotification(`Welcome back, ${user.name}! Workspace ready.`, "success");
  };

  // If unauthenticated, immediately display full-screen Login Page
  if (!currentUser) {
    return <LoginPageView onLoginSuccess={handleLoginSuccess} />;
  }

  const handlePurgeDeadFiles = () => {
    const dead = files.filter(
      (f) => f.isDeadFile || f.path.endsWith(".bak") || f.path.includes("-copy")
    );
    setFiles((prev) =>
      prev.filter((f) => !(f.isDeadFile || f.path.endsWith(".bak") || f.path.includes("-copy")))
    );
    saveActivity({
      type: "deduplicate",
      title: `Purged ${dead.length} obsolete *.bak files`,
      filePath: "workspace/root",
    });
    setActivities(getStoredActivities());
    showNotification(`Purged ${dead.length} obsolete/dead files from workspace.`, "success");
  };

  const handleConsolidateDuplicates = () => {
    const primaryPath = "src/utils/formatters.ts";
    const primaryCode = `// path: src/utils/formatters.ts
// Unified single-source-of-truth utility module
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(date)
  );
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
`;

    setFiles((prev) => {
      const filtered = prev.filter(
        (f) => !f.path.includes("dateFormatter") && !f.path.includes("dateHelpers") && !f.path.includes("slugify")
      );
      return filtered.map((f) =>
        f.path === primaryPath ? { ...f, content: primaryCode, isDuplicate: false } : f
      );
    });

    saveActivity({
      type: "deduplicate",
      title: "Consolidated duplicate formatters into single source",
      filePath: primaryPath,
      snapshotContent: primaryCode,
    });
    setActivities(getStoredActivities());

    showNotification(
      "Consolidated duplicate utilities into single source: src/utils/formatters.ts",
      "success"
    );
  };

  // Push code from AI Code Generator into active workspace
  const handlePushToWorkspace = (newFile: VirtualFile) => {
    setFiles((prev) => {
      const exists = prev.find((f) => f.path === newFile.path);
      if (exists) {
        return prev.map((f) => (f.path === newFile.path ? { ...f, content: newFile.content } : f));
      }
      return [...prev, newFile];
    });
    setActiveFileId(newFile.id);
    recordFileAccess({ path: newFile.path, name: newFile.name });
    setRecentFiles(getRecentFiles());
    showNotification(`Added ${newFile.name} to Code Studio workspace.`, "success");
  };

  const handleOpenRecentFileInWorkspace = (filePath: string) => {
    const target = files.find((f) => f.path === filePath);
    if (target) {
      setActiveFileId(target.id);
    }
    setActiveTab("workspace");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Professional SaaS Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        hasApiKey={Boolean(systemHealth?.hasApiKey)}
        githubConnected={githubConnected}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenHistory={() => {
          setActivities(getStoredActivities());
          setRecentFiles(getRecentFiles());
          setIsHistoryDrawerOpen(true);
        }}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        historyCount={activities.length}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-xs font-medium ${
              notification.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
                : notification.type === "alert"
                ? "bg-rose-950/90 border-rose-500/40 text-rose-200"
                : "bg-indigo-950/90 border-indigo-500/40 text-indigo-200"
            }`}
          >
            {notification.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {notification.type === "alert" && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            {notification.type === "info" && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dashboard" && (
          <DashboardView
            currentUser={currentUser}
            onNavigate={setActiveTab}
            systemHealth={systemHealth}
            githubConnected={githubConnected}
            onOpenFileInWorkspace={handleOpenRecentFileInWorkspace}
          />
        )}

        {activeTab === "codegen" && (
          <ProductionCodeGenView
            onPushToWorkspace={handlePushToWorkspace}
            onNavigateToWorkspace={() => setActiveTab("workspace")}
          />
        )}

        {activeTab === "github" && (
          <GitHubConnectView
            githubConnected={githubConnected}
            onConnectionChange={setGithubConnected}
          />
        )}

        {activeTab === "metrics" && (
          <GitHubMetricsView
            selectedRepo={null}
            onNavigateToDedup={() => setActiveTab("github")}
          />
        )}

        {activeTab === "readme" && (
          <ReadmeGeneratorView
            files={files}
            onSaveToWorkspace={(newFile) => {
              setFiles((prev) => {
                const exists = prev.some((f) => f.path === newFile.path);
                if (exists) {
                  return prev.map((f) => (f.path === newFile.path ? newFile : f));
                }
                return [...prev, newFile];
              });
              showNotification("README.md saved to active workspace!", "success");
            }}
            onNavigateToWorkspace={() => setActiveTab("workspace")}
          />
        )}

        {activeTab === "activity" && (
          <GitHubActivityTrackerView
            files={files}
            onUpdateFile={(fileId, newContent) => {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === fileId ? { ...f, content: newContent, isPendingCommit: false } : f
                )
              );
              showNotification("Applied AI modifications to file and recorded commit!", "success");
            }}
            githubConnected={githubConnected}
          />
        )}

        {activeTab === "issues" && <GitHubIssuesView files={files} />}

        {activeTab === "dependencies" && (
          <ProjectDependenciesView
            files={files}
            onAddDependencyToWorkspace={(pkgName, version) => {
              showNotification(`Added ${pkgName}@${version} to project dependencies!`, "success");
            }}
          />
        )}

        {activeTab === "cicd" && <CICDPipelineView />}

        {activeTab === "review" && (
          <MultiAgentCodeReviewView
            files={files}
            onApplyPatch={(filePath, patch) => {
              showNotification(`Applied DevSecOps patch to ${filePath}`, "success");
            }}
          />
        )}

        {activeTab === "performance" && <PerformanceDashboardView />}

        {activeTab === "debugger" && <FileUploadDebuggerView />}

        {activeTab === "vscode" && <VSCodeBridgeView />}

        {activeTab === "workspace" && (
          <WorkspaceEditorView
            files={files}
            activeFileId={activeFileId}
            onSelectFile={(id) => {
              setActiveFileId(id);
              const selected = files.find((f) => f.id === id);
              if (selected) {
                recordFileAccess({ path: selected.path, name: selected.name });
                setRecentFiles(getRecentFiles());
              }
            }}
            onUpdateFileContent={(id, content) => {
              setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, content } : f)));
            }}
            onAddFiles={(newFiles) => setFiles((prev) => [...prev, ...newFiles])}
            onPurgeDeadFiles={handlePurgeDeadFiles}
            onConsolidateDuplicates={handleConsolidateDuplicates}
          />
        )}
      </main>

      {/* Persistent Global Footer with Social Links & @2026 Copyright */}
      <Footer
        onOpenConnect={() => setIsConnectModalOpen(true)}
        onNavigate={setActiveTab}
      />

      {/* Connect With Us Modal (Instagram, LinkedIn, GitHub) */}
      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />

      {/* Command Palette Modal (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActiveTab}
        onToggleTheme={handleToggleTheme}
        onOpenHistory={() => {
          setActivities(getStoredActivities());
          setRecentFiles(getRecentFiles());
          setIsHistoryDrawerOpen(true);
        }}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onPurgeDeadFiles={handlePurgeDeadFiles}
        onConsolidateDuplicates={handleConsolidateDuplicates}
      />

      {/* Keyboard Shortcuts Modal (?) */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* History & Recent Files Drawer (Cmd+Shift+H) */}
      <HistoryTrackerDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        activities={activities}
        recentFiles={recentFiles}
        onOpenFileInWorkspace={handleOpenRecentFileInWorkspace}
        onClearActivities={() => {
          clearActivities();
          setActivities([]);
          showNotification("Cleared activity audit history.", "info");
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          if (currentUser) {
            setIsAuthModalOpen(false);
          }
        }}
        canDismiss={currentUser !== null}
        currentUser={currentUser}
        onUserChange={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          showNotification(`Authenticated as ${user.name}`, "success");
        }}
      />
    </div>
  );
}
