"use client";

import { useState, useEffect } from "react";
import { Search, Monitor, AppWindow } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TOOLS, ToolConfig } from "@/lib/tools-config";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function SystemTime() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return <span>{time || "--:--"}</span>;
}

export default function Home() {
  const [search, setSearch] = useState("");

  const filteredTools = TOOLS.filter((tool) =>
    tool.name.toLowerCase().includes(search.toLowerCase()) ||
    tool.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen p-6 md:p-12 w-full flex flex-col gap-8 bg-[#09090B] text-zinc-400">
      {/* Header / Top Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg shadow-primary/20">D</div>
          <div>
            <h1 className="text-white font-bold text-2xl leading-none">DevHub<span className="text-primary font-mono text-xs ml-2 opacity-70">v1.0.4</span></h1>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Developer Toolset Hub</p>
          </div>
        </div>

        <div className="relative group w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            placeholder="Search for tools (e.g. JSON, JWT)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-zinc-600"
          />
        </div>

        <div className="hidden lg:flex gap-6 items-center text-[10px] uppercase tracking-widest font-mono">
          <span className="flex items-center gap-2 text-zinc-400">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> 
            System Ready
          </span>
          <span className="text-zinc-600"><SystemTime /></span>
        </div>
      </header>

      {/* Grid of Tools */}
      <section className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
          {filteredTools.map((tool, index) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger>
                <Link href={tool.route} className="group block h-full">
                  <div className="relative h-full bg-[#161618]/50 border border-zinc-800/50 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center gap-3 md:gap-4 transition-all duration-300 group-hover:bg-[#1C1C1E] group-hover:border-primary/40 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-primary/5">
                    <div className="p-3 bg-zinc-900/80 rounded-xl group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500 border border-zinc-800">
                      <tool.icon className="w-6 h-6 md:w-8 md:h-8 text-zinc-500 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="font-semibold text-[10px] sm:text-xs md:text-sm text-zinc-200 group-hover:text-white transition-colors line-clamp-1">{tool.name}</h3>
                      <p className="text-[8px] md:text-[10px] text-zinc-500 line-clamp-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs bg-zinc-900 border-zinc-800 text-zinc-200 shadow-xl">
                <p className="font-medium">{tool.name}</p>
                <p className="text-zinc-500">{tool.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
      </section>

      {filteredTools.length === 0 && (
        <div 
          className="flex flex-col items-center justify-center py-20 text-center space-y-4"
        >
          <div className="p-4 bg-secondary/30 rounded-full">
            <AppWindow className="w-8 h-8 text-muted-foreground opacity-30" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-medium">No tools found</h3>
            <p className="text-sm text-muted-foreground">Try searching for something else like "JSON" or "Base64"</p>
          </div>
        </div>
      )}

      {/* Bottom Metadata & SEO Status Bar */}
      <footer className="mt-auto h-8 flex flex-col md:flex-row items-center justify-between border-t border-zinc-800/50 pt-8 pb-4 px-2 gap-4">
        <div className="flex gap-6 items-center">
        </div>
        <div className="flex gap-6 items-center">
          <div className="flex -space-x-1.5 transition-all hover:-space-x-0.5">
            {["T", "S", "N"].map((char, i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-950 flex items-center justify-center text-[8px] font-bold text-zinc-400 select-none">
                {char}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
