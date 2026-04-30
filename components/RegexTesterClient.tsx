"use client";

import React, { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { 
  Search, 
  Trash2, 
  AlertCircle, 
  ChevronRight,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Input, M3Textarea } from "@/components/ui/m3-ui";
import { cn } from "@/lib/utils";

export default function RegexTesterClient() {
  const tool = TOOLS.find((t) => t.id === "regex-tester")!;
  const [regex, setRegex] = useState("(\\w+)-(\\d+)");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState("Order-123, Item-456, User-789");

  const results = useMemo(() => {
    if (!regex) return { matches: [], error: null };
    try {
      const re = new RegExp(regex, flags);
      const matches = Array.from(testText.matchAll(re));
      return { matches, error: null };
    } catch (e: any) {
      return { matches: [], error: e.message };
    }
  }, [regex, flags, testText]);

  const clear = () => {
    setRegex("");
    setTestText("");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col h-full gap-8">
        {/* Input Controls */}
        <div className="bg-[#161618] border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-xl">
           <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-8">
                 <M3Input 
                   label="Regular Expression"
                   className={cn(
                     "font-mono text-lg text-primary",
                     results.error && "border-red-500/50 text-red-500"
                   )}
                   placeholder="Enter regex pattern..."
                   value={regex}
                   onChange={(e) => setRegex(e.target.value)}
                 />
              </div>
              <div className="md:col-span-3">
                 <M3Input 
                   label="Flags"
                   className="font-mono text-lg text-zinc-400"
                   placeholder="gim"
                   value={flags}
                   onChange={(e) => setFlags(e.target.value)}
                 />
              </div>
              <div className="md:col-span-1">
                 <Button variant="ghost" size="sm" onClick={clear} className="h-14 w-full text-zinc-700 hover:text-red-500 rounded-2xl hover:bg-red-500/5 border border-transparent hover:border-red-500/20">
                    <Trash2 className="w-5 h-5" />
                 </Button>
              </div>
           </div>

           {results.error && (
             <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <p className="text-xs font-mono">{results.error}</p>
             </div>
           )}
        </div>

        {/* Content & Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
           {/* Test Text Area */}
           <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5" />
                    Test String
                 </h3>
                 <span className="text-[10px] text-zinc-600 font-mono italic">Matches: {results.matches.length}</span>
              </div>
              <M3Textarea 
                label="Test String"
                className="flex-1 font-mono text-[13px] p-6 resize-none leading-relaxed"
                placeholder="Paste the text you want to test against here..."
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
              />
           </div>

           {/* Matches List */}
           <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                 <Search className="w-3.5 h-3.5" />
                 Match Results
              </div>
              <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-[2rem] overflow-hidden flex flex-col">
                 <div className="flex-1 overflow-auto p-6 space-y-3">
                   {results.matches.length > 0 ? (
                     results.matches.map((match, i) => (
                       <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 group hover:border-primary/40 transition-all">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[9px] bg-primary text-black font-black px-1.5 py-0.5 rounded italic">MATCH #{i + 1}</span>
                             <span className="text-[9px] text-zinc-600 font-mono">Index: {match.index} → {match.index! + match[0].length}</span>
                          </div>
                          <div className="font-mono text-sm text-white bg-zinc-950 p-2 rounded-lg border border-zinc-800/50 mb-3 break-all">
                             {match[0]}
                          </div>
                          {match.length > 1 && (
                            <div className="space-y-1.5 pt-2 border-t border-zinc-800/50">
                               {Array.from(match).slice(1).map((group, groupIdx) => (
                                 <div key={groupIdx} className="flex items-center gap-3 text-[10px] text-zinc-500">
                                    <ChevronRight className="w-3 h-3 text-primary/60" />
                                    <span className="font-bold opacity-60">Group {groupIdx + 1}:</span>
                                    <span className="text-zinc-400 font-mono">{String(group || "null")}</span>
                                 </div>
                               ))}
                            </div>
                          )}
                       </div>
                     ))
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-12 opacity-30">
                        <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center border-4 border-zinc-900">
                           <Search className="w-10 h-10" />
                        </div>
                        <p className="text-xs uppercase font-black tracking-widest leading-relaxed"> No matches found in current text </p>
                     </div>
                   )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </ToolLayout>
  );
}
