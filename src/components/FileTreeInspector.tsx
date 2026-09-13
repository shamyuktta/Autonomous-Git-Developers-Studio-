// path: src/components/FileTreeInspector.tsx
import React, { useState } from "react";
import {
  FolderTree,
  FileCode,
  AlertTriangle,
  Trash2,
  Plus,
  Layers,
  UploadCloud,
  FileCheck2,
  FileSpreadsheet,
} from "lucide-react";
import { VirtualFile } from "../types/studio";

interface FileTreeInspectorProps {
  files: VirtualFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onPurgeDeadFiles: () => void;
  onAddFile: (path: string, content: string) => void;
  onTriggerDeduplicationScan: () => void;
}

export const FileTreeInspector: React.FC<FileTreeInspectorProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onDeleteFile,
  onPurgeDeadFiles,
  onAddFile,
  onTriggerDeduplicationScan,
}) => {
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFilePath, setNewFilePath] = useState("");

  const deadFiles = files.filter((f) => f.isDeadFile || f.path.endsWith(".bak") || f.path.includes("-copy"));
  const duplicateFiles = files.filter((f) => f.isDuplicate);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilePath.trim()) return;
    const cleanPath = newFilePath.trim().startsWith("/") ? newFilePath.trim().slice(1) : newFilePath.trim();
    onAddFile(cleanPath, `// path: ${cleanPath}\n\nexport const placeholder = true;\n`);
    setNewFilePath("");
    setIsAddingFile(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded || uploaded.length === 0) return;
    Array.from(uploaded).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onAddFile(`uploaded/${file.name}`, text || `// path: uploaded/${file.name}\n`);
      };
      reader.readAsText(file);
    });
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl flex flex-col h-full overflow-hidden">
      {/* Header Bar */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Workspace Tree
          </span>
          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
            {files.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAddingFile(!isAddingFile)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Create new file"
          >
            <Plus className="w-4 h-4" />
          </button>
          <label className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer" title="Upload local files">
            <UploadCloud className="w-4 h-4" />
            <input type="file" multiple onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Deduplication & Dead File Alert Banner */}
      {(deadFiles.length > 0 || duplicateFiles.length > 0) && (
        <div className="bg-amber-950/40 border-b border-amber-900/50 p-2.5 flex flex-col gap-2">
          <div className="flex items-start gap-2 text-xs text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Repository Hygiene Alert:</span>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                Found {deadFiles.length} obsolete file(s) and {duplicateFiles.length} duplicate file pattern(s).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {deadFiles.length > 0 && (
              <button
                onClick={onPurgeDeadFiles}
                className="flex-1 text-[11px] font-medium py-1 px-2 rounded bg-amber-900/60 hover:bg-amber-800/80 text-amber-100 border border-amber-700/60 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Purge Dead Files ({deadFiles.length})</span>
              </button>
            )}
            <button
              onClick={onTriggerDeduplicationScan}
              className="flex-1 text-[11px] font-medium py-1 px-2 rounded bg-blue-900/60 hover:bg-blue-800/80 text-blue-100 border border-blue-700/60 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Layers className="w-3 h-3" />
              <span>Deduplicate Modules</span>
            </button>
          </div>
        </div>
      )}

      {/* New File Inline Form */}
      {isAddingFile && (
        <form onSubmit={handleCreateSubmit} className="p-2 border-b border-zinc-800 bg-zinc-950 flex gap-2">
          <input
            type="text"
            value={newFilePath}
            onChange={(e) => setNewFilePath(e.target.value)}
            placeholder="src/utils/newModule.ts"
            className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs rounded px-2 py-1 outline-none focus:border-emerald-500 font-mono"
            autoFocus
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1 rounded font-medium"
          >
            Add
          </button>
        </form>
      )}

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {files.map((file) => {
          const isActive = file.id === activeFileId;
          const isDead = file.isDeadFile || file.path.endsWith(".bak") || file.path.includes("-copy");

          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all ${
                isActive
                  ? "bg-zinc-800 text-zinc-100 border border-zinc-700 font-medium"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <FileCode
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isDead
                      ? "text-red-400"
                      : file.isDuplicate
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                />
                <span className={`truncate ${isDead ? "line-through opacity-70" : ""}`}>
                  {file.path}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {file.isDuplicate && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60">
                    dup
                  </span>
                )}
                {isDead && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/60">
                    dead
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(file.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-0.5 transition-opacity"
                  title="Delete file"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="px-3 py-2 border-t border-zinc-800/80 bg-zinc-950/40 text-[11px] text-zinc-500 font-mono flex items-center justify-between">
        <span>Cleanliness Protocol: STRICT</span>
        <span className="text-emerald-400/80 flex items-center gap-1">
          <FileCheck2 className="w-3 h-3" /> Minimal tree
        </span>
      </div>
    </div>
  );
};
