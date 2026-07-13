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
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { GaugeChart } from "../components/charts/GaugeChart";
import { useNavigate } from "react-router-dom";
import {
  Globe,
  Cpu,
  Zap,
  ShieldCheck,
  Search,
  Server,
  Palette,
  Settings,
  Sparkles,
  Check,
  X,
  Clock,
  Star,
  ChevronDown,
} from "lucide-react";
import { getDomainName } from "../services/scanner";
import { useLanguage } from "../context/LanguageContext";
import { sendAiQuestion } from "../services/aiService";
import type { AiMessage } from "../services/aiService";

// (animations configured inline)

const QUICK_QUESTIONS = [
  "Что это за сайт?",
  "Насколько он безопасен?",
  "Какие технологии используются?",
  "Как улучшить SEO?",
  "Как увеличить скорость?",
  "Какие слабые места?",
];

function AiAssistant({ report }: { report: any }) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      const response = await sendAiQuestion(question, report);
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Ответ скопирован в буфер обмена");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
      {/* Left: Quick questions & info */}
      <Card variant="glass" className="lg:col-span-1">
        <CardHeader>
          <CardTitle>🤖 AI Assistant</CardTitle>
          <CardDescription>
            Задайте любой вопрос о проанализированном сайте
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Быстрые вопросы:
            </span>
            <div className="flex flex-col gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <motion.button
                  key={q}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSend(q)}
                  disabled={loading}
                  className="text-left px-3 py-2 rounded-xl bg-zinc-950/40 border border-fuchsia-500/10 hover:border-fuchsia-400 hover:bg-fuchsia-500/5 text-zinc-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                >
                  {q}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="border-t border-fuchsia-500/10 pt-3 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Статистика:
            </span>
            <div className="flex justify-between text-zinc-400">
              <span>Сообщений:</span>
              <span className="text-white font-bold">{messages.length}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Домен:</span>
              <span className="text-fuchsia-400 font-mono">
                {getDomainName(report.url)}
              </span>
            </div>
          </div>

          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="w-full"
            >
              Очистить историю
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Right: Chat area */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <Card
          variant="glass"
          className="flex flex-col"
          style={{ minHeight: "500px" }}
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
            style={{ maxHeight: "500px" }}
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-fuchsia-500/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-fuchsia-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Начните диалог
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                    Задайте любой вопрос о сайте. AI проанализирует все данные и
                    даст развёрнутый ответ.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
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
                      ? "bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 border border-fuchsia-500/30 text-white"
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
                              <strong>Факты:</strong> {section.facts.join("; ")}
                            </p>
                            <p className="mb-1">
                              <strong>Объяснение:</strong> {section.explanation}
                            </p>
                            <p className="mb-1">
                              <strong>Технически:</strong> {section.technical}
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
                        className="text-[9px] text-fuchsia-400 hover:text-fuchsia-300 font-semibold cursor-pointer"
                      >
                        Копировать
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

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
            {error && <div className="text-xs text-rose-400 mb-2">{error}</div>}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                type="text"
                placeholder="Задайте вопрос о сайте..."
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
  );
}

export const Analysis: React.FC = () => {
  const {
    currentReport,
    scanUrl,
    loading,
    scanProgress,
    toggleFavorite,
    setCompareSlot,
  } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "tech"
    | "performance"
    | "security"
    | "seo"
    | "server"
    | "design"
    | "capabilities"
    | "ai"
  >("overview");
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState("");

  // Local state to toggle recommendations index
  const [expandedRec, setExpandedRec] = useState<number | null>(null);

  const handleQuickScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setError("");
    try {
      await scanUrl(urlInput);
    } catch {
      setError("Scan failed. Try again.");
    }
  };

  // If no report is loaded, show a premium empty state
  if (!currentReport) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="bg-linear-to-br from-fuchsia-500/20 to-cyan-500/20 p-5 rounded-2xl text-fuchsia-400 shadow-lg shadow-fuchsia-500/30"
        >
          <Globe className="w-12 h-12" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {t("noReportTitle")}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
            {t("noReportDesc")}
          </p>
        </div>

        <form
          onSubmit={handleQuickScan}
          className="w-full max-w-md flex flex-col sm:flex-row gap-3 mt-4"
        >
          <div className="grow">
            <Input
              type="text"
              placeholder="e.g. stripe.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              error={error}
              startIcon={<Search className="w-4 h-4 text-zinc-500" />}
              className="py-2.5 text-xs bg-zinc-900/60"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!urlInput.trim()}
          >
            Start Scan
          </Button>
        </form>

        {loading && (
          <div className="w-full max-w-xs mt-4 flex flex-col gap-2">
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-fuchsia-500 transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              Crawler scanner progress: {scanProgress}%
            </span>
          </div>
        )}
      </div>
    );
  }

  const report = currentReport;
  const domain = getDomainName(report.url);

  // Tab configurations
  const tabs = [
    {
      id: "overview",
      label: t("overviewTab"),
      icon: <Globe className="w-4 h-4" />,
    },
    { id: "tech", label: t("techTab"), icon: <Cpu className="w-4 h-4" /> },
    {
      id: "performance",
      label: t("perfTab"),
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: "security",
      label: t("secTab"),
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    { id: "seo", label: "SEO", icon: <Search className="w-4 h-4" /> },
    {
      id: "server",
      label: t("serverInfo"),
      icon: <Server className="w-4 h-4" />,
    },
    {
      id: "design",
      label: t("designTab"),
      icon: <Palette className="w-4 h-4" />,
    },
    {
      id: "capabilities",
      label: t("capabilities"),
      icon: <Settings className="w-4 h-4" />,
    },
    { id: "ai", label: t("aiTab"), icon: <Sparkles className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Top details card info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-card p-6 hover-tilt"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-5 h-5 rounded-full shrink-0 animate-pulse-glow ring-2 ring-fuchsia-500/40"
            style={{
              backgroundColor: report.design.colorPalette[0]?.hex || "#a855f7",
              boxShadow: `0 0 20px ${report.design.colorPalette[0]?.hex || "#a855f7"}`,
            }}
          />
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight sm:text-2xl flex items-center gap-2">
              <span className="animate-gradient-text">{domain}</span>
              <Badge variant="purple" size="md" glow>
                Score {report.scores.overallRating}
              </Badge>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              {report.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCompareSlot(0, report);
              navigate("/compare");
            }}
          >
            Compare Site
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={() => toggleFavorite(report.id)}
          >
            <Star
              className={`w-4 h-4 mr-1.5 text-amber-400 ${currentReport?.id && (currentReport as any).isFavorite ? "fill-current" : ""}`}
            />
            Bookmark
          </Button>
        </div>
      </motion.div>

      {/* Tabs Header Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="overflow-x-auto border-b border-fuchsia-500/10 scrollbar-none pb-1"
      >
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 border cursor-pointer
                  ${
                    active
                      ? "bg-linear-to-r from-fuchsia-500/15 to-cyan-500/15 text-fuchsia-300 border-fuchsia-500/30 shadow-md shadow-fuchsia-500/10"
                      : "text-zinc-400 hover:text-fuchsia-300 hover:bg-fuchsia-500/5 border-transparent"
                  }
                `}
              >
                {tab.icon}
                {tab.label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-linear-to-r from-fuchsia-500 to-cyan-500 rounded-full" />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Tabs panels */}
      <div className="flex flex-col gap-6">
        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card variant="glass" className="lg:col-span-2">
              <CardHeader>
                <CardTitle>🌐 Primary Domain Information</CardTitle>
                <CardDescription>
                  Standard WHOIS, registration, and site definitions
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                <div className="flex justify-between border-b border-fuchsia-500/10 pb-2.5">
                  <span className="text-zinc-500">Website title:</span>
                  <span className="text-white font-semibold text-right max-w-[200px] truncate">
                    {report.title}
                  </span>
                </div>
                <div className="flex justify-between border-b border-fuchsia-500/10 pb-2.5">
                  <span className="text-zinc-500">Main Topic:</span>
                  <span className="text-white font-semibold">
                    {report.topic}
                  </span>
                </div>
                <div className="flex justify-between border-b border-fuchsia-500/10 pb-2.5">
                  <span className="text-zinc-500">Target Category:</span>
                  <span className="text-white font-semibold">
                    {report.category}
                  </span>
                </div>
                <div className="flex justify-between border-b border-fuchsia-500/10 pb-2.5">
                  <span className="text-zinc-500">Target Audience:</span>
                  <span className="text-white font-semibold text-right max-w-[200px] truncate">
                    {report.targetAudience}
                  </span>
                </div>
                <div className="flex justify-between border-b border-fuchsia-500/10 pb-2.5">
                  <span className="text-zinc-500">Country of Origin:</span>
                  <span className="text-white font-semibold">
                    {report.country}
                  </span>
                </div>
                <div className="flex justify-between border-b border-fuchsia-500/10 pb-2.5">
                  <span className="text-zinc-500">Primary Language:</span>
                  <span className="text-white font-semibold">
                    {report.primaryLanguage}
                  </span>
                </div>
                <div className="flex justify-between border-b border-fuchsia-500/10 pb-2.5">
                  <span className="text-zinc-500">Domain Age:</span>
                  <span className="text-fuchsia-400 font-mono font-semibold">
                    {report.domainAge}
                  </span>
                </div>
                <div className="flex justify-between border-b border-fuchsia-500/10 pb-2.5">
                  <span className="text-zinc-500">Domain Created:</span>
                  <span className="text-white font-mono">
                    {report.domainCreationDate}
                  </span>
                </div>
                <div className="flex justify-between border-b border-fuchsia-500/10 pb-2.5 sm:col-span-2">
                  <span className="text-zinc-500">Description Index:</span>
                  <span className="text-zinc-300 font-medium text-right max-w-md block mt-1 sm:mt-0">
                    {report.description}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Company Block */}
            <Card variant="glass" className="lg:col-span-1">
              <CardHeader>
                <CardTitle>🏢 {t("companyInfo")}</CardTitle>
                <CardDescription>
                  Incorporation and corporate statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-xs">
                {report.company ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                      <span className="text-zinc-500">{t("companyName")}:</span>
                      <span className="text-white font-semibold">
                        {report.company.companyName}
                      </span>
                    </div>
                    {report.company.ceo ? (
                      <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                        <span className="text-zinc-500">{t("ceo")}:</span>
                        <span className="text-white font-semibold">
                          {report.company.ceo}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                        <span className="text-zinc-500">{t("ceo")}:</span>
                        <span className="text-zinc-400 italic">
                          {t("notFound")}
                        </span>
                      </div>
                    )}
                    {report.company.founders &&
                    report.company.founders.length > 0 ? (
                      <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                        <span className="text-zinc-500">{t("founders")}:</span>
                        <span className="text-white font-semibold text-right max-w-40 truncate">
                          {report.company.founders.join(", ")}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                        <span className="text-zinc-500">{t("founders")}:</span>
                        <span className="text-zinc-400 italic text-right max-w-40 truncate">
                          {t("notFound")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                      <span className="text-zinc-500">HQ Location:</span>
                      <span className="text-white font-semibold text-right max-w-[160px] truncate">
                        {report.company.hqLocation || t("notFound")}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                      <span className="text-zinc-500">Official Mail:</span>
                      <span className="text-fuchsia-400 font-mono">
                        {report.company.contactInfo?.email ||
                          `contact@${domain}`}
                      </span>
                    </div>

                    {/* Social networks */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-zinc-500 mr-2">Socials:</span>
                      {report.company.socialMedia?.twitter && (
                        <Badge variant="default" className="cursor-pointer">
                          @{report.company.socialMedia.twitter}
                        </Badge>
                      )}
                      {report.company.socialMedia?.github && (
                        <Badge variant="default" className="cursor-pointer">
                          github/{report.company.socialMedia.github}
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-zinc-500 flex flex-col items-center justify-center gap-2">
                    <Clock className="w-8 h-8 text-zinc-700" />
                    <span>
                      No verified corporate records found for this domain.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 2. TECH STACK TAB */}
        {activeTab === "tech" && (
          <Card variant="glass">
            <CardHeader>
              <CardTitle>💻 Software Stack & Architecture</CardTitle>
              <CardDescription>
                Aggregated front-end libraries, backend frameworks, database
                structures, and assets CDNs
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Frontend */}
              <div className="flex flex-col gap-3.5 bg-zinc-950/40 border border-fuchsia-500/10/5 p-4 rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-400">
                  Frontend Stack
                </span>
                <div className="flex flex-wrap gap-2">
                  {report.technologies.frontend.map((tech) => (
                    <Badge key={tech} variant="purple">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Backend */}
              <div className="flex flex-col gap-3.5 bg-zinc-950/40 border border-fuchsia-500/10/5 p-4 rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Backend Core
                </span>
                <div className="flex flex-wrap gap-2">
                  {report.technologies.backend.map((tech) => (
                    <Badge key={tech} variant="info">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Database */}
              <div className="flex flex-col gap-3.5 bg-zinc-950/40 border border-fuchsia-500/10/5 p-4 rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Database Storage
                </span>
                <div className="flex flex-wrap gap-2">
                  {report.technologies.databases.map((tech) => (
                    <Badge key={tech} variant="success">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* CMS & Styling */}
              <div className="flex flex-col gap-3.5 bg-zinc-950/40 border border-fuchsia-500/10/5 p-4 rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  CMS & Style Configs
                </span>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">CMS Framework:</span>
                    <span className="text-white font-medium">
                      {report.technologies.cms.join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">CSS Engine:</span>
                    <span className="text-white font-medium">
                      {report.technologies.cssFramework.join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fonts & UI Icons */}
              <div className="flex flex-col gap-3.5 bg-zinc-950/40 border border-fuchsia-500/10/5 p-4 rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Typography & UI Assets
                </span>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Font families:</span>
                    <span className="text-white font-medium truncate max-w-30">
                      {report.technologies.fonts.join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Icons:</span>
                    <span className="text-white font-medium">
                      {report.technologies.icons.join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Analytics & CDN */}
              <div className="flex flex-col gap-3.5 bg-zinc-950/40 border border-fuchsia-500/10/5 p-4 rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Marketing & Analytics
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {report.technologies.analytics.map((item) => (
                    <Badge key={item} variant="default">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3. PERFORMANCE TAB */}
        {activeTab === "performance" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Speedometers */}
            <Card variant="glass" className="lg:col-span-1">
              <CardHeader>
                <CardTitle>⚡ Lighthouse Diagnostics</CardTitle>
                <CardDescription>Simulated audit audit ratings</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <GaugeChart
                  score={report.performance.lighthouseScore.performance}
                  title="Performance"
                  size={90}
                />
                <GaugeChart
                  score={report.performance.lighthouseScore.accessibility}
                  title="Accessibility"
                  size={90}
                />
                <GaugeChart
                  score={report.performance.lighthouseScore.bestPractices}
                  title="Best Practices"
                  size={90}
                />
                <GaugeChart
                  score={report.performance.lighthouseScore.seo}
                  title="SEO Rating"
                  size={90}
                />
              </CardContent>
            </Card>

            {/* Core Web Vitals */}
            <Card variant="glass" className="lg:col-span-2">
              <CardHeader>
                <CardTitle>🚀 Loading Times & Vitals</CardTitle>
                <CardDescription>
                  Payload weights, scripts overhead, and layout shift
                  diagnostics
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {/* Visual grid numbers */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-zinc-950/40 border border-fuchsia-500/10/5 p-4 rounded-xl">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                      Page Load Speed
                    </span>
                    <span className="text-xl font-bold text-emerald-400 block mt-1">
                      {report.performance.loadSpeedMs} ms
                    </span>
                  </div>
                  <div className="bg-zinc-950/40 border border-fuchsia-500/10/5 p-4 rounded-xl">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                      Page Payload Size
                    </span>
                    <span className="text-xl font-bold text-white block mt-1">
                      {report.performance.pageSizeKb} KB
                    </span>
                  </div>
                  <div className="bg-zinc-950/40 border border-fuchsia-500/10/5 p-4 rounded-xl">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                      HTTP Request count
                    </span>
                    <span className="text-xl font-bold text-white block mt-1">
                      {report.performance.requestsCount} req
                    </span>
                  </div>
                </div>

                {/* Core web vitals bars */}
                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                    <span className="text-zinc-400">
                      Largest Contentful Paint (LCP):
                    </span>
                    <span className="font-semibold text-white">
                      {report.performance.coreWebVitals.lcpSec}s
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                    <span className="text-zinc-400">
                      First Input Delay (FID):
                    </span>
                    <span className="font-semibold text-white">
                      {report.performance.coreWebVitals.fidMs}ms
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                    <span className="text-zinc-400">
                      Cumulative Layout Shift (CLS):
                    </span>
                    <span className="font-semibold text-white">
                      {report.performance.coreWebVitals.cls}
                    </span>
                  </div>
                </div>

                {/* Optimization Accordions */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-white">
                    Recommendations ({report.performance.recommendations.length}
                    ):
                  </span>
                  {report.performance.recommendations.map((rec, idx) => {
                    const isOpen = expandedRec === idx;
                    return (
                      <div
                        key={idx}
                        className="border border-fuchsia-500/10 rounded-xl overflow-hidden bg-zinc-950/20 text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedRec(isOpen ? null : idx)}
                          className="w-full px-4 py-2.5 flex items-center justify-between text-left font-semibold text-zinc-300 hover:text-white cursor-pointer"
                        >
                          <span>{rec.substring(0, 50)}...</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-3 text-zinc-400 leading-relaxed font-medium">
                            {rec} We recommend implementing lazy-loading options
                            and caching headers to resolve this issue and save
                            40-80ms on page layout loads.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 4. SECURITY TAB */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            {/* Headers audit list */}
            <Card variant="glass" className="lg:col-span-2">
              <CardHeader>
                <CardTitle>🔒 Security Configuration & Headers</CardTitle>
                <CardDescription>
                  SSL validity checks, CSP layers, and HTTP headers inspection
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Certificates details */}
                <div className="grid grid-cols-2 gap-4 bg-zinc-950/40 p-4 border border-fuchsia-500/10 rounded-xl">
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                      SSL Certificate Status
                    </span>
                    <span className="text-emerald-400 font-bold block mt-0.5">
                      {report.security.sslStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                      SSL Cryptography protocol
                    </span>
                    <span className="text-white font-mono block mt-0.5">
                      {report.server.sslVersion}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                      SSL Certificate Authority (CA)
                    </span>
                    <span className="text-zinc-300 block mt-0.5 truncate">
                      {report.security.sslIssuer}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                      Certificate Expiration
                    </span>
                    <span className="text-zinc-300 block mt-0.5">
                      {report.security.sslExpiry}
                    </span>
                  </div>
                </div>

                {/* HTTP Security Headers checklist */}
                <div className="flex flex-col gap-2.5">
                  <span className="font-bold text-white mb-1.5 block">
                    Security Headers Audited:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-2.5 bg-zinc-950/20 border border-fuchsia-500/10 rounded-xl">
                      <span className="text-zinc-400">
                        Content Security Policy (CSP)
                      </span>
                      {report.security.securityHeaders.csp ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-zinc-950/20 border border-fuchsia-500/10 rounded-xl">
                      <span className="text-zinc-400">
                        HTTP Strict Transport (HSTS)
                      </span>
                      {report.security.securityHeaders.hsts ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-zinc-950/20 border border-fuchsia-500/10 rounded-xl">
                      <span className="text-zinc-400">
                        X-Frame-Options Header
                      </span>
                      {report.security.securityHeaders.xFrameOptions ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-zinc-950/20 border border-fuchsia-500/10 rounded-xl">
                      <span className="text-zinc-400">XSS Protection Flag</span>
                      {report.security.securityHeaders.xssProtection ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookies lists & warnings */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>🍪 Third-Party Tracking Cookies</CardTitle>
                  <CardDescription>
                    HTTP Cookies count and security flags
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                    <span className="text-zinc-500">Total detected:</span>
                    <span className="text-white font-bold">
                      {report.security.cookiesCount} cookies
                    </span>
                  </div>
                  {report.security.cookiesDetails.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 bg-zinc-950/40 border border-fuchsia-500/10 rounded-xl flex flex-col gap-1.5"
                    >
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-fuchsia-400 truncate max-w-30">
                          {c.name}
                        </span>
                        <span className="text-zinc-500">{c.type}</span>
                      </div>
                      <div className="flex gap-2.5 text-[9px] text-zinc-500 font-semibold uppercase">
                        <span
                          className={
                            c.secure ? "text-emerald-400" : "text-zinc-500"
                          }
                        >
                          Secure
                        </span>
                        <span>•</span>
                        <span
                          className={
                            c.httpOnly ? "text-fuchsia-400" : "text-zinc-500"
                          }
                        >
                          HttpOnly
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Threat warnings */}
              {report.security.securityIssues.length > 0 && (
                <Card className="border-rose-500/20 bg-rose-950/5">
                  <CardContent className="flex flex-col gap-3 p-5">
                    <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                      Warnings Detected
                    </span>
                    <ul className="flex flex-col gap-2 text-xs text-zinc-300">
                      {report.security.securityIssues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* 5. SEO TAB */}
        {activeTab === "seo" && (
          <Card variant="glass">
            <CardHeader>
              <CardTitle>🔍 Search Engine Optimization (SEO)</CardTitle>
              <CardDescription>
                Meta title audits, OpenGraph parameters, sitemap links, and
                crawlers configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              {/* Meta tags */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 bg-zinc-950/40 p-4 border border-fuchsia-500/10 rounded-xl">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                    Meta Title Tag
                  </span>
                  <span className="text-white font-semibold mt-1 text-sm">
                    {report.seo.metaTitle}
                  </span>
                </div>

                <div className="flex flex-col gap-1 bg-zinc-950/40 p-4 border border-fuchsia-500/10 rounded-xl">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                    Meta Description Tag
                  </span>
                  <span className="text-zinc-300 mt-1 leading-relaxed">
                    {report.seo.metaDescription}
                  </span>
                </div>

                <div className="flex justify-between p-3.5 bg-zinc-950/20 border border-fuchsia-500/10 rounded-xl">
                  <span className="text-zinc-400">Canonical Tag URL:</span>
                  <span className="text-fuchsia-400 font-mono">
                    {report.seo.canonicalUrl}
                  </span>
                </div>
              </div>

              {/* Sitemap & index */}
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 bg-zinc-950/40 p-4 border border-fuchsia-500/10 rounded-xl">
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                      robots.txt status
                    </span>
                    <span className="text-white block font-medium mt-1">
                      {report.seo.robotsTxtStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                      sitemap.xml check
                    </span>
                    <span className="text-white block font-medium mt-1">
                      {report.seo.sitemapXmlStatus}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                      Crawler Indexability
                    </span>
                    <span className="text-emerald-400 font-bold block mt-1">
                      {report.seo.indexability}
                    </span>
                  </div>
                </div>

                {/* Structured schema metadata */}
                <div className="p-4 bg-zinc-950/20 border border-fuchsia-500/10 rounded-xl flex flex-col gap-2">
                  <span className="font-bold text-white mb-1 block">
                    Schema.org Structured Data:
                  </span>
                  {report.seo.structuredData.map((schema, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between border-b border-fuchsia-500/10 pb-2 last:border-0 last:pb-0"
                    >
                      <span className="text-zinc-400">
                        {schema.type} Schema
                      </span>
                      {schema.detected ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 6. SERVER & INFRASTRUCTURE TAB */}
        {activeTab === "server" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            {/* Server core characteristics */}
            <Card variant="glass" className="lg:col-span-1">
              <CardHeader>
                <CardTitle>🖥 Server Infrastructure</CardTitle>
                <CardDescription>Network geolocation details</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3.5">
                <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                  <span className="text-zinc-500">Hosting Hosting:</span>
                  <span className="text-white font-semibold">
                    {report.server.hosting}
                  </span>
                </div>
                <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                  <span className="text-zinc-500">Provider Provider:</span>
                  <span className="text-white font-semibold">
                    {report.server.provider}
                  </span>
                </div>
                <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                  <span className="text-zinc-500">HTTP Protocol:</span>
                  <span className="text-fuchsia-400 font-mono">
                    {report.server.httpVersion}
                  </span>
                </div>
                <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                  <span className="text-zinc-500">Web IP Location:</span>
                  <span className="text-white font-semibold">
                    {report.server.serverLocation}
                  </span>
                </div>
                <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                  <span className="text-zinc-500">IP Registration:</span>
                  <span className="text-white font-mono">
                    {report.server.ipAddress}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* DNS Records & Response Headers */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* DNS Servers list */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>🌐 Domain Name Servers (DNS)</CardTitle>
                  <CardDescription>Active NS records resolved</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {report.server.dns.map((dns) => (
                    <Badge key={dns} variant="default" className="font-mono">
                      {dns}
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              {/* Server response headers */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>📄 HTTP Response Headers</CardTitle>
                  <CardDescription>
                    Server config parameters returned during handshakes
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-left font-mono text-[10px]">
                    <thead>
                      <tr className="bg-black/10 border-b border-fuchsia-500/10 text-zinc-500 font-bold uppercase tracking-wider">
                        <th className="px-6 py-3">Header Key</th>
                        <th className="px-6 py-3">Returned Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-zinc-300">
                      {Object.entries(report.server.serverHeaders).map(
                        ([key, val]) => (
                          <tr key={key} className="hover:bg-white/5">
                            <td className="px-6 py-2.5 font-bold text-fuchsia-400">
                              {key}
                            </td>
                            <td
                              className="px-6 py-2.5 truncate max-w-sm"
                              title={val}
                            >
                              {val}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 7. DESIGN SYSTEM TAB */}
        {activeTab === "design" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            {/* Branding colors */}
            <Card variant="glass" className="lg:col-span-2">
              <CardHeader>
                <CardTitle>🎨 Visual Color Palette</CardTitle>
                <CardDescription>
                  Extracted primary, secondary and interactive accents
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {/* Large color squares grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {report.design.colorPalette.map((color, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col bg-zinc-950/40 p-3 border border-fuchsia-500/10 rounded-xl items-center text-center gap-2 group"
                    >
                      <div
                        className="w-14 h-14 rounded-xl shadow-lg border border-fuchsia-500/15 group-hover:scale-105 transition-transform duration-200 cursor-pointer"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => {
                          navigator.clipboard.writeText(color.hex);
                          alert(`Copied ${color.hex} to clipboard!`);
                        }}
                        title="Copy hex code"
                      />
                      <span className="font-bold text-[10px] text-white font-mono uppercase">
                        {color.hex}
                      </span>
                      <span className="text-[9px] text-zinc-500 leading-none">
                        {color.role}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Typography info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-fuchsia-500/10 pt-5">
                  <div className="p-4 bg-zinc-950/20 border border-fuchsia-500/10 rounded-xl">
                    <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                      Typography System
                    </span>
                    <ul className="mt-2 flex flex-col gap-1 text-xs text-white">
                      {report.design.fonts.map((f, i) => (
                        <li key={i} className="font-semibold">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-zinc-950/20 border border-fuchsia-500/10 rounded-xl">
                    <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                      Icon systems
                    </span>
                    <ul className="mt-2 flex flex-col gap-1 text-xs text-white">
                      {report.design.icons.map((ic, i) => (
                        <li key={i}>{ic}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design features */}
            <Card variant="glass" className="lg:col-span-1">
              <CardHeader>
                <CardTitle>🎨 UI Adaptability & Styling</CardTitle>
                <CardDescription>
                  Viewport responsive scaling traits
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3.5">
                <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                  <span className="text-zinc-500">Theme Compatibility:</span>
                  <span className="text-white font-semibold">
                    {report.design.lightDarkTheme}
                  </span>
                </div>
                <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                  <span className="text-zinc-500">Responsiveness scale:</span>
                  <span className="text-emerald-400 font-semibold">
                    {report.design.responsiveness}
                  </span>
                </div>
                <div className="flex justify-between border-b border-fuchsia-500/10 pb-2">
                  <span className="text-zinc-500">Design Layout style:</span>
                  <span className="text-white font-semibold">
                    {report.design.designStyle}
                  </span>
                </div>

                {/* Visual rendering mockup */}
                <div className="w-full bg-zinc-950 border border-fuchsia-500/10 h-28 rounded-xl mt-4 flex items-center justify-center relative overflow-hidden group">
                  <div
                    className="absolute inset-0 opacity-10 animate-slow-rotate"
                    style={{
                      backgroundImage: `radial-gradient(circle, ${report.design.colorPalette[0]?.hex || "#6366f1"} 1px, transparent 1px)`,
                      backgroundSize: "12px 12px",
                    }}
                  />
                  <span className="text-[10px] text-zinc-500 font-mono z-10 font-semibold uppercase">
                    Responsive Visual Matrix
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 8. CAPABILITIES TAB */}
        {activeTab === "capabilities" && (
          <Card variant="glass">
            <CardHeader>
              <CardTitle>⚙ Domain Capabilities Checklist</CardTitle>
              <CardDescription>
                Check for user logins, API systems, AI widgets, and payment
                processors
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-fuchsia-500/10/5 rounded-xl">
                <span className="text-zinc-400">User Authorization Portal</span>
                {report.capabilities.hasAuth ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <X className="w-4 h-4 text-zinc-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-fuchsia-500/10/5 rounded-xl">
                <span className="text-zinc-400">User Registration Forms</span>
                {report.capabilities.hasRegistration ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <X className="w-4 h-4 text-zinc-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-fuchsia-500/10/5 rounded-xl">
                <span className="text-zinc-400">Online Live Chat Widget</span>
                {report.capabilities.hasLiveChat ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <X className="w-4 h-4 text-zinc-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-fuchsia-500/10/5 rounded-xl">
                <span className="text-zinc-400">Core Domain Search Bar</span>
                {report.capabilities.hasSearch ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <X className="w-4 h-4 text-zinc-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-fuchsia-500/10/5 rounded-xl">
                <span className="text-zinc-400">Payment Processor APIs</span>
                {report.capabilities.hasPayments ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <X className="w-4 h-4 text-zinc-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-fuchsia-500/10/5 rounded-xl">
                <span className="text-zinc-400">Public Developer APIs</span>
                {report.capabilities.hasApi ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <X className="w-4 h-4 text-zinc-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-fuchsia-500/10/5 rounded-xl">
                <span className="text-zinc-400">
                  AI / LLM Assistive widgets
                </span>
                {report.capabilities.hasAiFeatures ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <X className="w-4 h-4 text-zinc-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-fuchsia-500/10/5 rounded-xl">
                <span className="text-zinc-400">PWA Desktop installation</span>
                {report.capabilities.hasPwa ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <X className="w-4 h-4 text-zinc-600" />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 9. AI REVIEW TAB */}
        {activeTab === "ai" && <AiAssistant report={report} />}
      </div>
    </div>
  );
};
export default Analysis;
