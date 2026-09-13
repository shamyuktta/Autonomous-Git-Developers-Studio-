// path: src/components/ConnectModal.tsx
import React, { useState } from "react";
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Github,
  Linkedin,
  Instagram,
  Mail,
  Heart,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const socialProfiles = [
    {
      id: "instagram",
      name: "Instagram",
      handle: "@sampvt._.06",
      url: "https://www.instagram.com/sampvt._.06/",
      icon: <Instagram className="w-5 h-5 text-pink-400" />,
      color: "from-pink-500/20 to-purple-500/20 border-pink-500/30 hover:border-pink-500/60",
      accent: "text-pink-400",
      description: "Personal updates, creative design, and tech lifestyle",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      handle: "Shamyuktta B",
      url: "https://www.linkedin.com/in/shamyuktta-b-200214359/",
      icon: <Linkedin className="w-5 h-5 text-blue-400" />,
      color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 hover:border-blue-500/60",
      accent: "text-blue-400",
      description: "Professional network, engineering career, & full-stack development",
    },
    {
      id: "github",
      name: "GitHub",
      handle: "@shamyuktta",
      url: "https://github.com/shamyuktta",
      icon: <Github className="w-5 h-5 text-emerald-400" />,
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 hover:border-emerald-500/60",
      accent: "text-emerald-400",
      description: "Open source repositories, AI prototypes, and full-stack systems",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative p-6 border-b border-slate-800/80 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-pink-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">Connect With Us</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  Author & Lead
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Shamyuktta B. • Autonomous Senior Full-Stack Workbench
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Social Links List */}
        <div className="relative p-6 space-y-3.5">
          <p className="text-xs text-slate-300 font-medium">
            Reach out directly for collaborations, engineering feedback, or discussions:
          </p>

          <div className="space-y-3">
            {socialProfiles.map((p) => (
              <div
                key={p.id}
                className={`group p-3.5 rounded-2xl bg-gradient-to-r ${p.color} border transition-all flex items-center justify-between gap-3`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {p.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{p.name}</span>
                      <span className={`text-[11px] font-mono ${p.accent}`}>{p.handle}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{p.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopy(p.url, p.id)}
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-slate-200 transition-all text-xs"
                    title="Copy Profile URL"
                  >
                    {copiedKey === p.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm group-hover:border-slate-600"
                  >
                    <span>Visit</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Email section */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-300">Direct Email</div>
                <div className="text-[11px] font-mono text-slate-400">shamyukttab@gmail.com</div>
              </div>
            </div>
            <button
              onClick={() => handleCopy("shamyukttab@gmail.com", "email")}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              {copiedKey === "email" ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer with copyright */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400 font-mono">
            @2026 reserved • Shamyuktta B. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
