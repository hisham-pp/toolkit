import React from "react";
import ToolBackButton from "@/components/ToolBackButton";
import SyncRefreshButton from "@/components/SyncRefreshButton";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-400 flex flex-col font-sans">
      <header className="border-b border-zinc-700/50 bg-[#09090B]/80 backdrop-blur-md sticky top-0 z-50 w-full">
        <div className="w-full px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <ToolBackButton />
            <div className="h-6 w-[1px] bg-zinc-800 mx-1" />
            <h1 className="text-sm font-bold text-white tracking-tight leading-none uppercase italic">Settings & Sync</h1>
          </div>
          <SyncRefreshButton />
        </div>
      </header>
      <main className="flex-1 w-full p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
