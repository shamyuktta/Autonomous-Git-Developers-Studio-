// path: src/components/Navbar.tsx
import React, { useState } from "react";
import { UserProfile, ThemeMode } from "../types/studio";
import {
  LayoutDashboard,
  Sparkles,
  Github,
  Activity,
  Bug,
  Terminal,
  Code2,
  Cpu,
  LogOut,
  User,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Moon,
  Sun,
  History,
  Search,
  HelpCircle,
  FileText,
  GitCommit,
  CircleDot,
  Package,
  GitPullRequest,
  Gauge,
} from "lucide-react";

export type ActiveTab =
  | "dashboard"
  | "codegen"
  | "readme"
  | "activity"
  | "issues"
  | "dependencies"
  | "cicd"
  | "review"
  | "performance"
  | "github"
  | "metrics"
  | "debugger"
  | "vscode"
  | "workspace"
  | "profile";

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  hasApiKey: boolean;
  githubConnected: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenCommandPalette: () => void;
  onOpenHistory: () => void;
  onOpenShortcuts: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onOpenAuth,
  onLogout,
  hasApiKey,
  githubConnected,
  theme,
  onToggleTheme,
  onOpenCommandPalette,
  onOpenHistory,
  onOpenShortcuts,
  historyCount,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: "codegen", label: "AI Generator", icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" /> },
    { id: "readme", label: "Pro README", icon: <FileText className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: "activity", label: "GitHub Live", icon: <GitCommit className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: "issues", label: "Live Issues", icon: <CircleDot className="w-3.5 h-3.5 text-amber-400" /> },
    { id: "dependencies", label: "Dependencies", icon: <Package className="w-3.5 h-3.5 text-blue-400" /> },
    { id: "cicd", label: "CI/CD Pipeline", icon: <Cpu className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: "review", label: "Agent Review", icon: <GitPullRequest className="w-3.5 h-3.5 text-purple-400" /> },
    { id: "performance", label: "Performance", icon: <Gauge className="w-3.5 h-3.5 text-emerald-400" /> },
    {
      id: "github",
      label: "GitHub Sync",
      icon: <Github className="w-3.5 h-3.5" />,
      badge: githubConnected ? "Connected" : undefined,
    },
    { id: "metrics", label: "Repo Metrics", icon: <Activity className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: "debugger", label: "Debugger", icon: <Bug className="w-3.5 h-3.5 text-amber-400" /> },
    { id: "vscode", label: "VS Code", icon: <Terminal className="w-3.5 h-3.5 text-sky-400" /> },
    { id: "workspace", label: "Code Studio", icon: <Code2 className="w-3.5 h-3.5 text-violet-400" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div
          onClick={() => onTabChange("dashboard")}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-100 text-sm tracking-tight">Autonomous Studio</span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Staff AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Senior Full-Stack Workbench</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-0.5 p-1 bg-slate-900/90 border border-slate-800/80 rounded-xl overflow-x-auto max-w-[55%]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-slate-800 text-white font-semibold shadow-sm shadow-slate-950"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Tools, Theme Toggle, Command Palette, Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Command Palette Trigger (Cmd+K) */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
            title="Command Palette (⌘K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden md:inline">Quick Jump</span>
            <kbd className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title={`Theme: ${theme.toUpperCase()} (⌘T)`}
          >
            {theme === "light" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : theme === "midnight" ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* Recent Files & History Drawer */}
          <button
            onClick={onOpenHistory}
            className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="History & Recent Files (⌘⇧H)"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-[9px] font-bold text-white flex items-center justify-center">
                {historyCount > 9 ? "9+" : historyCount}
              </span>
            )}
          </button>

          {/* Keyboard Shortcuts Trigger */}
          <button
            onClick={onOpenShortcuts}
            className="hidden md:flex p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User Profile / Auth */}
          <div className="relative">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden sm:block text-left text-xs">
                    <div className="font-semibold text-slate-200 leading-tight truncate max-w-[110px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                      {currentUser.role.split(" ")[0]}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 space-y-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="pb-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-slate-200">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                        {currentUser.role}
                      </span>
                    </div>

                    <div className="py-1 border-b border-slate-800">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          onTabChange("profile");
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-200 hover:bg-slate-800 text-xs font-medium transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        Profile Dashboard & Settings
                      </button>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between py-1 px-2 text-slate-300">
                        <span className="flex items-center gap-2">
                          <Github className="w-3.5 h-3.5" /> GitHub Sync
                        </span>
                        <span className="font-mono text-[11px] text-emerald-400">
                          {githubConnected ? "Connected" : "Not Linked"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 px-2 text-slate-300">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Gemini API
                        </span>
                        <span className="font-mono text-[11px] text-emerald-400">
                          {hasApiKey ? "Active" : "Ready"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
