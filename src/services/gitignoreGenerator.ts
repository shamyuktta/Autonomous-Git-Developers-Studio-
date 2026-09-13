// path: src/services/gitignoreGenerator.ts
import { VirtualFile } from "../types/studio";

export interface GitignorePreset {
  id: string;
  name: string;
  description: string;
  category: "node" | "python" | "go" | "rust" | "general";
  rules: string[];
}

export const GITIGNORE_PRESETS: GitignorePreset[] = [
  {
    id: "node_react",
    name: "Node.js / Vite / React",
    description: "Standard exclusions for npm, pnpm, yarn, Vite dist/, and temporary build artifacts.",
    category: "node",
    rules: [
      "# Dependency directories",
      "node_modules/",
      "jspm_packages/",
      ".pnp/",
      ".pnp.js",
      "",
      "# Production build output",
      "dist/",
      "dist-ssr/",
      "build/",
      "out/",
      ".next/",
      ".nuxt/",
      "",
      "# Local environment & secrets",
      ".env",
      ".env.local",
      ".env.development.local",
      ".env.test.local",
      ".env.production.local",
      "*.pem",
      "*.key",
      "id_rsa",
      "",
      "# Logs and debuggers",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
      "pnpm-debug.log*",
      "lerna-debug.log*",
      "",
      "# Editor & OS artifacts",
      ".DS_Store",
      "Thumbs.db",
      ".vscode/*",
      "!.vscode/extensions.json",
      "!.vscode/settings.json",
      ".idea/",
      "*.suo",
      "*.ntvs*",
      "*.njsproj",
    ],
  },
  {
    id: "python",
    name: "Python 3 / Django / FastAPI",
    description: "Bytecode, virtual environments, PyInstaller, and cache artifacts.",
    category: "python",
    rules: [
      "# Byte-compiled / optimized / DLL files",
      "__pycache__/",
      "*.py[cod]",
      "*$py.class",
      "",
      "# Virtual environments",
      "venv/",
      "env/",
      ".venv/",
      "env.bak/",
      "venv.bak/",
      "",
      "# Distribution / packaging",
      ".Python",
      "build/",
      "develop-eggs/",
      "dist/",
      "downloads/",
      "eggs/",
      ".eggs/",
      "lib/",
      "lib64/",
      "parts/",
      "sdist/",
      "var/",
      "wheels/",
      "*.egg-info/",
      ".installed.cfg",
      "*.egg",
      "",
      "# Unit test / coverage reports",
      "htmlcov/",
      ".tox/",
      ".nox/",
      ".coverage",
      ".coverage.*",
      ".cache",
      "nosetests.xml",
      "coverage.xml",
      "*.cover",
      ".hypothesis/",
      ".pytest_cache/",
      "",
      "# Local secrets & env",
      ".env",
      ".env.vault",
      "*.pem",
      "*.key",
    ],
  },
  {
    id: "devsecops",
    name: "Enterprise DevSecOps & AI Studio",
    description: "Hardened security exclusions preventing token, secret, and backup file leaks.",
    category: "general",
    rules: [
      "# Critical Leaked Secrets Interceptor",
      ".env",
      ".env.*",
      "!.env.example",
      "*.pem",
      "*.key",
      "*.pkcs12",
      "*.pfx",
      "*.p12",
      "*_rsa",
      "*_dsa",
      "*_ed25519",
      "",
      "# Cloud credentials",
      ".aws/",
      ".gcp/",
      "credentials.json",
      "service-account*.json",
      "firebase-adminsdk*.json",
      "",
      "# Temporary agent & editor backup dumps",
      "*.bak",
      "*-copy.*",
      "*.tmp",
      "*.swp",
      "*~",
      ".autonomous_drafts/",
      "",
      "# Build artifacts & package locks",
      "dist/",
      "node_modules/",
      "coverage/",
    ],
  },
];

/**
 * Automatically inspects the current workspace files and generates an optimal .gitignore file
 */
export function generateAutoGitignore(files: VirtualFile[]): string {
  const hasTsOrJs = files.some((f) =>
    /\.(ts|tsx|js|jsx|json)$/i.test(f.path)
  );
  const hasPython = files.some((f) => /\.py$/i.test(f.path));
  const hasEnv = files.some((f) => /\.env/i.test(f.path));

  const sections: string[] = [
    "# ========================================================",
    "# Auto-Generated .gitignore by Autonomous Engineer Studio",
    `# Generated on: ${new Date().toISOString()}`,
    "# ========================================================",
    "",
  ];

  // DevSecOps security block is always included
  sections.push(
    "# 🛡️ DevSecOps & Security Hardening (Zero Leaked Secrets)",
    ".env",
    ".env.*",
    "!.env.example",
    "*.pem",
    "*.key",
    "credentials.json",
    "service-account*.json",
    "*.bak",
    "*-copy.*",
    ""
  );

  if (hasTsOrJs || files.length === 0) {
    sections.push(
      "# 📦 Node.js / TypeScript / Bundler Dependencies & Artifacts",
      "node_modules/",
      "dist/",
      "build/",
      ".cache/",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
      "pnpm-debug.log*",
      ""
    );
  }

  if (hasPython) {
    sections.push(
      "# 🐍 Python Virtual Environments & Bytecode",
      "__pycache__/",
      "*.py[cod]",
      ".venv/",
      "venv/",
      ".pytest_cache/",
      ""
    );
  }

  sections.push(
    "# 💻 OS & IDE Metadata",
    ".DS_Store",
    "Thumbs.db",
    ".idea/",
    ".vscode/*",
    "!.vscode/extensions.json",
    "!.vscode/settings.json",
    ""
  );

  return sections.join("\n");
}
