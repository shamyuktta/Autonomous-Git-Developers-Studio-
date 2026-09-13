// path: src/components/CodeEditorView.tsx
import React, { useState, useEffect } from "react";
import { Copy, Check, Terminal, Play, Zap, Sparkles, Bug, FileCheck } from "lucide-react";
import { VirtualFile } from "../types/studio";

interface CodeEditorViewProps {
  file: VirtualFile | null;
  onUpdateContent: (content: string) => void;
  onSendToDebugger: (file: VirtualFile) => void;
  onSendToHighThinking: (file: VirtualFile) => void;
  onRunFastLint: (file: VirtualFile) => void;
}

export const CodeEditorView: React.FC<CodeEditorViewProps> = ({
  file,
  onUpdateContent,
  onSendToDebugger,
  onSendToHighThinking,
  onRunFastLint,
}) => {
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState(file ? file.content : "");

  useEffect(() => {
    setCode(file ? file.content : "");
  }, [file]);

  if (!file) {
    return (
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl h-full flex flex-col items-center justify-center text-zinc-500 p-8">
        <Terminal className="w-12 h-12 text-zinc-700 mb-3" />
        <p className="text-sm font-medium text-zinc-400">No file selected in workspace.</p>
        <p className="text-xs text-zinc-500 mt-1">Select a file from the tree or load a test scenario above.</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = code.split("\n").length;

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl flex flex-col h-full overflow-hidden">
      {/* File Header Bar */}
      <div className="px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/70 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-zinc-500">File:</span>
          <span className="text-emerald-400 font-semibold">{file.path}</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400">
            {file.language}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-500 text-[11px]">{lineCount} lines</span>
        </div>

        {/* Quick AI Action Triggers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onRunFastLint(file)}
            className="flex items-center gap-1 text-[11px] font-medium py-1 px-2.5 rounded bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 border border-amber-800/60 transition-colors"
            title="Rapid AST & syntax audit via gemini-3.1-flash-lite"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Fast Lint</span>
          </button>

          <button
            onClick={() => onSendToDebugger(file)}
            className="flex items-center gap-1 text-[11px] font-medium py-1 px-2.5 rounded bg-red-950/60 hover:bg-red-900/70 text-red-300 border border-red-800/60 transition-colors"
            title="Line-by-line root-cause debugger"
          >
            <Bug className="w-3 h-3 text-red-400" />
            <span>Debug</span>
          </button>

          <button
            onClick={() => onSendToHighThinking(file)}
            className="flex items-center gap-1 text-[11px] font-medium py-1 px-2.5 rounded bg-purple-950/60 hover:bg-purple-900/70 text-purple-300 border border-purple-800/60 transition-colors"
            title="Deep architectural reasoning via gemini-3.1-pro-preview"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>High Thinking</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="flex-1 flex overflow-hidden font-mono text-xs">
        {/* Line Numbers */}
        <div className="py-3 px-3 bg-zinc-950/40 text-zinc-600 select-none border-r border-zinc-800/60 text-right shrink-0">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-5 h-5 text-[11px]">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            onUpdateContent(e.target.value);
          }}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-zinc-200 leading-5 resize-none outline-none overflow-auto font-mono whitespace-pre"
        />
      </div>

      {/* Bottom Status */}
      <div className="px-4 py-1.5 border-t border-zinc-800/60 bg-zinc-950/50 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
        <span className="flex items-center gap-1">
          <FileCheck className="w-3 h-3 text-emerald-400" /> Complete code enforcement: Active (No placeholders)
        </span>
        <span>UTF-8 • Strict TypeScript</span>
      </div>
    </div>
  );
};
