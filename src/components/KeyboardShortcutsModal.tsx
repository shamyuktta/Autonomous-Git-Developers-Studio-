// path: src/components/KeyboardShortcutsModal.tsx
import React from "react";
import { Keyboard, X, Command, Sparkles } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      group: "Navigation",
      items: [
        { label: "Dashboard", keys: ["⌘", "1"] },
        { label: "AI Code Generator & Models", keys: ["⌘", "2"] },
        { label: "GitHub Sync & Dedup", keys: ["⌘", "3"] },
        { label: "GitHub Codebase Metrics", keys: ["⌘", "4"] },
        { label: "Project File Debugger", keys: ["⌘", "5"] },
        { label: "VS Code Bridge", keys: ["⌘", "6"] },
        { label: "Code Studio Workspace", keys: ["⌘", "7"] },
        { label: "Pro README.md Generator", keys: ["⌘", "8"] },
        { label: "GitHub Live Activity & Commits", keys: ["⌘", "9"] },
      ],
    },
    {
      group: "Quick Tools & Actions",
      items: [
        { label: "Open Command Palette", keys: ["⌘", "K"] },
        { label: "Toggle Theme (Dark/Light/Midnight)", keys: ["⌘", "T"] },
        { label: "Open Recent Files & History", keys: ["⌘", "⇧", "H"] },
        { label: "Show Keyboard Shortcuts", keys: ["?"] },
        { label: "Close Modal / Cancel", keys: ["Esc"] },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Keyboard Shortcuts</h3>
              <p className="text-[11px] text-slate-400">Master autonomous engineering with quick keybindings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {shortcutGroups.map((group) => (
            <div key={group.group} className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {group.group}
              </div>
              <div className="divide-y divide-slate-800/60 border border-slate-800/80 rounded-xl bg-slate-950/40 overflow-hidden">
                {group.items.map((item) => (
                  <div
                    key={item.label}
                    className="px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-300"
                  >
                    <span>{item.label}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-200 shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
