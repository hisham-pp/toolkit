"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { Search, Info, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function RegexTool() {
  const tool = TOOLS.find((t) => t.id === "regex-tester")!;
  const [regex, setRegex] = useState("");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog 123.");
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!regex) {
      setMatches([]);
      setError(null);
      return;
    }

    try {
      const re = new RegExp(regex, flags);
      const m = Array.from(text.matchAll(re));
      setMatches(m);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setMatches([]);
    }
  }, [regex, flags, text]);

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-[#161618] border border-zinc-800 rounded-3xl p-8 space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Regular Expression</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 font-mono">/</span>
                <Input 
                  value={regex}
                  onChange={(e) => setRegex(e.target.value)}
                  placeholder="[a-zA-Z]+"
                  className="pl-6 pr-12 font-mono bg-zinc-950 border-zinc-800"
                />
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-600 font-mono">/</span>
                <input 
                  value={flags}
                  onChange={(e) => setFlags(e.target.value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 bg-transparent text-primary font-mono focus:outline-none"
                  maxLength={5}
                />
              </div>
              {error && (
                <p className="text-red-400 text-[10px] flex items-center gap-1.5 mt-1 font-mono">
                  <AlertTriangle className="w-3 h-3" />
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Test String</label>
             <Textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[150px] bg-zinc-950 border-zinc-800 font-mono text-sm leading-relaxed"
             />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              Matches 
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-400">{matches.length}</span>
            </h2>
          </div>
          <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl min-h-[100px]">
             {matches.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                 {matches.map((m, i) => (
                    <div key={i} className="px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg text-primary font-mono text-sm">
                      {m[0]}
                    </div>
                 ))}
               </div>
             ) : (
               <p className="text-zinc-600 italic text-sm">No matches found with current expression.</p>
             )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
