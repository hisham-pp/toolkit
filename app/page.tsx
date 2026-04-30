"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Monitor, AppWindow, History, SortAsc, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TOOLS, Tool } from "@/lib/tools-config";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const RECENT_TOOLS_KEY = "devhub_recent_tools";
const MAX_HOME_TOOLS = 16;

export default function Home() {
  const [search, setSearch] = useState("");
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<"recent" | "az">("az");

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_TOOLS_KEY);
    if (saved) {
      try {
        setRecentIds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent tools", e);
      }
    }
  }, []);

  const trackToolClick = (id: string) => {
    const newRecent = [id, ...recentIds.filter(rid => rid !== id)].slice(0, 10);
    setRecentIds(newRecent);
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(newRecent));
  };

  const filteredTools = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return TOOLS;

    return TOOLS.filter((tool) =>
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query) ||
      tool.keywords.some(k => k.toLowerCase().includes(query))
    );
  }, [search]);

  const recentTools = useMemo(() => {
    return recentIds
      .map(id => TOOLS.find(t => t.id === id))
      .filter((t): t is Tool => !!t);
  }, [recentIds]);

  const displayedTools = useMemo(() => {
    let list = [...filteredTools];
    
    if (!search) {
      if (sortMode === "recent" && recentTools.length > 0) {
        return recentTools.slice(0, MAX_HOME_TOOLS);
      }
      // Default A-Z
      list.sort((a, b) => a.name.localeCompare(b.name));
      return list.slice(0, MAX_HOME_TOOLS);
    }

    return list;
  }, [filteredTools, search, sortMode, recentTools]);

  return (
    <main className="min-h-screen p-6 md:p-12 w-full flex flex-col gap-10 bg-[#09090B] text-zinc-400">
      {/* Header / Top Bar */}
      <header className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-14 h-14 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-center text-primary font-black text-3xl shadow-2xl">
                D
              </div>
            </div>
            <div>
              <h1 className="text-white font-black text-3xl tracking-tight leading-none">
                DevHub
                <span className="ml-3 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-[10px] text-primary font-mono uppercase tracking-widest align-middle">
                  {TOOLS.length} Tools
                </span>
              </h1>
              <p className="text-[10px] text-zinc-500 mt-2 uppercase font-black tracking-[0.2em] italic">Open-Source Developer OS</p>
            </div>
          </div>

          <div className="relative group w-full md:w-[450px]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-full opacity-50 group-focus-within:from-primary/50 group-focus-within:to-blue-500/50 blur transition duration-500"></div>
            <div className="relative flex items-center bg-zinc-950 rounded-full border border-zinc-800 focus-within:border-primary/50 transition-all">
              <Search className="ml-5 w-4 h-4 text-zinc-600 transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                placeholder="Search tools, keywords (e.g. 'auth', 'css', 'json')..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent py-4 px-4 text-sm font-medium text-zinc-200 focus:outline-none placeholder:text-zinc-700"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="mr-4 text-[10px] uppercase font-black text-zinc-600 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Home Stats/Info */}
        {!search && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-1.5 bg-zinc-950 border border-zinc-900 rounded-2xl md:rounded-full">
            <div className="flex bg-zinc-900/50 p-1 rounded-full">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSortMode("az")}
                className={cn(
                  "h-8 px-4 text-[9px] uppercase font-black tracking-widest gap-2 rounded-full transition-all",
                  sortMode === "az" ? "bg-zinc-800 text-white shadow-xl" : "text-zinc-600 hover:text-zinc-400"
                )}
              >
                <SortAsc className="w-3 h-3" /> A-Z Order
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSortMode("recent")}
                className={cn(
                  "h-8 px-4 text-[9px] uppercase font-black tracking-widest gap-2 rounded-full transition-all",
                  sortMode === "recent" ? "bg-zinc-800 text-white shadow-xl" : "text-zinc-600 hover:text-zinc-400"
                )}
              >
                <History className="w-3 h-3" /> Recent
              </Button>
            </div>

            <div className="hidden md:flex items-center gap-6 pr-6">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Productive Sessions: 42</span>
               </div>
               <div className="h-3 w-px bg-zinc-800" />
               <Link href="/tools" className="flex items-center gap-2 group">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-primary transition-colors">Directory</span>
                  <ArrowRight className="w-3 h-3 text-zinc-700 group-hover:text-primary transition-all group-hover:translate-x-1" />
               </Link>
            </div>
          </div>
        )}
      </header>

      {/* Grid of Tools */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 flex items-center gap-3">
              {search ? `Search Results (${filteredTools.length})` : sortMode === "recent" ? "Your Frequent Tools" : "Popular Utilities"}
              <div className="flex-1 h-[1px] w-20 bg-zinc-900" />
           </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4">
            {displayedTools.map((tool, index) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger>
                  <Link 
                    href={tool.route} 
                    onClick={() => trackToolClick(tool.id)}
                    className="group relative"
                  >
                    <div className="relative h-full bg-[#111113]/80 border border-zinc-800/40 rounded-3xl p-5 flex flex-col items-center justify-center gap-4 transition-all duration-500 group-hover:bg-[#161618] group-hover:border-primary/40 group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:shadow-primary/5 overflow-hidden">
                      {/* Decorative background accent */}
                      <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
                      
                      <div className="relative p-4 bg-zinc-900/50 rounded-2xl group-hover:bg-primary group-hover:scale-110 transition-all duration-500 border border-zinc-800/50 shadow-inner group-hover:shadow-primary/40">
                        <tool.icon className="w-7 h-7 text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                      
                      <div className="text-center space-y-1.5 relative z-10">
                        <h3 className="font-black text-[11px] uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors line-clamp-1">{tool.name}</h3>
                        <div className="flex justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                           {tool.keywords.slice(0, 2).map((k, i) => (
                             <span key={i} className="text-[7px] font-bold text-zinc-600 lowercase">#{k}</span>
                           ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="p-4 rounded-2xl bg-zinc-950 border-zinc-800 text-zinc-200 shadow-2xl max-w-[200px]">
                  <div className="space-y-2">
                    <p className="font-black uppercase tracking-widest text-[10px] text-primary italic">{tool.name}</p>
                    <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">{tool.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                       {tool.keywords.map(k => (
                         <span key={k} className="text-[8px] bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-600">#{k}</span>
                       ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
        </div>

        {!search && (
          <div className="mt-8 flex justify-center">
             <Link 
               href="/tools" 
               className="group flex items-center gap-4 px-10 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
             >
                <div className="flex flex-col items-start">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-primary transition-colors">Comprehensive View</span>
                   <span className="text-xs font-black text-zinc-400 group-hover:text-zinc-200">See All {TOOLS.length} Tools</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center group-hover:bg-primary transition-all group-hover:translate-x-1">
                   <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                </div>
             </Link>
          </div>
        )}
      </section>

      {filteredTools.length === 0 && (
        <div 
          className="flex flex-col items-center justify-center py-24 text-center space-y-6"
        >
          <div className="relative">
             <div className="absolute -inset-4 bg-red-500/10 rounded-full blur-xl" />
             <div className="relative p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
               <AppWindow className="w-10 h-10 text-zinc-700" />
             </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-zinc-200 uppercase tracking-tight italic">Zero results found</h3>
            <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest max-w-[280px]">Try searching for generic terms like "conversion", "css", or "security"</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSearch("")}
            className="rounded-xl border-zinc-800 text-[10px] font-black uppercase tracking-widest h-10 px-8"
          >
            Reset Search Engine
          </Button>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="mt-auto pt-20 pb-10 border-t border-zinc-900">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 hover:opacity-100 transition-opacity duration-1000">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <Sparkles className="w-3 h-3 text-primary" />
               <span className="text-[9px] font-black uppercase tracking-[0.4em] select-none">Powered by Developer OS</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-800" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Released April 2024</span>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mr-2">Core Stack:</div>
             {["React", "Next.js", "Tailwind", "Lucide"].map((tech) => (
               <div key={tech} className="px-2.5 py-1 bg-zinc-950 border border-zinc-900 rounded text-[8px] font-bold text-zinc-500">
                 {tech}
               </div>
             ))}
          </div>
        </div>
      </footer>
    </main>
  );
}

function Button({ children, variant = "primary", size = "md", className, onClick }: any) {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    ghost: "bg-transparent text-zinc-400 hover:text-white",
    outline: "bg-transparent border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white",
  };
  
  const sizes = {
    sm: "h-8 px-3 text-[10px]",
    md: "h-10 px-4 text-xs",
    lg: "h-12 px-6 text-sm",
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center font-bold transition-all disabled:opacity-50 disabled:pointer-events-none",
        variants[variant as keyof typeof variants],
        sizes[size as keyof typeof sizes],
        className
      )}
    >
      {children}
    </button>
  );
}

