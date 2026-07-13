import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import type { WebScanReport, HistoryItem } from "../types/scan";
import { scanUrl as apiScanUrl } from "../services/apiService";
import {
  getScanHistory,
  saveScanReportToHistory,
  toggleFavoriteScan,
  deleteScanFromHistory,
} from "../services/scanner";

interface AppContextType {
  history: HistoryItem[];
  favorites: HistoryItem[];
  currentReport: WebScanReport | null;
  compareReports: [WebScanReport | null, WebScanReport | null];
  loading: boolean;
  scanProgress: number;
  scanUrl: (url: string) => Promise<WebScanReport>;
  toggleFavorite: (id: string) => void;
  deleteReport: (id: string) => void;
  setCompareSlot: (index: 0 | 1, report: WebScanReport | null) => void;
  clearCompareSlots: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentReport, setCurrentReport] = useState<WebScanReport | null>(
    null,
  );
  const [compareReports, setCompareReports] = useState<
    [WebScanReport | null, WebScanReport | null]
  >([null, null]);
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Initial load of history
  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  // Compute favorites list from history
  const favorites = useMemo(() => history.filter((item) => item.isFavorite), [history]);

  // Scan a website URL entirely in the browser (no backend required)
  const scanUrl = useCallback(async (url: string): Promise<WebScanReport> => {
    setLoading(true);
    setScanProgress(10);
    setCurrentReport(null);

    // Simulate progress increments for premium feeling
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        const step = prev < 50 ? 15 : prev < 80 ? 8 : 3;
        return prev + step;
      });
    }, 300);

    try {
      // Run the browser-based scanner
      const report = await apiScanUrl(url);

      clearInterval(interval);
      setScanProgress(100);

      saveScanReportToHistory(report);
      setHistory(getScanHistory());
      setCurrentReport(report);
      setLoading(false);
      return report;
    } catch (error) {
      clearInterval(interval);
      setScanProgress(0);
      setLoading(false);
      throw error;
    }
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback((id: string) => {
    const updated = toggleFavoriteScan(id);
    setHistory(updated);

    if (currentReport && currentReport.id === id) {
      setCurrentReport({ ...currentReport });
    }
  }, [currentReport]);

  // Delete scan from history
  const deleteReport = useCallback((id: string) => {
    const updated = deleteScanFromHistory(id);
    setHistory(updated);

    if (currentReport && currentReport.id === id) {
      setCurrentReport(null);
    }

    setCompareReports((prev) => {
      const copy = [...prev] as [WebScanReport | null, WebScanReport | null];
      if (copy[0]?.id === id) copy[0] = null;
      if (copy[1]?.id === id) copy[1] = null;
      return copy;
    });
  }, [currentReport]);

  // Set report for comparison slots
  const setCompareSlot = useCallback((index: 0 | 1, report: WebScanReport | null) => {
    setCompareReports((prev) => {
      const copy = [...prev] as [WebScanReport | null, WebScanReport | null];
      copy[index] = report;
      return copy;
    });
  }, []);

  // Clear comparison slots
  const clearCompareSlots = useCallback(() => {
    setCompareReports([null, null]);
  }, []);

  const contextValue = useMemo(() => ({
        history,
        favorites,
        currentReport,
        compareReports,
        loading,
        scanProgress,
        scanUrl,
        toggleFavorite,
        deleteReport,
        setCompareSlot,
        clearCompareSlots,
      }), [history, favorites, currentReport, compareReports, loading, scanProgress]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};