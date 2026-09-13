// path: src/data/sampleProjects.ts
import { VirtualFile } from "../types/studio";

export interface SampleProject {
  id: string;
  name: string;
  description: string;
  category: "Deduplication" | "Debug & Root Cause" | "Architecture & High Thinking";
  files: VirtualFile[];
  suggestedActionPlan: {
    prompt: string;
    errorTrace?: string;
    targetFile?: string;
  };
}

export const SAMPLE_PROJECTS: SampleProject[] = [
  {
    id: "dedup-repo",
    name: "Redundant Helpers & Duplicate Modules",
    description: "Repository with duplicate utility functions across utils.ts & helpers.ts, legacy App.js vs App.tsx, and obsolete .bak files.",
    category: "Deduplication",
    suggestedActionPlan: {
      prompt: "Scan for redundant file names, duplicate function declarations (e.g., formatDate, slugify, deepClone), and purge dead .bak modules into a single-source-of-truth utility library.",
      targetFile: "src/utils.ts",
    },
    files: [
      {
        id: "f1",
        path: "src/utils.ts",
        name: "utils.ts",
        language: "typescript",
        isDuplicate: true,
        duplicateOf: "src/helpers.ts",
        content: `// path: src/utils.ts
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function truncate(str: string, maxLen: number = 50): string {
  return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
}
`,
      },
      {
        id: "f2",
        path: "src/helpers.ts",
        name: "helpers.ts",
        language: "typescript",
        isDuplicate: true,
        duplicateOf: "src/utils.ts",
        content: `// path: src/helpers.ts
// Redundant duplicate logic of utils.ts
export const formatDateHelper = (val: string | Date) => {
  return new Date(val).toISOString().slice(0, 10);
};

export const createSlug = (input: string): string => {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export function cloneDeepObject<T>(source: T): T {
  return structuredClone ? structuredClone(source) : JSON.parse(JSON.stringify(source));
}

export const formatCurrency = (amount: number, currency = "USD") => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
};
`,
      },
      {
        id: "f3",
        path: "src/legacy/AuthService.bak",
        name: "AuthService.bak",
        language: "typescript",
        isDeadFile: true,
        tags: ["obsolete", "backup"],
        content: `// path: src/legacy/AuthService.bak
// OBSOLETE BACKUP FILE - DO NOT USE
export class AuthServiceOld {
  static loginLegacy(token: string) {
    localStorage.setItem("old_token", token);
    console.warn("Legacy auth method called!");
  }
}
`,
      },
      {
        id: "f4",
        path: "src/App.js",
        name: "App.js",
        language: "javascript",
        isDeadFile: true,
        isDuplicate: true,
        duplicateOf: "src/App.tsx",
        tags: ["duplicate-extension", "obsolete"],
        content: `// path: src/App.js
// Outdated duplicate of App.tsx
import React from 'react';
export default function OldApp() {
  return <div>Legacy JS entry point that conflicts with App.tsx</div>;
}
`,
      },
      {
        id: "f5",
        path: "src/services/apiClient.ts",
        name: "apiClient.ts",
        language: "typescript",
        content: `// path: src/services/apiClient.ts
import { formatDate } from "../utils";
import { formatCurrency } from "../helpers"; // Fragile split import between utils & helpers!

export interface Transaction {
  id: string;
  amount: number;
  date: string;
}

export function formatTransactionRow(tx: Transaction): string {
  return \`[\${formatDate(tx.date)}] Transaction \${tx.id}: \${formatCurrency(tx.amount)}\`;
}
`,
      },
    ],
  },
  {
    id: "debug-crash",
    name: "Async Race Condition & TypeError in React Hook",
    description: "Component crashing with unhandled rejection: Cannot read properties of undefined (reading 'items') on rapid filter toggling.",
    category: "Debug & Root Cause",
    suggestedActionPlan: {
      prompt: "Perform line-by-line root-cause analysis on the crash log and race condition in UserDashboard.tsx. Generate fully working replacement code with AbortController, error boundaries, and runnable unit assertions.",
      errorTrace: `TypeError: Cannot read properties of undefined (reading 'items')
    at UserDashboard.tsx:38:22
    at runMicrotasks (<anonymous>)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.`,
      targetFile: "src/components/UserDashboard.tsx",
    },
    files: [
      {
        id: "d1",
        path: "src/components/UserDashboard.tsx",
        name: "UserDashboard.tsx",
        language: "typescript",
        content: `// path: src/components/UserDashboard.tsx
import React, { useState, useEffect } from "react";

interface DashboardData {
  user: { name: string; email: string };
  items: Array<{ id: string; title: string; active: boolean }>;
}

export default function UserDashboard({ categoryId }: { categoryId: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    // CRITICAL BUG 1: Missing AbortController - race condition when categoryId rapidly changes
    // CRITICAL BUG 2: Unmounted component state update memory leak
    fetch(\`/api/dashboard?cat=\${categoryId}\`)
      .then((res) => res.json())
      .then((resData) => {
        // BUG: resData might be null or { error: "Not found" } without items
        // Line 38: Crashes when resData.data is undefined
        const activeItems = resData.data.items.filter((i: any) => i.active);
        setData({ user: resData.data.user, items: activeItems });
        setLoading(false);
      })
      .catch((err) => {
        // Unhandled rejected promise causing React boundary to drop
        setError(err.message);
        setLoading(false);
      });
  }, [categoryId]);

  if (loading) return <div className="p-4 text-gray-500">Loading dashboard...</div>;
  if (error) return <div className="p-4 text-red-500">Failed: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900">{data?.user.name}</h2>
      <ul className="mt-4 divide-y divide-gray-100">
        {data?.items.map((item) => (
          <li key={item.id} className="py-2 text-sm text-gray-700">
            {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
      },
      {
        id: "d2",
        path: "src/components/UserDashboard.test.ts",
        name: "UserDashboard.test.ts",
        language: "typescript",
        content: `// path: src/components/UserDashboard.test.ts
// Test runner assertions to verify bug resolution
export function verifyDashboardSafety(mockFetch: Function) {
  console.assert(typeof mockFetch === "function", "mockFetch must be callable");
  console.log("Verification suite loaded.");
}
`,
      },
    ],
  },
  {
    id: "arch-thinking",
    name: "Distributed Event Bus & High-Scale Flow",
    description: "Event-driven distributed event dispatcher evaluating cyclic dependencies, backpressure, and high-throughput memory bounds.",
    category: "Architecture & High Thinking",
    suggestedActionPlan: {
      prompt: "Evaluate the event bus architecture for memory leaks, lack of backpressure during bursts, unbounded Map caches, and thread-safe queue dispatching. Provide an architectural blueprint with High Thinking reasoning.",
      targetFile: "src/core/EventBroker.ts",
    },
    files: [
      {
        id: "a1",
        path: "src/core/EventBroker.ts",
        name: "EventBroker.ts",
        language: "typescript",
        content: `// path: src/core/EventBroker.ts
type EventHandler<T = any> = (payload: T) => Promise<void> | void;

export class EventBroker {
  // ARCHITECTURAL FLAW: Unbounded listeners array - memory leak under high-churn subscriptions
  private listeners: Map<string, EventHandler[]> = new Map();
  private eventHistory: Array<{ event: string; payload: any; timestamp: number }> = [];

  public subscribe<T>(event: string, handler: EventHandler<T>): () => void {
    const list = this.listeners.get(event) || [];
    list.push(handler);
    this.listeners.set(event, list);

    // Missing idempotency checks and memory caps
    return () => {
      const current = this.listeners.get(event) || [];
      this.listeners.set(event, current.filter((h) => h !== handler));
    };
  }

  public async publish<T>(event: string, payload: T): Promise<void> {
    // ARCHITECTURAL FLAW: Unbounded history array grows indefinitely
    this.eventHistory.push({ event, payload, timestamp: Date.now() });

    const handlers = this.listeners.get(event) || [];
    // CRITICAL: Promise.all without concurrency limit or backpressure can exhaust Node.js microtask queue
    await Promise.all(handlers.map((h) => h(payload)));
  }

  public getHistorySize(): number {
    return this.eventHistory.length;
  }
}
`,
      },
    ],
  },
];
