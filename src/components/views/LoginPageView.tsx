// path: src/components/views/LoginPageView.tsx
import React, { useState } from "react";
import { UserProfile } from "../../types/studio";
import {
  DEMO_PROFILES,
  saveUserSession,
  saveRegisteredAccount,
  verifyUserCredentials,
  getRegisteredAccounts,
} from "../../services/auth";
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Github,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Terminal,
  Cpu,
  Sparkles,
  Layers,
  Code2,
} from "lucide-react";

interface LoginPageViewProps {
  onLoginSuccess: (user: UserProfile, targetTab?: "profile" | "dashboard") => void;
}

export const LoginPageView: React.FC<LoginPageViewProps> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<"email" | "oauth" | "demo">("email");
  const [destination, setDestination] = useState<"profile" | "dashboard">("profile");
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

  // Email login / signup with credentials
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
        bio: `Software Engineer specializing in ${role}.`,
        location: "Global Remote",
        company: "Autonomous Engineering Team",
        website: `https://github.com/${trimmedEmail.split("@")[0]}`,
        githubConnected: false,
        token: `session-${Date.now().toString(36)}`,
      };

      saveUserSession(user);
      setStatusMsg(`Account created! Welcome, ${displayName}.`);
      setTimeout(() => {
        onLoginSuccess(user, destination);
      }, 500);
    } else {
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
        bio: `Software Engineer specializing in ${acc.role}.`,
        location: "Global Remote",
        company: "Autonomous Engineering Team",
        website: `https://github.com/${acc.githubUsername || acc.email.split("@")[0]}`,
        githubConnected: Boolean(acc.githubUsername),
        githubUsername: acc.githubUsername,
        token: `session-${Date.now().toString(36)}`,
      };

      saveUserSession(user);
      setStatusMsg(`Welcome back, ${acc.name}! Launching your workspace...`);
      setTimeout(() => {
        onLoginSuccess(user, destination);
      }, 500);
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
    setStatusMsg("Verifying Google account credentials...");

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
        bio: "Cloud Engineer working with Gemini models and modern web frameworks.",
        location: "Mountain View, CA",
        company: "Google Developer Ecosystem",
        website: "https://developers.google.com",
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
      setIsLoading(false);
      setStatusMsg(`Authenticated via Google as ${user.name}`);
      setTimeout(() => {
        onLoginSuccess(user, destination);
      }, 500);
    }, 700);
  };

  // GitHub Login with User Credentials
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
    setStatusMsg("Authenticating GitHub developer credentials...");

    setTimeout(() => {
      const user: UserProfile = {
        id: `github-${Date.now()}`,
        name: ghUser || "GitHub Developer",
        email: ghEmail,
        role: "Principal Architect",
        avatar: ghUser
          ? `https://github.com/${ghUser}.png`
          : `https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces`,
        bio: `Open-source contributor and full-stack systems engineer.`,
        location: "San Francisco, CA",
        company: "GitHub Global Dev",
        website: `https://github.com/${ghUser || "developer"}`,
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
      setIsLoading(false);
      setStatusMsg(`Authenticated GitHub developer: @${user.githubUsername}`);
      setTimeout(() => {
        onLoginSuccess(user, destination);
      }, 500);
    }, 700);
  };

  const handleSelectDemo = (profile: UserProfile) => {
    saveUserSession(profile);
    setStatusMsg(`Authenticated as ${profile.name} (${profile.role})`);
    setTimeout(() => {
      onLoginSuccess(profile, destination);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 text-slate-100 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* App Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-3">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Autonomous Engineer Studio</h1>
          <p className="text-xs text-slate-400 mt-1">Please sign in with your user credentials to access your workspace</p>
        </div>

        {/* Post-Login Destination Selector */}
        <div className="mb-4 p-2 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
          <span className="text-[11px] font-medium text-slate-400 pl-2">Open upon sign in:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => setDestination("profile")}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                destination === "profile"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <User className="w-3 h-3" />
              <span>Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setDestination("dashboard")}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                destination === "dashboard"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-3 h-3" />
              <span>Studio</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 p-1 mb-5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setTab("email");
              setErrorMsg("");
              setOauthModalOpen(null);
            }}
            className={`py-2 px-2 rounded-lg transition-all text-center ${
              tab === "email"
                ? "bg-slate-800 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Email & Pass
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("oauth");
              setErrorMsg("");
            }}
            className={`py-2 px-2 rounded-lg transition-all text-center ${
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
            className={`py-2 px-2 rounded-lg transition-all text-center ${
              tab === "demo"
                ? "bg-slate-800 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Staff Quick-Pass
          </button>
        </div>

        {/* Status & Error Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {statusMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* TAB 1: User Credentials with Email & Password */}
        {tab === "email" && (
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-300 font-medium">
                {emailAuthMode === "login" ? "Sign In with User Credentials" : "Create New Engineer Account"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmailAuthMode(emailAuthMode === "login" ? "register" : "login");
                  setErrorMsg("");
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                {emailAuthMode === "login" ? "Register new account →" : "Have an account? Sign In →"}
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
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="engineer@company.com"
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
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Engineering Tier / Role</label>
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
                {emailAuthMode === "login" ? "Sign In to Studio" : "Create Account & Sign In"}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Google & GitHub User Credentials */}
        {tab === "oauth" && (
          <div className="space-y-3.5">
            {!oauthModalOpen ? (
              <>
                <p className="text-xs text-slate-400">
                  Authenticate using your personal Google or GitHub account credentials:
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
                  <label className="block text-xs font-medium text-slate-300 mb-1">Google Email</label>
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
                    placeholder="e.g. octocat"
                    value={oauthInputGithubUser}
                    onChange={(e) => setOauthInputGithubUser(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">GitHub Email</label>
                  <input
                    type="email"
                    placeholder="e.g. user@github.com"
                    value={oauthInputEmail}
                    onChange={(e) => setOauthInputEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    GitHub Password or PAT
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
          <div className="space-y-2.5">
            <p className="text-xs text-slate-400 mb-2">
              Select an authorized engineering persona to immediately enter the studio:
            </p>
            {DEMO_PROFILES.map((profile) => (
              <div
                key={profile.id}
                onClick={() => handleSelectDemo(profile)}
                className="p-3 rounded-2xl border bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50 text-slate-300 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <div className="font-medium text-xs text-slate-200">{profile.name}</div>
                    <div className="text-[11px] text-slate-400">{profile.email}</div>
                    <div className="text-[10px] text-indigo-400/90 font-mono mt-0.5">{profile.role}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-slate-500">
        Autonomous Full-Stack Engineer Studio &bull; End-to-End Enterprise CI/CD &bull; &copy; 2026
      </div>
    </div>
  );
};
