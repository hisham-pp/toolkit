import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { TOOLS, ToolConfig } from "@/lib/tools-config";
import { 
  Braces, 
  ChevronRight, 
  LayoutGrid, 
  Terminal, 
  ShieldCheck, 
  Zap,
  ArrowRight
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "All Tools | DevHub",
  description: "Browse our comprehensive collection of developer tools categorized for productivity.",
};

const CATEGORY_ICONS: Record<string, any> = {
  formatting: Braces,
  converters: Zap,
  encoding: Terminal,
  generation: LayoutGrid,
  security: ShieldCheck,
  utils: Zap,
};

export default function ToolsIndexPage() {
  // Group tools by category
  const categories = TOOLS.reduce((acc, tool) => {
    const cat = tool.category || "utils";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tool);
    return acc;
  }, {} as Record<string, ToolConfig[]>);

  const categoryOrder = ["formatting", "converters", "encoding", "generation", "security", "utils"];

  return (
    <main className="min-h-screen bg-[#09090B] text-zinc-400 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="space-y-4">
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 hover:gap-3 transition-all group">
            <span className="w-4 h-[1px] bg-primary group-hover:w-8 transition-all"></span>
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
              Tool <span className="text-primary italic">Directory</span>
            </h1>
          </div>
          <p className="text-zinc-500 max-w-2xl text-lg">
            A comprehensive suite of modular utilities designed to speed up your development workflow. 
            No tracking, no clouds, just raw processing in your browser.
          </p>
        </header>

        {/* Categories */}
        <div className="grid grid-cols-1 gap-12">
          {categoryOrder.map((catKey) => {
            const tools = categories[catKey];
            if (!tools) return null;
            const Icon = CATEGORY_ICONS[catKey] || Zap;

            return (
              <section key={catKey} className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-tight">{catKey}</h2>
                    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.2em]">{tools.length} available tools</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {tools.map((tool) => (
                    <Tooltip key={tool.id}>
                      <TooltipTrigger>
                        <Link 
                          href={tool.route} 
                          className="group relative flex flex-col items-center justify-center p-6 bg-[#161618]/30 border border-zinc-800/50 rounded-2xl transition-all hover:bg-[#1C1C1E] hover:border-primary/30 hover:-translate-y-1"
                        >
                          <div className="p-3 bg-zinc-900 rounded-xl mb-3 text-zinc-500 group-hover:text-primary transition-colors border border-zinc-800 group-hover:scale-110 duration-300">
                            <tool.icon className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] sm:text-xs font-bold text-zinc-300 text-center tracking-tight group-hover:text-white truncate w-full">
                            {tool.name}
                          </span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs bg-zinc-900 border-zinc-800 text-zinc-200">
                        <p className="font-bold">{tool.name}</p>
                        <p className="text-zinc-500">{tool.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="pt-12 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
             <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">Unified Utility Hub</span>
           </div>
           <p className="text-[10px] font-mono text-zinc-700">© 2026 DevHub Modular Series</p>
        </footer>
      </div>
    </main>
  );
}
