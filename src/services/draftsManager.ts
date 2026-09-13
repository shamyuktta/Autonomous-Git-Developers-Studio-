// path: src/services/draftsManager.ts
import { DraftSnapshot } from "../types/devsecops";

const DRAFTS_STORAGE_KEY = "autonomous_studio_drafts_v1";
const AUTOSAVE_SETTINGS_KEY = "autonomous_studio_autosave_cfg";

export interface DraftsConfig {
  enabled: boolean;
  intervalMs: number;
  maxSnapshotsPerFile: number;
}

export const DEFAULT_AUTOSAVE_CONFIG: DraftsConfig = {
  enabled: true,
  intervalMs: 1500, // 1.5s debounce auto-save
  maxSnapshotsPerFile: 15,
};

export const getAutoSaveConfig = (): DraftsConfig => {
  try {
    const raw = localStorage.getItem(AUTOSAVE_SETTINGS_KEY);
    if (!raw) return DEFAULT_AUTOSAVE_CONFIG;
    return { ...DEFAULT_AUTOSAVE_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AUTOSAVE_CONFIG;
  }
};

export const saveAutoSaveConfig = (cfg: DraftsConfig): void => {
  try {
    localStorage.setItem(AUTOSAVE_SETTINGS_KEY, JSON.stringify(cfg));
  } catch (e) {
    console.error("Failed to persist autosave config", e);
  }
};

export const getAllDrafts = (): Record<string, DraftSnapshot[]> => {
  try {
    const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveFileDraft = (
  fileId: string,
  filePath: string,
  content: string,
  tag = "autosave"
): DraftSnapshot => {
  const all = getAllDrafts();
  const fileHistory = all[fileId] || [];

  // Check if content is actually different from top snapshot
  if (fileHistory.length > 0 && fileHistory[0].content === content) {
    return fileHistory[0];
  }

  const snapshot: DraftSnapshot = {
    id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    fileId,
    filePath,
    content,
    tag,
  };

  const config = getAutoSaveConfig();
  const updatedHistory = [snapshot, ...fileHistory].slice(0, config.maxSnapshotsPerFile);
  all[fileId] = updatedHistory;

  try {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn("Local storage full, pruning old draft entries", e);
    // Prune entries older than 2 days
    pruneOldDrafts();
  }

  return snapshot;
};

export const getLatestDraft = (fileId: string): DraftSnapshot | null => {
  const all = getAllDrafts();
  const list = all[fileId];
  return list && list.length > 0 ? list[0] : null;
};

export const getDraftHistory = (fileId: string): DraftSnapshot[] => {
  const all = getAllDrafts();
  return all[fileId] || [];
};

export const clearDraftHistory = (fileId: string): void => {
  const all = getAllDrafts();
  delete all[fileId];
  try {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("Error clearing draft history", e);
  }
};

export const pruneOldDrafts = (): void => {
  const all = getAllDrafts();
  const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
  const pruned: Record<string, DraftSnapshot[]> = {};

  for (const [fId, history] of Object.entries(all)) {
    const fresh = history.filter((s) => s.timestamp > twoDaysAgo);
    if (fresh.length > 0) {
      pruned[fId] = fresh.slice(0, 5);
    }
  }

  try {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(pruned));
  } catch {
    // If still fails, clear non-critical
    localStorage.removeItem(DRAFTS_STORAGE_KEY);
  }
};
