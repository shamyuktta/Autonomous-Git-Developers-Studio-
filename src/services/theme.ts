// path: src/services/theme.ts
import { ThemeMode } from "../types/studio";

const THEME_STORAGE_KEY = "autonomous_engineer_theme";

export function getStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
    if (saved === "dark" || saved === "light" || saved === "midnight") {
      return saved;
    }
  } catch {
    // fallback
  }
  return "dark";
}

export function saveTheme(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // ignore
  }
  applyThemeToDocument(mode);
}

export function applyThemeToDocument(mode: ThemeMode): void {
  const root = document.documentElement;
  root.classList.remove("theme-dark", "theme-light", "theme-midnight");
  root.classList.add(`theme-${mode}`);

  if (mode === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
  }
}
