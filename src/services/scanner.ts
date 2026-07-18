import type { HistoryItem } from '../types/scan';

// Clean and normalize URL to get domain
export function getDomainName(urlStr: string): string {
  try {
    let cleaned = urlStr.trim().toLowerCase();
    if (!/^https?:\/\//i.test(cleaned)) {
      cleaned = 'https://' + cleaned;
    }
    const urlObj = new URL(cleaned);
    return urlObj.hostname.replace('www.', '');
  } catch {
    const match = urlStr.match(/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/i);
    return match ? match[0] : urlStr;
  }
}

// History utilities storing in localStorage
const LOCAL_STORAGE_KEY = 'webscope_scan_history';

export function getScanHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveScanReportToHistory(report: { id: string; url: string; title: string; scanDate: string; scores: { overallRating: number }; design?: { colorPalette?: { hex: string }[] }; category: string } & Record<string, any>): void {
  try {
    const history = getScanHistory();
    const domain = getDomainName(report.url);
    const existingIndex = history.findIndex(item => getDomainName(item.url) === domain);

    const newItem: HistoryItem = {
      id: report.id,
      url: report.url,
      title: report.title,
      scanDate: report.scanDate,
      overallRating: report.scores.overallRating,
      primaryColor: report.design?.colorPalette?.[0]?.hex || '#6366f1',
      category: report.category,
      isFavorite: false,
    };

    if (existingIndex >= 0) {
      history[existingIndex] = newItem;
    } else {
      history.unshift(newItem);
    }

    // Cap at 30 items
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history.slice(0, 30)));
  } catch (e) {
    console.error('Failed to save scan to history', e);
  }
}

export function toggleFavoriteScan(id: string): HistoryItem[] {
  const history = getScanHistory();
  const index = history.findIndex(item => item.id === id);
  if (index >= 0) {
    history[index].isFavorite = !history[index].isFavorite;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
  }
  return history;
}

export function deleteScanFromHistory(id: string): HistoryItem[] {
  const history = getScanHistory().filter(item => item.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
  return history;
}