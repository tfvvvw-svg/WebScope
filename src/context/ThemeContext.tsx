import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

// Theme definition - Dark theme only
type Theme = "dark";

interface ThemeContextProps {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme] = useState<Theme>(() => {
    const saved = localStorage.getItem("app-theme");
    return (saved as Theme) || "dark";
  });

  // Apply theme class to html element
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = "dark";
    localStorage.setItem("app-theme", "dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

// Helper hook to check if dark mode (always true in this implementation)
export const useIsDarkMode = (): boolean => {
  return true;
};
