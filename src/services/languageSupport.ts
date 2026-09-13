// path: src/services/languageSupport.ts

export interface SupportedLanguage {
  id: string;
  name: string;
  extension: string;
  monacoLang: string;
  badgeColor: string;
  iconType: string;
  sampleTemplate: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    id: "typescript",
    name: "TypeScript",
    extension: ".ts",
    monacoLang: "typescript",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    iconType: "code",
    sampleTemplate: `// TypeScript Strong Type Engine
export interface ServiceResponse<T> {
  success: boolean;
  data: T;
  timestamp: number;
}

export async function executeQuery<T>(query: string): Promise<ServiceResponse<T>> {
  console.log("Executing typed query:", query);
  return {
    success: true,
    data: {} as T,
    timestamp: Date.now(),
  };
}
`,
  },
  {
    id: "tsx",
    name: "React (TSX)",
    extension: ".tsx",
    monacoLang: "typescript",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    iconType: "react",
    sampleTemplate: `import React, { useState } from "react";

export const DynamicComponent: React.FC = () => {
  const [count, setCount] = useState(0);
  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
      <h2 className="text-sm font-bold text-white">Interactive TSX Component</h2>
      <button 
        onClick={() => setCount((c) => c + 1)} 
        className="mt-2 px-3 py-1 bg-indigo-600 rounded text-xs text-white"
      >
        Clicks: {count}
      </button>
    </div>
  );
};
`,
  },
  {
    id: "javascript",
    name: "JavaScript (ESM)",
    extension: ".js",
    monacoLang: "javascript",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    iconType: "js",
    sampleTemplate: `// Modern ESM Javascript module
export const calculateEntropy = (bytes) => {
  if (!bytes || bytes.length === 0) return 0;
  const frequencies = new Map();
  for (const byte of bytes) {
    frequencies.set(byte, (frequencies.get(byte) || 0) + 1);
  }
  let entropy = 0;
  for (const count of frequencies.values()) {
    const p = count / bytes.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
};
`,
  },
  {
    id: "python",
    name: "Python 3",
    extension: ".py",
    monacoLang: "python",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    iconType: "python",
    sampleTemplate: `# Python 3.12 Autonomous Agent Module
import asyncio
from typing import Dict, Any, List

class AgentPipeline:
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.active_tasks: List[str] = []

    async def run_review(self, diff_content: str) -> Dict[str, Any]:
        """Perform AST validation and security audits."""
        await asyncio.sleep(0.1)
        return {
            "status": "passed",
            "agent": self.agent_id,
            "lines_inspected": len(diff_content.splitlines())
        }

if __name__ == "__main__":
    agent = AgentPipeline("agent-sec-01")
    print("Agent pipeline ready.")
`,
  },
  {
    id: "go",
    name: "Go (Golang)",
    extension: ".go",
    monacoLang: "go",
    badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    iconType: "go",
    sampleTemplate: `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type HealthCheckResponse struct {
	Status    string \`json:"status"\`
	Timestamp int64  \`json:"timestamp"\`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	resp := HealthCheckResponse{
		Status:    "healthy",
		Timestamp: time.Now().Unix(),
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func main() {
	http.HandleFunc("/healthz", healthHandler)
	fmt.Println("Server running on :8080")
}
`,
  },
  {
    id: "rust",
    name: "Rust",
    extension: ".rs",
    monacoLang: "rust",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    iconType: "rust",
    sampleTemplate: `// High-performance Rust memory-safe engine
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct GitCommitNode {
    pub hash: String,
    pub author: String,
    pub timestamp: u64,
}

impl GitCommitNode {
    pub fn new(hash: &str, author: &str) -> Self {
        Self {
            hash: hash.to_string(),
            author: author.to_string(),
            timestamp: 1773303600,
        }
    }
}
`,
  },
  {
    id: "sql",
    name: "PostgreSQL",
    extension: ".sql",
    monacoLang: "sql",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    iconType: "database",
    sampleTemplate: `-- Autonomous Studio Database Schema
CREATE TABLE IF NOT EXISTS repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_name VARCHAR(255) NOT NULL UNIQUE,
    owner_login VARCHAR(128) NOT NULL,
    default_branch VARCHAR(64) DEFAULT 'main',
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_repo_owner ON repositories(owner_login);
`,
  },
  {
    id: "yaml",
    name: "YAML / CI Pipeline",
    extension: ".yml",
    monacoLang: "yaml",
    badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    iconType: "yaml",
    sampleTemplate: `name: Autonomous Studio Enterprise CI/CD
on:
  push:
    branches: [ main, staging ]
  pull_request:
    branches: [ main ]

jobs:
  devsecops-pipeline:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Scan Secrets with Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

      - name: Run Multi-Agent Linter & Tests
        run: |
          npm ci
          npm run lint
          npm run build
`,
  },
];

export const detectLanguageFromPath = (filePath: string): SupportedLanguage => {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".tsx")) return SUPPORTED_LANGUAGES[1];
  if (lower.endsWith(".ts")) return SUPPORTED_LANGUAGES[0];
  if (lower.endsWith(".jsx") || lower.endsWith(".js") || lower.endsWith(".mjs"))
    return SUPPORTED_LANGUAGES[2];
  if (lower.endsWith(".py")) return SUPPORTED_LANGUAGES[3];
  if (lower.endsWith(".go")) return SUPPORTED_LANGUAGES[4];
  if (lower.endsWith(".rs")) return SUPPORTED_LANGUAGES[5];
  if (lower.endsWith(".sql")) return SUPPORTED_LANGUAGES[6];
  if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return SUPPORTED_LANGUAGES[7];
  return SUPPORTED_LANGUAGES[0]; // fallback TS
};
