// path: src/components/CommandPalette.tsx
import React, { useState, useEffect } from "react";
import { ActiveTab } from "./Navbar";
import {
  Search,
  LayoutDashboard,
  Sparkles,
  Github,
  Activity,
  Bug,
  Terminal,
  Code2,
  Moon,
  Sun,
  History,
  Trash2,
  Layers,
  HelpCircle,
  X,
  ArrowRight,
  FileText,
  GitCommit,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ActiveTab) => void;
  onToggleTheme: () => void;
  onOpenHistory: () => void;
  onOpenShortcuts: () => void;
  onPurgeDeadFiles: () => void;
  onConsolidateDuplicates: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onToggleTheme,
  onOpenHistory,
  onOpenShortcuts,
  onPurgeDeadFiles,
  onConsolidateDuplicates,
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // handled in parent or toggle
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    {
      id: "nav-dashboard",
      title: "Go to Dashboard",
      category: "Navigation",
      icon: <LayoutDashboard className="w-4 h-4 text-indigo-400" />,
      shortcut: "⌘1",
      action: () => {
        onNavigate("dashboard");
        onClose();
      },
    },
    {
      id: "nav-codegen",
      title: "Go to AI Production Code Generator",
      category: "Navigation",
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      shortcut: "⌘2",
      action: () => {
        onNavigate("codegen");
        onClose();
      },
    },
    {
      id: "nav-readme",
      title: "Go to AI-Based Pro README.md Generator",
      category: "Navigation",
      icon: <FileText className="w-4 h-4 text-emerald-400" />,
      shortcut: "⌘8",
      action: () => {
        onNavigate("readme");
        onClose();
      },
    },
    {
      id: "nav-activity",
      title: "Go to Real-Time GitHub Activity & Commit Tracker",
      category: "Navigation",
      icon: <GitCommit className="w-4 h-4 text-indigo-400" />,
      shortcut: "⌘9",
      action: () => {
        onNavigate("activity");
        onClose();
      },
    },
    {
      id: "nav-github",
      title: "Go to GitHub Sync & Auto-Dedup",
      category: "Navigation",
      icon: <Github className="w-4 h-4 text-emerald-400" />,
      shortcut: "⌘3",
      action: () => {
        onNavigate("github");
        onClose();
      },
    },
    {
      id: "nav-metrics",
      title: "Go to GitHub Repository Metrics",
      category: "Navigation",
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
      shortcut: "⌘4",
      action: () => {
        onNavigate("metrics");
        onClose();
      },
    },
    {
      id: "nav-debugger",
      title: "Go to Project File Debugger",
      category: "Navigation",
      icon: <Bug className="w-4 h-4 text-amber-400" />,
      shortcut: "⌘5",
      action: () => {
        onNavigate("debugger");
        onClose();
      },
    },
    {
      id: "nav-vscode",
      title: "Go to VS Code Extension Bridge",
      category: "Navigation",
      icon: <Terminal className="w-4 h-4 text-sky-400" />,
      shortcut: "⌘6",
      action: () => {
        onNavigate("vscode");
        onClose();
      },
    },
    {
      id: "nav-workspace",
      title: "Go to Code Studio Workspace",
      category: "Navigation",
      icon: <Code2 className="w-4 h-4 text-violet-400" />,
      shortcut: "⌘7",
      action: () => {
        onNavigate("workspace");
        onClose();
      },
    },
    {
      id: "act-theme",
      title: "Toggle Theme (Dark / Light / Midnight)",
      category: "Actions",
      icon: <Moon className="w-4 h-4 text-amber-400" />,
      shortcut: "⌘T",
      action: () => {
        onToggleTheme();
        onClose();
      },
    },
    {
      id: "act-history",
      title: "Open Recent Files & History Tracker",
      category: "Actions",
      icon: <History className="w-4 h-4 text-indigo-400" />,
      shortcut: "⌘⇧H",
      action: () => {
        onOpenHistory();
        onClose();
      },
    },
    {
      id: "act-purge",
      title: "Purge Dead & Obsolete Files (*.bak)",
      category: "Actions",
      icon: <Trash2 className="w-4 h-4 text-rose-400" />,
      action: () => {
        onPurgeDeadFiles();
        onClose();
      },
    },
    {
      id: "act-dedup",
      title: "Consolidate Duplicate Modules",
      category: "Actions",
      icon: <Layers className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onConsolidateDuplicates();
        onClose();
      },
    },
    {
      id: "act-shortcuts",
      title: "View All Keyboard Shortcuts",
      category: "Help",
      icon: <HelpCircle className="w-4 h-4 text-slate-400" />,
      shortcut: "?",
      action: () => {
        onOpenShortcuts();
        onClose();
      },
    },
  ];

  const filtered = items.filter(
    (i) =>
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      i.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Search input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to view..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-96 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No matching commands found.</div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 flex items-center justify-between text-xs text-slate-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-slate-700">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-medium text-slate-200 group-hover:text-white">{item.title}</div>
                    <div className="text-[10px] text-slate-500">{item.category}</div>
                  </div>
                </div>

                {item.shortcut && (
                  <kbd className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 shadow-sm">
                    {item.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Navigate with ⌘K</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};
