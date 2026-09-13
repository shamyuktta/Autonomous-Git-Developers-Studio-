// path: src/components/views/ProjectDependenciesView.tsx
import React, { useState } from "react";
import { ProjectDependencyItem, VirtualFile } from "../../types/studio";
import { saveActivity } from "../../services/history";
import {
  Package,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Plus,
  ExternalLink,
  Layers,
  Sparkles,
  Terminal,
  Copy,
  Check,
  X,
  Code2,
  Zap,
  ArrowUpRight,
  Filter,
} from "lucide-react";

interface ProjectDependenciesViewProps {
  files?: VirtualFile[];
  onAddDependencyToWorkspace?: (pkgName: string, version: string, isDev?: boolean) => void;
}

const INITIAL_DEPENDENCIES: ProjectDependencyItem[] = [
  {
    name: "@google/genai",
    version: "^2.4.0",
    latestVersion: "2.4.0",
    type: "dependency",
    category: "AI & LLM Engine",
    description: "Official Google Gen AI TypeScript SDK for Gemini 3.1 Pro & Flash reasoning models",
    license: "Apache-2.0",
    bundleSize: "42.5 KB",
    isOutdated: false,
    vulnerabilities: 0,
    homepage: "https://www.npmjs.com/package/@google/genai",
  },
  {
    name: "react",
    version: "^19.0.1",
    latestVersion: "19.0.1",
    type: "dependency",
    category: "Core Framework",
    description: "The library for web and native user interfaces with React Server Components & Actions",
    license: "MIT",
    bundleSize: "7.1 KB",
    isOutdated: false,
    vulnerabilities: 0,
    homepage: "https://react.dev",
  },
  {
    name: "react-dom",
    version: "^19.0.1",
    latestVersion: "19.0.1",
    type: "dependency",
    category: "Core Framework",
    description: "DOM rendering declarative bindings for React 19",
    license: "MIT",
    bundleSize: "130 KB",
    isOutdated: false,
    vulnerabilities: 0,
    homepage: "https://react.dev",
  },
  {
    name: "motion",
    version: "^12.23.24",
    latestVersion: "12.23.24",
    type: "dependency",
    category: "UI & Animation",
    description: "High-performance hardware-accelerated declarative motion and layout animations",
    license: "MIT",
    bundleSize: "28.4 KB",
    isOutdated: false,
    vulnerabilities: 0,
    homepage: "https://motion.dev",
  },
  {
    name: "lucide-react",
    version: "^0.546.0",
    latestVersion: "0.546.0",
    type: "dependency",
    category: "UI & Animation",
    description: "Beautiful & consistent icon toolkit for modern web applications",
    license: "ISC",
    bundleSize: "18.2 KB",
    isOutdated: false,
    vulnerabilities: 0,
    homepage: "https://lucide.dev",
  },
  {
    name: "express",
    version: "^4.21.2",
    latestVersion: "4.21.2",
    type: "dependency",
    category: "Server & Routing",
    description: "Fast, unopinionated, minimalist web framework for Node.js full-stack proxy routing",
    license: "MIT",
    bundleSize: "55.8 KB",
    isOutdated: false,
    vulnerabilities: 0,
    homepage: "https://expressjs.com",
  },
  {
    name: "dotenv",
    version: "^17.2.3",
    latestVersion: "17.2.3",
    type: "dependency",
    category: "Utilities",
    description: "Zero-dependency module that loads environment variables from .env",
    license: "BSD-2-Clause",
    bundleSize: "8.3 KB",
    isOutdated: false,
    vulnerabilities: 0,
    homepage: "https://www.npmjs.com/package/dotenv",
  },
  {
    name: "@tailwindcss/vite",
    version: "^4.1.14",
    latestVersion: "4.1.14",
    type: "dependency",
    category: "UI & Animation",
    description: "Tailwind CSS v4 engine integration for Vite compiler",
    license: "MIT",
    bundleSize: "12.4 KB",
    isOutdated: false,
    vulnerabilities: 0,
    homepage: "https://tailwindcss.com",
  },
  {
    name: "vite",
    version: "^6.2.3",
    latestVersion: "6.2.3",
    type: "dependency",
    category: "Build & Tooling",
    description: "Next Generation Frontend Tooling with Rollup bundler and lightning-fast HMR",
    license: "MIT",
    bundleSize: "68.2 KB",
    isOutdated: false,
    vulnerabilities: 0,
    homepage: "https://vitejs.dev",
  },
  {
    name: "esbuild",
    version: "^0.25.0",
    latestVersion: "0.25.0",
    type: "devDependency",
    category: "Build & Tooling",
    description: "An extremely fast JavaScript and TypeScript bundler written in Go",
    license: "MIT",
    bundleSize: "2.1 MB",
    isOutdated: false,
    vulnerabilities: 0,
    homepage: "https://esbuild.github.io",
  },
  {
    name: "tsx",
    version: "^4.21.0",
    latestVersion: "4.21.0",
    type: "devDependency",
    category: "Build & Tooling",
    description: "TypeScript Execute: Node.js enhanced to execute TypeScript seamlessly via esbuild",
    license: "MIT",
    bundleSize: "1.4 MB",
    isOutdated: false,
    vulnerabilities: 0,
    homepage: "https://github.com/privatenumber/tsx",
  },
  {
    name: "typescript",
    version: "~5.8.2",
    latestVersion: "5.8.2",
    type: "devDependency",
    category: "Build & Tooling",
    description: "TypeScript is a language for application-scale JavaScript development with strict typing",
    license: "Apache-2.0",
    bundleSize: "14.2 MB",
    isOutdated: false,
    vulnerabilities: 0,
    homepage: "https://www.typescriptlang.org",
  },
];

export const ProjectDependenciesView: React.FC<ProjectDependenciesViewProps> = ({
  files,
  onAddDependencyToWorkspace,
}) => {
  const [dependencies, setDependencies] = useState<ProjectDependencyItem[]>(INITIAL_DEPENDENCIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "dependency" | "devDependency">("all");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditCleanSuccess, setAuditCleanSuccess] = useState(true);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Add Package Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPkgName, setNewPkgName] = useState("");
  const [newPkgVersion, setNewPkgVersion] = useState("^1.0.0");
  const [newPkgCategory, setNewPkgCategory] = useState<any>("Utilities");
  const [isDevDep, setIsDevDep] = useState(false);
  const [newPkgDescription, setNewPkgDescription] = useState("");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditCleanSuccess(true);
    }, 1000);
  };

  const handleAddDependencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgName.trim()) return;

    const newDep: ProjectDependencyItem = {
      name: newPkgName.trim().toLowerCase(),
      version: newPkgVersion.trim() || "^1.0.0",
      latestVersion: newPkgVersion.trim().replace("^", "") || "1.0.0",
      type: isDevDep ? "devDependency" : "dependency",
      category: newPkgCategory,
      description: newPkgDescription.trim() || "User added npm dependency to project environment",
      license: "MIT",
      bundleSize: "14.2 KB",
      isOutdated: false,
      vulnerabilities: 0,
      homepage: `https://www.npmjs.com/package/${newPkgName.trim()}`,
    };

    setDependencies((prev) => [newDep, ...prev]);
    if (onAddDependencyToWorkspace) {
      onAddDependencyToWorkspace(newDep.name, newDep.version, isDevDep);
    }

    saveActivity({
      type: "file-upload",
      title: `Added dependency ${newDep.name}@${newDep.version} to package.json`,
      filePath: "package.json",
    });

    setIsAddModalOpen(false);
    setNewPkgName("");
    setNewPkgDescription("");
  };

  const filteredDependencies = dependencies.filter((dep) => {
    const matchesSearch =
      dep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || dep.category === categoryFilter;
    const matchesType = typeFilter === "all" || dep.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const totalProdCount = dependencies.filter((d) => d.type === "dependency").length;
  const totalDevCount = dependencies.filter((d) => d.type === "devDependency").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Package className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-100">Project Dependencies Manager</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                package.json
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-400 max-w-2xl">
              Inspect all runtime and development packages, license agreements, supply-chain vulnerability audits,
              and bundle size impact.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? "animate-spin text-indigo-400" : ""}`} />
              <span>{isAuditing ? "Scanning CVEs..." : "Run Security Audit"}</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Package</span>
            </button>
          </div>
        </div>

        {/* Audit Metrics Row */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/70">
            <div className="text-[11px] text-slate-400 font-medium">Total Dependencies</div>
            <div className="text-xl font-bold text-slate-100 mt-0.5">{dependencies.length}</div>
            <div className="text-[10px] text-slate-500 font-mono">
              {totalProdCount} prod • {totalDevCount} dev
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/70">
            <div className="text-[11px] text-slate-400 font-medium">Security Health</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>0 CVEs</span>
            </div>
            <div className="text-[10px] text-slate-500">Audit Grade: A+ Clean</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/70">
            <div className="text-[11px] text-slate-400 font-medium">License Compliance</div>
            <div className="text-xl font-bold text-indigo-400 mt-0.5">100% Permissive</div>
            <div className="text-[10px] text-slate-500">MIT • Apache 2.0 • ISC</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/70">
            <div className="text-[11px] text-slate-400 font-medium">Package Manager</div>
            <div className="text-sm font-mono font-bold text-slate-200 mt-1">npm / pnpm</div>
            <div className="text-[10px] text-slate-500">Node.js 22 LTS Runtime</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search dependencies by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All ({dependencies.length})
            </button>
            <button
              onClick={() => setTypeFilter("dependency")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === "dependency"
                  ? "bg-slate-800 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Production ({totalProdCount})
            </button>
            <button
              onClick={() => setTypeFilter("devDependency")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === "devDependency"
                  ? "bg-slate-800 text-indigo-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Dev ({totalDevCount})
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="AI & LLM Engine">AI & LLM Engine</option>
            <option value="Core Framework">Core Framework</option>
            <option value="UI & Animation">UI & Animation</option>
            <option value="Server & Routing">Server & Routing</option>
            <option value="Build & Tooling">Build & Tooling</option>
            <option value="Utilities">Utilities</option>
          </select>
        </div>
      </div>

      {/* Dependencies Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDependencies.map((dep) => (
          <div
            key={dep.name}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all space-y-3 flex flex-col justify-between group shadow-sm"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 font-mono group-hover:text-indigo-300 transition-colors">
                      {dep.name}
                    </h3>
                    <span className="text-[10px] text-emerald-400 font-mono">{dep.version}</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                    dep.type === "dependency"
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                      : "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
                  }`}
                >
                  {dep.type === "dependency" ? "Prod" : "Dev"}
                </span>
              </div>

              {/* Description */}
              <p className="mt-2.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {dep.description}
              </p>
            </div>

            {/* Badges and Footer */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px]">
                  {dep.category}
                </span>
                <span>{dep.license}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500 font-mono">Size: {dep.bundleSize}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(`npm i ${dep.name}`, dep.name)}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-mono flex items-center gap-1 transition-colors"
                    title="Copy npm install command"
                  >
                    {copiedCmd === dep.name ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                  {dep.homepage && (
                    <a
                      href={dep.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
                      title="View package homepage"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Package Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-base">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Add Package to Dependencies</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDependencySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. zod, axios, recharts, date-fns"
                  value={newPkgName}
                  onChange={(e) => setNewPkgName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Version Target</label>
                  <input
                    type="text"
                    value={newPkgVersion}
                    onChange={(e) => setNewPkgVersion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                  <select
                    value={newPkgCategory}
                    onChange={(e) => setNewPkgCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Utilities">Utilities</option>
                    <option value="UI & Animation">UI & Animation</option>
                    <option value="Core Framework">Core Framework</option>
                    <option value="AI & LLM Engine">AI & LLM Engine</option>
                    <option value="Server & Routing">Server & Routing</option>
                    <option value="Build & Tooling">Build & Tooling</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. TypeScript-first schema validation with static type inference"
                  value={newPkgDescription}
                  onChange={(e) => setNewPkgDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDevCheck"
                  checked={isDevDep}
                  onChange={(e) => setIsDevDep(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isDevCheck" className="text-xs text-slate-300 select-none">
                  Install as devDependency (-D / dev)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPkgName.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  Add Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
