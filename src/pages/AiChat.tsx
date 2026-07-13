import React, { useState } from "react";
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
import { Sparkles, Search, Trash2, Copy, Check } from "lucide-react";
import { getDomainName } from "../services/scanner";

const QUICK_QUESTIONS = [
  "Что это за сайт?",
  "Насколько он безопасен?",
  "Какие технологии используются?",
  "Как улучшить SEO?",
  "Как увеличить скорость?",
  "Какие слабые места?",
];

export const AiChat: React.FC = () => {
  const { currentReport } = useApp();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const question = text || input.trim();
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
      const response = await sendAiQuestion(question, currentReport || {});
      const assistantMsg: AiMessage = {
        role: "assistant",
        text: response.text,
        timestamp: Date.now(),
        sections: response.sections,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setError("Не удалось получить ответ. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError("");
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Header */}
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
            Задайте любой вопрос о проанализированном сайте. AI использует все
            данные сканирования.
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Очистить историю
          </Button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick questions */}
        <Card variant="glass" className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Быстрые вопросы</CardTitle>
            <CardDescription>Нажмите, чтобы получить ответ</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {QUICK_QUESTIONS.map((q) => (
              <motion.button
                key={q}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-left px-3 py-2.5 rounded-xl bg-zinc-950/40 border border-fuchsia-500/10 hover:border-fuchsia-400 hover:bg-fuchsia-500/5 text-zinc-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer text-xs"
              >
                {q}
              </motion.button>
            ))}
          </CardContent>
        </Card>

        {/* Right: Chat area */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card
            variant="glass"
            className="flex flex-col"
            style={{ minHeight: "600px" }}
          >
            <CardHeader className="border-b border-fuchsia-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" />
                  <CardTitle>Чат с AI</CardTitle>
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
              style={{ maxHeight: "600px" }}
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
                        ? `Задайте любой вопрос о сайте ${getDomainName(currentReport.url)}. AI использует все данные сканирования.`
                        : "Вы можете задавать любые вопросы. Для анализа конкретного сайта сначала выполните сканирование на главной странице."}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 ${
                        msg.role === "user"
                          ? "bg-linear-to-br from-fuchsia-500/20 to-cyan-500/20 border border-fuchsia-500/30 text-white"
                          : "bg-zinc-950/60 border border-fuchsia-500/10 text-zinc-200"
                      }`}
                    >
                      {msg.role === "assistant" && msg.sections ? (
                        <div className="flex flex-col gap-3">
                          {msg.sections.map((section, sIdx) => (
                            <div key={sIdx} className="flex flex-col gap-1.5">
                              <span className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-wider">
                                {section.title}
                              </span>
                              <div className="text-[11px] leading-relaxed text-zinc-300">
                                <p className="mb-1">
                                  <strong>Факты:</strong>{" "}
                                  {section.facts.join("; ")}
                                </p>
                                <p className="mb-1">
                                  <strong>Объяснение:</strong>{" "}
                                  {section.explanation}
                                </p>
                                <p className="mb-1">
                                  <strong>Технически:</strong>{" "}
                                  {section.technical}
                                </p>
                                {section.recommendations?.length > 0 && (
                                  <p>
                                    <strong>Рекомендации:</strong>{" "}
                                    {section.recommendations.join("; ")}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                        <span className="text-[9px] text-zinc-500 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {msg.role === "assistant" && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleCopy(msg.text)}
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
                        AI анализирует данные...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input area */}
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
