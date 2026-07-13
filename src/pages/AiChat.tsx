import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { sendAiQuestion } from "../services/aiService";
import type { AiMessage } from "../services/aiService";
import {
  Sparkles,
  Search,
  Trash2,
  Copy,
  Check,
  ChevronsRight,
} from "lucide-react";
import { getDomainName } from "../services/scanner";

const QUICK_QUESTIONS = [
  "Привет",
  "Объясни JavaScript",
  "Помоги написать React компонент",
  "Как работает DNS?",
  "Что такое SSL?",
  "Какие технологии использует сайт?",
  "Почему сайт медленный?",
  "Как улучшить SEO?",
  "Какие проблемы безопасности?",
  "Как реализовать похожий интерфейс?",
];

const SESSION_STORAGE_KEY = "webscope-ai-session";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function renderInlineMarkdown(text: string): React.ReactNode {
  let value = escapeHtml(text);
  value = value.replace(
    /`([^`]+)`/g,
    '<code class="rounded bg-fuchsia-500/15 px-1 py-0.5 text-fuchsia-200">$1</code>',
  );
  value = value.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  value = value.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  value = value.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a class="text-cyan-300 underline" href="$2" target="_blank" rel="noreferrer">$1</a>',
  );
  return <span dangerouslySetInnerHTML={{ __html: value }} />;
}

function renderMarkdownMessage(
  text: string,
  onCopyCode: (snippet: string) => void,
): React.ReactNode {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];
  let codeLines: string[] = [];
  let codeLang = "text";
  let inCodeBlock = false;

  const flushList = () => {
    if (listItems.length === 0) return;
    nodes.push(
      <ul
        key={`list-${nodes.length}`}
        className="list-disc pl-5 space-y-1 text-xs leading-relaxed text-zinc-300"
      >
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  const flushCodeBlock = () => {
    if (codeLines.length === 0) return;
    nodes.push(
      <div
        key={`code-${nodes.length}`}
        className="rounded-xl border border-fuchsia-500/20 bg-zinc-950 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-fuchsia-500/10 px-3 py-2 text-[10px] text-zinc-400">
          <span>{codeLang || "text"}</span>
          <button
            type="button"
            onClick={() => onCopyCode(codeLines.join("\n"))}
            className="text-fuchsia-300 underline underline-offset-2"
          >
            Копировать код
          </button>
        </div>
        <pre className="overflow-x-auto p-3 text-[11px] text-zinc-100">
          <code>{codeLines.join("\n")}</code>
        </pre>
      </div>,
    );
    codeLines = [];
    codeLang = "text";
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushList();
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = trimmed.replace(/```/, "").trim() || "text";
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (!trimmed) {
      flushList();
      return;
    }

    if (/^##\s+/.test(trimmed)) {
      flushList();
      nodes.push(
        <h2 key={`h2-${index}`} className="text-base font-bold text-white">
          {renderInlineMarkdown(trimmed.replace(/^##\s+/, ""))}
        </h2>,
      );
      return;
    }

    if (/^###\s+/.test(trimmed)) {
      flushList();
      nodes.push(
        <h3 key={`h3-${index}`} className="text-sm font-bold text-fuchsia-300">
          {renderInlineMarkdown(trimmed.replace(/^###\s+/, ""))}
        </h3>,
      );
      return;
    }

    if (
      /^-\s+/.test(trimmed) ||
      /^\*\s+/.test(trimmed) ||
      /^\d+\.\s+/.test(trimmed)
    ) {
      listItems.push(
        trimmed
          .replace(/^-\s+/, "")
          .replace(/^\*\s+/, "")
          .replace(/^\d+\.\s+/, ""),
      );
      return;
    }

    if (/^>\s+/.test(trimmed)) {
      flushList();
      nodes.push(
        <blockquote
          key={`quote-${index}`}
          className="border-l-2 border-fuchsia-500/40 pl-3 text-[11px] text-zinc-300"
        >
          {renderInlineMarkdown(trimmed.replace(/^>\s+/, ""))}
        </blockquote>,
      );
      return;
    }

    flushList();
    nodes.push(
      <p key={`p-${index}`} className="text-xs leading-relaxed text-zinc-300">
        {renderInlineMarkdown(trimmed)}
      </p>,
    );
  });

  flushList();
  if (inCodeBlock) {
    flushCodeBlock();
  }

  return <div className="space-y-2">{nodes}</div>;
}

export const AiChat: React.FC = () => {
  const { currentReport } = useApp();
  const [messages, setMessages] = useState<AiMessage[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const saved = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as AiMessage[]) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<{
    intervalId: number | null;
    fullText: string;
    messageId: number | null;
  }>({ intervalId: null, fullText: "", messageId: null });

  const lastAssistantMessage = useMemo(
    () =>
      [...messages].reverse().find((message) => message.role === "assistant"),
    [messages],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(messages),
    );
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const completeStreamingMessage = () => {
    if (!streamRef.current.intervalId || !streamRef.current.fullText) {
      return;
    }

    window.clearInterval(streamRef.current.intervalId);
    streamRef.current.intervalId = null;
    setMessages((prev) =>
      prev.map((message, index) => {
        if (index !== prev.length - 1) {
          return message;
        }

        return {
          ...message,
          text: streamRef.current.fullText,
          streaming: false,
          isComplete: true,
        };
      }),
    );
    setLoading(false);
  };

  const startStreamingReply = (
    fullText: string,
    sections?: AiMessage["sections"],
  ) => {
    const assistantId = Date.now();
    const assistantMsg: AiMessage = {
      role: "assistant",
      text: "",
      timestamp: Date.now(),
      sections,
      streaming: true,
      isComplete: false,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    streamRef.current = {
      intervalId: null,
      fullText,
      messageId: assistantId,
    };

    let current = 0;
    const chunkSize = Math.max(1, Math.ceil(fullText.length / 40));
    streamRef.current.intervalId = window.setInterval(() => {
      current = Math.min(current + chunkSize, fullText.length);
      const partialText = fullText.slice(0, current);

      setMessages((prev) =>
        prev.map((message, index) => {
          if (index !== prev.length - 1) {
            return message;
          }

          return {
            ...message,
            text: partialText,
            streaming: current < fullText.length,
          };
        }),
      );

      if (current >= fullText.length) {
        window.clearInterval(streamRef.current.intervalId ?? undefined);
        streamRef.current.intervalId = null;
        setMessages((prev) =>
          prev.map((message, index) => {
            if (index !== prev.length - 1) {
              return message;
            }

            return {
              ...message,
              text: fullText,
              streaming: false,
              isComplete: true,
            };
          }),
        );
        setLoading(false);
      }
    }, 16);
  };

  const handleSend = async (text?: string) => {
    const question = (text || input).trim();
    if (!question || loading) return;

    setError("");
    const userMsg: AiMessage = {
      role: "user",
      text: question,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendAiQuestion(
        question,
        currentReport || {},
        messages,
      );
      startStreamingReply(response.text, response.sections);
    } catch {
      setError("Не удалось получить ответ. Попробуйте снова.");
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError("");
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
    if (streamRef.current.intervalId) {
      window.clearInterval(streamRef.current.intervalId);
      streamRef.current.intervalId = null;
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="purple" glow size="md">
              <Sparkles className="w-3 h-3 mr-1" /> AI
            </Badge>
            {currentReport && (
              <span className="text-[10px] text-zinc-400 font-mono">
                {getDomainName(currentReport.url)}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            <span className="animate-gradient-text">AI Assistant</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Универсальный помощник: общение, кодинг, SEO, безопасность, дизайн и
            ответы по результатам анализа сайта.
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Очистить чат
          </Button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="glass" className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Быстрые вопросы</CardTitle>
            <CardDescription>
              Умный AI-чат поддерживает обычное общение и анализ сайта
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {QUICK_QUESTIONS.map((question) => (
              <motion.button
                key={question}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSend(question)}
                disabled={loading}
                className="text-left px-3 py-2.5 rounded-xl bg-zinc-950/40 border border-fuchsia-500/10 hover:border-fuchsia-400 hover:bg-fuchsia-500/5 text-zinc-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer text-xs"
              >
                {question}
              </motion.button>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card
            variant="glass"
            className="flex flex-col"
            style={{ minHeight: "640px" }}
          >
            <CardHeader className="border-b border-fuchsia-500/10">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" />
                  <CardTitle>Встроенный AI Assistant</CardTitle>
                </div>
                {messages.length > 0 && (
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {messages.length} сообщений
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
              style={{ maxHeight: "640px" }}
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-fuchsia-500/10 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-fuchsia-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-2">
                      Начните диалог
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-sm">
                      {currentReport
                        ? `AI уже подключён к отчёту сайта ${getDomainName(currentReport.url)} и будет использовать его как контекст.`
                        : "Вы можете общаться как с обычным ассистентом: объяснять код, задавать концептуальные вопросы, писать компоненты и получать рекомендации."}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={`${message.timestamp}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl p-4 ${
                        message.role === "user"
                          ? "bg-linear-to-br from-fuchsia-500/20 to-cyan-500/20 border border-fuchsia-500/30 text-white"
                          : "bg-zinc-950/60 border border-fuchsia-500/10 text-zinc-200"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="flex flex-col gap-3">
                          {renderMarkdownMessage(message.text, handleCopy)}
                          {message.sections?.length ? (
                            <div className="rounded-xl border border-fuchsia-500/15 bg-zinc-950/60 p-3 space-y-2">
                              <p className="text-[10px] uppercase tracking-wider text-fuchsia-300 font-bold">
                                Контекст отчёта
                              </p>
                              {message.sections.map((section, sectionIndex) => (
                                <div
                                  key={`${section.title}-${sectionIndex}`}
                                  className="space-y-1"
                                >
                                  <p className="text-[10px] text-white font-semibold">
                                    {section.title}
                                  </p>
                                  <p className="text-[10px] text-zinc-400">
                                    {section.facts.join(" • ")}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">
                          {message.text}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                        <span className="text-[9px] text-zinc-500 font-mono">
                          {new Date(message.timestamp).toLocaleTimeString(
                            "ru-RU",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>

                        {message.role === "assistant" && (
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => handleCopy(message.text)}
                            className="text-[9px] text-fuchsia-400 hover:text-fuchsia-300 font-semibold cursor-pointer flex items-center gap-1"
                          >
                            {copied ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            {copied ? "Скопировано" : "Копировать"}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-950/60 border border-fuchsia-500/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-fuchsia-400 border-t-transparent rounded-full"
                      />
                      <span className="text-xs text-zinc-400">
                        AI печатает...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {lastAssistantMessage?.streaming && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={completeStreamingMessage}
                  >
                    <ChevronsRight className="w-3.5 h-3.5 mr-1.5" />
                    Продолжить ответ
                  </Button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            <div className="border-t border-fuchsia-500/10 p-4">
              {error && (
                <div className="text-xs text-rose-400 mb-2">{error}</div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  type="text"
                  placeholder="Задайте любой вопрос..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="flex-1 py-2.5 text-xs bg-zinc-950/60"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={loading}
                  disabled={!input.trim()}
                >
                  <Search className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
