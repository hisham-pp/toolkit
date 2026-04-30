"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { diffLines, Change } from "diff";
import { Copy, Trash2, Split, Rows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TextDiff() {
  const tool = TOOLS.find((t) => t.id === "text-diff")!;
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [viewMode, setViewMode] = useState<"side-by-side" | "unified">("side-by-side");

  const diffs = diffLines(text1, text2);

  const stats = {
    added: diffs.filter(d => d.added).length,
    removed: diffs.filter(d => d.removed).length,
  };

  const copyResult = () => {
    // Just a placeholder since the visual diff is hard to copy as text
    toast.info("Visual diff is for viewing. Copy original texts if needed.");
  };

  const clear = () => {
    setText1("");
    setText2("");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col h-full gap-8">
        {/* Controls */}
        <div className="flex items-center justify-between bg-[#161618] p-4 border border-zinc-800 rounded-2xl">
          <div className="flex gap-2">
            <Button 
              variant={viewMode === "side-by-side" ? "default" : "outline"} 
              size="sm"
              onClick={() => setViewMode("side-by-side")}
              className="gap-2"
            >
              <Split className="w-4 h-4" />
              Side by Side
            </Button>
            <Button 
              variant={viewMode === "unified" ? "default" : "outline"} 
              size="sm"
              onClick={() => setViewMode("unified")}
              className="gap-2"
            >
              <Rows className="w-4 h-4" />
              Unified
            </Button>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4 text-[10px] font-mono uppercase font-bold tracking-widest">
              <span className="text-green-500">+{stats.added} Added</span>
              <span className="text-red-500">-{stats.removed} Removed</span>
            </div>
            <div className="w-[1px] h-6 bg-zinc-800" />
            <Button variant="ghost" size="sm" onClick={clear} className="text-zinc-500 hover:text-red-400">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-1/3">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Original Text</label>
            <Textarea
              className="flex-1 bg-zinc-950 border-zinc-800 font-mono text-xs resize-none"
              placeholder="Paste original text here..."
              value={text1}
              onChange={(e) => setText1(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Changed Text</label>
            <Textarea
              className="flex-1 bg-zinc-950 border-zinc-800 font-mono text-xs resize-none"
              placeholder="Paste changed text here..."
              value={text2}
              onChange={(e) => setText2(e.target.value)}
            />
          </div>
        </div>

        {/* Diff View */}
        <div className="flex-1 min-h-[400px] border border-zinc-800 rounded-3xl bg-[#0F0F10] overflow-hidden flex flex-col">
          <div className="flex items-center px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Diff Preview</p>
          </div>
          
          <div className="flex-1 overflow-auto p-6 font-mono text-xs leading-relaxed">
            {text1 || text2 ? (
              <div className={cn(
                "grid gap-1",
                viewMode === "side-by-side" ? "grid-cols-2" : "grid-cols-1"
              )}>
                {diffs.map((part, index) => {
                  const color = part.added ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                               part.removed ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                               "text-zinc-500";
                  const prefix = part.added ? "+" : part.removed ? "-" : " ";
                  
                  return (
                    <div 
                      key={index} 
                      className={cn(
                        "p-1 border border-transparent rounded whitespace-pre-wrap",
                        color,
                        viewMode === "side-by-side" && !part.added && !part.removed ? "col-span-2" : ""
                      )}
                    >
                      {part.value.split('\n').filter(l => l || !part.value.endsWith('\n')).map((line, i) => (
                        <div key={i} className="flex gap-2">
                           <span className="opacity-50 select-none w-4">{prefix}</span>
                           <span>{line}</span>
                        </div>
                      ))}
                    </div>
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
    </ToolLayout>
  );
}
