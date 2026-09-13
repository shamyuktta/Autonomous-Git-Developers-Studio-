// path: src/services/ciPipelineEngine.ts
import { CIPipelineRun, PipelineStageStep } from "../types/devsecops";

export const SAMPLE_WORKFLOW_YML = `# .github/workflows/ci-cd.yml
name: Enterprise DevSecOps CI/CD
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  validate-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Check out repository
        uses: actions/checkout@v4

      - name: ⚙️ Setup Node.js Runtime
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: 📦 Install Clean Dependencies
        run: npm ci

      - name: 🛡️ Pre-Flight Secret Scanner (Gitleaks)
        run: |
          npx gitleaks detect --verbose --no-git

      - name: 🔍 TypeScript AST & Broken Import Audit
        run: npm run lint

      - name: ⚡ Automated Production Build
        run: npm run build

      - name: 🚀 Deploy Gate (Cloud Run / Vercel)
        if: github.ref == 'refs/heads/main'
        run: echo "Artifact verified. Initiating deployment to Cloud Run cluster..."
`;

export const PRE_COMMIT_HOOK_SCRIPT = `#!/usr/bin/env bash
# .husky/pre-commit or .githooks/pre-commit
# Enterprise DevSecOps Automated Hook

echo "🛡️ [DevSecOps Hook] Running pre-commit security and import verification..."

# 1. Check for staged leaked secrets / .env
STAGED_SECRETS=$(git diff --cached --name-only | grep -E "(\.env|\.pem|\.key|id_rsa)$")
if [ -n "$STAGED_SECRETS" ]; then
  echo "❌ [SECURITY ABORT] Attempted to commit prohibited sensitive file: $STAGED_SECRETS"
  exit 1
fi

# 2. Check for exposed raw token patterns
TOKEN_LEAKS=$(git diff --cached -S "ghp_" -S "AIza" -S "xoxb-" --name-only)
if [ -n "$TOKEN_LEAKS" ]; then
  echo "❌ [SECURITY ABORT] Detected raw token pattern (ghp_ or AIza) in staged file: $TOKEN_LEAKS"
  exit 1
fi

# 3. Prevent broken imports and run TypeScript compilation
echo "🔍 [DevSecOps Hook] Checking for broken relative imports..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ [BUILD ABORT] TypeScript compilation or imports check failed. Fix errors before committing."
  exit 1
fi

echo "✅ [DevSecOps Hook] All pre-commit checks passed clean. Proceeding with commit."
exit 0
`;

export const executeMockPipeline = async (
  trigger: CIPipelineRun["trigger"] = "manual",
  branch = "main",
  onStepUpdate?: (step: PipelineStageStep, stageId: string) => void
): Promise<CIPipelineRun> => {
  const runId = `pipe_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const commitSha = Math.random().toString(16).substring(2, 9);

  const stages: {
    id: string;
    name: string;
    steps: PipelineStageStep[];
  }[] = [
    {
      id: "stage_security",
      name: "1. DevSecOps Secret & Lint Scan",
      steps: [
        {
          id: "step_secrets",
          name: "Secret Interception & Gitleaks Audit",
          command: "gitleaks detect --source=. --no-git",
          status: "pending",
          durationMs: 0,
          outputLog: [],
        },
        {
          id: "step_imports",
          name: "AST Import Path & Dead Code Check",
          command: "npx knip --include=unlisted,unresolved",
          status: "pending",
          durationMs: 0,
          outputLog: [],
        },
      ],
    },
    {
      id: "stage_build",
      name: "2. Build & TypeScript Verification",
      steps: [
        {
          id: "step_tsc",
          name: "Strict TypeScript Compile (tsc --noEmit)",
          command: "tsc --noEmit",
          status: "pending",
          durationMs: 0,
          outputLog: [],
        },
        {
          id: "step_vite",
          name: "Vite Bundle & Tree-Shaking",
          command: "vite build --mode production",
          status: "pending",
          durationMs: 0,
          outputLog: [],
        },
      ],
    },
    {
      id: "stage_deploy",
      name: "3. Cloud Run Deploy Gate",
      steps: [
        {
          id: "step_deploy",
          name: "Verify Ingress & Route Health",
          command: "curl -f https://ais-dev-preview/api/health",
          status: "pending",
          durationMs: 0,
          outputLog: [],
        },
      ],
    },
  ];

  const pipeline: CIPipelineRun = {
    id: runId,
    trigger,
    branch,
    commitSha,
    status: "running",
    startedAt: Date.now(),
    stages,
    artifacts: [],
  };

  // Run steps with sequential simulated progress
  for (const stage of stages) {
    for (const step of stage.steps) {
      step.status = "running";
      step.outputLog.push(`[${new Date().toISOString()}] $ ${step.command}`);
      if (onStepUpdate) onStepUpdate(step, stage.id);

      await new Promise((res) => setTimeout(res, 500));

      if (step.id === "step_secrets") {
        step.outputLog.push(
          `[Gitleaks 8.18.2] Scanning working tree files...`,
          `No leaked tokens, private keys, or API credentials detected in diff.`,
          `Rule match: 0 violations. Pass!`
        );
      } else if (step.id === "step_imports") {
        step.outputLog.push(
          `Analyzing AST relative imports across 28 workspace files...`,
          `Checking module resolutions: OK (0 broken relative paths)`,
          `Dead code scan: 0 dangling top-level exports detected.`
        );
      } else if (step.id === "step_tsc") {
        step.outputLog.push(
          `tsc --noEmit: 0 errors found in 0.42s.`,
          `Strict type safety 100% verified.`
        );
      } else if (step.id === "step_vite") {
        step.outputLog.push(
          `vite v6.2.3 building for production...`,
          `✓ 48 modules transformed.`,
          `dist/index.html                   0.82 kB`,
          `dist/assets/index-D7h.css        22.14 kB`,
          `dist/assets/index-Cb9.js        214.30 kB`,
          `✓ built in 620ms`
        );
      } else if (step.id === "step_deploy") {
        step.outputLog.push(
          `HTTP/2 200 OK: Container health check confirmed.`,
          `Ingress routing: Port 3000 nginx reverse proxy verified.`,
          `Deployment status: ACTIVE`
        );
      }

      step.status = "success";
      step.durationMs = 650;
      if (onStepUpdate) onStepUpdate(step, stage.id);
    }
  }

  pipeline.status = "passed";
  pipeline.finishedAt = Date.now();
  pipeline.artifacts = [
    { name: "production-bundle.zip", size: "238 KB", url: "#" },
    { name: "gitleaks-audit-report.json", size: "4.2 KB", url: "#" },
    { name: "tsc-diagnostics.log", size: "1.1 KB", url: "#" },
  ];

  return pipeline;
};
