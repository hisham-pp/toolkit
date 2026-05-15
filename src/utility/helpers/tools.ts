import { RECENT_TOOLS_KEY } from "@/utility/constants/storage-keys";

export function trackToolVisit(toolId: string) {
  if (typeof window === "undefined") return;

  try {
    const saved = localStorage.getItem(RECENT_TOOLS_KEY);
    let recentIds: string[] = [];

    if (saved) {
      recentIds = JSON.parse(saved);
    }

    const newRecent = [toolId, ...recentIds.filter((id) => id !== toolId)].slice(0, 10);
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(newRecent));
  } catch (e) {
    console.error("Failed to track tool visit", e);
  }
}

export function getRecentToolIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(RECENT_TOOLS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to get recent tools", e);
  }
  return [];
}
