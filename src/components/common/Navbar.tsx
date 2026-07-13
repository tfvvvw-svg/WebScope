import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, History, GitCompare, LayoutDashboard, Globe, Sun, Moon, Languages, Info, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Language } from '../../context/LanguageContext';
import { motion } from 'framer-motion';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { history } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { path: '/', label: t('landing'), icon: <Globe className="w-4 h-4" /> },
    { path: '/dashboard', label: t('dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: '/history', label: t('history'), icon: <History className="w-4 h-4" /> },
    { path: '/compare', label: t('compare'), icon: <GitCompare className="w-4 h-4" /> },
    { path: '/ai-chat', label: 'AI Chat', icon: <Sparkles className="w-4 h-4" /> },
    { path: '/about', label: t('about') || 'About', icon: <Info className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 w-full glass-panel border-b border-fuchsia-500/20 backdrop-blur-md"
    >
      {/* Animated top border line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/60 to-transparent animate-shimmer" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="relative bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-cyan-500 p-2 rounded-xl text-white shadow-lg shadow-fuchsia-500/40"
          >
            <ShieldAlert className="w-5 h-5" />
            <span className="absolute inset-0 rounded-xl bg-fuchsia-400/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
          <span className="font-extrabold text-lg tracking-tight animate-gradient-text">
            WebScope
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-300 nav-link
                  ${active
                    ? 'bg-gradient-to-r from-fuchsia-500/15 to-cyan-500/15 text-fuchsia-300 border border-fuchsia-500/30 shadow-lg shadow-fuchsia-500/10'
                    : 'text-zinc-400 hover:text-fuchsia-300 hover:bg-fuchsia-500/5 border border-transparent'
                  }
                `}
              >
                {active && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {link.icon}
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <div className="relative flex items-center gap-1 bg-zinc-900/80 rounded-xl px-2.5 py-1.5 border border-fuchsia-500/20 mr-2 shadow-inner">
            <Languages className="w-3.5 h-3.5 text-fuchsia-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-[11px] font-semibold text-zinc-200 outline-none border-0 cursor-pointer pr-1"
            >
              <option value="en" className="bg-zinc-900 text-zinc-200">EN</option>
              <option value="ru" className="bg-zinc-900 text-zinc-200">RU</option>
              <option value="uz" className="bg-zinc-900 text-zinc-200">UZ</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-fuchsia-500/10 transition-colors border border-fuchsia-500/20"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-fuchsia-400" />}
          </motion.button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-zinc-200">{t('demoUser')}</span>
            <span className="text-[10px] text-fuchsia-400 font-mono font-medium animate-pulse">{history.length} {t('scansCached')}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-200 font-bold text-xs ring-1 ring-fuchsia-500/20 shadow-md">
            DU
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
