// path: src/components/views/GitHubResourcesView.tsx
import React, { useState } from "react";
import { GitHubLearningResource } from "../../types/studio";
import {
  BookOpen,
  Github,
  Star,
  GitFork,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  Code2,
  Terminal,
  Cpu,
  ShieldCheck,
  Sparkles,
  Layers,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";

export const CURATED_GITHUB_RESOURCES: GitHubLearningResource[] = [
  // BEGINNER LEVEL (Git Basics, Markdown, First PRs, Workflow)
  {
    id: "res-first-contributions",
    title: "First Contributions: Beginner Open Source Guide",
    repoName: "firstcontributions/first-contributions",
    repoUrl: "https://github.com/firstcontributions/first-contributions",
    stars: "45.2k",
    forks: "72.8k",
    level: "beginner",
    category: "Open Source Contribution",
    summary: "Hands-on step-by-step tutorial guiding beginners through making their first pull request on GitHub.",
    whyLearn: "Master the git branching model, fork workflows, remote upstream tracking, and opening mergeable PRs.",
    topics: ["git clone", "git branch", "git push", "Pull Requests", "Markdown"],
    cloneCommand: "git clone https://github.com/firstcontributions/first-contributions.git",
    curatedDocsUrl: "https://firstcontributions.github.io",
  },
  {
    id: "res-git-flight-rules",
    title: "Flight Rules for Git (Troubleshooting & Commands)",
    repoName: "k88hudson/git-flight-rules",
    repoUrl: "https://github.com/k88hudson/git-flight-rules",
    stars: "92.4k",
    forks: "4.8k",
    level: "beginner",
    category: "Git Fundamentals",
    summary: "The definitive guide for what to do when things go wrong in Git: recovering lost commits, undoing commits, and merge conflicts.",
    whyLearn: "Essential reference for daily git navigation, fixing detached HEAD states, stash recovery, and clean commit hygiene.",
    topics: ["git reflog", "git reset", "git stash", "merge conflicts", "commit undo"],
    cloneCommand: "git clone https://github.com/k88hudson/git-flight-rules.git",
  },
  {
    id: "res-markdown-cheatsheet",
    title: "Awesome README & Documentation Blueprints",
    repoName: "matiassingers/awesome-readme",
    repoUrl: "https://github.com/matiassingers/awesome-readme",
    stars: "22.5k",
    forks: "2.1k",
    level: "beginner",
    category: "Git Fundamentals",
    summary: "A curated collection of world-class README examples, badges, license embeds, and structural layouts.",
    whyLearn: "Learn how to write professional repository documentation like DocuGen AI that attracts stars and clarity.",
    topics: ["GitHub Badges", "README.md formatting", "Markdown tables", "Documentation specs"],
    cloneCommand: "git clone https://github.com/matiassingers/awesome-readme.git",
  },
  {
    id: "res-pro-git-book",
    title: "Pro Git (2nd Edition) Official Source Code",
    repoName: "progit/progit2",
    repoUrl: "https://github.com/progit/progit2",
    stars: "18.9k",
    forks: "7.1k",
    level: "beginner",
    category: "Git Fundamentals",
    summary: "The authoritative book on Git by Scott Chacon and Ben Straub, covering internal plumbing and everyday branching.",
    whyLearn: "Understand blobs, trees, commit objects, remotes, and how Git computes hashes under the hood.",
    topics: ["Git Internals", "Branching models", "Remote management", "Distributed workflows"],
    cloneCommand: "git clone https://github.com/progit/progit2.git",
  },

  // INTERMEDIATE LEVEL (GitHub Actions CI/CD, Monorepos, Testing Gates, Semantic Versioning)
  {
    id: "res-actions-starter",
    title: "GitHub Actions Official Starter Workflows",
    repoName: "actions/starter-workflows",
    repoUrl: "https://github.com/actions/starter-workflows",
    stars: "14.1k",
    forks: "6.9k",
    level: "intermediate",
    category: "CI/CD & Actions",
    summary: "Official workflow templates for building, testing, linting, and deploying across Python, Node.js, Go, Rust, and Docker.",
    whyLearn: "Learn how to write multi-stage pipelines, matrix testing, secret management, and artifact caching in YAML.",
    topics: ["YAML CI/CD", "actions/checkout", "Matrix builds", "Secret tokens", "Cloud Deploy"],
    cloneCommand: "git clone https://github.com/actions/starter-workflows.git",
  },
  {
    id: "res-clean-code-js",
    title: "Clean Code JavaScript & TypeScript Patterns",
    repoName: "ryanmcdermott/clean-code-javascript",
    repoUrl: "https://github.com/ryanmcdermott/clean-code-javascript",
    stars: "94.6k",
    forks: "12.3k",
    level: "intermediate",
    category: "Architecture & System Design",
    summary: "Software engineering principles, SOLID guidelines, and refactoring techniques adapted for modern JavaScript/TypeScript.",
    whyLearn: "Eliminate code smells, decouple modules, write testable functions, and avoid duplicate code debt.",
    topics: ["SOLID principles", "Function design", "DRY & deduplication", "Async handling"],
    cloneCommand: "git clone https://github.com/ryanmcdermott/clean-code-javascript.git",
  },
  {
    id: "res-gitleaks",
    title: "Gitleaks: Secret & Credential Detection in Git",
    repoName: "gitleaks/gitleaks",
    repoUrl: "https://github.com/gitleaks/gitleaks",
    stars: "19.8k",
    forks: "1.6k",
    level: "intermediate",
    category: "DevSecOps & Best Practices",
    summary: "Automated scanner for detecting hardcoded secrets like API keys, AWS credentials, and tokens in Git history.",
    whyLearn: "Integrate pre-commit hooks and GitHub Actions to enforce enterprise context sanitization rules.",
    topics: ["Pre-commit hooks", "Secret scanning", "DevSecOps", "AST regex regex rules"],
    cloneCommand: "git clone https://github.com/gitleaks/gitleaks.git",
  },
  {
    id: "res-semantic-release",
    title: "Semantic Release: Fully Automated Version Management",
    repoName: "semantic-release/semantic-release",
    repoUrl: "https://github.com/semantic-release/semantic-release",
    stars: "21.3k",
    forks: "1.7k",
    level: "intermediate",
    category: "CI/CD & Actions",
    summary: "Automates the whole package release workflow: determining next version numbers, generating release notes, and publishing git tags.",
    whyLearn: "Enforce conventional commit messages (`feat:`, `fix:`, `chore:`) and eliminate manual version bumping.",
    topics: ["Conventional Commits", "Changelog generation", "GitHub Releases", "SemVer"],
    cloneCommand: "git clone https://github.com/semantic-release/semantic-release.git",
  },

  // ADVANCED LEVEL (System Design, AST Compilers, Distributed Nodes, High-Throughput Engines)
  {
    id: "res-system-design-primer",
    title: "The System Design Primer (Scale to Millions)",
    repoName: "donnemartin/system-design-primer",
    repoUrl: "https://github.com/donnemartin/system-design-primer",
    stars: "288.4k",
    forks: "47.2k",
    level: "advanced",
    category: "Architecture & System Design",
    summary: "The global benchmark for learning how to design large-scale, high-availability, distributed systems.",
    whyLearn: "Master load balancing, CAP theorem, caching tiers (Redis), database sharding, asynchronous queues, and microservices.",
    topics: ["High Availability", "Distributed Consensus", "Message Queues", "Database Sharding"],
    cloneCommand: "git clone https://github.com/donnemartin/system-design-primer.git",
  },
  {
    id: "res-super-tiny-compiler",
    title: "The Super Tiny Compiler (AST & Code Transpilation)",
    repoName: "jamiebuilds/the-super-tiny-compiler",
    repoUrl: "https://github.com/jamiebuilds/the-super-tiny-compiler",
    stars: "27.5k",
    forks: "2.8k",
    level: "advanced",
    category: "AST & Compilers",
    summary: "An ultra-simplified, 200-line pedagogical JavaScript compiler explaining tokenizer, parser, AST transformation, and code generation.",
    whyLearn: "Understand how Babel, TypeScript, and DocuGen AI parse abstract syntax trees to generate architecture maps.",
    topics: ["AST Parsing", "Lexical Tokenizer", "AST Traverser", "Code Generation"],
    cloneCommand: "git clone https://github.com/jamiebuilds/the-super-tiny-compiler.git",
  },
  {
    id: "res-realworld-specs",
    title: "RealWorld: Production Full-Stack Architectural Specs",
    repoName: "gothinkster/realworld",
    repoUrl: "https://github.com/gothinkster/realworld",
    stars: "81.9k",
    forks: "7.6k",
    level: "advanced",
    category: "Architecture & System Design",
    summary: "The 'Mother of All Demo Apps' — shows identical full-stack Medium clone implemented across React, Node, Rust, Go, and GraphQL.",
    whyLearn: "Directly compare framework idioms, state management, and backend contracts with real-world production specs.",
    topics: ["Full-Stack Contracts", "API Specs", "Architectural Uniformity", "State Machines"],
    cloneCommand: "git clone https://github.com/gothinkster/realworld.git",
  },
  {
    id: "res-octokit",
    title: "Octokit.js: Official GitHub API SDK & App Engine",
    repoName: "octokit/octokit.js",
    repoUrl: "https://github.com/octokit/octokit.js",
    stars: "6.8k",
    forks: "850",
    level: "advanced",
    category: "CI/CD & Actions",
    summary: "The official GitHub SDK for Node.js, browsers, and Deno, powering bots, GitHub Apps, and direct Git tree manipulations.",
    whyLearn: "Build autonomous bots that create commits, pull requests, AST checks, and trigger remote workflows programmatically.",
    topics: ["GitHub REST & GraphQL API", "Webhooks", "OAuth Apps", "Commit Trees"],
    cloneCommand: "git clone https://github.com/octokit/octokit.js.git",
  },
];

export const GitHubResourcesView: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = Array.from(new Set(CURATED_GITHUB_RESOURCES.map((r) => r.category)));

  const filteredResources = CURATED_GITHUB_RESOURCES.filter((res) => {
    const matchesLevel = activeLevel === "all" || res.level === activeLevel;
    const matchesCategory = selectedCategory === "all" || res.category === selectedCategory;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      res.repoName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLevel && matchesCategory && matchesSearch;
  });

  const handleCopyCommand = (id: string, command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLevelBadge = (level: "beginner" | "intermediate" | "advanced") => {
    switch (level) {
      case "beginner":
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-semibold uppercase">
            🟢 Beginner
          </span>
        );
      case "intermediate":
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-semibold uppercase">
            🟡 Intermediate
          </span>
        );
      case "advanced":
        return (
          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-semibold uppercase">
            🔴 Advanced
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 font-semibold">
                <GraduationCap className="w-3 h-3" /> Learning Hub
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
                {CURATED_GITHUB_RESOURCES.length} Production Repositories
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5 tracking-tight">
              <Github className="w-6 h-6 text-white" />
              <span>GitHub Engineering Curriculum</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Curated, progressive open-source repositories organized strictly by learning order: from Git basics and workflow standards to AST compilers and million-user distributed architecture.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, repos, git..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 text-slate-200 text-xs border border-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Level Order Tab Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveLevel("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeLevel === "all" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Levels
            </button>
            <button
              onClick={() => setActiveLevel("beginner")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeLevel === "beginner" ? "bg-emerald-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>🟢 Beginner</span>
              <span className="text-[10px] opacity-75 font-mono">
                ({CURATED_GITHUB_RESOURCES.filter((r) => r.level === "beginner").length})
              </span>
            </button>
            <button
              onClick={() => setActiveLevel("intermediate")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeLevel === "intermediate" ? "bg-amber-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>🟡 Intermediate</span>
              <span className="text-[10px] opacity-75 font-mono">
                ({CURATED_GITHUB_RESOURCES.filter((r) => r.level === "intermediate").length})
              </span>
            </button>
            <button
              onClick={() => setActiveLevel("advanced")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeLevel === "advanced" ? "bg-rose-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>🔴 Advanced</span>
              <span className="text-[10px] opacity-75 font-mono">
                ({CURATED_GITHUB_RESOURCES.filter((r) => r.level === "advanced").length})
              </span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-500 text-[11px] font-mono mr-1">Category:</span>
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-slate-800 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-slate-800 text-indigo-400 border border-indigo-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Curated Repositories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between space-y-4 transition-all group"
          >
            <div>
              {/* Header: Badges & Stars */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  {getLevelBadge(resource.level)}
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700/80">
                    {resource.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400/20" /> {resource.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-3.5 h-3.5" /> {resource.forks}
                  </span>
                </div>
              </div>

              {/* Title & Link */}
              <a
                href={resource.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-base font-bold text-slate-100 group-hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
              >
                <span>{resource.title}</span>
                <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>

              <p className="text-xs font-mono text-indigo-400/80 mt-0.5">{resource.repoName}</p>

              {/* Summary */}
              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">{resource.summary}</p>

              {/* Why Learn Callout */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300">
                <strong className="text-indigo-300">Why Learn This:</strong> {resource.whyLearn}
              </div>

              {/* Topics Pills */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {resource.topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 font-mono text-[10px] border border-slate-800"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions: Clone Command & Repo Link */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto flex-1">
                <Terminal className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">{resource.cloneCommand}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopyCommand(resource.id, resource.cloneCommand)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                  title="Copy git clone command"
                >
                  {copiedId === resource.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[11px]">Clone</span>
                    </>
                  )}
                </button>

                <a
                  href={resource.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="View on GitHub"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
