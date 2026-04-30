"use client";

import React, { useState, useMemo } from "react";
import { diffLines, diffWords, diffChars, Change } from "diff";
import { Copy, Trash2, Split, Rows, Type, MousePointer2, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Textarea } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { cn } from "@/utility/helpers/utils";

export default function TextDiff() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [viewMode, setViewMode] = useState<"side-by-side" | "unified">("side-by-side");
  const [granularity, setGranularity] = useState<"lines" | "words" | "chars">("lines");

  const diffs = useMemo(() => {
    if (granularity === "lines") return diffLines(text1, text2);
    if (granularity === "words") return diffWords(text1, text2);
    return diffChars(text1, text2);
  }, [text1, text2, granularity]);

  const stats = useMemo(() => {
    return {
      added: diffs.filter(d => d.added).length,
      removed: diffs.filter(d => d.removed).length,
    };
  }, [diffs]);

  const copyResult = () => {
    if (!text2) {
      toast.error("Nothing to copy");
      return;
    }
    navigator.clipboard.writeText(text2);
    toast.success("Changed text copied to clipboard");
  };

  const clear = () => {
    setText1("");
    setText2("");
  };

  return (
      <div className="flex flex-col h-full gap-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-[#161618] p-4 border border-zinc-800 rounded-3xl gap-4">
          <div className="flex flex-wrap items-center gap-4">
             <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 shadow-inner">
               <Button 
                 variant="ghost" 
                 size="sm"
                 onClick={() => setViewMode("side-by-side")}
                 className={cn(
                   "h-9 px-4 text-[10px] uppercase font-black tracking-widest gap-2 rounded-xl transition-all",
                   viewMode === "side-by-side" ? "bg-primary/20 text-primary shadow-lg shadow-primary/5" : "text-zinc-500 hover:bg-zinc-800"
                 )}
               >
                 <Split className="w-3.5 h-3.5" />
                 <span className="hidden sm:inline">Side by Side</span>
               </Button>
               <Button 
                 variant="ghost" 
                 size="sm"
                 onClick={() => setViewMode("unified")}
                 className={cn(
                   "h-9 px-4 text-[10px] uppercase font-black tracking-widest gap-2 rounded-xl transition-all",
                   viewMode === "unified" ? "bg-primary/20 text-primary shadow-lg shadow-primary/5" : "text-zinc-500 hover:bg-zinc-800"
                 )}
               >
                 <Rows className="w-3.5 h-3.5" />
                 <span className="hidden sm:inline">Unified</span>
               </Button>
             </div>

             <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 shadow-inner">
               <Button 
                 variant="ghost" 
                 size="sm"
                 onClick={() => setGranularity("lines")}
                 className={cn(
                   "h-9 px-4 text-[10px] uppercase font-black tracking-widest gap-2 rounded-xl transition-all",
                   granularity === "lines" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:bg-zinc-800/50"
                 )}
               >
                 <AlignLeft className="w-3.5 h-3.5" />
                 Lines
               </Button>
               <Button 
                 variant="ghost" 
                 size="sm"
                 onClick={() => setGranularity("words")}
                 className={cn(
                   "h-9 px-4 text-[10px] uppercase font-black tracking-widest gap-2 rounded-xl transition-all",
                   granularity === "words" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:bg-zinc-800/50"
                 )}
               >
                 <Type className="w-3.5 h-3.5" />
                 Words
               </Button>
               <Button 
                 variant="ghost" 
                 size="sm"
                 onClick={() => setGranularity("chars")}
                 className={cn(
                   "h-9 px-4 text-[10px] uppercase font-black tracking-widest gap-2 rounded-xl transition-all",
                   granularity === "chars" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:bg-zinc-800/50"
                 )}
               >
                 <MousePointer2 className="w-3.5 h-3.5" />
                 Letters
               </Button>
             </div>
          </div>
          
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-zinc-800 pt-4 md:pt-0">
            <div className="flex gap-4 text-[10px] font-mono uppercase font-bold tracking-widest">
              <span className="text-green-500">+{stats.added}</span>
              <span className="text-red-500">-{stats.removed}</span>
            </div>
            <div className="w-[1px] h-6 bg-zinc-800 hidden md:block" />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyResult} className="h-10 px-4 bg-zinc-950 border-zinc-800 text-[10px] uppercase font-black tracking-widest gap-2 rounded-xl hover:border-primary/50 transition-all">
                <Copy className="w-3.5 h-3.5" />
                Copy Changed
              </Button>
              <Button variant="ghost" size="sm" onClick={clear} className="h-10 w-10 p-0 text-zinc-600 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-xl">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-1/3">
          <M3Textarea
            label="Original Text"
            className="flex-1 font-mono text-xs resize-none"
            placeholder="Paste original text here..."
            value={text1}
            onChange={(e) => setText1(e.target.value)}
          />
          <M3Textarea
            label="Changed Text"
            className="flex-1 font-mono text-xs resize-none"
            placeholder="Paste changed text here..."
            value={text2}
            onChange={(e) => setText2(e.target.value)}
          />
        </div>

        {/* Diff View */}
        <div className="flex-1 min-h-[400px] border border-zinc-800 rounded-3xl bg-[#0F0F10] overflow-hidden flex flex-col">
          <div className="flex items-center px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Diff Preview</p>
          </div>
          
          <div className="flex-1 overflow-auto p-8 font-mono text-[13px] leading-relaxed">
            {text1 || text2 ? (
              <div className={cn(
                "whitespace-pre-wrap rounded-2xl p-6 bg-zinc-950/20 border border-zinc-900/50",
                viewMode === "side-by-side" && granularity === "lines" ? "grid grid-cols-2 gap-4" : "block"
              )}>
                {diffs.map((part, index) => {
                  const isAdded = part.added;
                  const isRemoved = part.removed;
                  const colorClass = isAdded ? "bg-green-500/20 text-green-400 decoration-green-500/30" : 
                                     isRemoved ? "bg-red-500/20 text-red-400 line-through decoration-red-500/30" : 
                                     "text-zinc-500";
                  
                  if (granularity === "lines") {
                    return (
                      <div 
                        key={index} 
                        className={cn(
                          "px-4 py-1 rounded border border-transparent transition-colors",
                          isAdded ? "bg-green-500/10 border-green-500/20 text-green-400" : 
                          isRemoved ? "bg-red-500/10 border-red-500/20 text-red-400" : "opacity-60",
                          viewMode === "side-by-side" && !isAdded && !isRemoved ? "col-span-2" : ""
                        )}
                      >
                         {part.value.split('\n').filter((l, i, arr) => l || i < arr.length - 1).map((line, i) => (
                           <div key={i} className="flex gap-4 group">
                              <span className="w-6 opacity-30 select-none text-right italic font-black">
                                 {isAdded ? "+" : isRemoved ? "-" : "·"}
                              </span>
                              <span className="flex-1">{line || " "}</span>
                           </div>
                         ))}
                      </div>
                    );
                  }

                  // Word or Char level (inline)
                  return (
                    <span 
                      key={index}
                      className={cn(
                        "rounded-sm px-0.5 mx-px transition-all inline",
                        colorClass
                      )}
                    >
                      {part.value}
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-700 italic">
                Enter text above to see the comparison.
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
