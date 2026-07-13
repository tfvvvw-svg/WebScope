import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import {
  Star,
  Trash2,
  GitCompare,
  Globe,
  Activity,
  Zap,
  Search as SearchIcon,
  ExternalLink,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { getDomainName } from "../services/scanner";

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.5,
    delay: i * 0.07,
    ease: [0.16, 1, 0.3, 1] as const,
  },
});

export const Dashboard: React.FC = () => {
  const {
    history,
    favorites,
    toggleFavorite,
    deleteReport,
    setCompareSlot,
    compareReports,
    scanUrl,
  } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const totalScans = history.length;
  const avgRating =
    totalScans > 0
      ? Math.round(
          history.reduce((acc, item) => acc + item.overallRating, 0) /
            totalScans,
        )
      : 0;
  const favoriteCount = favorites.length;
  const topScore =
    totalScans > 0 ? Math.max(...history.map((h) => h.overallRating)) : 0;

  const handleCompareSelect = async (item: any) => {
    if (!compareReports[0]) {
      import("../services/apiService").then(async (mod) => {
        try {
          const report = await mod.scanUrl(item.url);
          setCompareSlot(0, report);
        } catch {
          // Fallback if scan fails
        }
      });
    } else if (!compareReports[1]) {
      import("../services/apiService").then(async (mod) => {
        try {
          const report = await mod.scanUrl(item.url);
          setCompareSlot(1, report);
          navigate("/compare");
        } catch {
          // Fallback if scan fails
        }
      });
    } else {
      import("../services/apiService").then(async (mod) => {
        try {
          const report = await mod.scanUrl(item.url);
          setCompareSlot(0, report);
        } catch {
          // Fallback if scan fails
        }
      });
    }
  };

  const handleViewDetails = (url: string) => {
    void scanUrl(url).then(() => navigate("/analysis"));
  };

  const filteredHistory = history.filter(
    (item) =>
      item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stats = [
    {
      icon: <Activity />,
      label: "Всего аудитов",
      value: totalScans,
      gradient: "from-fuchsia-500 to-purple-500",
      glow: "shadow-fuchsia-500/30",
    },
    {
      icon: <Zap />,
      label: "Средний рейтинг",
      value: `${avgRating}/100`,
      gradient: "from-cyan-500 to-blue-500",
      glow: "shadow-cyan-500/30",
    },
    {
      icon: <Sparkles />,
      label: "Избранное",
      value: favoriteCount,
      gradient: "from-amber-500 to-pink-500",
      glow: "shadow-amber-500/30",
    },
    {
      icon: <TrendingUp />,
      label: "Топ-скан",
      value: topScore,
      gradient: "from-emerald-500 to-teal-500",
      glow: "shadow-emerald-500/30",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="purple" glow size="md" className="text-[10px]">
              📊 Live
            </Badge>
            <span className="text-[10px] text-fuchsia-400 font-mono">
              v2.0 · {new Date().toLocaleDateString("ru-RU")}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            <span className="animate-gradient-text">Workspace Dashboard</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Мониторинг аудитов, сравнение профилей производительности и анализ
            технологических стеков
          </p>
        </div>
        <Link to="/">
          <Button variant="primary" size="md">
            <Globe className="w-4 h-4 mr-1.5" />
            Новый скан
          </Button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            {...stagger(i)}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group"
          >
            <Card variant="glass" className="overflow-hidden">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              />
              <CardContent className="relative flex items-center gap-4 p-5">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg ${stat.glow} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                >
                  {stat.icon}
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">
                    {stat.label}
                  </span>
                  <span className="text-2xl font-extrabold text-white block mt-1 animate-gradient-text">
                    {stat.value}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* History Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card variant="glass">
          <CardHeader className="flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-fuchsia-400" />
                История аудитов
              </CardTitle>
              <CardDescription>
                Все ваши сканирования хранятся локально в браузере
              </CardDescription>
            </div>
            <div className="w-full sm:w-72">
              <Input
                type="text"
                placeholder="Поиск по домену, названию, категории..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startIcon={<SearchIcon className="w-4 h-4" />}
                className="py-1.5 text-xs rounded-lg"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {filteredHistory.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-zinc-500 text-xs flex flex-col gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-fuchsia-500/10 flex items-center justify-center mx-auto">
                  <Globe className="w-8 h-8 text-fuchsia-400" />
                </div>
                <span className="text-zinc-300 font-semibold">
                  Аудиты не найдены
                </span>
                <span className="text-zinc-500">
                  Запустите новое сканирование с главной страницы
                </span>
                <Link to="/" className="mt-2">
                  <Button variant="primary" size="sm">
                    <Globe className="w-3.5 h-3.5 mr-1.5" />
                    Начать сканирование
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-fuchsia-500/10 text-zinc-400 uppercase tracking-widest text-[9px] font-bold">
                    <th className="px-6 py-4">Домен</th>
                    <th className="px-4 py-4">Категория</th>
                    <th className="px-4 py-4 text-center">Рейтинг</th>
                    <th className="px-4 py-4">Дата</th>
                    <th className="px-6 py-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      className="border-b border-fuchsia-500/5 hover:bg-fuchsia-500/5 transition-colors group cursor-pointer"
                      onClick={() => handleViewDetails(item.url)}
                    >
                      <td className="px-6 py-4 font-bold text-white min-w-[180px]">
                        <span className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full inline-block ring-2 ring-fuchsia-500/30 group-hover:ring-4 group-hover:scale-110 transition-all"
                            style={{
                              backgroundColor: item.primaryColor,
                              boxShadow: `0 0 10px ${item.primaryColor}`,
                            }}
                          />
                          <span className="group-hover:text-fuchsia-300 transition-colors">
                            {getDomainName(item.url)}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-4 text-zinc-400">
                        <span className="px-2 py-0.5 rounded-md bg-fuchsia-500/10 text-fuchsia-300 text-[10px] font-mono">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
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
                      </td>
                      <td className="px-4 py-4 text-zinc-500 font-mono text-[11px]">
                        {item.scanDate}
                      </td>
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleFavorite(item.id)}
                            className={`p-1.5 rounded-lg border border-fuchsia-500/20 hover:bg-fuchsia-500/10 transition-colors cursor-pointer
                              ${item.isFavorite ? "text-amber-400 fill-current" : "text-zinc-500 hover:text-fuchsia-300"}
                            `}
                            title="Избранное"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleCompareSelect(item)}
                            className="p-1.5 rounded-lg border border-fuchsia-500/20 hover:bg-fuchsia-500/10 text-zinc-500 hover:text-cyan-300 transition-colors cursor-pointer"
                            title="Сравнить"
                          >
                            <GitCompare className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleViewDetails(item.url)}
                            className="p-1.5 rounded-lg border border-fuchsia-500/20 hover:bg-fuchsia-500/10 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            title="Подробнее"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteReport(item.id)}
                            className="p-1.5 rounded-lg border border-fuchsia-500/20 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
