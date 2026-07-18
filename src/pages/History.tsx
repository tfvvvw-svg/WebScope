import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Trash2,
  Star,
  GitCompare,
  Filter,
  TrendingUp,
  ExternalLink,
  Info,
  History as HistoryIcon,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { getDomainName } from "../services/scanner";
import { useLanguage } from "../context/LanguageContext";

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.4,
    delay: i * 0.05,
    ease: [0.16, 1, 0.3, 1] as const,
  },
});

export const History: React.FC = () => {
  const {
    history,
    toggleFavorite,
    deleteReport,
    setCompareSlot,
    scanUrl,
    compareReports,
  } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const { t } = useLanguage();

  const categories = [
    "All",
    ...Array.from(new Set(history.map((item) => item.category))),
  ];

  const filtered = history.filter((item) => {
    const matchesSearch =
      item.url.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;
    let matchesRating = true;
    if (ratingFilter === "Excellent") matchesRating = item.overallRating >= 90;
    else if (ratingFilter === "Good")
      matchesRating = item.overallRating >= 70 && item.overallRating < 90;
    else if (ratingFilter === "Warnings")
      matchesRating = item.overallRating < 70;
    return matchesSearch && matchesCategory && matchesRating;
  });

  const handleInspect = async (url: string) => {
    await scanUrl(url);
    navigate("/analysis");
  };

  const handleCompare = async (item: any) => {
    try {
      const report = await scanUrl(item.url);
      if (!compareReports[0]) {
        setCompareSlot(0, report);
      } else {
        setCompareSlot(1, report);
        navigate("/compare");
      }
    } catch {
      // Scan failed silently
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="purple" glow size="md">
            <HistoryIcon className="w-3 h-3 mr-1" /> {history.length} {t("recordsCount")}
          </Badge>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
          <span className="animate-gradient-text">{t("historyTitle")}</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          {t("historySubtitle")}
        </p>
      </motion.div>

      {/* Filter Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card variant="glass" className="p-5">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
              <Input
                type="text"
                placeholder={t("searchByDomain")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                startIcon={<Search className="w-4 h-4" />}
                className="py-2.5 text-xs"
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-1.5 bg-zinc-950/60 px-3 py-2 rounded-xl border border-fuchsia-500/20 text-xs text-zinc-400 hover:border-fuchsia-400 transition-colors"
              >
                <Filter className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>{t("categoryFilter")}</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent border-0 text-white font-semibold focus:outline-none ml-1 text-xs cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                      className="bg-zinc-900 text-white"
                    >
                      {cat}
                    </option>
                  ))}
                </select>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-1.5 bg-zinc-950/60 px-3 py-2 rounded-xl border border-fuchsia-500/20 text-xs text-zinc-400 hover:border-fuchsia-400 transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t("ratingFilter")}</span>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="bg-transparent border-0 text-white font-semibold focus:outline-none ml-1 text-xs cursor-pointer"
                >
                  <option value="All" className="bg-zinc-900 text-white">
                    {t("all")}
                  </option>
                  <option value="Excellent" className="bg-zinc-900 text-white">
                    ≥ 90 ({t("excellent")})
                  </option>
                  <option value="Good" className="bg-zinc-900 text-white">
                    70-89 ({t("good")})
                  </option>
                   <option value="Warnings" className="bg-zinc-900 text-white">
                     {"< 70"} ({t("warnings")})
                   </option>
                </select>
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full text-center py-20 glass-card flex flex-col items-center justify-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-fuchsia-500/10 flex items-center justify-center">
              <Info className="w-8 h-8 text-fuchsia-400" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-bold text-white">{t("historyEmpty")}</h4>
              <p className="text-xs text-zinc-500 max-w-md">
                {t("historyEmptySubtitle")}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="mt-2"
              onClick={() => navigate("/")}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              {t("scanNewSite")}
            </Button>
          </motion.div>
        ) : (
          filtered.map((item, i) => (
            <motion.div
              key={item.id}
              {...stagger(i)}
              whileHover={{ y: -6 }}
              onClick={() => handleInspect(item.url)}
              className="cursor-pointer"
            >
              <Card variant="glass" hoverable className="flex flex-col h-full">
                <CardHeader className="flex justify-between items-start gap-4 pb-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-fuchsia-500/30"
                      style={{
                        backgroundColor: item.primaryColor,
                        boxShadow: `0 0 10px ${item.primaryColor}`,
                      }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-white truncate group-hover:text-fuchsia-300">
                        {getDomainName(item.url)}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {item.scanDate}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      item.overallRating >= 90
                        ? "success"
                        : item.overallRating >= 70
                          ? "purple"
                          : "warning"
                    }
                    glow
                  >
                    {item.overallRating}
                  </Badge>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between py-4">
                  <div className="text-xs flex flex-col gap-1.5">
                    <div className="flex justify-between text-zinc-400">
                      <span>{t("title")}:</span>
                      <span className="text-white font-medium max-w-[180px] truncate text-right">
                        {item.title}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>{t("category")}:</span>
                      <span className="text-fuchsia-300 font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-fuchsia-500/10 mt-5 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                      className={`flex items-center gap-1 text-[11px] font-semibold cursor-pointer
                        ${item.isFavorite ? "text-amber-400" : "text-zinc-500 hover:text-fuchsia-300"}
                      `}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${item.isFavorite ? "fill-current" : ""}`}
                      />
                      {item.isFavorite ? t("inFavorites") : t("addToFavorites")}
                    </motion.button>

                    <div
                      className="flex gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompare(item);
                        }}
                        className="p-1.5 rounded-lg border border-fuchsia-500/20 bg-zinc-950/40 hover:bg-fuchsia-500/10 text-zinc-500 hover:text-cyan-300 transition-colors cursor-pointer"
                        title={t("compare")}
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInspect(item.url);
                        }}
                        className="p-1.5 rounded-lg border border-fuchsia-500/20 bg-zinc-950/40 hover:bg-fuchsia-500/10 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        title={t("open")}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteReport(item.id);
                        }}
                        className="p-1.5 rounded-lg border border-fuchsia-500/20 bg-zinc-950/40 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title={t("delete")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
