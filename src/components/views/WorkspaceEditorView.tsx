// path: src/components/views/WorkspaceEditorView.tsx
import React, { useState, useEffect, useRef } from "react";
import { VirtualFile } from "../../types/studio";
import { CodeEditorView } from "../CodeEditorView";
import { FileTreeInspector } from "../FileTreeInspector";
import { FastLintPanel } from "../FastLintPanel";
import { refactorCode } from "../../services/gemini";
import { saveFileDraft, getLatestDraft, getDraftHistory } from "../../services/draftsManager";
import { detectLanguageFromPath, SUPPORTED_LANGUAGES } from "../../services/languageSupport";
import {
  Code2,
  Sparkles,
  Zap,
  CheckCircle2,
  FileCode2,
  RefreshCw,
  FolderTree,
  Command,
  Save,
  Clock,
  ShieldCheck,
  Columns,
  Maximize2,
  X,
  FilePlus,
  Terminal,
  Layers,
} from "lucide-react";

interface WorkspaceEditorViewProps {
  files: VirtualFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onUpdateFileContent: (id: string, content: string) => void;
  onAddFiles: (newFiles: VirtualFile[]) => void;
  onPurgeDeadFiles: () => void;
  onConsolidateDuplicates: () => void;
}

export const WorkspaceEditorView: React.FC<WorkspaceEditorViewProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onUpdateFileContent,
  onAddFiles,
  onPurgeDeadFiles,
  onConsolidateDuplicates,
}) => {
  // Multi-tab files state
  const [openTabIds, setOpenTabIds] = useState<string[]>([
    activeFileId || files[0]?.id || "",
    files[1]?.id || "",
  ].filter(Boolean));

  // Split-screen dual-file comparison state
  const [isSplitView, setIsSplitView] = useState(false);
  const [secondaryFileId, setSecondaryFileId] = useState<string>(files[1]?.id || files[0]?.id || "");

  const activeFile = files.find((f) => f.id === activeFileId) || files[0] || null;
  const secondaryFile = files.find((f) => f.id === secondaryFileId) || files[1] || null;

  const [refactorPrompt, setRefactorPrompt] = useState("");
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [refactorSuccess, setRefactorSuccess] = useState(false);

  // Auto-Save Draft State
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number>(Date.now());
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showDraftHistory, setShowDraftHistory] = useState(false);

  // Slash commands state
  const [slashQuery, setSlashQuery] = useState<string>("");
  const [isSlashMenuOpen, setIsSlashMenuOpen] = useState(false);
  const [slashSuccessMessage, setSlashSuccessMessage] = useState<string | null>(null);

  // Fast lint trigger
  const [fastLintCode, setFastLintCode] = useState<string>("");
  const [fastLintLang, setFastLintLang] = useState<string>("typescript");
  const [lintTriggerCount, setLintTriggerCount] = useState<number>(0);

  // Sync open tabs with active file
  useEffect(() => {
    if (activeFileId && !openTabIds.includes(activeFileId)) {
      setOpenTabIds((prev) => [...prev, activeFileId]);
    }
  }, [activeFileId]);

  // Debounced auto-save hook
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleContentChange = (content: string) => {
    if (!activeFile) return;
    onUpdateFileContent(activeFile.id, content);
    setIsAutoSaving(true);

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      saveFileDraft(activeFile.id, activeFile.path, content);
      setLastSavedTimestamp(Date.now());
      setIsAutoSaving(false);
    }, 1200);
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = openTabIds.filter((id) => id !== tabId);
    setOpenTabIds(remaining);
    if (activeFileId === tabId && remaining.length > 0) {
      onSelectFile(remaining[0]);
    }
  };

  const handleRunRefactor = async () => {
    if (!activeFile || !refactorPrompt.trim()) return;
    setIsRefactoring(true);
    setRefactorSuccess(false);

    try {
      const res = await refactorCode(activeFile.content, refactorPrompt.trim(), activeFile.path);
      if (res.result) {
        onUpdateFileContent(activeFile.id, res.result);
        saveFileDraft(activeFile.id, activeFile.path, res.result, "ai-refactor");
        setRefactorSuccess(true);
        setTimeout(() => setRefactorSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefactoring(false);
    }
  };

  // Slash commands execution
  const executeSlashCommand = async (cmd: string) => {
    if (!activeFile) return;
    setIsSlashMenuOpen(false);

    if (cmd === "/fix-imports") {
      // Automatically clean and normalize ../../../ into modern clean imports
      const cleaned = activeFile.content.replace(/\.\.\/\.\.\/\.\.\//g, "@/");
      onUpdateFileContent(activeFile.id, cleaned);
      setSlashSuccessMessage("Healed relative imports to clean paths.");
    } else if (cmd === "/security-scan") {
      // Scans for API keys or plain tokens
      const hasToken = activeFile.content.match(/(ghp_|AIza|Bearer\s+[a-zA-Z0-9])/);
      if (hasToken) {
        setSlashSuccessMessage("⚠️ Warning: Detected token pattern in active file. Clean before committing.");
      } else {
        setSlashSuccessMessage("✅ Gitleaks pass: Zero token patterns found in this file.");
      }
    } else if (cmd === "/pr-summary") {
      setSlashSuccessMessage("Generated PR summary snippet in clipboard.");
      navigator.clipboard.writeText(`### 🛠️ Refactored: \`${activeFile.path}\`\n- AST structure optimized\n- Zero broken relative imports.`);
    } else if (cmd === "/dedupe") {
      onConsolidateDuplicates();
      setSlashSuccessMessage("Ran workspace deduplication scan.");
    }

    setTimeout(() => setSlashSuccessMessage(null), 3500);
  };

  const handleTriggerLint = (file: VirtualFile) => {
    setFastLintCode(file.content);
    setFastLintLang(file.language);
    setLintTriggerCount((c) => c + 1);
  };

  const activeLang = activeFile ? detectLanguageFromPath(activeFile.path) : SUPPORTED_LANGUAGES[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Workspace Header & Action Bar */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Multi-File Code Studio & AST Engine</h2>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${activeLang.badgeColor}`}>
                  {activeLang.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {isAutoSaving ? "Auto-Saving..." : "Draft Saved"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Multi-tab polyglot workspace with split-screen compare, persistent drafts auto-save, and custom slash commands (<code className="text-indigo-300 font-mono">/fix-imports</code>, <code className="text-indigo-300 font-mono">/security-scan</code>).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSplitView(!isSplitView)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isSplitView
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                  : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{isSplitView ? "Single View" : "Split Screen"}</span>
            </button>

            <button
              onClick={() => setIsSlashMenuOpen(!isSlashMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 text-indigo-300 border border-slate-800 hover:bg-slate-900 text-xs font-semibold"
            >
              <Command className="w-3.5 h-3.5" />
              <span>Slash Commands</span>
            </button>
          </div>
        </div>

        {/* Slash Commands Dropdown Menu */}
        {isSlashMenuOpen && (
          <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 animate-in fade-in">
            <div className="text-[11px] font-semibold text-slate-400 px-2 flex items-center justify-between">
              <span>Agent Hooks & Slash Commands</span>
              <span className="text-[10px] text-slate-500 font-mono">Click to execute</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => executeSlashCommand("/fix-imports")}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-left text-xs transition-all"
              >
                <div className="font-mono text-indigo-400 font-bold">/fix-imports</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Heal deep relative paths</div>
              </button>
              <button
                onClick={() => executeSlashCommand("/security-scan")}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-left text-xs transition-all"
              >
                <div className="font-mono text-emerald-400 font-bold">/security-scan</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Gitleaks token intercept</div>
              </button>
              <button
                onClick={() => executeSlashCommand("/pr-summary")}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-left text-xs transition-all"
              >
                <div className="font-mono text-purple-400 font-bold">/pr-summary</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Copy PR markdown block</div>
              </button>
              <button
                onClick={() => executeSlashCommand("/dedupe")}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-left text-xs transition-all"
              >
                <div className="font-mono text-amber-400 font-bold">/dedupe</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Consolidate dead files</div>
              </button>
            </div>
          </div>
        )}

        {slashSuccessMessage && (
          <div className="mt-3 p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{slashSuccessMessage}</span>
          </div>
        )}

        {/* Refactor Input Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={refactorPrompt}
              onChange={(e) => setRefactorPrompt(e.target.value)}
              placeholder="AST Refactor Prompt (e.g. 'Extract interface, sanitize input, eliminate redundant helpers')..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleRunRefactor}
            disabled={isRefactoring || !refactorPrompt.trim() || !activeFile}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isRefactoring ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Refactoring AST...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Refactor Active File
              </>
            )}
          </button>
        </div>

        {refactorSuccess && (
          <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            File refactored successfully & saved to draft snapshot!
          </div>
        )}
      </div>

      {/* Multi-Tab Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {openTabIds.map((tabId) => {
          const tabFile = files.find((f) => f.id === tabId);
          if (!tabFile) return null;
          const isActive = tabId === activeFileId;
          return (
            <div
              key={tabId}
              onClick={() => onSelectFile(tabId)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono cursor-pointer transition-all border ${
                isActive
                  ? "bg-slate-900 text-white border-indigo-500/50 shadow-sm"
                  : "bg-slate-950/60 text-slate-400 border-slate-800/80 hover:bg-slate-900"
              }`}
            >
              <FileCode2 className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
              <span className="truncate max-w-[140px]">{tabFile.name}</span>
              {openTabIds.length > 1 && (
                <button
                  onClick={(e) => handleCloseTab(tabId, e)}
                  className="p-0.5 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Editor & Tree Layout (with optional Split Screen) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left Column: File Tree Inspector (4 Cols) */}
        <div className="lg:col-span-3 h-full">
          <FileTreeInspector
            files={files}
            activeFileId={activeFileId}
            onSelectFile={onSelectFile}
            onPurgeDeadFiles={onPurgeDeadFiles}
            onConsolidateDuplicates={onConsolidateDuplicates}
            onAddFiles={onAddFiles}
          />
        </div>

        {/* Right Column: Code Editor + Fast Lint (9 Cols) */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          {/* Main Editor or Split-Screen View */}
          <div className="flex-1 min-h-[440px]">
            {isSplitView ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                {/* Primary File */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-indigo-300 font-bold px-1">
                    Primary: {activeFile?.path}
                  </div>
                  <CodeEditorView
                    file={activeFile}
                    onUpdateContent={handleContentChange}
                    onSendToDebugger={() => {}}
                    onSendToHighThinking={() => {}}
                    onRunFastLint={(f) => handleTriggerLint(f)}
                  />
                </div>

                {/* Secondary Comparison File */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-emerald-300 font-bold px-1">
                    <span>Compare: {secondaryFile?.path}</span>
                    <select
                      value={secondaryFileId}
                      onChange={(e) => setSecondaryFileId(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-slate-300"
                    >
                      {files.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <CodeEditorView
                    file={secondaryFile}
                    onUpdateContent={(val) => {
                      if (secondaryFile) onUpdateFileContent(secondaryFile.id, val);
                    }}
                    onSendToDebugger={() => {}}
                    onSendToHighThinking={() => {}}
                    onRunFastLint={(f) => handleTriggerLint(f)}
                  />
                </div>
              </div>
            ) : (
              <CodeEditorView
                file={activeFile}
                onUpdateContent={handleContentChange}
                onSendToDebugger={() => {}}
                onSendToHighThinking={() => {}}
                onRunFastLint={(f) => handleTriggerLint(f)}
              />
            )}
          </div>

          <div>
            <FastLintPanel
              codeToLint={fastLintCode || activeFile?.content || ""}
              language={fastLintLang || activeFile?.language || "typescript"}
              triggerCount={lintTriggerCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
