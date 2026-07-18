import React, { memo } from "react";
import { ShieldAlert, Heart, Sparkles, Zap, Globe, Cpu } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

export const Footer: React.FC = memo(() => {
  const socialLinks = [
    { label: "GitHub", href: "#", icon: <Globe className="w-4 h-4" /> },
    { label: "Twitter", href: "#", icon: <Sparkles className="w-4 h-4" /> },
    { label: "LinkedIn", href: "#", icon: <Cpu className="w-4 h-4" /> },
  ];

  return (
    <footer className="relative w-full bg-gradient-to-b from-transparent to-fuchsia-950/20 border-t border-fuchsia-500/20 py-12 px-6 mt-auto overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute -top-20 left-1/4 w-96 h-96 bg-fuchsia-600/10 blur-[100px] rounded-full animate-blob pointer-events-none" />
      <div
        className="absolute -bottom-20 right-1/4 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full animate-blob pointer-events-none"
        style={{ animationDelay: "3s" }}
      />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Branding */}
        <motion.div {...fadeUp} className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-cyan-500 p-2 rounded-xl text-white shadow-lg shadow-fuchsia-500/30 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight animate-gradient-text">
              WebScope
            </span>
          </Link>
          <p className="text-xs text-zinc-400 leading-relaxed">
            SaaS-платформа для прозрачного анализа веб-инфраструктуры:
            технологический стек, дизайн-системы, безопасность и
            производительность в одном отчёте.
          </p>
          <div className="flex items-center gap-3 text-zinc-400 mt-2">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                whileHover={{ scale: 1.2, y: -2 }}
                className="hover:text-fuchsia-400 transition-colors"
                aria-label={social.label}
              >
                <span
                  className="inline-flex items-center justify-center"
                  aria-hidden="true"
                >
                  {social.icon}
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Platform */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
        >
          <h4 className="text-xs font-bold text-fuchsia-300 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Платформа
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs text-zinc-400">
            {[
              { to: "/", label: "Сканировать сайт" },
              { to: "/compare", label: "Сравнение сайтов" },
              { to: "/dashboard", label: "Рабочая панель" },
              { to: "/history", label: "История аудитов" },
              { to: "/about", label: "О платформе" },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="hover:text-fuchsia-300 transition-colors relative inline-block group"
                >
                  <span className="relative">
                    {item.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-fuchsia-400 to-cyan-400 group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Resources */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
        >
          <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Zap className="w-3 h-3" /> Ресурсы
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs text-zinc-400">
            {[
              "Документация API",
              "База знаний",
              "Блог разработчика",
              "Changelog",
            ].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="hover:text-cyan-300 transition-colors relative inline-block group"
                >
                  <span className="relative">
                    {item}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-cyan-400 to-fuchsia-400 group-hover:w-full transition-all duration-300" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Legal */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.3 }}
        >
          <h4 className="text-xs font-bold text-pink-300 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Globe className="w-3 h-3" /> Юридическое
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs text-zinc-400">
            {[
              "Условия использования",
              "Политика конфиденциальности",
              "Cookie-настройки",
              "GDPR Compliance",
            ].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="hover:text-pink-300 transition-colors relative inline-block group"
                >
                  <span className="relative">
                    {item}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-pink-400 to-fuchsia-400 group-hover:w-full transition-all duration-300" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Newsletter section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="max-w-3xl mx-auto mt-12 relative z-10"
      >
        <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-4 border-fuchsia-500/30">
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Cpu className="w-4 h-4 text-fuchsia-400" />
              <h5 className="text-sm font-bold text-white">
                Подпишитесь на dev-рассылку
              </h5>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Еженедельно: тренды стеков, разборы производительности, советы по
              оптимизации.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="name@company.com"
              className="bg-zinc-950/60 border border-fuchsia-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500 focus:shadow-fuchsia-500/30 focus:shadow-lg w-full sm:w-56 transition-all"
              aria-label="Email for newsletter"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white rounded-xl px-4 py-2 text-xs font-semibold shadow-lg shadow-fuchsia-500/30 transition-all"
            >
              Подписаться
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="neon-divider max-w-7xl mx-auto mt-10" />

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-500 font-medium mt-6">
        <span>
          © {new Date().getFullYear()} WebScope Technologies Inc. Все права
          защищены.
        </span>
        <span className="flex items-center gap-1">
          Сделано с{" "}
          <Heart className="w-3 h-3 text-pink-500 fill-current animate-pulse" />{" "}
          для современных разработчиков
        </span>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
