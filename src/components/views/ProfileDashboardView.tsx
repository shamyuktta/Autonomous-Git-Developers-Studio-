// path: src/components/views/ProfileDashboardView.tsx
import React, { useState } from "react";
import { UserProfile, HistoryActivityItem } from "../../types/studio";
import { ActiveTab } from "../Navbar";
import { saveUserSession } from "../../services/auth";
import {
  User,
  Mail,
  Building,
  MapPin,
  Globe,
  Phone,
  Camera,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  GitCommit,
  GitPullRequest,
  Terminal,
  Cpu,
  RefreshCw,
  Edit3,
  Save,
  Key,
  Bell,
  Sliders,
  ExternalLink,
  Lock,
  Flame,
  FileCode2,
  Trash2,
  Info,
  LogOut,
  CreditCard,
  TrendingUp,
  BarChart3,
  Clock,
  ArrowUpRight,
  Shield,
  Zap,
  Check,
} from "lucide-react";

interface ProfileDashboardViewProps {
  currentUser: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  activities: HistoryActivityItem[];
  workspaceFileCount: number;
  githubConnected: boolean;
  onNavigateToTab: (tab: ActiveTab) => void;
  onLogout?: () => void;
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
  "https://api.dicebear.com/7.x/bottts/svg?seed=engineer1",
  "https://api.dicebear.com/7.x/bottts/svg?seed=deepmind",
  "https://api.dicebear.com/7.x/identicon/svg?seed=architect",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=matrix",
];

export const ProfileDashboardView: React.FC<ProfileDashboardViewProps> = ({
  currentUser,
  onUpdateProfile,
  activities,
  workspaceFileCount,
  githubConnected,
  onNavigateToTab,
  onLogout,
}) => {
  // Navigation Sidebar Active Subtab
  const [activeSubTab, setActiveSubTab] = useState<
    "overview" | "edit" | "metrics" | "security" | "notifications" | "widgets"
  >("overview");

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [bio, setBio] = useState(
    currentUser.bio ||
      "Autonomous Senior Engineer driving zero-debt TypeScript architecture and cloud reliability."
  );
  const [location, setLocation] = useState(currentUser.location || "San Francisco, CA");
  const [company, setCompany] = useState(currentUser.company || "Google AI Studio Enterprise");
  const [website, setWebsite] = useState(currentUser.website || "https://github.com");
  const [phone, setPhone] = useState(currentUser.phone || "+1 (555) 012-3456");
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar);
  const [customAvatarInput, setCustomAvatarInput] = useState("");
  const [saveFeedback, setSaveFeedback] = useState("");

  // Notification state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [ciAlerts, setCiAlerts] = useState(true);
  const [securityScans, setSecurityScans] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);

  // Calculate metrics
  const totalActions = activities.length;
  const refactorsCount = activities.filter(
    (a) => a.type === "ast-refactor" || a.type === "deduplicate"
  ).length;
  const genCodeCount = activities.filter(
    (a) => a.type === "ai-generate" || a.type === "readme-gen"
  ).length;
  const debugFixCount = activities.filter((a) => a.type === "debug-fix").length;

  // Real-time Weekly Velocity Chart data (simulated from activities or defaults)
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const activityVelocity = [12, 18, 15, 24, 30, 20, Math.max(14, totalActions)];
  const maxVelocity = Math.max(...activityVelocity, 1);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenAvatar = customAvatarInput.trim() || avatarUrl;
    const updated: UserProfile = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      role,
      bio: bio.trim(),
      location: location.trim(),
      company: company.trim(),
      website: website.trim(),
      phone: phone.trim(),
      avatar: chosenAvatar,
    };

    saveUserSession(updated);
    onUpdateProfile(updated);
    setIsEditing(false);
    setSaveFeedback("Profile & photo updated and saved successfully!");
    setTimeout(() => setSaveFeedback(""), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP BANNER: USER IDENTIFICATION CARD */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-xl">
        {/* Decorative ambient blur */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* User Avatar with online beacon & quick edit trigger */}
            <div className="relative group shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg bg-slate-950"
              />
              <button
                onClick={() => {
                  setIsEditing(true);
                  setActiveSubTab("edit");
                }}
                title="Change Avatar Photo"
                className="absolute inset-0 bg-slate-950/70 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white"
              >
                <Camera className="w-6 h-6 text-indigo-300 mb-1" />
                <span className="text-[10px] font-semibold text-indigo-200">Change Photo</span>
              </button>
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center"
                title="Active Session: Authenticated"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            {/* User Identification Meta */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-100">{currentUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                  {currentUser.role}
                </span>
                {githubConnected && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> GitHub Linked
                  </span>
                )}
                <span className="text-[11px] font-mono text-slate-400">
                  ID: {currentUser.id.slice(0, 12)}
                </span>
              </div>

              {/* Bio */}
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {currentUser.bio ||
                  "Autonomous Senior Engineer delivering zero-debt TypeScript architecture and cloud reliability."}
              </p>

              {/* Contact Information Elements */}
              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 pt-1 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-mono text-slate-300">{currentUser.email}</span>
                </div>
                {currentUser.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono text-slate-300">{currentUser.phone}</span>
                  </div>
                )}
                {currentUser.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{currentUser.location}</span>
                  </div>
                )}
                {currentUser.company && (
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentUser.company}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Header CTA Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setActiveSubTab(isEditing ? "overview" : "edit");
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              {isEditing ? "View Profile" : "Edit Profile"}
            </button>
            <button
              onClick={() => onNavigateToTab("workspace")}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
            >
              <Terminal className="w-3.5 h-3.5" />
              Code Studio
            </button>
          </div>
        </div>

        {saveFeedback && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{saveFeedback}</span>
          </div>
        )}
      </div>

      {/* 2. MAIN LAYOUT: NAVIGATION SIDEBAR + CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* NAVIGATION SIDEBAR */}
        <aside className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md">
            <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Dashboard Navigation
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => {
                  setActiveSubTab("overview");
                  setIsEditing(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeSubTab === "overview" && !isEditing
                    ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <User className="w-4 h-4" />
                <span>User Identification</span>
              </button>

              <button
                onClick={() => {
                  setActiveSubTab("edit");
                  setIsEditing(true);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeSubTab === "edit" || isEditing
                    ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile & Photo</span>
              </button>

              <button
                onClick={() => {
                  setActiveSubTab("metrics");
                  setIsEditing(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeSubTab === "metrics"
                    ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Activity Metrics & KPIs</span>
              </button>

              <button
                onClick={() => {
                  setActiveSubTab("security");
                  setIsEditing(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeSubTab === "security"
                    ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Security & Credentials</span>
              </button>

              <button
                onClick={() => {
                  setActiveSubTab("notifications");
                  setIsEditing(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeSubTab === "notifications"
                    ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Notification Settings</span>
              </button>

              <button
                onClick={() => {
                  setActiveSubTab("widgets");
                  setIsEditing(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeSubTab === "widgets"
                    ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Data Widgets & Orders</span>
              </button>
            </nav>

            {/* Logout / Sign Out button directly inside the Navigation Sidebar */}
            {onLogout && (
              <div className="pt-3 mt-3 border-t border-slate-800">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Account Badge Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Account Verification
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Account Plan</span>
                <span className="font-semibold text-slate-200">Autonomous Enterprise</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>MFA Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> FIDO2 Active
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Workspace ID</span>
                <span className="font-mono text-[11px] text-slate-300">ae0c1071</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-3 space-y-6">
          {/* REAL-TIME ACTIVITY METRICS & KPIS HIGHLIGHT ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">AST Refactors</span>
                <Cpu className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{refactorsCount}</div>
                <p className="text-[11px] text-emerald-400 font-medium mt-0.5">100% duplicate free</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">AI Generative Tasks</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{genCodeCount}</div>
                <p className="text-[11px] text-purple-300 font-medium mt-0.5">Gemini 3.1 Pro High Thinking</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Self-Healing Fixes</span>
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{debugFixCount}</div>
                <p className="text-[11px] text-amber-300 font-medium mt-0.5">Automated error recovery</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Total Activity Events</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{totalActions}</div>
                <p className="text-[11px] text-emerald-300 font-medium mt-0.5">
                  {workspaceFileCount} workspace files
                </p>
              </div>
            </div>
          </div>

          {/* SUBTAB 1: USER IDENTIFICATION & OVERVIEW */}
          {activeSubTab === "overview" && !isEditing && (
            <div className="space-y-6">
              {/* Detailed Contact & Identity Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    User Identification & Professional Dossier
                  </h3>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setActiveSubTab("edit");
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Information
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Full Legal Name</span>
                    <p className="font-semibold text-slate-200 text-sm">{currentUser.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Primary Email</span>
                    <p className="font-mono text-slate-200">{currentUser.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Role & Title</span>
                    <p className="font-semibold text-indigo-400">{currentUser.role}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Company / Organization</span>
                    <p className="text-slate-200">{currentUser.company || "Google AI Studio Enterprise"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Work Location</span>
                    <p className="text-slate-200">{currentUser.location || "San Francisco, CA"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Direct Contact Phone</span>
                    <p className="font-mono text-slate-200">{currentUser.phone || "+1 (555) 012-3456"}</p>
                  </div>
                  {currentUser.website && (
                    <div className="md:col-span-2">
                      <span className="text-slate-400 block mb-1">Portfolio & Developer URL</span>
                      <a
                        href={currentUser.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline flex items-center gap-1 font-mono"
                      >
                        {currentUser.website} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Data Widgets Row: Recent Actions & Customized Usage Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Actions Data Widget */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      Recent Developer Actions
                    </h4>
                    <span className="text-[11px] text-slate-400">{activities.length} total logged</span>
                  </div>

                  {activities.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No actions logged yet.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {activities.slice(0, 5).map((act) => (
                        <div
                          key={act.id}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-medium text-slate-200 truncate">{act.title}</div>
                            <div className="text-[11px] text-indigo-400 font-mono truncate">
                              {act.filePath}
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {new Date(act.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Orders & Customized Usage Data Widget */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-400" />
                      Customized Usage & Quotas
                    </h4>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                      Tier 1 Active
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Workspace Virtual Storage</span>
                        <span className="font-mono text-slate-400">
                          {workspaceFileCount} / 250 files
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (workspaceFileCount / 250) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Gemini Reasoning Quota</span>
                        <span className="font-mono text-emerald-400">Unlimited (Google AI Studio)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "42%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>CI/CD Automated Build Minutes</span>
                        <span className="font-mono text-slate-400">500 / 500 mins/mo</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: "22%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 2: EDIT PROFILE & PROFILE PHOTO */}
          {(activeSubTab === "edit" || isEditing) && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-400" />
                  Edit Profile Information & Photo
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>

              {/* Profile Photo / Avatar Picker Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Choose Profile Photo / Avatar
                  </label>
                  <span className="text-[11px] text-slate-400">Select preset or enter custom URL</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {AVATAR_PRESETS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Avatar preset ${idx + 1}`}
                      onClick={() => {
                        setAvatarUrl(url);
                        setCustomAvatarInput("");
                      }}
                      className={`w-14 h-14 rounded-2xl object-cover cursor-pointer border-2 transition-all ${
                        (!customAvatarInput && avatarUrl === url)
                          ? "border-indigo-500 scale-105 shadow-md shadow-indigo-500/20"
                          : "border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-xs text-slate-400 mb-1">
                    Or specify custom image URL:
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/my-photo.jpg"
                    value={customAvatarInput}
                    onChange={(e) => setCustomAvatarInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Engineering Role</label>
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

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Work Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Direct Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Portfolio or GitHub URL</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Professional Bio</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Describe your engineering focus, experience, and domains..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SUBTAB 3: ACTIVITY METRICS & REAL-TIME GRAPHS */}
          {activeSubTab === "metrics" && (
            <div className="space-y-6">
              {/* Activity Velocity SVG Graph */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                      Weekly Activity & Action Flow Velocity
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Real-time graph of actions executed in this workspace
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    Live Telemetry
                  </span>
                </div>

                {/* SVG Bar Chart with values */}
                <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
                  {daysOfWeek.map((day, idx) => {
                    const count = activityVelocity[idx];
                    const heightPercent = Math.max(15, (count / maxVelocity) * 100);
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-300 transition-colors">
                          {count}
                        </span>
                        <div
                          className="w-full bg-slate-800 rounded-t-lg group-hover:bg-indigo-500 transition-all duration-300 relative overflow-hidden"
                          style={{ height: `${heightPercent}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/30 to-transparent" />
                        </div>
                        <span className="text-xs font-medium text-slate-400">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Task Distribution & KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    Engineering Task Breakdown
                  </h4>
                  <div className="space-y-3 pt-2 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>AST Refactors & Deduplication</span>
                        <span className="font-mono text-indigo-300">{refactorsCount}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.max(10, (refactorsCount / (totalActions || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>AI Code Generation & Modules</span>
                        <span className="font-mono text-purple-300">{genCodeCount}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${Math.max(15, (genCodeCount / (totalActions || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Automated Fixes & Healing</span>
                        <span className="font-mono text-amber-300">{debugFixCount}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${Math.max(10, (debugFixCount / (totalActions || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Quality & Reliability KPIs
                  </h4>
                  <div className="space-y-2.5 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">Code Quality Index</span>
                      <span className="font-bold text-emerald-400 font-mono">99.4% (Grade A)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">Test & Build Pass Rate</span>
                      <span className="font-bold text-emerald-400 font-mono">100% Green</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">Dead / Obsolete Code Ratio</span>
                      <span className="font-bold text-indigo-300 font-mono">0.0% Zero Debt</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 4: SECURITY CONTROLS */}
          {activeSubTab === "security" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  Security Controls, Credentials & Session Keys
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage developer credentials, GitHub access tokens, and active session protection
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      GitHub Personal Access Token (PAT)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Scoped for git commits, PR merges, and repository synchronization
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateToTab("github")}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    Configure PAT
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      Multi-Factor Authentication (MFA)
                    </div>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> FIDO2 Hardware Key Enforced
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">Active</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      Local Session Key Encryption
                    </div>
                    <div className="text-[11px] text-slate-400">
                      AES-256 with PBKDF2 derived keys in secure client vault
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">Secured</span>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 5: NOTIFICATION SETTINGS */}
          {activeSubTab === "notifications" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-400" />
                  Notification & Alert Preferences
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure when and how critical engineering events trigger system alerts
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-medium text-slate-200">
                      Security Secret Leak Detection Alerts
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Immediate alert if uncommitted API keys or tokens are detected
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityScans}
                    onChange={(e) => setSecurityScans(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-medium text-slate-200">
                      CI/CD Pipeline Failure Warnings
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Notify immediately when linter or automated verification fails
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={ciAlerts}
                    onChange={(e) => setCiAlerts(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-medium text-slate-200">
                      Autonomous Refactor Summaries
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Receive reports on AST cleanup, deduplication, and dead file purges
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 6: DATA WIDGETS (ORDERS, USAGE DATA, RECENT ACTIONS) */}
          {activeSubTab === "widgets" && (
            <div className="space-y-6">
              {/* Orders & Subscription Widget */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    Orders, Subscriptions & Licenses
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Active Order #AES-2026-9841
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Plan Tier</span>
                    <p className="font-semibold text-slate-200 text-sm">Enterprise Dev Seat</p>
                    <span className="text-[10px] text-emerald-400">Unlimited Autonomous AI</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Billing Period</span>
                    <p className="font-semibold text-slate-200 text-sm">Annual (Active)</p>
                    <span className="text-[10px] text-slate-400">Renews Sept 2027</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">License Key</span>
                    <p className="font-mono text-indigo-400 text-xs truncate">AES-PRO-9X84-FT21</p>
                    <span className="text-[10px] text-slate-400">Single Seat Assigned</span>
                  </div>
                </div>
              </div>

              {/* Comprehensive Recent Actions Widget */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Complete Action History & Audit Log
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{activities.length} entries</span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="font-semibold text-slate-200 truncate">{act.title}</div>
                        <div className="font-mono text-[11px] text-slate-400 truncate mt-0.5">
                          {act.filePath}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-indigo-300 font-mono">
                          {act.type}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {new Date(act.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
