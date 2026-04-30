import { useState, useEffect } from "react";

export type HistoryItem = {
  id: string;
  timestamp: number;
  data: string;
};

export function useToolHistory(toolId: string) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`devhub_history_${toolId}`);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, [toolId]);

  const addToHistory = (data: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      data,
    };

    setHistory((prev) => {
      // Avoid duplicate consecutive entries
      if (prev.length > 0 && prev[0].data === data) return prev;
      
      const newHistory = [newItem, ...prev].slice(0, 10);
      localStorage.setItem(`devhub_history_${toolId}`, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(`devhub_history_${toolId}`);
  };

  return { history, addToHistory, clearHistory };
}
