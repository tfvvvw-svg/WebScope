import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AnimatePresence, motion } from "framer-motion";
import { AppProvider } from "./context/AppContext";
import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";
import { AnimatedBackground } from "./components/common/AnimatedBackground";

const Home = lazy(() =>
  import("./pages/Home").then((module) => ({ default: module.Home })),
);
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })),
);
const History = lazy(() =>
  import("./pages/History").then((module) => ({ default: module.History })),
);
const Compare = lazy(() =>
  import("./pages/Compare").then((module) => ({ default: module.Compare })),
);
const Analysis = lazy(() =>
  import("./pages/Analysis").then((module) => ({ default: module.Analysis })),
);
const Developer = lazy(() =>
  import("./pages/Developer").then((module) => ({ default: module.Developer })),
);
const AiChat = lazy(() =>
  import("./pages/AiChat").then((module) => ({ default: module.AiChat })),
);
const About = lazy(() =>
  import("./pages/About").then((module) => ({ default: module.About })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const pageTransition = {
  initial: { opacity: 0, y: 24, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -24, filter: "blur(8px)" },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.main key={location.pathname} className="grow" {...pageTransition}>
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="h-4 w-40 bg-fuchsia-500/20 rounded mb-4" />
                <div className="h-24 bg-zinc-800/60 rounded-xl" />
              </div>
            </div>
          }
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/developer" element={<Developer />} />
            <Route path="/ai-chat" element={<AiChat />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Suspense>
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
