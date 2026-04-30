"use client";

import React, { useState } from "react";
import ReactDiffViewer from "react-diff-viewer-continued";
import { 
  Split, 
  Trash2, 
  Copy, 
  Code2, 
  ChevronRight,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DEFAULT_OLD = `function calculateTotal(price, tax) {
  const total = price + (price * tax);
  return total;
}

console.log(calculateTotal(100, 0.2));`;

const DEFAULT_NEW = `function calculateTotal(price, tax, discount = 0) {
  const subtotal = price + (price * tax);
  const total = subtotal - discount;
  return Math.max(0, total);
}

const result = calculateTotal(100, 0.2, 10);
console.log("Final Amount:", result);`;

export default function CodeDiff() {
  const [oldCode, setOldCode] = useState(DEFAULT_OLD);
  const [newCode, setNewCode] = useState(DEFAULT_NEW);
  const [splitView, setSplitView] = useState(true);

  const copyResult = () => {
    navigator.clipboard.writeText(newCode);
    toast.success("New code copied");
  };

  const clear = () => {
    setOldCode("");
    setNewCode("");
  };

  return (
      <div className="flex flex-col h-full gap-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between bg-[#161618] p-3 border border-zinc-800 rounded-2xl shadow-xl">
           <div className="flex items-center gap-4 ml-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500/50" />
                 <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500">Original</span>
              </div>
              <ChevronRight className="w-3 h-3 text-zinc-700" />
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500/50" />
                 <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500">Modified</span>
              </div>
           </div>

           <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSplitView(!splitView)}
                className={cn("h-9 px-4 font-bold text-xs gap-2 rounded-xl border border-zinc-800 hover:border-primary/50 transition-all", splitView && "bg-primary/10 text-primary border-primary/20")}
              >
                 <Monitor className="w-3.5 h-3.5" /> {splitView ? "Split View" : "Unified View"}
              </Button>
              <Button variant="ghost" size="sm" onClick={clear} className="h-9 px-3 text-zinc-500 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button onClick={copyResult} className="h-9 px-6 bg-primary hover:bg-primary/90 text-white font-bold gap-2 rounded-xl text-xs shadow-lg shadow-primary/20">
                 <Copy className="w-3.5 h-3.5" /> Copy New
              </Button>
           </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
           <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-2">
                 <Code2 className="w-3.5 h-3.5 text-zinc-600" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Old Version</span>
              </div>
              <Textarea 
                className="flex-1 bg-zinc-950 border-zinc-800 font-mono text-xs p-6 resize-none rounded-[2rem] focus:border-red-500/30 transition-all"
                value={oldCode}
                onChange={(e) => setOldCode(e.target.value)}
                placeholder="Paste original code here..."
              />
           </div>

           <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-2">
                 <Code2 className="w-3.5 h-3.5 text-zinc-600" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">New Version</span>
              </div>
              <Textarea 
                className="flex-1 bg-zinc-950 border-zinc-800 font-mono text-xs p-6 resize-none rounded-[2rem] focus:border-green-500/30 transition-all"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Paste modified code here..."
              />
           </div>
        </div>

        {/* Visual Comparison */}
        <div className="h-[400px] bg-zinc-950 border border-zinc-800 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
           <div className="p-4 border-b border-zinc-900 bg-zinc-900/50 flex items-center gap-3">
              <Split className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Visual Diff Engine</span>
           </div>
           <div className="flex-1 overflow-auto custom-scrollbar">
              <ReactDiffViewer
                oldValue={oldCode}
                newValue={newCode}
                splitView={splitView}
                useDarkTheme={true}
                styles={{
                  variables: {
                    dark: {
                      diffViewerBackground: "#09090B",
                      diffViewerColor: "#A1A1AA",
                      addedBackground: "rgba(34, 197, 94, 0.1)",
                      addedColor: "#4ADE80",
                      removedBackground: "rgba(239, 68, 68, 0.1)",
                      removedColor: "#F87171",
                      wordAddedBackground: "rgba(34, 197, 94, 0.2)",
                      wordRemovedBackground: "rgba(239, 68, 68, 0.2)",
                    }
                  },
                  codeFold: {
                    padding: "16px",
                  }
                }}
              />
           </div>
        </div>
      </div>
  );
}
