// path: src/components/AuthModal.tsx
import React, { useState } from "react";
import { UserProfile } from "../types/studio";
import {
  DEMO_PROFILES,
  saveUserSession,
  saveRegisteredAccount,
  verifyUserCredentials,
  getRegisteredAccounts,
} from "../services/auth";
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Github,
  KeyRound,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile) => void;
  canDismiss?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  canDismiss = true,
}) => {
  const [tab, setTab] = useState<"oauth" | "email" | "demo">("email");
  const [emailAuthMode, setEmailAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserProfile["role"]>("Staff Full-Stack Engineer");

  // OAuth credential inputs
  const [oauthModalOpen, setOauthModalOpen] = useState<"google" | "github" | null>(null);
  const [oauthInputEmail, setOauthInputEmail] = useState("");
  const [oauthInputPassword, setOauthInputPassword] = useState("");
  const [oauthInputGithubUser, setOauthInputGithubUser] = useState("");
  const [oauthInputToken, setOauthInputToken] = useState("");

  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Handlers for User Credentials Email Login / Signup
  const handleEmailAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setStatusMsg("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMsg("Please provide both email and password.");
      return;
    }

    if (emailAuthMode === "register") {
      // Registering new credentials
      const accounts = getRegisteredAccounts();
      if (accounts.some((a) => a.email.toLowerCase() === trimmedEmail.toLowerCase())) {
        setErrorMsg("An account with this email already exists. Please switch to Sign In.");
        return;
      }

      const displayName = name.trim() || trimmedEmail.split("@")[0];
      saveRegisteredAccount({
        email: trimmedEmail,
        passwordHash: password,
        name: displayName,
        role: role,
        provider: "email",
        createdAt: Date.now(),
      });

      const user: UserProfile = {
        id: `user-${Date.now()}`,
        name: displayName,
        email: trimmedEmail,
        role: role,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedEmail)}`,
        githubConnected: false,
        token: `session-${Date.now().toString(36)}`,
      };

      saveUserSession(user);
      onUserChange(user);
      setStatusMsg(`Account created! Welcome, ${displayName}.`);
      setTimeout(() => {
        setStatusMsg("");
        if (onClose) onClose();
      }, 700);
    } else {
      // Login with user credentials
      const result = verifyUserCredentials(trimmedEmail, password);
      if (!result.success || !result.account) {
        setErrorMsg(result.error || "Invalid email or password.");
        return;
      }

      const acc = result.account;
      const user: UserProfile = {
        id: `user-${acc.createdAt || Date.now()}`,
        name: acc.name,
        email: acc.email,
        role: acc.role,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(acc.email)}`,
        githubConnected: Boolean(acc.githubUsername),
        githubUsername: acc.githubUsername,
        token: `session-${Date.now().toString(36)}`,
      };

      saveUserSession(user);
      onUserChange(user);
      setStatusMsg(`Welcome back, ${acc.name}! Access granted.`);
      setTimeout(() => {
        setStatusMsg("");
        if (onClose) onClose();
      }, 700);
    }
  };

  // Google Login with User Credentials
  const handleGoogleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const trimmed = oauthInputEmail.trim();
    if (!trimmed || !oauthInputPassword) {
      setErrorMsg("Please enter your Google email and password.");
      return;
    }

    setIsLoading(true);
    setStatusMsg("Authenticating Google OAuth credentials...");

    setTimeout(() => {
      const displayName = trimmed.split("@")[0].replace(".", " ");
      const formattedName = displayName
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      const user: UserProfile = {
        id: `google-${Date.now()}`,
        name: formattedName || "Google Developer",
        email: trimmed,
        role: "Staff Full-Stack Engineer",
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmed)}`,
        githubConnected: false,
        token: `google-oauth-${Date.now().toString(36)}`,
      };

      saveRegisteredAccount({
        email: trimmed,
        passwordHash: oauthInputPassword,
        name: user.name,
        role: user.role,
        provider: "google",
        createdAt: Date.now(),
      });

      saveUserSession(user);
      onUserChange(user);
      setIsLoading(false);
      setStatusMsg(`Authenticated via Google as ${user.name}`);
      setTimeout(() => {
        setStatusMsg("");
        setOauthModalOpen(null);
        if (onClose) onClose();
      }, 700);
    }, 800);
  };

  // GitHub Login with User Credentials & PAT
  const handleGithubCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const ghUser = oauthInputGithubUser.trim();
    const ghEmail = oauthInputEmail.trim() || `${ghUser || "developer"}@github.com`;

    if (!ghUser && !ghEmail) {
      setErrorMsg("Please provide your GitHub username or email.");
      return;
    }

    setIsLoading(true);
    setStatusMsg("Validating GitHub credentials & token...");

    setTimeout(() => {
      const user: UserProfile = {
        id: `github-${Date.now()}`,
        name: ghUser || "GitHub Developer",
        email: ghEmail,
        role: "Principal Architect",
        avatar: ghUser
          ? `https://github.com/${ghUser}.png`
          : `https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces`,
        githubConnected: true,
        githubUsername: ghUser || "developer",
        token: oauthInputToken.trim() || `gho_${Date.now().toString(36)}`,
      };

      saveRegisteredAccount({
        email: ghEmail,
        passwordHash: oauthInputPassword || "github-oauth",
        name: user.name,
        role: user.role,
        provider: "github",
        githubUsername: user.githubUsername,
        createdAt: Date.now(),
      });

      saveUserSession(user);
      onUserChange(user);
      setIsLoading(false);
      setStatusMsg(`Authenticated GitHub developer: @${user.githubUsername}`);
      setTimeout(() => {
        setStatusMsg("");
        setOauthModalOpen(null);
        if (onClose) onClose();
      }, 700);
    }, 800);
  };

  const handleSelectDemo = (profile: UserProfile) => {
    saveUserSession(profile);
    onUserChange(profile);
    setStatusMsg(`Authenticated as ${profile.name} (${profile.role})`);
    setTimeout(() => {
      setStatusMsg("");
      if (onClose) onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Engineer Studio Authentication</h3>
              <p className="text-xs text-slate-400">Sign in with your user credentials to access the studio</p>
            </div>
          </div>
          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 p-1.5 m-6 mb-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setTab("email");
              setErrorMsg("");
              setOauthModalOpen(null);
            }}
            className={`py-2 px-3 rounded-lg transition-all text-center ${
              tab === "email"
                ? "bg-slate-800 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Email & Password
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("oauth");
              setErrorMsg("");
            }}
            className={`py-2 px-3 rounded-lg transition-all text-center ${
              tab === "oauth"
                ? "bg-slate-800 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Google / GitHub
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("demo");
              setErrorMsg("");
              setOauthModalOpen(null);
            }}
            className={`py-2 px-3 rounded-lg transition-all text-center ${
              tab === "demo"
                ? "bg-slate-800 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Staff Quick-Pass
          </button>
        </div>

        {/* Alert / Notification banners */}
        {errorMsg && (
          <div className="mx-6 mb-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300 font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {statusMsg && (
          <div className="mx-6 mb-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* TAB 1: User Credentials with Email & Password */}
        {tab === "email" && (
          <div className="px-6 pb-6">
            {/* Toggle Login vs Register */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
              <span className="text-xs text-slate-300 font-medium">
                {emailAuthMode === "login"
                  ? "Sign In with existing user credentials"
                  : "Register new user credentials"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmailAuthMode(emailAuthMode === "login" ? "register" : "login");
                  setErrorMsg("");
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                {emailAuthMode === "login" ? "Create an account →" : "Have an account? Sign In →"}
              </button>
            </div>

            <form onSubmit={handleEmailAuthSubmit} className="space-y-3.5">
              {emailAuthMode === "register" && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Jordan Miller"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">User Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your secret password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {emailAuthMode === "register" && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Engineering Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserProfile["role"])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Staff Full-Stack Engineer">Staff Full-Stack Engineer</option>
                    <option value="Principal Architect">Principal Architect</option>
                    <option value="DevOps Lead">DevOps Lead</option>
                    <option value="Security Specialist">Security Specialist</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                {emailAuthMode === "login" ? "Sign In with Credentials" : "Create Account & Sign In"}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Google & GitHub User Credentials */}
        {tab === "oauth" && (
          <div className="px-6 pb-6 space-y-4">
            {!oauthModalOpen ? (
              <>
                <p className="text-xs text-slate-400">
                  Authenticate with your personal Google or GitHub developer account credentials:
                </p>

                {/* Google Button */}
                <button
                  onClick={() => {
                    setOauthModalOpen("google");
                    setErrorMsg("");
                  }}
                  className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 transition-all flex items-center justify-between group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100">Sign in with Google Account</div>
                      <div className="text-[11px] text-slate-400">Enter your Google email credentials</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </button>

                {/* GitHub Button */}
                <button
                  onClick={() => {
                    setOauthModalOpen("github");
                    setErrorMsg("");
                  }}
                  className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 transition-all flex items-center justify-between group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white shrink-0 shadow-sm">
                      <Github className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100">Sign in with GitHub Account</div>
                      <div className="text-[11px] text-slate-400">Enter GitHub username, email & PAT</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </button>
              </>
            ) : oauthModalOpen === "google" ? (
              /* Google Credentials Form */
              <form onSubmit={handleGoogleCredentialSubmit} className="space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Google Account Credentials
                  </div>
                  <button
                    type="button"
                    onClick={() => setOauthModalOpen(null)}
                    className="text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    ← Back
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Google Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="user@gmail.com"
                    value={oauthInputEmail}
                    onChange={(e) => setOauthInputEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Google Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter your Google account password"
                    value={oauthInputPassword}
                    onChange={(e) => setOauthInputPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isLoading ? "Authenticating..." : "Login with Google Credentials"}
                </button>
              </form>
            ) : (
              /* GitHub Credentials Form */
              <form onSubmit={handleGithubCredentialSubmit} className="space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Github className="w-4 h-4 text-emerald-400" />
                    GitHub Account Credentials
                  </div>
                  <button
                    type="button"
                    onClick={() => setOauthModalOpen(null)}
                    className="text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    ← Back
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">GitHub Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. shamyuktta"
                    value={oauthInputGithubUser}
                    onChange={(e) => setOauthInputGithubUser(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">GitHub Email</label>
                  <input
                    type="email"
                    placeholder="e.g. shamyukttab@gmail.com"
                    value={oauthInputEmail}
                    onChange={(e) => setOauthInputEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    GitHub Password or Personal Access Token (PAT)
                  </label>
                  <input
                    type="password"
                    placeholder="ghp_•••••••••••• or Account Password"
                    value={oauthInputPassword}
                    onChange={(e) => {
                      setOauthInputPassword(e.target.value);
                      if (e.target.value.startsWith("ghp_")) {
                        setOauthInputToken(e.target.value);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isLoading ? "Validating..." : "Login with GitHub Credentials"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: Instant Demo Profiles */}
        {tab === "demo" && (
          <div className="px-6 pb-6 space-y-3">
            <p className="text-xs text-slate-400 mb-2">
              Select an authorized engineering persona to immediately evaluate reasoning, GitHub automation, and CI/CD pipelines:
            </p>
            {DEMO_PROFILES.map((profile) => {
              const isSelected = currentUser?.id === profile.id;
              return (
                <div
                  key={profile.id}
                  onClick={() => handleSelectDemo(profile)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-200"
                      : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="font-medium text-xs text-slate-200 flex items-center gap-2">
                        {profile.name}
                        {isSelected && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{profile.email}</div>
                      <div className="text-[10px] text-indigo-400/90 font-mono mt-0.5">{profile.role}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
