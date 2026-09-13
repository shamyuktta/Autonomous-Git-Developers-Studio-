// path: src/services/auth.ts
import { UserProfile } from "../types/studio";

const AUTH_STORAGE_KEY = "autonomous_engineer_user";
const REGISTERED_ACCOUNTS_KEY = "autonomous_engineer_registered_accounts";
const GITHUB_TOKEN_KEY = "autonomous_engineer_github_pat";

export interface UserAccountCredentials {
  email: string;
  passwordHash: string;
  name: string;
  role: UserProfile["role"];
  provider: "email" | "google" | "github";
  githubUsername?: string;
  createdAt: number;
}

export const DEMO_PROFILES: UserProfile[] = [
  {
    id: "user-staff-1",
    name: "Alex Vance",
    email: "alex.vance@studio.ai",
    role: "Staff Full-Stack Engineer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
    bio: "Full-stack cloud architect specialized in autonomous agentic loops, TypeScript, and high-performance AST refactoring.",
    location: "San Francisco, CA",
    company: "Google AI Studio",
    website: "https://github.com/alexvance-ai",
    phone: "+1 (555) 019-2834",
    githubConnected: false,
  },
  {
    id: "user-architect-2",
    name: "Elena Rostova",
    email: "elena.rostova@deepmind.internal",
    role: "Principal Architect",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces",
    bio: "Systems architect focused on scalable CI/CD pipelines, zero-duplicate codebases, and resilient cloud infrastructure.",
    location: "London, UK",
    company: "DeepMind Systems",
    website: "https://deepmind.google/research",
    phone: "+44 20 7946 0912",
    githubConnected: false,
  },
];

export function getRegisteredAccounts(): UserAccountCredentials[] {
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRegisteredAccount(account: UserAccountCredentials): void {
  const accounts = getRegisteredAccounts();
  const existingIdx = accounts.findIndex(
    (a) => a.email.toLowerCase() === account.email.toLowerCase()
  );
  if (existingIdx >= 0) {
    accounts[existingIdx] = account;
  } else {
    accounts.push(account);
  }
  localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function verifyUserCredentials(
  email: string,
  passwordAttempt: string
): { success: boolean; account?: UserAccountCredentials; error?: string } {
  const accounts = getRegisteredAccounts();
  const matched = accounts.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!matched) {
    return {
      success: false,
      error: "No account found with this email. Please create an account first.",
    };
  }

  if (matched.passwordHash !== passwordAttempt) {
    return {
      success: false,
      error: "Incorrect password. Please verify your credentials and try again.",
    };
  }

  return { success: true, account: matched };
}

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null; // Require login authentication before using app
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveUserSession(user: UserProfile): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearUserSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(GITHUB_TOKEN_KEY);
}

export function getStoredGitHubToken(): string | null {
  return localStorage.getItem(GITHUB_TOKEN_KEY);
}

export function saveGitHubToken(token: string): void {
  localStorage.setItem(GITHUB_TOKEN_KEY, token);
  const current = getStoredUser();
  if (current) {
    saveUserSession({
      ...current,
      githubConnected: true,
    });
  }
}

export function removeGitHubToken(): void {
  localStorage.removeItem(GITHUB_TOKEN_KEY);
  const current = getStoredUser();
  if (current) {
    saveUserSession({
      ...current,
      githubConnected: false,
      githubUsername: undefined,
    });
  }
}
