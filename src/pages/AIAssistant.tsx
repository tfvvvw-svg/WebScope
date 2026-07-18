import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  StopCircle,
  Copy,
  Check,
  Trash2,
  Download,
  Search,
  MessageSquare,
  Sparkles,
  User,
  Bot,
  RefreshCw,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { askAIStream } from "../services/apiService";
import type { AiMessage } from "../services/apiService";
import { useLanguage } from "../context/LanguageContext";

interface ChatMessage extends AiMessage {
  id: string;
}

export const AIAssistant: React.FC = () => {
  const { currentReport } = useApp();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("ai-chat-history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed);
      } catch (e) {
        console.error("Failed to load chat history:", e);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ai-chat-history", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom only if user is already near the bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const isNearBottom = 
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    if (isNearBottom) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      text: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      // Build history for API (exclude current message)
      const history = messages.map((msg) => ({
        role: msg.role,
        text: msg.text,
        timestamp: msg.timestamp,
      }));

      // Use streaming
      let fullResponse = "";
      const stream = askAIStream(
        userMessage.text,
        currentReport || undefined,
        history
      );

      abortControllerRef.current = new AbortController();

      for await (const chunk of stream) {
        if (abortControllerRef.current.signal.aborted) {
          break;
        }
        fullResponse += chunk;
        setStreamingContent(fullResponse);
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        text: fullResponse,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent("");
    } catch (error) {
      console.error("AI error:", error);
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        text: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setStreamingContent("");
  };

  const handleRegenerate = async (messageId: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    // Find the previous user message
    let userMessage: ChatMessage | undefined;
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        userMessage = messages[i];
        break;
      }
    }

    if (!userMessage) return;

    // Remove the assistant message and regenerate
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    setIsLoading(true);
    setStreamingContent("");

      try {
        const history = messages
          .filter((m) => m.id !== messageId)
          .map((msg) => ({
            role: msg.role,
            text: msg.text,
            timestamp: msg.timestamp,
          }));

      let fullResponse = "";
      const stream = askAIStream(
        userMessage.text,
        currentReport || undefined,
        history
      );

      abortControllerRef.current = new AbortController();

      for await (const chunk of stream) {
        if (abortControllerRef.current.signal.aborted) {
          break;
        }
        fullResponse += chunk;
        setStreamingContent(fullResponse);
      }

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        text: fullResponse,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent("");
    } catch (error) {
      console.error("AI error:", error);
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        text: `Error: ${error instanceof Error ? error.message : "Failed to regenerate"}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (confirm(t("confirmClearChat"))) {
      setMessages([]);
      localStorage.removeItem("ai-chat-history");
    }
  };

  const handleExportChat = () => {
    const exportData = messages
      .map((m) => `[${new Date(m.timestamp).toLocaleString()}] ${m.role === "user" ? "You" : "AI"}:\n${m.text}`)
      .join("\n\n---\n\n");

    const blob = new Blob([exportData], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredMessages = messages.filter((m) =>
    m.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering
    let html = text
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
        return `<pre><code class="language-${lang || "text"}">${escapeHtml(code.trim())}</code></pre>`;
      })
      // Inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // Headers
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Lists
      .replace(/^\s*-\s(.*$)/gim, "<li>$1</li>")
      // Line breaks
      .replace(/\n/g, "<br />");

    return html;
  };

  const escapeHtml = (text: string) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-3 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 border border-fuchsia-500/30">
              <Sparkles className="w-6 h-6 text-fuchsia-400" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-fuchsia-400/20 blur-md opacity-50 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {t("aiAssistant")}
            </h1>
            <p className="text-xs text-zinc-400">
              {currentReport
                ? `${t("analyzingUrl")}: ${currentReport.url}`
                : t("askAnything")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-lg hover:bg-fuchsia-500/10 text-zinc-400 hover:text-fuchsia-300 transition-colors"
            title={t("searchInChat")}
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportChat}
            className="p-2 rounded-lg hover:bg-fuchsia-500/10 text-zinc-400 hover:text-fuchsia-300 transition-colors"
            title={t("exportChat")}
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearChat}
            className="p-2 rounded-lg hover:bg-rose-500/10 text-zinc-400 hover:text-rose-300 transition-colors"
            title={t("clearChat")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={t("searchInConversation")}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-fuchsia-500/20 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500/50"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && !streamingContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center py-20"
          >
            <div className="relative mb-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 border border-fuchsia-500/30">
                <MessageSquare className="w-12 h-12 text-fuchsia-400" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-fuchsia-400/20 blur-xl opacity-50" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {t("startConversation")}
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mb-6">
              {t("conversationSubtitle")}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                t("suggestionReact"),
                t("suggestionPython"),
                t("suggestionCSS"),
                t("suggestionWebsite"),
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-zinc-900/60 border border-fuchsia-500/20 text-zinc-300 hover:border-fuchsia-500/50 hover:text-fuchsia-300 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {(searchQuery ? filteredMessages : messages).map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 border border-fuchsia-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-fuchsia-400" />
                </div>
              )}

              <div
                className={`group relative max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30"
                    : "bg-zinc-900/60 border border-fuchsia-500/10"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {message.role === "user" ? t("you") : t("aiAssistant")}
                  </span>
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(message.text, message.id)}
                        className="p-1 rounded hover:bg-fuchsia-500/20 text-zinc-400 hover:text-fuchsia-300"
                        title={t("copy")}
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => handleRegenerate(message.id)}
                        className="p-1 rounded hover:bg-fuchsia-500/20 text-zinc-400 hover:text-fuchsia-300"
                        title={t("regenerate")}
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div
                  className="text-sm text-zinc-200 prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }}
                />

                <div className="text-[10px] text-zinc-500 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>

              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-cyan-400" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming content */}
        {streamingContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 border border-fuchsia-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-fuchsia-400" />
            </div>
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-zinc-900/60 border border-fuchsia-500/10">
              <div
                className="text-sm text-zinc-200 prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(streamingContent) + '<span class="animate-pulse">|</span>',
                }}
              />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={t("askAnything")}
            disabled={isLoading}
            rows={1}
            className="w-full px-4 py-3 bg-zinc-900/60 border border-fuchsia-500/20 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500/50 resize-none disabled:opacity-50"
          />
        </div>

        {isLoading ? (
          <button
            type="button"
            onClick={handleStop}
            className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-xl text-rose-300 transition-colors flex items-center gap-2"
          >
            <StopCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">Stop</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-all flex items-center gap-2 shadow-lg shadow-fuchsia-500/20"
          >
            <Send className="w-4 h-4" />
            <span className="text-sm font-semibold">Send</span>
          </button>
        )}
      </form>

      {/* Typing indicator */}
      {isLoading && !streamingContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-center text-xs text-zinc-500"
        >
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default AIAssistant;