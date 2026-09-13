// path: src/components/views/VSCodeBridgeView.tsx
import React, { useState } from "react";
import { testVSCodeEndpoint } from "../../services/gemini";
import {
  Terminal,
  Cpu,
  Key,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Code2,
  Send,
  RefreshCw,
  Sparkles,
  Layers,
  Settings,
  ShieldCheck,
} from "lucide-react";

export const VSCodeBridgeView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [activeClientTab, setActiveClientTab] = useState<"continue" | "cline" | "curl">("continue");

  // Live test prompt
  const [testPrompt, setTestPrompt] = useState(
    "Analyze this function for memory leaks and provide a complete refactor: function listen() { window.addEventListener('resize', () => {}); }"
  );
  const [isTesting, setIsTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<any | null>(null);

  const endpointUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/vscode/chat`
    : "http://localhost:3000/api/vscode/chat";

  const bridgeToken = "sk-auto-eng-studio-staff-bridge-live";

  const continueConfigSnippet = `{
  "models": [
    {
      "title": "Autonomous Senior Engineer",
      "provider": "openai",
      "model": "gemini-3.1-pro-preview",
      "apiBase": "${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/vscode",
      "apiKey": "${bridgeToken}",
      "roles": ["chat", "edit"]
    }
  ]
}`;

  const clineConfigSnippet = `API Provider: OpenAI-compatible
Base URL: ${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/vscode
API Key: ${bridgeToken}
Model ID: gemini-3.1-pro-preview
Context Window: 1,000,000 tokens`;

  const curlSnippet = `curl -X POST ${endpointUrl} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${bridgeToken}" \\
  -d '{"prompt": "Refactor src/utils/format.ts to strict TypeScript with no duplicate helpers"}'`;

  const handleRunBridgeTest = async () => {
    if (!testPrompt.trim()) return;
    setIsTesting(true);
    setTestResponse(null);

    try {
      const res = await testVSCodeEndpoint(testPrompt.trim());
      setTestResponse(res);
    } catch (err: any) {
      setTestResponse({ error: err.message || "Failed to reach bridge endpoint" });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
              <Terminal className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">VS Code AI Extension Bridge</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold">
                  OpenAI Compatible
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Connect your local Visual Studio Code directly into this engineering agent. Compatible with popular
                developer extensions like Continue.dev, Cline, Roo Code, or custom scripts using standard completions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-400 font-mono">Agent Bridge Active</span>
          </div>
        </div>

        {/* Credentials Bar */}
        <div className="mt-5 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Bridge Endpoint URL</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(endpointUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Copy URL
              </button>
            </div>
            <div className="font-mono text-xs text-slate-200 truncate">{endpointUrl}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Bridge Token (Bearer)</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(bridgeToken);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1"
              >
                {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Copy Token
              </button>
            </div>
            <div className="font-mono text-xs text-slate-200 truncate">{bridgeToken}</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Extension Setup Guide (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                IDE Extension Setup
              </span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg text-xs">
                <button
                  onClick={() => setActiveClientTab("continue")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeClientTab === "continue"
                      ? "bg-slate-800 text-white font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Continue.dev
                </button>
                <button
                  onClick={() => setActiveClientTab("cline")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeClientTab === "cline"
                      ? "bg-slate-800 text-white font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Cline / Roo
                </button>
                <button
                  onClick={() => setActiveClientTab("curl")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeClientTab === "curl"
                      ? "bg-slate-800 text-white font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  cURL / Script
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {activeClientTab === "continue" && (
                <div>
                  <p className="text-xs text-slate-400 mb-2">
                    Add this configuration to your <code className="text-slate-200">~/.continue/config.json</code> file in VS Code:
                  </p>
                  <div className="relative">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(continueConfigSnippet);
                        setCopiedConfig(true);
                        setTimeout(() => setCopiedConfig(false), 2000);
                      }}
                      className="absolute right-3 top-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 border border-slate-700 transition-colors"
                    >
                      {copiedConfig ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copy JSON
                    </button>
                    <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-cyan-300 font-mono overflow-x-auto leading-relaxed">
                      {continueConfigSnippet}
                    </pre>
                  </div>
                </div>
              )}

              {activeClientTab === "cline" && (
                <div>
                  <p className="text-xs text-slate-400 mb-2">
                    In the Cline / Roo Code settings panel, choose <strong>OpenAI-compatible</strong> and fill in:
                  </p>
                  <div className="relative">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(clineConfigSnippet);
                        setCopiedConfig(true);
                        setTimeout(() => setCopiedConfig(false), 2000);
                      }}
                      className="absolute right-3 top-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 border border-slate-700 transition-colors"
                    >
                      {copiedConfig ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copy Settings
                    </button>
                    <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-emerald-300 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
                      {clineConfigSnippet}
                    </pre>
                  </div>
                </div>
              )}

              {activeClientTab === "curl" && (
                <div>
                  <p className="text-xs text-slate-400 mb-2">
                    Invoke the agent directly from your local terminal or bash workflow:
                  </p>
                  <div className="relative">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(curlSnippet);
                        setCopiedConfig(true);
                        setTimeout(() => setCopiedConfig(false), 2000);
                      }}
                      className="absolute right-3 top-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 border border-slate-700 transition-colors"
                    >
                      {copiedConfig ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copy Bash
                    </button>
                    <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-amber-300 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
                      {curlSnippet}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                All completions route server-side with Gemini 3.1 Pro High Thinking. Zero local GPU load.
              </span>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Bridge Test Terminal (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Live Bridge Test Terminal
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Simulator</span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Test Prompt (Simulate VS Code Request)
                </label>
                <textarea
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleRunBridgeTest}
                disabled={isTesting || !testPrompt.trim()}
                className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing via /api/vscode/chat...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Test Request to Bridge
                  </>
                )}
              </button>

              {/* Response output */}
              {testResponse && (
                <div className="mt-4 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Response from Bridge Server</span>
                    <span className="font-mono text-[10px] text-emerald-400">
                      {testResponse.model || "gemini-3.1-pro-preview"}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-72 whitespace-pre-wrap leading-relaxed">
                    {testResponse.choices?.[0]?.message?.content ||
                      JSON.stringify(testResponse, null, 2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
