import React from "react";
import Link from "next/link";
import { Tool } from "@/utility/constants/tools";
import ToolBackButton from "@/components/ToolBackButton";
import HeaderSearch from "@/components/HeaderSearch";
import { Settings as SettingsIcon } from "lucide-react";

interface ToolLayoutProps {
  tool: Tool;
  children: React.ReactNode;
}

export default function ToolLayout({ tool, children }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-400 flex flex-col font-sans">
      {/* Tool Header */}
      <header className="border-b border-zinc-700/50 bg-[#09090B]/80 backdrop-blur-md sticky top-0 z-50 w-full">
        <div className="w-full px-4 md:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <ToolBackButton />
            <div className="h-6 w-[1px] bg-zinc-800 mx-0.5 md:mx-1" />
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center shadow-lg shrink-0">
                <tool.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <h1 className="text-xs md:text-sm font-bold text-white tracking-tight leading-none truncate">{tool.name}</h1>
                  <span className="text-[8px] md:text-[10px] bg-zinc-900 text-zinc-500 border border-zinc-800 px-1 py-0.5 md:px-1.5 rounded uppercase font-black tracking-tighter shrink-0">v1.2</span>
                </div>
                <p className="text-[8px] md:text-[9px] text-zinc-600 uppercase tracking-[0.1em] md:tracking-[0.2em] mt-0.5 md:mt-1 font-bold truncate">{tool.category}</p>
              </div>
            </div>
          </div>

          {/* Global Search - Hidden on very small screens, smaller on medium */}
          <div className="hidden sm:block flex-1 max-w-md">
            <HeaderSearch />
          </div>

          <div className="flex items-center gap-3 md:gap-6 shrink-0">
             <Link 
               href="/settings" 
               className="p-2 text-zinc-600 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
               title="Settings & Sync"
             >
               <SettingsIcon className="w-5 h-5" />
             </Link>
             <div className="h-8 w-[1px] bg-zinc-800 hidden lg:block" />
             <div className="hidden lg:flex items-center gap-6 pr-4">
                <div className="flex flex-col items-end">
                   <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest leading-none mb-1">Processing Mode</span>
                   <span className="text-[10px] text-primary font-mono font-bold">Local-Only (Client-Side)</span>
                </div>
             </div>
             <div className="h-8 w-[1px] bg-zinc-800 hidden lg:block" />
             <div className="flex items-center gap-2 md:gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-600 font-mono">Ready</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width */}
      <main className="flex-1 w-full p-6 lg:p-8 xl:p-10">
        <div className="w-full h-full max-w-full">
          {children}
        </div>
      </main>

      {/* Modern Status Footer */}
      <footer className="border-t border-zinc-800/50 bg-[#09090B] py-4 px-6 w-full">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-mono text-zinc-700 flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded">ENV: PRODUCTION</span>
              <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded">LIB: SHADCN/V4</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
            <span className="opacity-40">Privacy Secured</span>
            <div className="w-1 h-1 rounded-full bg-zinc-800" />
            <span className="text-zinc-500">Developer OS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
