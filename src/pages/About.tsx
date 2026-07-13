 import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Cpu,
  Code,
  Globe,
  Heart,
  Rocket,
  Brain,
  Target,
  Eye,
  Users,
  GitBranch,
  Layers,
  Database,
  Server,
  Lock,
  Gauge,
  Palette,
  Bot,
  Award,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

const stagger = (i: number) => ({
  ...fadeUp,
  transition: { ...fadeUp.transition, delay: i * 0.08 },
});

export const About: React.FC = () => {
  const features = [
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "Технологический стек",
      desc: "Определяем более 120 технологий: фреймворки (React, Vue, Angular), серверы (Node, Nginx, Go), базы данных, CDN, шрифты, иконки и аналитику.",
      color: "from-fuchsia-500 to-purple-500",
      glow: "shadow-fuchsia-500/30",
    },
    {
      icon: <Gauge className="w-6 h-6" />,
      title: "Core Web Vitals",
      desc: "Lighthouse-эквивалентный аудит: LCP, FID, CLS, FCP, TTI. Реальные показатели скорости загрузки и отзывчивости интерфейса.",
      color: "from-cyan-500 to-blue-500",
      glow: "shadow-cyan-500/30",
    },
    {
      icon: <Server className="w-6 h-6" />,
      title: "Сервер и инфраструктура",
      desc: "IP-адреса, NS-серверы, A-записи, геолокация серверов, провайдеры хостинга, версии HTTP и SSL-сертификаты.",
      color: "from-amber-500 to-orange-500",
      glow: "shadow-amber-500/30",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Аудит безопасности",
      desc: "Проверка HTTPS, CSP, HSTS, X-Frame-Options, политик cookies, mixed-content и уязвимостей в заголовках.",
      color: "from-emerald-500 to-teal-500",
      glow: "shadow-emerald-500/30",
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Дизайн-палитра",
      desc: "Извлечение цветовой системы, шрифтов, иконок, обнаружение тёмной/светлой темы и стиля дизайна (Glassmorphism, Neobrutalism, Corporate).",
      color: "from-pink-500 to-rose-500",
      glow: "shadow-pink-500/30",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-анализ",
      desc: "Машинное обучение анализирует агрегированные данные и формулирует конкретные рекомендации для разработчиков.",
      color: "from-violet-500 to-fuchsia-500",
      glow: "shadow-violet-500/30",
    },
  ];

  const stats = [
    { v: "50 000+", l: "Аудитов проведено" },
    { v: "120+", l: "Технологий в базе" },
    { v: "99.9%", l: "Uptime сканера" },
    { v: "< 2 сек", l: "Среднее время ответа" },
  ];

  const techCategories = [
    {
      icon: <Code />,
      label: "Frontend",
      items:
        "React, Vue, Angular, Svelte, Next.js, Nuxt.js, Gatsby, Astro, Solid",
    },
    {
      icon: <Server />,
      label: "Backend",
      items:
        "Node.js, Go, Python (Django/Flask), PHP (Laravel), Ruby on Rails, Java Spring",
    },
    {
      icon: <Database />,
      label: "Базы данных",
      items: "PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch, DynamoDB",
    },
    {
      icon: <Layers />,
      label: "CSS-фреймворки",
      items: "Tailwind CSS, Bootstrap, Bulma, Material UI, Chakra UI, Sass",
    },
    {
      icon: <Globe />,
      label: "CMS",
      items: "WordPress, Drupal, Joomla, Strapi, Contentful, Sanity, Ghost",
    },
    {
      icon: <Lock />,
      label: "Безопасность",
      items: "Cloudflare, Sucuri, reCAPTCHA, Let's Encrypt, OWASP Headers",
    },
  ];

  const roadmap = [
    {
      version: "v2.0",
      status: "Текущая",
      title: "AI-Powered Reports",
      desc: "Машинное обучение для рекомендаций и предиктивного анализа",
      done: true,
    },
    {
      version: "v2.1",
      status: "Q2 2025",
      title: "Real-time Monitoring",
      desc: "Подписка на изменения домена и уведомления о регрессиях",
      done: false,
    },
    {
      version: "v2.2",
      status: "Q3 2025",
      title: "Team Workspaces",
      desc: "Совместная работа над аудитами, комментарии, шаринг отчётов",
      done: false,
    },
    {
      version: "v3.0",
      status: "Q4 2025",
      title: "Public API",
      desc: "Открытый REST/GraphQL API для интеграций в CI/CD",
      done: false,
    },
  ];

  const team = [
    {
      name: "Артём Волков",
      role: "Founder & CEO",
      bio: "10+ лет в SaaS, бывший engineering lead в Vercel.",
    },
    {
      name: "Лиза Чен",
      role: "Head of Design",
      bio: "Ex-Stripe, эксперт в дизайн-системах и a11y.",
    },
    {
      name: "Марк Иванов",
      role: "Principal Engineer",
      bio: "Distributed systems, реалтайм-аналитика.",
    },
    {
      name: "Сара Нгуен",
      role: "AI Research Lead",
      bio: "PhD, ML-аудит и рекомендательные системы.",
    },
  ];

  return (
    <div className="relative w-full">
      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto px-6 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="purple" glow size="md" className="mb-6">
            <Sparkles className="w-3.5 h-3.5 fill-current mr-1" /> О платформе
            WebScope
          </Badge>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <span className="text-white">Платформа для </span>
          <span className="animate-gradient-text">глубокого анализа</span>
          <br />
          <span className="text-white">любого </span>
          <span className="animate-gradient-text">веб-стека</span>
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg text-zinc-300 max-w-3xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <strong className="text-fuchsia-300">WebScope</strong> — это
          SaaS-платформа нового поколения, которая за считанные секунды
          раскрывает архитектуру, производительность, безопасность и
          дизайн-систему любого публичного веб-сайта. Мы помогаем разработчикам,
          дизайнерам и продакт-менеджерам принимать решения на основе данных.
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center gap-3 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Link to="/">
            <Button variant="primary" size="lg">
              <Rocket className="w-4 h-4 mr-2" />
              Попробовать сканер
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="lg">
              Открыть Dashboard
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.l} {...stagger(i)}>
              <div className="glass-card p-5 text-center hover-tilt">
                <div className="text-2xl sm:text-3xl font-extrabold animate-gradient-text">
                  {s.v}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-400 mt-1.5 font-semibold">
                  {s.l}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div {...fadeUp}>
          <Card variant="glass" className="overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-cyan-500/10" />
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-fuchsia-500/20 blur-[100px] rounded-full animate-blob" />
            <div
              className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/20 blur-[100px] rounded-full animate-blob"
              style={{ animationDelay: "3s" }}
            />

            <CardContent className="relative p-8 sm:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Target className="w-7 h-7" />,
                    title: "Наша миссия",
                    desc: "Сделать глубокий технический аудит веб-сайтов доступным каждому разработчику за считанные секунды, без регистрации и сложных настроек.",
                  },
                  {
                    icon: <Eye className="w-7 h-7" />,
                    title: "Наше видение",
                    desc: "Мир, где каждый веб-проект создаётся на основе прозрачных данных и лучших практик, а не догадок.",
                  },
                  {
                    icon: <Heart className="w-7 h-7" />,
                    title: "Наши ценности",
                    desc: "Прозрачность, скорость, уважение к приватности. Все данные хранятся локально в браузере пользователя.",
                  },
                ].map((block, i) => (
                  <motion.div
                    key={block.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4 text-fuchsia-300 shadow-lg shadow-fuchsia-500/20">
                      {block.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {block.title}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {block.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* What we do - Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div {...fadeUp} className="text-center mb-14">
          <Badge variant="info" size="md" className="mb-4 mx-auto">
            🔍 Что мы делаем
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Шесть направлений{" "}
            <span className="animate-gradient-text">глубокого аудита</span>
          </h2>
          <p className="text-sm text-zinc-400 mt-3 max-w-2xl mx-auto">
            Каждый отчёт включает более 120 технических параметров, оценённых по
            7-балльной шкале
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              {...stagger(i)}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="glass-card p-6 h-full flex flex-col gap-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-lg ${f.glow} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                >
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed flex-1">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Technology database */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div {...fadeUp} className="text-center mb-14">
          <Badge variant="purple" size="md" className="mb-4 mx-auto">
            📚 База знаний
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            <span className="animate-gradient-text">120+ технологий</span> в
            нашей базе
          </h2>
          <p className="text-sm text-zinc-400 mt-3 max-w-2xl mx-auto">
            Постоянно обновляемая база сигнатур популярных фреймворков,
            серверов, CMS и инструментов
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techCategories.map((cat, i) => (
            <motion.div
              key={cat.label}
              {...stagger(i)}
              whileHover={{ scale: 1.02 }}
            >
              <Card variant="glass" className="p-5 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 flex items-center justify-center text-fuchsia-300">
                    {cat.icon}
                  </div>
                  <h3 className="text-sm font-bold text-white">{cat.label}</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {cat.items}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div {...fadeUp} className="text-center mb-14">
          <Badge variant="purple" size="md" className="mb-4 mx-auto">
            ⚙️ Архитектура
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Как работает{" "}
            <span className="animate-gradient-text">наш сканер</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              n: "01",
              icon: <Globe />,
              t: "DNS Resolution",
              d: "Резолвим домен, получаем A-записи, NS-серверы, IP-адреса. Проверяем геолокацию сервера через GeoIP.",
            },
            {
              n: "02",
              icon: <Code />,
              t: "HTTP Fetch",
              d: "Загружаем HTML с CORS-прокси для обхода cross-origin ограничений, парсим заголовки и cookies.",
            },
            {
              n: "03",
              icon: <Cpu />,
              t: "DOM Analysis",
              d: "Парсим HTML: meta-теги, OpenGraph, Twitter Cards, шрифты, цвета, JS-библиотеки, ссылки.",
            },
            {
              n: "04",
              icon: <Bot />,
              t: "AI Report",
              d: "Агрегируем данные, генерируем оценки по 7 метрикам и формулируем рекомендации.",
            },
          ].map((step, i) => (
            <motion.div key={step.n} {...stagger(i)} className="relative">
              <Card variant="glass" className="p-5 h-full hover-tilt">
                <div className="text-3xl font-black animate-gradient-text mb-3">
                  {step.n}
                </div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center text-white mb-3 shadow-lg shadow-fuchsia-500/30">
                  {step.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{step.t}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {step.d}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div {...fadeUp} className="text-center mb-14">
          <Badge variant="purple" size="md" className="mb-4 mx-auto">
            🗺️ Дорожная карта
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Планы <span className="animate-gradient-text">развития</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roadmap.map((item, i) => (
            <motion.div key={item.version} {...stagger(i)} className="relative">
              <Card
                variant="glass"
                className={`p-5 h-full ${item.done ? "border-fuchsia-400/50" : ""}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant={item.done ? "success" : "purple"}
                    glow
                    size="md"
                  >
                    {item.version}
                  </Badge>
                  {item.done && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-[10px] text-fuchsia-300 uppercase tracking-widest font-bold mb-2">
                  {item.status}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div {...fadeUp} className="text-center mb-14">
          <Badge variant="purple" size="md" className="mb-4 mx-auto">
            <Users className="w-3 h-3 mr-1" /> Команда
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Люди, которые{" "}
            <span className="animate-gradient-text">строят WebScope</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              {...stagger(i)}
              whileHover={{ y: -6 }}
            >
              <Card variant="glass" className="p-5 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500 mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-fuchsia-500/30">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <h3 className="text-sm font-bold text-white">{member.name}</h3>
                <p className="text-[10px] text-fuchsia-300 uppercase tracking-widest font-bold mt-1">
                  {member.role}
                </p>
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                  {member.bio}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Privacy & Tech stack */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div {...fadeUp}>
            <Card
              variant="glass"
              className="p-7 h-full relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 blur-[80px] rounded-full" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-300 mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Приватность прежде всего
                </h3>
                <ul className="flex flex-col gap-2.5 text-xs text-zinc-300">
                  {[
                    "Все отчёты хранятся ТОЛЬКО в вашем браузере (localStorage)",
                    "Мы не отправляем историю сканирований на сторонние серверы",
                    "Никаких cookies-трекеров и рекламных идентификаторов",
                    "GDPR-compliant архитектура: данные никогда не покидают ваше устройство",
                    "Полный контроль: очистка истории одним кликом",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
          >
            <Card
              variant="glass"
              className="p-7 h-full relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-fuchsia-500/20 blur-[80px] rounded-full" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 flex items-center justify-center text-fuchsia-300 mb-4">
                  <GitBranch className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Технологический стек WebScope
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { l: "Frontend", v: "React 19 + TypeScript" },
                    { l: "Стили", v: "Tailwind CSS 4" },
                    { l: "Анимации", v: "Framer Motion" },
                    { l: "Routing", v: "React Router 7" },
                    { l: "State", v: "Context API + React Query" },
                    { l: "Иконки", v: "Lucide React" },
                    { l: "Сборка", v: "Vite 8" },
                    { l: "Линтер", v: "oxlint" },
                  ].map((item) => (
                    <div
                      key={item.l}
                      className="p-2.5 rounded-lg bg-zinc-950/40 border border-fuchsia-500/10"
                    >
                      <div className="text-[9px] text-fuchsia-300 uppercase tracking-widest font-bold">
                        {item.l}
                      </div>
                      <div className="text-white font-mono mt-0.5">
                        {item.v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
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
            <Award className="w-10 h-10 text-fuchsia-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Присоединяйтесь к{" "}
              <span className="animate-gradient-text">сообществу WebScope</span>
            </h2>
            <p className="text-sm text-zinc-300 max-w-xl mx-auto mb-7">
              Более 50 000 разработчиков уже используют WebScope для улучшения
              своих проектов. Запустите первый аудит прямо сейчас — это
              бесплатно.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-2xl shadow-fuchsia-500/50"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Запустить первый аудит
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                <Clock className="w-4 h-4 mr-2" />
                Запросить демо
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default About;
