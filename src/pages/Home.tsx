import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import {
  Globe,
  Zap,
  Cpu,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  CheckCircle,
  ArrowRight,
  Search,
  Server,
  Palette,
  Brain,
  Rocket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

const DEMOS = ["vercel.com", "stripe.com", "github.com", "notion.so"];

const FAQS = [
  {
    qKey: "faq1Question",
    aKey: "faq1Answer",
  },
  {
    qKey: "faq2Question",
    aKey: "faq2Answer",
  },
  {
    qKey: "faq3Question",
    aKey: "faq3Answer",
  },
];

const SCAN_STEPS = [
  "scanStep1",
  "scanStep2",
  "scanStep3",
  "scanStep4",
  "scanStep5",
  "scanStep6",
  "scanStep7",
  "scanStep8",
  "scanStep9",
  "scanStep10",
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

const stagger = (delay = 0) => ({
  ...fadeUp,
  transition: { ...fadeUp.transition, delay },
});

export const Home: React.FC = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const { scanUrl, loading, scanProgress } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [scanStep, setScanStep] = useState("");

  useEffect(() => {
    if (!loading) return;
    const stepInterval = setInterval(() => {
      const stepIndex = Math.min(
        Math.floor((scanProgress / 100) * SCAN_STEPS.length),
        SCAN_STEPS.length - 1,
      );
      setScanStep(SCAN_STEPS[stepIndex]);
    }, 150);
    return () => clearInterval(stepInterval);
  }, [loading, scanProgress]);

  const handleScan = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError(t("enterUrl"));
      return;
    }
    const urlPattern = /^(https?:\/\/)?([a-z0-9.-]+\.[a-z]{2,})(\/\S*)?$/i;
    if (!urlPattern.test(url.trim())) {
      setError(t("invalidUrl"));
      return;
    }
    setError("");
    try {
      await scanUrl(url);
      navigate("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("scanFailed");
      setError(msg);
    }
  }, [url, scanUrl, navigate, t]);

  const demos = DEMOS;

  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const faqs = FAQS;

  const features = useMemo(() => ([
    {
      icon: <Cpu className="w-6 h-6" />,
      titleKey: "techTitle",
      descKey: "techDesc",
      color: "from-fuchsia-500 to-purple-500",
      glow: "shadow-fuchsia-500/40",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      titleKey: "perfTitle",
      descKey: "perfDesc",
      color: "from-cyan-500 to-blue-500",
      glow: "shadow-cyan-500/40",
    },
    {
      icon: <Server className="w-6 h-6" />,
      titleKey: "serverTitle",
      descKey: "serverDesc",
      color: "from-amber-500 to-orange-500",
      glow: "shadow-amber-500/40",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      titleKey: "securityAudit",
      descKey: "securityDesc",
      color: "from-emerald-500 to-teal-500",
      glow: "shadow-emerald-500/40",
    },
    {
      icon: <Palette className="w-6 h-6" />,
      titleKey: "designPalette",
      descKey: "designDesc",
      color: "from-pink-500 to-rose-500",
      glow: "shadow-pink-500/40",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      titleKey: "aiEngine",
      descKey: "aiEngineDesc",
      color: "from-violet-500 to-fuchsia-500",
      glow: "shadow-violet-500/40",
    },
  ]), [t]);

  return (
    <div className="relative w-full">
      {/* Hero Background Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-fuchsia-500/20 blur-[100px] rounded-full pointer-events-none z-0 animate-blob" />
      <div
        className="absolute top-60 right-10 w-96 h-96 bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none z-0 animate-blob"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-500/10 blur-[150px] rounded-full pointer-events-none z-0 animate-blob"
        style={{ animationDelay: "8s" }}
      />

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-6 pt-20 pb-16 sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge
            variant="purple"
            size="md"
            glow
            className="mb-6 flex items-center gap-1.5 py-1.5 px-3"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            {t("badgeTitle")}
            <span className="ml-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </Badge>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <span className="text-white">{t("heroTitle").split(' ')[0]} </span>
          <span className="animate-gradient-text">{t("heroTitle").split(' ').slice(1, 3).join(' ')}</span>
          <br />
          <span className="text-white">{t("heroTitle").split(' ')[3]} </span>
          <span className="relative inline-block">
            <span className="animate-gradient-text">{t("heroTitle").split(' ').slice(4).join(' ')}</span>
            <motion.span
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-pink-500 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ originX: 0 }}
            />
          </span>
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {t("heroSub")}
        </motion.p>

        {/* Search Form */}
        <motion.form
          onSubmit={handleScan}
          className="w-full max-w-2xl flex flex-col sm:flex-row gap-3 mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="flex-grow relative group">
            <Input
              type="text"
              placeholder={t("placeholder")}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              error={error}
              startIcon={<Globe className="w-5 h-5" />}
              className="py-3.5 text-sm pl-12 pr-4 rounded-2xl border-fuchsia-500/30 focus:border-fuchsia-400"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!url.trim()}
            className="rounded-2xl px-7 shadow-2xl shadow-fuchsia-500/40"
          >
            {loading ? (
              <>{scanProgress}%</>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                {t("analyzeButton")}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </motion.form>

        {/* Live progress bar */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-2xl mb-8 overflow-hidden"
            >
              <div className="bg-zinc-950/60 border border-fuchsia-500/30 rounded-xl p-4 backdrop-blur-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-fuchsia-300 uppercase tracking-widest flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-3 h-3 border-2 border-fuchsia-400 border-t-transparent rounded-full inline-block"
                    />
                    {t("scanningTitle")}
                  </span>
                  <span className="text-xs font-mono text-cyan-300 font-bold">
                    {scanProgress}%
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <motion.div
                    className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 relative"
                    style={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={scanStep}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-[11px] font-mono text-zinc-400"
                  >
                    {scanStep}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick demos */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-400 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <span className="text-zinc-500">{t("tryScanning")}:</span>
          {demos.map((demo, i) => (
            <motion.button
              key={demo}
              type="button"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => !loading && setUrl(demo)}
              className="px-3 py-1.5 rounded-full bg-zinc-900/60 border border-fuchsia-500/20 hover:border-fuchsia-400 hover:text-fuchsia-300 hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all font-mono cursor-pointer"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {demo}
            </motion.button>
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-zinc-500 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {[
            { icon: <Zap className="w-3 h-3" />, labelKey: "auditIn2Sec" },
            {
              icon: <ShieldCheck className="w-3 h-3" />,
              labelKey: "noRegistration",
            },
            { icon: <Sparkles className="w-3 h-3" />, labelKey: "aiPowered" },
          ].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 text-fuchsia-300/70"
            >
              {item.icon}
              {t(item.labelKey)}
            </span>
          ))}
        </motion.div>
      </section>

      {/* Floating Stat Ticker */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { v: "50K+", labelKey: "auditsConducted" },
            { v: "99.9%", labelKey: "scannerUptime" },
            { v: "120+", labelKey: "techInDatabase" },
            { v: "< 2s", labelKey: "responseTime" },
          ].map((s, i) => (
            <motion.div
              key={s.labelKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-5 text-center hover-tilt"
            >
              <div className="text-2xl sm:text-3xl font-extrabold animate-gradient-text">
                {s.v}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-400 mt-1.5 font-semibold">
                {t(s.labelKey)}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div {...fadeUp} className="text-center mb-14">
          <Badge variant="info" size="md" className="mb-4 mx-auto">
            ⚡ {t("fullSpectrumDiagnostics")}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t("everythingYouNeed").split(' ').slice(0, 3).join(' ')}{" "}
            <span className="animate-gradient-text">
              {t("everythingYouNeed").split(' ').slice(3).join(' ')}
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.titleKey}
              {...stagger(i * 0.1)}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <div className="glass-card p-6 h-full flex flex-col gap-3">
                {/* Animated icon container */}
                <div
                  className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-xl ${feature.glow} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                >
                  {feature.icon}
                  <span className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed flex-1">
                  {t(feature.descKey)}
                </p>

                <div className="flex items-center gap-1.5 text-[11px] text-fuchsia-300/70 font-semibold uppercase tracking-widest pt-2 group-hover:text-cyan-300 transition-colors">
                  Подробнее
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Bottom glow accent on hover */}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div {...fadeUp} className="text-center mb-14">
          <Badge variant="purple" size="md" className="mb-4 mx-auto">
            🚀 {t("howItWorks")}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t("stepsTitle")}{" "}
            <span className="animate-gradient-text">{t("stepsSubtitle")}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {[
            {
              n: "01",
              titleKey: "step1Title",
              descKey: "step1Desc",
              icon: <Globe />,
            },
            {
              n: "02",
              titleKey: "step2Title",
              descKey: "step2Desc",
              icon: <Brain />,
            },
            {
              n: "03",
              titleKey: "step3Title",
              descKey: "step3Desc",
              icon: <Rocket />,
            },
          ].map((step, i) => (
            <motion.div
              key={step.n}
              {...stagger(i * 0.15)}
              className="relative"
            >
              <div className="glass-card p-7 h-full">
                <div className="text-5xl font-black animate-gradient-text mb-3">
                  {step.n}
                </div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-fuchsia-500/30">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t(step.titleKey)}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {t(step.descKey)}
                </p>
              </div>
              {i < 2 && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 text-fuchsia-400 animate-pulse" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div {...fadeUp} className="text-center mb-14">
          <Badge variant="purple" size="md" className="mb-4 mx-auto">
            💎 {t("pricingTitle")}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t("pricingTitle")} <span className="animate-gradient-text">{t("pricingSubtitle")}</span>
          </h2>
          <p className="text-sm text-zinc-400 mt-3">
            {t("pricingDesc")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Free */}
          <motion.div
            {...stagger(0)}
            whileHover={{ y: -6 }}
            className="glass-card p-7 flex flex-col"
          >
            <h4 className="text-sm font-bold text-fuchsia-300 uppercase tracking-widest">
              {t("starter")}
            </h4>
            <div className="mt-4 flex items-baseline text-white">
              <span className="text-4xl font-extrabold tracking-tight">$0</span>
              <span className="ml-1 text-xs text-zinc-400">{t("forever")}</span>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              {t("forPersonalProjects")}
            </p>
            <ul className="mt-6 flex flex-col gap-3 text-xs text-zinc-300 flex-1">
              {[
                t("fiveScansPerDay"),
                t("basicStackAssessment"),
                t("historyUpTo10"),
                t("basicDesignAudit"),
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />{" "}
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="mt-8 w-full">
              {t("startFree")}
            </Button>
          </motion.div>

          {/* Pro (highlighted) */}
          <motion.div
            {...stagger(0.1)}
            whileHover={{ y: -8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 rounded-2xl blur-xl" />
            <div className="relative glass-card p-7 flex flex-col border-fuchsia-400/50 shadow-2xl shadow-fuchsia-500/30">
              <div className="absolute -top-3 right-6">
                <Badge variant="purple" glow className="text-[10px]">
                  ⚡ {t("popular")}
                </Badge>
              </div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-widest">
                {t("pro")}
              </h4>
              <div className="mt-4 flex items-baseline text-white">
                <span className="text-4xl font-extrabold tracking-tight animate-gradient-text">
                  $29
                </span>
                <span className="ml-1 text-xs text-zinc-400">{t("perMonth")}</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                {t("forQATeams")}
              </p>
              <ul className="mt-6 flex flex-col gap-3 text-xs text-zinc-200 flex-1">
                {[
                  t("unlimitedScans"),
                  t("fullComparisonCharts"),
                  t("detailedDesignPalettes"),
                  t("pdfExport"),
                  t("prioritySupport"),
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />{" "}
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant="primary"
                className="mt-8 w-full shadow-fuchsia-500/40"
              >
                {t("upgradePro")}
              </Button>
            </div>
          </motion.div>

          {/* Enterprise */}
          <motion.div
            {...stagger(0.2)}
            whileHover={{ y: -6 }}
            className="glass-card p-7 flex flex-col"
          >
            <h4 className="text-sm font-bold text-pink-300 uppercase tracking-widest">
              {t("enterprise")}
            </h4>
            <div className="mt-4 flex items-baseline text-white">
              <span className="text-4xl font-extrabold tracking-tight">
                $99
              </span>
              <span className="ml-1 text-xs text-zinc-400">{t("perMonth")}</span>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              {t("forAgencies")}
            </p>
            <ul className="mt-6 flex flex-col gap-3 text-xs text-zinc-300 flex-1">
              {[
                t("highFrequencyCrawler"),
                t("webhookIntegrations"),
                t("teamWorkspaces"),
                t("support247"),
                t("customReports"),
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-pink-400 flex-shrink-0" />{" "}
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="mt-8 w-full">
              {t("contactSales")}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-20 w-full relative z-10">
        <motion.div {...fadeUp} className="text-center mb-12">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center mx-auto shadow-lg shadow-fuchsia-500/40">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mt-4">
            {t("faqTitle")}
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            {t("faqSubtitle")}
          </p>
        </motion.div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => {
            const open = activeFaq === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`glass-card overflow-hidden transition-all duration-300 ${open ? "border-fuchsia-400/50 shadow-lg shadow-fuchsia-500/20" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(open ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-sm text-zinc-100 hover:text-white cursor-pointer group"
                >
                  <span className="group-hover:text-fuchsia-300 transition-colors">
                    {t(faq.qKey)}
                  </span>
                  <motion.span
                    animate={{ rotate: open ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-fuchsia-400 font-mono text-xl"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-xs text-zinc-300 leading-relaxed">
                        {t(faq.aKey)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <motion.div
          {...fadeUp}
          className="relative glass-card p-10 sm:p-14 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-cyan-500/10" />
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-fuchsia-500/20 blur-[100px] rounded-full animate-blob" />
          <div
            className="absolute -bottom-20 -right-20 w-80 h-80 bg-cyan-500/20 blur-[100px] rounded-full animate-blob"
            style={{ animationDelay: "3s" }}
          />

          <div className="relative z-10">
            <Sparkles className="w-10 h-10 text-fuchsia-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              {t("readyToSee")}{" "}
              <span className="animate-gradient-text">{t("hiddenDna")}</span> {t("ofYourSite")}
            </h2>
            <p className="text-sm text-zinc-300 max-w-xl mx-auto mb-7">
              {t("noEmailNoReg")}
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="shadow-2xl shadow-fuchsia-500/50"
            >
              <Rocket className="w-5 h-5 mr-2" />
              {t("launchAudit")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
