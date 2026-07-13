import React, { useState } from "react";
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
import { ScoreBar } from "../components/charts/ScoreBar";
import { GitCompare, Trash2, Trophy, Sparkles, X as XIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getDomainName } from "../services/scanner";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

export const Compare: React.FC = () => {
  const { compareReports, setCompareSlot, clearCompareSlots, history } =
    useApp();
  const [showSelectorModal, setShowSelectorModal] = useState<0 | 1 | null>(
    null,
  );

  const report1 = compareReports[0];
  const report2 = compareReports[1];

  const handleSelectSlot = async (slotIndex: 0 | 1, url: string) => {
    import("../services/apiService").then(async (mod) => {
      try {
        const report = await mod.scanUrl(url);
        setCompareSlot(slotIndex, report);
        setShowSelectorModal(null);
      } catch {
        // If scan fails, try using history item data
        const historyItem = history.find(h => h.url.includes(url));
        if (historyItem) {
          setCompareSlot(slotIndex, null);
          setShowSelectorModal(null);
        }
      }
    });
  };

  const handleRemoveSlot = (slotIndex: 0 | 1) =>
    setCompareSlot(slotIndex, null);

  const getWinnerDomain = () => {
    if (!report1 || !report2) return null;
    const s1 = report1.scores.overallRating;
    const s2 = report2.scores.overallRating;
    if (s1 > s2) return getDomainName(report1.url);
    if (s2 > s1) return getDomainName(report2.url);
    return "Ничья";
  };

  const renderSlot = (
    slotIndex: 0 | 1,
    report: any,
    _otherReport: any,
    accentColor: string,
  ) => (
    <motion.div
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay: slotIndex * 0.1 }}
    >
      <Card variant="glass" className="relative overflow-hidden h-full">
        {/* Decorative corner glow */}
        <div
          className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${accentColor} opacity-20 blur-3xl rounded-full`}
        />

        {report ? (
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-fuchsia-500/30"
                  style={{
                    backgroundColor:
                      report.design.colorPalette[0]?.hex || "#a855f7",
                    boxShadow: `0 0 12px ${report.design.colorPalette[0]?.hex || "#a855f7"}`,
                  }}
                />
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white tracking-tight truncate">
                    {getDomainName(report.url)}
                  </h3>
                  <p className="text-[10px] text-zinc-500">{report.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="purple" size="md" glow>
                  {report.scores.overallRating}
                </Badge>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemoveSlot(slotIndex)}
                  className="p-1.5 hover:bg-rose-500/10 rounded-lg text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-fuchsia-500/20 rounded-2xl min-h-[160px]">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 flex items-center justify-center">
              <GitCompare className="w-7 h-7 text-fuchsia-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Слот {slotIndex + 1}
              </h4>
              <p className="text-xs text-zinc-500 mt-1">
                Выберите просканированный домен
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSelectorModal(slotIndex)}
              className="shadow-lg shadow-fuchsia-500/30"
            >
              Выбрать домен
            </Button>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <Badge variant="purple" glow size="md" className="mb-2">
            <GitCompare className="w-3 h-3 mr-1" /> Сравнение
          </Badge>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            <span className="animate-gradient-text">
              Матрица сравнения доменов
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Сравните технические параметры, дизайн-палитры и индикаторы
            производительности
          </p>
        </div>
        {(report1 || report2) && (
          <Button variant="outline" size="sm" onClick={clearCompareSlots}>
            <XIcon className="w-3.5 h-3.5 mr-1.5" />
            Очистить слоты
          </Button>
        )}
      </motion.div>

      {/* Slot selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSlot(0, report1, report2, "from-fuchsia-500 to-purple-500")}
        {renderSlot(1, report2, report1, "from-cyan-500 to-blue-500")}
      </div>

      {/* VS divider */}
      {(!report1 || !report2) && (
        <div className="flex items-center justify-center -my-4">
          <div className="text-2xl font-black text-zinc-700 animate-pulse">
            VS
          </div>
        </div>
      )}

      {/* Winner Spotlight */}
      {report1 && report2 && (
        <motion.div {...fadeUp}>
          <Card variant="glass" className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 via-transparent to-cyan-500/10" />
            <div className="absolute -top-10 left-1/4 w-60 h-60 bg-fuchsia-500/20 blur-[80px] rounded-full animate-blob" />
            <div
              className="absolute -bottom-10 right-1/4 w-60 h-60 bg-cyan-500/20 blur-[80px] rounded-full animate-blob"
              style={{ animationDelay: "3s" }}
            />

            <CardContent className="relative flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-amber-400 to-pink-500 p-3.5 rounded-2xl text-white shadow-lg shadow-amber-500/30">
                  <Trophy className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-300 tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Лидер аудита
                  </span>
                  <h4 className="text-base font-extrabold text-white mt-0.5">
                    {getWinnerDomain()} имеет техническое преимущество
                  </h4>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-fuchsia-300 text-glow">
                    {report1.scores.overallRating}
                  </div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mt-1">
                    Слот 1
                  </div>
                </div>
                <div className="text-zinc-600 text-xl font-thin">vs</div>
                <div className="text-center">
                  <div className="text-3xl font-black text-cyan-300 text-glow">
                    {report2.scores.overallRating}
                  </div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mt-1">
                    Слот 2
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Detailed score comparison */}
      {report1 && report2 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[report1, report2].map((report, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
            >
              <Card variant="glass" className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full ring-2 ring-fuchsia-500/30"
                      style={{
                        backgroundColor:
                          report.design.colorPalette[0]?.hex || "#a855f7",
                      }}
                    />
                    <CardTitle>{getDomainName(report.url)} — оценки</CardTitle>
                  </div>
                  <CardDescription>Распределение по 7 метрикам</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <ScoreBar label="Дизайн" score={report.scores.designScore} />
                  <ScoreBar
                    label="Производительность"
                    score={report.scores.performanceScore}
                  />
                  <ScoreBar
                    label="Безопасность"
                    score={report.scores.securityScore}
                  />
                  <ScoreBar label="SEO" score={report.scores.seoScore} />
                  <ScoreBar
                    label="Доступность"
                    score={report.scores.accessibilityScore}
                  />
                  <ScoreBar
                    label="Современность стека"
                    score={report.scores.techModernityScore}
                  />
                  <ScoreBar label="UX" score={report.scores.uxScore} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 glass-card flex flex-col items-center justify-center gap-3"
        >
          <div className="w-16 h-16 rounded-full bg-fuchsia-500/10 flex items-center justify-center">
            <GitCompare className="w-8 h-8 text-fuchsia-400" />
          </div>
          <h3 className="text-sm font-bold text-white">
            Выберите два домена для сравнения
          </h3>
          <p className="text-xs text-zinc-500 max-w-md">
            Загрузите домены в оба слота, чтобы увидеть детальное сравнение по 7
            метрикам
          </p>
        </motion.div>
      )}

      {/* Select Domain Modal */}
      <AnimatePresence>
        {showSelectorModal !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSelectorModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card
                variant="glass"
                className="border-fuchsia-500/30 shadow-2xl shadow-fuchsia-500/20"
              >
                <CardHeader className="flex justify-between items-center pb-3">
                  <div>
                    <CardTitle>
                      Выберите домен для слота {showSelectorModal + 1}
                    </CardTitle>
                    <CardDescription>
                      Из кэшированных веб-сканов
                    </CardDescription>
                  </div>
                  <button
                    onClick={() => setShowSelectorModal(null)}
                    className="text-zinc-400 hover:text-fuchsia-300 text-xs font-semibold cursor-pointer"
                  >
                    Закрыть
                  </button>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-center py-6 text-xs text-zinc-500">
                      Кэш пуст. Сначала выполните сканирование.
                    </p>
                  ) : (
                    history.map((item) => (
                      <motion.button
                        key={item.id}
                        whileHover={{ x: 4 }}
                        onClick={() =>
                          handleSelectSlot(showSelectorModal, item.url)
                        }
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-fuchsia-500/15 hover:border-fuchsia-400 hover:bg-fuchsia-500/5 text-left transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full ring-2 ring-fuchsia-500/30"
                            style={{ backgroundColor: item.primaryColor }}
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {getDomainName(item.url)}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <Badge variant="purple">{item.overallRating}</Badge>
                      </motion.button>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Compare;
