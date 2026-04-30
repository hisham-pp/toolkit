import React from "react";
import { Tool } from "@/utility/constants/tools";
import ToolBackButton from "@/components/ToolBackButton";

interface ToolLayoutProps {
  tool: Tool;
  children: React.ReactNode;
}

export default function ToolLayout({ tool, children }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-400 flex flex-col font-sans">
      {/* Tool Header */}
      <header className="border-b border-zinc-700/50 bg-[#09090B]/80 backdrop-blur-md sticky top-0 z-50 w-full">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ToolBackButton />
            <div className="h-6 w-[1px] bg-zinc-800 mx-1" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center shadow-lg group-hover:border-primary/50 transition-all">
                <tool.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-white tracking-tight leading-none">{tool.name}</h1>
                  <span className="text-[10px] bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">v1.2</span>
                </div>
                <p className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] mt-1 font-bold">{tool.category}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden lg:flex items-center gap-6 pr-4">
                <div className="flex flex-col items-end">
                   <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest leading-none mb-1">Processing Mode</span>
                   <span className="text-[10px] text-primary font-mono font-bold">Local-Only (Client-Side)</span>
                </div>
             </div>
             <div className="h-8 w-[1px] bg-zinc-800 hidden lg:block" />
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 font-mono">System Ready</span>
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
