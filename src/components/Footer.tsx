// path: src/components/Footer.tsx
import React from "react";
import {
  Github,
  Linkedin,
  Instagram,
  Heart,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Sparkles,
  Layers,
  ArrowUpRight,
  GitBranch,
} from "lucide-react";

interface FooterProps {
  onOpenConnect: () => void;
  onNavigate?: (tab: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenConnect, onNavigate }) => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-900">
          {/* Brand & Author Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100 tracking-tight">
                  Autonomous Senior Full-Stack Workbench
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  v2.6.4
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>Architected by</span>
                <button
                  onClick={onOpenConnect}
                  className="text-slate-200 font-semibold hover:text-indigo-400 transition-colors underline decoration-slate-700 underline-offset-4"
                >
                  Shamyuktta B.
                </button>
              </p>
            </div>
          </div>

          {/* Connect Us & Social Accounts */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-slate-400">Connect Us:</span>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/sampvt._.06/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/40 text-xs font-medium text-slate-300 hover:text-pink-400 transition-all shadow-sm group"
              title="Visit Instagram: @sampvt._.06"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
              <span>Instagram</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-pink-400 transition-colors" />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/shamyuktta-b-200214359/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 text-xs font-medium text-slate-300 hover:text-blue-400 transition-all shadow-sm group"
              title="Visit LinkedIn: Shamyuktta B"
            >
              <Linkedin className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>LinkedIn</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/shamyuktta"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-xs font-medium text-slate-300 hover:text-emerald-400 transition-all shadow-sm group"
              title="Visit GitHub: @shamyuktta"
            >
              <Github className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>GitHub</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </a>

            {/* Connect Modal Trigger */}
            <button
              onClick={onOpenConnect}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Connect Profile</span>
            </button>
          </div>
        </div>

        {/* Bottom Row with Mandatory Copyright Notice */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">@2026 reserved</span>
            <span>•</span>
            <span>© 2026 Shamyuktta B. All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Enterprise Cleanliness Protocol
            </span>
            <span>•</span>
            <span className="text-slate-400">Zero Codebase Debt Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
