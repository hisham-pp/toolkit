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
    // Top 7 tools logic
    let list = [...recentTools];
    if (list.length < 7) {
      const remainingIds = TOOLS
        .filter(t => !recentIds.includes(t.id))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(t => t.id);
      
      const fillCount = 7 - list.length;
      const fillTools = remainingIds.slice(0, fillCount)
        .map(id => TOOLS.find(t => t.id === id)!)
        .filter(Boolean);
      
      list = [...list, ...fillTools];
    }
    return list.slice(0, 7);
  }, [recentTools, recentIds]);

  return (
    <main className="min-h-screen w-full bg-[#09090B] text-zinc-400">
      {/* Hero Section - Full Screen */}
      <section className="h-screen w-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center gap-10"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-zinc-950 border border-white/10 rounded-[2rem] flex items-center justify-center text-primary font-black text-5xl shadow-2xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500">
              D
            </div>
            <div className="text-left">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">Version 2.0.4</span>
               <h1 className="text-white font-black text-6xl md:text-8xl tracking-tighter leading-[0.85]">
                 Dev<span className="text-primary italic">Hub</span>
               </h1>
            </div>
          </div>
          
          <div className="max-w-2xl">
            <p className="text-xl md:text-2xl text-zinc-500 font-medium tracking-tight leading-relaxed">
              The <span className="text-zinc-200">Ultimate Operating System</span> for Modern Developers. 
              Minimalist, blazing fast, and packed with <span className="text-primary">{TOOLS.length} essential utilities</span>.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
              className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-primary hover:text-white transition-all shadow-2xl shadow-white/10"
            >
              Access Workspace
            </motion.button>
            <div className="animate-bounce mt-4">
              <ChevronDown className="w-5 h-5 text-zinc-800" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Workspace Section */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pb-24 space-y-24">
        {/* Workspace Header */}
        <div className="flex items-end justify-between border-b border-zinc-900 pb-12">
          <div>
            <h2 className="text-white font-black text-4xl tracking-tighter uppercase italic">Workspace</h2>
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] mt-2 italic">Quick access to your engine room</p>
          </div>
          <Link href="/tools" className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">
            Explore All Tools
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Tools Grid */}
        <section className="flex flex-col gap-12">
          <div className="flex items-center gap-4">
             <div className="h-px flex-1 bg-zinc-900" />
             <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 whitespace-nowrap">
               {recentIds.length > 0 ? "Recently Deployed" : "Popular Utilities"}
             </h3>
             <div className="h-px flex-1 bg-zinc-900" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
              {displayedTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link 
                        href={tool.route} 
                        onClick={() => trackToolClick(tool.id)}
                        className="group relative block aspect-square"
                      >
                        <div className="h-full bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-6 transition-all duration-700 group-hover:bg-[#111113] group-hover:border-primary group-hover:-translate-y-4 shadow-xl hover:shadow-primary/10 overflow-hidden">
                          <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                          
                          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-3xl group-hover:bg-primary group-hover:scale-110 transition-all duration-700 shadow-inner group-hover:shadow-primary/50">
                            <tool.icon className="w-8 h-8 text-zinc-500 group-hover:text-white transition-colors" />
                          </div>
                          
                          <div className="text-center">
                            <h4 className="font-black text-xs uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors truncate px-2">{tool.name}</h4>
                          </div>
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="p-6 rounded-3xl bg-zinc-950 border-zinc-800 text-zinc-200 shadow-2xl max-w-[240px]">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <tool.icon className="w-3 h-3 text-primary" />
                          <p className="font-black uppercase tracking-widest text-xs italic">{tool.name}</p>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">{tool.description}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              ))}
          </div>
        </section>

        {/* Directory CTA */}
        <section className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
           
           <div className="relative z-10 max-w-xl text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic mb-4 block">Expand your toolkit</span>
              <h2 className="text-white font-black text-5xl md:text-6xl tracking-tighter leading-none mb-6">
                Explore the Full <br /> <span className="italic">Inventory.</span>
              </h2>
              <p className="text-zinc-500 text-lg font-medium tracking-tight">Access every utility, converter, and generator in our database with powerful category filtering.</p>
           </div>
           
           <Link 
             href="/tools" 
             className="relative z-10 group flex items-center justify-center w-24 h-24 bg-white rounded-full hover:bg-primary transition-all duration-700 hover:scale-110 shadow-2xl shadow-white/5"
           >
             <ArrowRight className="w-8 h-8 text-black group-hover:text-white transition-transform group-hover:translate-x-2" />
           </Link>
        </section>
      </div>

      {/* Footer Branding */}
      <footer className="pt-20 pb-10 border-t border-zinc-900/50 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 hover:opacity-100 transition-opacity duration-1000">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <Sparkles className="w-3 h-3 text-primary" />
               <span className="text-[9px] font-black uppercase tracking-[0.4em] select-none">Powered by Developer OS</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-800" />
            <span className="text-[9px] font-bold uppercase tracking-widest italic">DevHub 2024</span>
          </div>
          
          <div className="flex items-center gap-2">
             {["React", "Next.js", "Tailwind", "Lucide"].map((tech) => (
               <div key={tech} className="px-3 py-1 bg-zinc-950 border border-zinc-900 rounded-full text-[8px] font-black text-zinc-600 uppercase tracking-widest">
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

