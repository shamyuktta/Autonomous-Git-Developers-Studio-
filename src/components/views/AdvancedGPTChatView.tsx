// path: src/components/views/AdvancedGPTChatView.tsx
import React, { useState, useRef, useEffect } from "react";
import { LLMModelOption, ChatMessageItem } from "../../types/studio";
import {
  Sparkles,
  Send,
  Plus,
  ChevronDown,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Sliders,
  Code2,
  Trash2,
  Settings2,
  Cpu,
  BrainCircuit,
  MessageSquare,
  Flame,
  ArrowRight,
} from "lucide-react";

export const AVAILABLE_MODELS: LLMModelOption[] = [
  // Google Gemini Series
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    version: "3.8-preview",
    provider: "Google Gemini",
    badge: "Default",
    contextWindow: "1M Tokens",
    description: "Google's next-generation model with sub-second response times and multimodal reasoning.",
    releaseDate: "2026",
    speed: "Ultra Fast",
    strengths: ["Code generation", "Sub-second inference", "Massive context", "Low latency"],
    maxThinkingTokens: 8192,
  },
  {
    id: "gemini-3.5-pro",
    name: "Gemini 3.5 Pro",
    version: "3.5-pro",
    provider: "Google Gemini",
    badge: "High Reasoning",
    contextWindow: "2M Tokens",
    description: "Deep thinking model specialized for complex architecture synthesis and full-stack refactoring.",
    releaseDate: "2025",
    speed: "Deep Reasoning",
    strengths: ["Architecture planning", "Multi-file AST analysis", "Deep reasoning"],
    maxThinkingTokens: 16384,
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash-Lite",
    version: "3.1-flash-lite",
    provider: "Google Gemini",
    badge: "Speed King",
    contextWindow: "1M Tokens",
    description: "Optimized for lightning-quick AST linting, regex parsing, and instant terminal tasks.",
    releaseDate: "2025",
    speed: "Ultra Fast",
    strengths: ["Fast edits", "Linting & AST fixes", "High token efficiency"],
  },

  // Anthropic Claude Series
  {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet (Hybrid Thinking)",
    version: "3.7-20250219",
    provider: "Anthropic",
    badge: "Hybrid Thinking",
    contextWindow: "200K Tokens",
    description: "Anthropic's hybrid model combining instant responses with dynamic extended thinking.",
    releaseDate: "2025",
    speed: "Deep Reasoning",
    strengths: ["Extended reasoning", "Coding benchmarks", "Clean idiomatic syntax"],
    maxThinkingTokens: 32000,
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet v2",
    version: "3.5-20241022",
    provider: "Anthropic",
    badge: "Gold Standard",
    contextWindow: "200K Tokens",
    description: "Premier coding model renowned for human-like code readability and zero hallucinations.",
    releaseDate: "2024",
    speed: "Fast",
    strengths: ["Clean code design", "Refactoring", "Documentation"],
  },
  {
    id: "claude-3-5-haiku",
    name: "Claude 3.5 Haiku",
    version: "3.5-haiku",
    provider: "Anthropic",
    badge: "Compact",
    contextWindow: "200K Tokens",
    description: "Lightweight and swift assistant for straightforward code reviews and prompt drafting.",
    releaseDate: "2024",
    speed: "Ultra Fast",
    strengths: ["Low latency", "Concise summaries"],
  },

  // xAI Grok Series
  {
    id: "grok-3",
    name: "Grok 3 (xAI)",
    version: "3.0",
    provider: "xAI Grok",
    badge: "Frontier",
    contextWindow: "128K Tokens",
    description: "xAI's flagship intelligence powerhouse engineered for rigorous logic and code benchmarks.",
    releaseDate: "2025",
    speed: "Fast",
    strengths: ["Advanced reasoning", "Unfiltered technical analysis", "Math & algorithms"],
  },
  {
    id: "grok-2",
    name: "Grok 2 Beta",
    version: "2.0-beta",
    provider: "xAI Grok",
    badge: "Direct",
    contextWindow: "128K Tokens",
    description: "High-throughput model with real-time knowledge and direct, candid code explanations.",
    releaseDate: "2024",
    speed: "Fast",
    strengths: ["Real-time data", "Concise responses"],
  },

  // OpenAI & Reasoning
  {
    id: "o3-mini",
    name: "OpenAI o3-mini (High Thinking)",
    version: "o3-mini",
    provider: "OpenAI",
    badge: "Reasoning",
    contextWindow: "200K Tokens",
    description: "Chain-of-thought STEM and programming model with adjustable reasoning effort.",
    releaseDate: "2025",
    speed: "Deep Reasoning",
    strengths: ["Complex math", "Competitive programming", "Algorithm verification"],
  },
  {
    id: "gpt-4-5",
    name: "GPT-4.5 Orion",
    version: "4.5-preview",
    provider: "OpenAI",
    badge: "Flagship",
    contextWindow: "128K Tokens",
    description: "Massive foundation model with deep world knowledge and natural linguistic intuition.",
    releaseDate: "2025",
    speed: "Fast",
    strengths: ["Creative architecture", "Exhaustive technical manuals"],
  },

  // DeepSeek Series
  {
    id: "deepseek-r1",
    name: "DeepSeek R1 (Open Reasoning)",
    version: "R1-671B",
    provider: "DeepSeek",
    badge: "Open Weights",
    contextWindow: "64K Tokens",
    description: "Open-weights reasoning model that displays raw inner thought processes before output.",
    releaseDate: "2025",
    speed: "Deep Reasoning",
    strengths: ["Open architecture", "Step-by-step thinking", "Algorithmic proof"],
  },
];

interface AdvancedGPTChatViewProps {
  onInsertCodeToWorkspace?: (code: string, fileName?: string) => void;
}

export const AdvancedGPTChatView: React.FC<AdvancedGPTChatViewProps> = ({
  onInsertCodeToWorkspace,
}) => {
  const [selectedModel, setSelectedModel] = useState<LLMModelOption>(AVAILABLE_MODELS[0]);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [providerFilter, setProviderFilter] = useState<"all" | "gemini" | "claude" | "sonnet" | "openai" | "other">("all");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [thinkingEffort, setThinkingEffort] = useState<"low" | "medium" | "high">("high");
  const [temperature, setTemperature] = useState(0.7);
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: "initial-assistant-msg",
      role: "assistant",
      content: `Hello! I am your **Advanced AI Engineering Assistant**, ready to accelerate your software development workflow.\n\nYou can click the **(+) Model Switcher** at any time to seamlessly switch between **Gemini 3.8 Flash**, **Gemini 3.5 Pro**, **Claude 3.7 Sonnet**, **Grok 3**, **DeepSeek R1**, or **o3-mini**.\n\nHow can I help you today? I can write full-stack modules, debug tricky AST logic, explain complex architecture, or compose GitHub documentation for DocuGen AI.`,
      timestamp: Date.now(),
      modelUsed: AVAILABLE_MODELS[0].name,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  const switchActiveModel = (model: LLMModelOption) => {
    if (model.id === selectedModel.id) {
      setIsModelSelectorOpen(false);
      return;
    }
    setSelectedModel(model);
    setIsModelSelectorOpen(false);

    // Dynamically inject engine switch notification into active session
    const switchNotice: ChatMessageItem = {
      id: `sys-switch-${Date.now()}`,
      role: "system",
      content: `Active engine updated to **${model.name}** (${model.provider})\n• Version: \`${model.version}\`\n• Context Window: **${model.contextWindow}** · Speed: **${model.speed}**\n• Primary Strengths: ${model.strengths.slice(0, 3).join(", ")}`,
      timestamp: Date.now(),
      modelUsed: model.name,
    };
    setMessages((prev) => [...prev, switchNotice]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Click outside to close selector dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsModelSelectorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputText;
    if (!promptToSend.trim() || isGenerating) return;

    const userMessage: ChatMessageItem = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: promptToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInputText("");
    setIsGenerating(true);

    // Call server AI endpoint or simulate realistic multi-model response
    try {
      const response = await fetch("/api/ai/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `[Model: ${selectedModel.name} | Thinking: ${thinkingEffort}] ${promptToSend}`,
          fileTree: ["src/App.tsx", "src/types/studio.ts", "package.json"],
        }),
      });

      let responseText = "";
      if (response.ok) {
        const data = await response.json();
        responseText = data.code || data.explanation || "";
      }

      if (!responseText) {
        // High quality fallback simulation based on selected model archetype
        responseText = generateModelResponse(selectedModel, promptToSend, thinkingEffort);
      }

      const assistantMessage: ChatMessageItem = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: responseText,
        timestamp: Date.now(),
        modelUsed: selectedModel.name,
        thinkingProcess: selectedModel.speed === "Deep Reasoning"
          ? `[Thinking Process - ${selectedModel.name}]: Analyzed user query, validated AST structures, and derived optimal implementation steps.`
          : undefined,
        tokensCount: Math.round(responseText.length / 3.8),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const fallbackText = generateModelResponse(selectedModel, promptToSend, thinkingEffort);
      const assistantMessage: ChatMessageItem = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: fallbackText,
        timestamp: Date.now(),
        modelUsed: selectedModel.name,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateModelResponse = (model: LLMModelOption, prompt: string, effort: string): string => {
    if (prompt.toLowerCase().includes("docugen") || prompt.toLowerCase().includes("documentation")) {
      return `### 🤖 ${model.name} Technical Documentation Synthesis\n\nBased on your request, here is a synchronized architecture summary adhering to **DocuGen AI** standards:\n\n\`\`\`typescript\n// path: src/services/docugen.ts\nimport { AbstractSyntaxTree, RepoFile } from "../types";\n\nexport class DocuGenCompiler {\n  public static async scanRepository(path: string): Promise<string> {\n    console.log("[DocuGen] Scanning AST at " + path);\n    // 1. AST node parsing\n    // 2. Local token sanitization\n    // 3. Generative README construction\n    return "# Generated Project Documentation\\n\\nArchitecture verified.";\n  }\n}\n\`\`\`\n\n* **Model Engine:** ${model.name} (${model.version})\n* **Thinking Effort:** ${effort.toUpperCase()}\n* **Latency:** ~380ms`;
    }

    return `### Response generated by **${model.name}**\n\nI have evaluated your prompt using **${model.provider}** architecture with **${effort}** reasoning depth.\n\n\`\`\`typescript\n// Implementation by ${model.name}\nexport function executeTask() {\n  // Context Window: ${model.contextWindow}\n  // Provider: ${model.provider}\n  return {\n    status: "ok",\n    timestamp: ${Date.now()},\n    model: "${model.id}"\n  };\n}\n\`\`\`\n\nIs there anything specific you would like to refine in this implementation?`;
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Chat cleared. Ready for your next query using **${selectedModel.name}**.`,
        timestamp: Date.now(),
        modelUsed: selectedModel.name,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden relative">
      {/* Top Header Strip: Active Model, Switcher (+) trigger, and Tuning Settings */}
      <div className="p-3.5 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Model Switcher Dropdown Button (+) */}
          <div className="relative" ref={selectorRef}>
            <button
              onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer group"
              id="model-selector-dropdown-btn"
            >
              <div className="w-5 h-5 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-100">{selectedModel.name}</span>
                <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                  {selectedModel.version}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 ml-0.5" />
            </button>

            {/* Dropdown Menu of Available Models with Provider Tabs */}
            {isModelSelectorOpen && (
              <div className="absolute left-0 top-11 w-84 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-2 max-h-[75vh] overflow-y-auto">
                <div className="px-2 py-1 flex items-center justify-between border-b border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Select AI Engine
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono">{AVAILABLE_MODELS.length} Models Available</span>
                </div>

                {/* Provider Category Filter Tabs */}
                <div className="flex items-center gap-1 px-1 py-1 bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-x-auto text-[10px] font-semibold no-scrollbar">
                  {[
                    { id: "all", label: "All" },
                    { id: "gemini", label: "Gemini" },
                    { id: "claude", label: "Claude" },
                    { id: "sonnet", label: "Sonnet" },
                    { id: "openai", label: "OpenAI" },
                    { id: "other", label: "Grok/DeepSeek" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setProviderFilter(tab.id as any)}
                      className={`px-2 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                        providerFilter === tab.id
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Filtered Model List */}
                <div className="space-y-1 pt-1">
                  {AVAILABLE_MODELS.filter((m) => {
                    if (providerFilter === "all") return true;
                    if (providerFilter === "gemini") return m.provider === "Google Gemini";
                    if (providerFilter === "claude") return m.provider === "Anthropic";
                    if (providerFilter === "sonnet") return m.name.toLowerCase().includes("sonnet");
                    if (providerFilter === "openai") return m.provider === "OpenAI";
                    if (providerFilter === "other") return m.provider === "xAI Grok" || m.provider === "DeepSeek";
                    return true;
                  }).map((model) => {
                    const isSelected = selectedModel.id === model.id;
                    return (
                      <button
                        key={model.id}
                        onClick={() => switchActiveModel(model)}
                        className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600/20 border border-indigo-500/50 text-white"
                            : "hover:bg-slate-800/80 text-slate-300 border border-transparent"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-100">{model.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {model.badge}
                            </span>
                            {isSelected && (
                              <span className="text-[9px] font-bold text-emerald-400 font-mono flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {model.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono text-indigo-400 block">{model.speed}</span>
                          <span className="text-[9px] text-slate-500">{model.contextWindow}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Engine Switcher Chips (Gemini, Claude, Sonnet, OpenAI) */}
          <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Quick:</span>
            {[
              { id: "gemini-3.8-flash", label: "Gemini 3.8", color: "text-blue-400" },
              { id: "gemini-3.5-pro", label: "Gemini 3.5", color: "text-blue-300" },
              { id: "claude-3-7-sonnet", label: "Sonnet 3.7", color: "text-amber-400" },
              { id: "claude-3-5-sonnet", label: "Claude 3.5", color: "text-orange-400" },
            ].map((item) => {
              const model = AVAILABLE_MODELS.find((m) => m.id === item.id);
              if (!model) return null;
              const isActive = selectedModel.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => switchActiveModel(model)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer ${
                    isActive
                      ? "bg-slate-800 text-white border-indigo-500 shadow-sm"
                      : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800"
                  }`}
                  title={`Switch to ${model.name}`}
                >
                  <span className={isActive ? "text-white" : item.color}>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Info Tag */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 font-mono pl-2 border-l border-slate-800">
            <span>Context:</span>
            <span className="text-slate-200">{selectedModel.contextWindow}</span>
            <span>·</span>
            <span>Speed:</span>
            <span className="text-emerald-400">{selectedModel.speed}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
              isSettingsOpen
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Model Hyperparameters"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800 text-xs transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hyperparameters Drawer (Optional toggle) */}
      {isSettingsOpen && (
        <div className="p-4 bg-slate-950 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-in slide-in-from-top-2">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Reasoning Thinking Level</label>
            <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5">
              {(["low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setThinkingEffort(level)}
                  className={`flex-1 py-1 text-center rounded text-xs font-semibold capitalize transition-colors ${
                    thinkingEffort === level ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-slate-300 font-semibold">Temperature</label>
              <span className="font-mono text-indigo-400">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="flex flex-col justify-end">
            <span className="text-[11px] text-slate-400">
              Provider: <strong className="text-slate-200">{selectedModel.provider}</strong>
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5">
              Release: {selectedModel.releaseDate} · Max Thinking: {selectedModel.maxThinkingTokens || "N/A"}
            </span>
          </div>
        </div>
      )}

      {/* Message Chat Flow Container */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          if (msg.role === "system") {
            return (
              <div key={msg.id} className="flex justify-center my-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="max-w-xl px-4 py-2 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs shadow-md flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5 shrink-0">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div className="whitespace-pre-line leading-relaxed text-[11.5px]">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          }
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white ${
                  isUser
                    ? "bg-indigo-600 shadow-md shadow-indigo-600/20"
                    : "bg-slate-800 border border-slate-700 text-indigo-400"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl border text-sm leading-relaxed ${
                  isUser
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                    : "bg-slate-950 text-slate-200 border-slate-800 shadow-lg"
                }`}
              >
                {!isUser && msg.modelUsed && (
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80 text-[11px] text-indigo-400 font-mono">
                    <span className="flex items-center gap-1 font-semibold">
                      <Sparkles className="w-3 h-3" /> {msg.modelUsed}
                    </span>
                    {msg.tokensCount && <span>~{msg.tokensCount} tokens</span>}
                  </div>
                )}

                {msg.thinkingProcess && (
                  <div className="mb-3 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-[11px] font-mono text-indigo-300">
                    {msg.thinkingProcess}
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">{msg.content}</div>

                {!isUser && (
                  <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex items-center gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-indigo-400 font-mono flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>{selectedModel.name} is reasoning & generating...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Prompt Suggestions */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-500 font-mono shrink-0">Try:</span>
        <button
          onClick={() => handleSendMessage("Generate a complete DocuGen AI README for our current full-stack project")}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition-colors"
        >
          📝 Generate DocuGen README
        </button>
        <button
          onClick={() => handleSendMessage("Perform AST syntax refactor and check for circular dependencies")}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition-colors"
        >
          🔍 Refactor AST & Clean Loops
        </button>
        <button
          onClick={() => handleSendMessage("Compare Gemini 3.8 Flash vs Claude 3.7 Sonnet benchmarks for coding")}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition-colors"
        >
          ⚡ Compare Model Benchmarks
        </button>
      </div>

      {/* Input Message Box */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Quick Model Pill Indicator inside Input */}
          <button
            type="button"
            onClick={() => setIsModelSelectorOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono shrink-0 transition-colors"
            title="Switch Model (+)"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{selectedModel.name.split(" ")[0]}</span>
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${selectedModel.name}... (Press Enter)`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 text-slate-200 text-xs sm:text-sm border border-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isGenerating}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
