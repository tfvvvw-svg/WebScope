import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Compare } from './pages/Compare';
import { Analysis } from './pages/Analysis';
import { AiChat } from './pages/AiChat';
import { About } from './pages/About';
import { AnimatedBackground } from './components/common/AnimatedBackground';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

const pageTransition = {
  initial: { opacity: 0, y: 24, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -24, filter: 'blur(8px)' },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const }
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        className="grow "
        {...pageTransition}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/ai-chat" element={<AiChat />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <BrowserRouter>
              <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] selection:bg-fuchsia-500/30 selection:text-white relative overflow-hidden">
                <AnimatedBackground />
                <div className="relative z-10 flex flex-col min-h-screen">
                  <Navbar />
                  <AnimatedRoutes />
                  <Footer />
                </div>
              </div>
            </BrowserRouter>
          </AppProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
