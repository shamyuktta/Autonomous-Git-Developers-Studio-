// path: src/services/history.ts
import { HistoryActivityItem, VirtualFile } from "../types/studio";

const HISTORY_STORAGE_KEY = "autonomous_engineer_activity_history";
const RECENT_FILES_KEY = "autonomous_engineer_recent_files";

const INITIAL_ACTIVITIES: HistoryActivityItem[] = [
  {
    id: "act-1",
    type: "ast-refactor",
    title: "Consolidated date utilities",
    filePath: "src/utils/formatters.ts",
    timestamp: Date.now() - 1000 * 60 * 12,
    modelUsed: "gemini-3.5-flash",
    snapshotContent: `// path: src/utils/formatters.ts\nexport function formatDate(d: Date) { return d.toISOString(); }`,
  },
  {
    id: "act-2",
    type: "debug-fix",
    title: "Eliminated PaymentProcessor memory leak",
    filePath: "src/services/PaymentProcessor.ts",
    timestamp: Date.now() - 1000 * 60 * 45,
    modelUsed: "gemini-3.1-pro-preview",
    snapshotContent: `// path: src/services/PaymentProcessor.ts\nexport class PaymentProcessor { private active = new Map(); }`,
  },
  {
    id: "act-3",
    type: "deduplicate",
    title: "Purged redundant *.bak artifacts",
    filePath: "src/services/AuthService.bak",
    timestamp: Date.now() - 1000 * 60 * 120,
    modelUsed: "gemini-3.5-flash",
  },
];

export function getStoredActivities(): HistoryActivityItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return INITIAL_ACTIVITIES;
    return JSON.parse(raw);
  } catch {
    return INITIAL_ACTIVITIES;
  }
}

export function saveActivity(item: Omit<HistoryActivityItem, "id" | "timestamp">): HistoryActivityItem {
  const activities = getStoredActivities();
  const newItem: HistoryActivityItem = {
    ...item,
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
  };

  const updated = [newItem, ...activities].slice(0, 50); // keep 50 most recent
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Could not save activity to localStorage", e);
  }
  return newItem;
}

export function clearActivities(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (e) {
    console.warn("Could not clear activities", e);
  }
}

export function getRecentFiles(): Array<{ path: string; name: string; timestamp: number }> {
  try {
    const raw = localStorage.getItem(RECENT_FILES_KEY);
    if (!raw) {
      return [
        { path: "src/services/PaymentProcessor.ts", name: "PaymentProcessor.ts", timestamp: Date.now() - 1000 * 60 * 15 },
        { path: "src/utils/formatters.ts", name: "formatters.ts", timestamp: Date.now() - 1000 * 60 * 35 },
        { path: "src/stores/orderStore.ts", name: "orderStore.ts", timestamp: Date.now() - 1000 * 60 * 80 },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordFileAccess(file: { path: string; name: string }): void {
  try {
    const list = getRecentFiles().filter((f) => f.path !== file.path);
    const updated = [{ ...file, timestamp: Date.now() }, ...list].slice(0, 15);
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Could not record file access", e);
  }
}
