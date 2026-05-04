"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TOOLS, Tool } from "@/utility/constants/tools";
import { 
  Braces, 
  LayoutGrid, 
  Terminal, 
  ShieldCheck, 
  Zap,
  Search,
  X,
  Split,
  Command
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/utility/helpers/utils";

export default function ToolsDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Filter and group tools by category
  const { categories, flatTools } = useMemo(() => {
    const filtered = TOOLS.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const grouped = filtered.reduce((acc, tool) => {
      const cat = tool.category || "utils";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(tool);
      return acc;
    }, {} as Record<string, Tool[]>);

    // Ensure flatTools follows visual category order
    const categoryOrder = ["diff", "formatting", "converters", "encoding", "generation", "security", "utils"];
    const orderedFlatTools: Tool[] = [];
    categoryOrder.forEach(cat => {
      if (grouped[cat]) {
        orderedFlatTools.push(...grouped[cat]);
      }
    });

    return { categories: grouped, flatTools: orderedFlatTools };
  }, [searchQuery]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Search shortcut
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }

      // Navigation
      if (flatTools.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev < flatTools.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        router.push(flatTools[selectedIndex].route);
      } else if (e.key === "Escape") {
        setSearchQuery("");
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flatTools, selectedIndex, router]);

  useEffect(() => {
    if (selectedIndex >= 0) {
      const element = document.getElementById(`tool-${selectedIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedIndex]);

  const categoryOrder = ["diff", "formatting", "converters", "encoding", "generation", "security", "utils"];
  
  const totalCount = TOOLS.length;
  const filteredCount = Object.values(categories).flat().length;

  const CATEGORY_ICONS: Record<string, any> = {
    diff: Split,
    formatting: Braces,
    converters: Zap,
    encoding: Terminal,
    generation: LayoutGrid,
    security: ShieldCheck,
    utils: Zap,
  };

  return (
    <main className="min-h-screen bg-[#09090B] text-zinc-400 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <Link href="/" className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 hover:gap-3 transition-all group">
                <span className="w-4 h-[1px] bg-primary group-hover:w-8 transition-all"></span>
                Back to Dashboard
              </Link>
              <div className="flex items-center gap-4">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                  Tool <span className="text-primary italic">Directory</span>
                </h1>
                <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-2 mt-2">
                   <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-mono font-bold text-primary">{totalCount} TOTAL</span>
                </div>
              </div>
              <p className="text-zinc-500 max-w-2xl text-lg">
                A comprehensive suite of modular utilities designed to speed up your development workflow.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
              <Input 
                ref={inputRef}
                placeholder="Search tools by name or description..."
                className="bg-zinc-900/50 border-zinc-800 h-14 pl-12 pr-16 rounded-2xl focus:border-primary/50 transition-all text-white placeholder:text-zinc-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchQuery ? (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="text-zinc-600 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-md opacity-40 group-focus-within:opacity-0 transition-opacity">
                    <span className="text-[10px] font-bold text-zinc-400">/</span>
                  </div>
                )}
              </div>
            </div>asChild
          </div>
        </header>

        {/* Search Stats */}
        {searchQuery && (
          <div className="text-xs font-mono text-zinc-600 flex items-center gap-3">
             <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded">
                Found {filteredCount} matches for "{searchQuery}"
             </div>
             {selectedIndex >= 0 && (
               <div className="px-2 py-1 bg-primary/10 border border-primary/20 text-primary rounded">
                 Press Enter to select {flatTools[selectedIndex].name}
               </div>
             )}
          </div>
        )}

        {/* Categories */}
        <div className="grid grid-cols-1 gap-12">
          {(() => {
            let toolCounter = 0;
            return categoryOrder.map((catKey) => {
              const tools = categories[catKey];
              if (!tools || tools.length === 0) return null;
              const Icon = CATEGORY_ICONS[catKey] || Zap;

              return (
                <section key={catKey} className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-100">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-tight">{catKey}</h2>
                      <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.2em]">{tools.length} results</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {tools.map((tool) => {
                      const currentToolIndex = toolCounter++;
                      const isSelected = selectedIndex === currentToolIndex;
                      
                      return (
                        <Tooltip key={tool.id}>
                          <TooltipTrigger>
                            <Link 
                              id={`tool-${currentToolIndex}`}
                              href={tool.route} 
                              className={cn(
                                "group relative flex flex-col items-center justify-center p-6 bg-[#161618]/30 border border-zinc-800/50 rounded-2xl transition-all hover:bg-[#1C1C1E] hover:border-primary/30 hover:-translate-y-1 block",
                                isSelected && "ring-2 ring-primary bg-[#1C1C1E] border-primary/30 -translate-y-1"
                              )}
                            >

                              <div className={cn(
                                "p-3 bg-zinc-900 rounded-xl mb-3 text-zinc-500 group-hover:text-primary transition-colors border border-zinc-800 group-hover:scale-110 duration-300",
                                isSelected && "text-primary scale-110"
                              )}>
                                <tool.icon className="w-6 h-6" />
                              </div>
                              <span className={cn(
                                "text-[10px] sm:text-xs font-bold text-zinc-300 text-center tracking-tight group-hover:text-white truncate w-full",
                                isSelected && "text-white"
                              )}>
                                {tool.name}
                              </span>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs bg-zinc-900 border-zinc-800 text-zinc-200 p-3 max-w-xs shadow-2xl">
                            <p className="font-bold text-white mb-1">{tool.name}</p>
                            <p className="text-zinc-500 leading-relaxed">{tool.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </section>
              );
            });
          })()}
          
          {filteredCount === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
               <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                  <Search className="w-10 h-10 text-zinc-800" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl font-bold text-zinc-300 uppercase tracking-tight">No tools found</h3>
                  <p className="text-zinc-600 text-sm max-w-xs">We couldn't find anything matching your search. Try a different term.</p>
               </div>
               <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery("")} 
                  className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                >
                  Clear Search
               </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="pt-12 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
             <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">Unified Utility Hub</span>
           </div>
           <p className="text-[10px] font-mono text-zinc-700">© 2026 Developer OS Platform</p>
        </footer>
      </div>
    </main>
  );
}
