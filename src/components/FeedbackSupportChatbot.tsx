// path: src/components/FeedbackSupportChatbot.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  ExternalLink,
  Mail,
  Check,
  Sparkles,
  PhoneCall,
  AlertCircle,
  HelpCircle,
  Bug,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  CornerDownRight,
  RefreshCw,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { SupportCategory, SupportTicket } from "../types/studio";

interface FeedbackSupportChatbotProps {
  userEmail?: string;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: number;
  ticket?: SupportTicket;
  suggestedActions?: Array<{
    label: string;
    action: () => void;
    icon?: React.ReactNode;
    variant?: "primary" | "whatsapp" | "email" | "secondary";
  }>;
}

export const FeedbackSupportChatbot: React.FC<FeedbackSupportChatbotProps> = ({
  userEmail = "shamyukttab@gmail.com",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [inputText, setInputText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SupportCategory>("general_help");
  const [isTyping, setIsTyping] = useState(false);
  const [adminEmail, setAdminEmail] = useState("shamyukttab@gmail.com");
  const [adminWhatsApp, setAdminWhatsApp] = useState("+1234567890");
  const [showDispatchModal, setShowDispatchModal] = useState<SupportTicket | null>(null);
  const [dispatchedChannels, setDispatchedChannels] = useState<{ [ticketId: string]: { email?: boolean; whatsapp?: boolean } }>({});
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: "👋 Hi there! I'm your **24/7 AI Support & Feedback Assistant** (like Flipkart & Amazon Help Centre).\n\nNeed help with an issue, have an enquiry about models or DocuGen, or want to share feedback? You can chat with me directly, and I can immediately forward your queries to our Admin via **Email** or **WhatsApp**!",
      timestamp: Date.now() - 60000,
      suggestedActions: [
        {
          label: "🐛 Report a Bug",
          action: () => handleQuickPrompt("I noticed an issue or bug in the workspace and need help fixing it.", "bug"),
        },
        {
          label: "💡 Request a Feature",
          action: () => handleQuickPrompt("I have an enquiry or feature request for the AI Studio models.", "feature_request"),
        },
        {
          label: "📲 Chat on WhatsApp",
          action: () => handleQuickPrompt("I want to speak with support via WhatsApp.", "general_help"),
        },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, messages]);

  const generateTicketId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `TKT-${randomNum}`;
  };

  const handleQuickPrompt = (prompt: string, category: SupportCategory) => {
    setSelectedCategory(category);
    handleSendMessage(prompt, category);
  };

  const handleSendMessage = (textToSend?: string, categoryToSend?: SupportCategory) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const category = categoryToSend || selectedCategory;
    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) {
      setInputText("");
    }
    setIsTyping(true);

    // AI resolution & ticket generation
    setTimeout(() => {
      const ticketId = generateTicketId();
      const friendlyResolution = generateResolution(text, category, ticketId);

      const ticket: SupportTicket = {
        id: `ticket-${Date.now()}`,
        ticketNumber: ticketId,
        category: category,
        userQuery: text,
        resolutionSummary: friendlyResolution.summary,
        timestamp: Date.now(),
        status: "open",
        adminEmail: adminEmail,
        whatsappContact: adminWhatsApp,
      };

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: friendlyResolution.response,
        timestamp: Date.now(),
        ticket: ticket,
        suggestedActions: [
          {
            label: "📲 Forward via WhatsApp",
            action: () => sendViaWhatsApp(ticket),
            variant: "whatsapp",
          },
          {
            label: "✉️ Send to Admin Email",
            action: () => sendViaEmail(ticket),
            variant: "email",
          },
        ],
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 900);
  };

  const generateResolution = (query: string, category: SupportCategory, ticketId: string) => {
    const lower = query.toLowerCase();

    if (category === "bug" || lower.includes("bug") || lower.includes("error") || lower.includes("broken")) {
      return {
        summary: "Bug report logged with console diagnostics and telemetry.",
        response: `Thank you for reporting this issue! I have filed support ticket **#${ticketId}** with high priority 🚨.\n\nOur team has received this report and is actively looking into it. In the meantime, you can easily forward the details directly to our admin team via **WhatsApp** or **Admin Email** using the buttons below!`,
      };
    }

    if (category === "feature_request" || lower.includes("feature") || lower.includes("add") || lower.includes("suggest")) {
      return {
        summary: "Feature proposal cataloged for product engineering roadmap.",
        response: `Awesome idea! 💡 I have registered feature ticket **#${ticketId}** for review by our engineering leads.\n\nWe love user suggestions like this. Would you like to forward this directly to our product admin via **WhatsApp** or **Email** to accelerate its timeline?`,
      };
    }

    if (lower.includes("whatsapp") || lower.includes("contact") || lower.includes("phone")) {
      return {
        summary: "Direct WhatsApp support channel dispatch.",
        response: `You got it! 📱 We have a direct WhatsApp channel just like Amazon/Flipkart support.\n\nTicket **#${ticketId}** is pre-formatted with your query and workspace details. Tap **Forward via WhatsApp** below to open WhatsApp with your message ready to send!`,
      };
    }

    return {
      summary: "User enquiry processed by Support Assistant.",
      response: `Thanks for reaching out! I have noted your enquiry under ticket **#${ticketId}**.\n\nI'm here to ensure you have a seamless experience. You can dispatch this enquiry directly to the system administrator via **WhatsApp** or **Admin Email** below!`,
    };
  };

  // Dispatch via WhatsApp (like Amazon/Flipkart support integration)
  const sendViaWhatsApp = (ticket: SupportTicket) => {
    const message = `*AI Studio Support Request [#${ticket.ticketNumber}]*\n` +
      `----------------------------------------\n` +
      `📂 *Category:* ${ticket.category.toUpperCase()}\n` +
      `👤 *User Email:* ${userEmail}\n` +
      `🕒 *Time:* ${new Date(ticket.timestamp).toLocaleString()}\n` +
      `💬 *Query / Issue:*\n"${ticket.userQuery}"\n\n` +
      `🤖 *AI Assistant Assessment:*\n${ticket.resolutionSummary || "Pending resolution"}\n` +
      `----------------------------------------\n` +
      `Please reply with instructions or status update.`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMsg}`;

    // Open WhatsApp in new tab
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    setDispatchedChannels((prev) => ({
      ...prev,
      [ticket.ticketNumber]: {
        ...prev[ticket.ticketNumber],
        whatsapp: true,
      },
    }));
  };

  // Dispatch via Admin Email
  const sendViaEmail = (ticket: SupportTicket) => {
    const subject = `[${ticket.ticketNumber}] Support Inquiry: ${ticket.category.toUpperCase()} from ${userEmail}`;
    const body = `Full-Stack Workbench AI Support Ticket\n` +
      `========================================\n` +
      `Ticket Number : ${ticket.ticketNumber}\n` +
      `Category      : ${ticket.category}\n` +
      `Submitted By  : ${userEmail}\n` +
      `Timestamp     : ${new Date(ticket.timestamp).toISOString()}\n\n` +
      `USER QUERY / ISSUE:\n${ticket.userQuery}\n\n` +
      `AI SUMMARY & TELEMETRY:\n${ticket.resolutionSummary || "N/A"}\n` +
      `========================================\n` +
      `Generated automatically by Workbench AI Support Chatbot.`;

    const mailtoUrl = `mailto:${adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open mail client
    window.open(mailtoUrl, "_blank");

    setDispatchedChannels((prev) => ({
      ...prev,
      [ticket.ticketNumber]: {
        ...prev[ticket.ticketNumber],
        email: true,
      },
    }));
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-5 right-5 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            id="feedback-chatbot-toggle-btn"
            className="group relative flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:via-teal-500 hover:to-indigo-500 text-white font-medium shadow-2xl shadow-emerald-500/25 border border-emerald-400/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 border-2 border-slate-900 animate-ping" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold tracking-wide block leading-none">Support & Feedback</span>
              <span className="text-[10px] text-emerald-100/80 font-mono">WhatsApp & Email Connected</span>
            </div>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Floating Customer Care Chat Window */}
      {isOpen && (
        <div
          id="feedback-chatbot-modal"
          className="fixed bottom-5 right-5 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-black/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header Bar */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white tracking-tight">Workbench Support AI</h3>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Direct dispatch to WhatsApp & Admin Email
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Minimize Support Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Dispatch Channels Badge Bar */}
          <div className="px-3.5 py-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-400">Admin:</span>
              <span className="font-mono text-slate-200 truncate max-w-[170px]" title={adminEmail}>
                {adminEmail}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <PhoneCall className="w-2.5 h-2.5" /> WhatsApp Active
              </span>
            </div>
          </div>

          {/* Category Selector Chips */}
          <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
            <span className="text-[10px] text-slate-500 font-mono uppercase pl-1 shrink-0">Topic:</span>
            {[
              { id: "general_help", label: "General Help", icon: HelpCircle },
              { id: "bug", label: "Bug / Error", icon: Bug },
              { id: "enquiry", label: "Enquiry", icon: MessageSquare },
              { id: "feature_request", label: "Feature Idea", icon: Lightbulb },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as SupportCategory)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-950/40 text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 shadow-md ${
                      isUser
                        ? "bg-indigo-600 text-white rounded-br-xs"
                        : "bg-slate-800/95 text-slate-200 border border-slate-700/70 rounded-bl-xs"
                    }`}
                  >
                    {/* Bot Title tag */}
                    {!isUser && (
                      <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-slate-700/60 text-[10px] font-bold text-emerald-400">
                        <Bot className="w-3.5 h-3.5" />
                        <span>AI Customer Care</span>
                        <span className="text-slate-500 font-normal ml-auto">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    )}

                    {/* Text content with simple markdown breaks */}
                    <div className="whitespace-pre-line leading-relaxed text-[12px]">
                      {msg.text}
                    </div>

                    {/* Associated Ticket Card */}
                    {msg.ticket && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="font-mono font-bold text-white text-[11px]">
                              {msg.ticket.ticketNumber}
                            </span>
                          </div>
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] uppercase">
                            {msg.ticket.category}
                          </span>
                        </div>

                        {/* Dispatch Status feedback */}
                        {dispatchedChannels[msg.ticket.ticketNumber] && (
                          <div className="text-[10px] flex items-center gap-2 pt-1 border-t border-slate-800 text-slate-300 font-mono">
                            {dispatchedChannels[msg.ticket.ticketNumber]?.whatsapp && (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <Check className="w-3 h-3" /> WhatsApp Sent
                              </span>
                            )}
                            {dispatchedChannels[msg.ticket.ticketNumber]?.email && (
                              <span className="text-blue-400 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Email Prepared
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Action Buttons */}
                  {msg.suggestedActions && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[88%]">
                      {msg.suggestedActions.map((action, idx) => {
                        let btnStyle = "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700";
                        if (action.variant === "whatsapp") {
                          btnStyle = "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-600/30";
                        } else if (action.variant === "email") {
                          btnStyle = "bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-600/30";
                        }

                        return (
                          <button
                            key={idx}
                            onClick={action.action}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${btnStyle}`}
                          >
                            <span>{action.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                <Bot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px]">AI Support agent is typing</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.3s]" />
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Issue Chips */}
          <div className="p-2 bg-slate-950/80 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-400">
            <span className="text-[10px] text-slate-500 font-mono shrink-0">Quick:</span>
            <button
              onClick={() => handleSendMessage("DocuGen failed to parse repository AST tree", "bug")}
              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 shrink-0 cursor-pointer"
            >
              Parse Error
            </button>
            <button
              onClick={() => handleSendMessage("Can you add support for Sonnet 3.7 Hybrid thinking tokens?", "feature_request")}
              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 shrink-0 cursor-pointer"
            >
              Model Request
            </button>
            <button
              onClick={() => handleSendMessage("How do I sync to my personal GitHub repository?", "general_help")}
              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 shrink-0 cursor-pointer"
            >
              GitHub Sync
            </button>
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Describe your issue, question, or enquiry..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
