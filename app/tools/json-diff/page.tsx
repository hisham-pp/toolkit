"use client";

import React, { useState, useMemo } from "react";
import { diffJson } from "diff";
import { Trash2, FileJson, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function JsonDiff() {
  const [json1, setJson1] = useState("");
  const [json2, setJson2] = useState("");
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);

  const diffs = useMemo(() => {
    let obj1 = {};
    let obj2 = {};
    
    try {
      if (json1) {
        obj1 = JSON.parse(json1);
        setError1(null);
      }
    } catch (e) {
      setError1("Invalid JSON");
      return [];
    }

    try {
      if (json2) {
        obj2 = JSON.parse(json2);
        setError2(null);
      }
    } catch (e) {
      setError2("Invalid JSON");
      return [];
    }

    if (!json1 && !json2) return [];
    
    return diffJson(obj1, obj2);
  }, [json1, json2]);

  const clear = () => {
    setJson1("");
    setJson2("");
    setError1(null);
    setError2(null);
  };

  return (
      <div className="flex flex-col h-full gap-8">
        {/* Controls */}
        <div className="flex items-center justify-between bg-[#161618] p-4 border border-zinc-800 rounded-2xl">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-zinc-900 rounded-lg">
                <FileJson className="w-5 h-5 text-primary" />
             </div>
             <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-white">Structural Comparison</h2>
                <p className="text-[10px] text-zinc-500 font-mono">Comparing objects by key/value pairs</p>
             </div>
          </div>
          <Button variant="ghost" size="sm" onClick={clear} className="text-zinc-500 hover:text-red-400">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-1/3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Source JSON</label>
              {error1 && <span className="text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error1}</span>}
            </div>
            <Textarea
              className={cn(
                "flex-1 bg-zinc-950 border-zinc-800 font-mono text-[10px] resize-none",
                error1 && "border-red-500/50"
              )}
              placeholder='{ "key": "value" }'
              value={json1}
              onChange={(e) => setJson1(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Target JSON</label>
              {error2 && <span className="text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error2}</span>}
            </div>
            <Textarea
              className={cn(
                "flex-1 bg-zinc-950 border-zinc-800 font-mono text-[10px] resize-none",
                error2 && "border-red-500/50"
              )}
              placeholder='{ "key": "new value" }'
              value={json2}
              onChange={(e) => setJson2(e.target.value)}
            />
          </div>
        </div>

        {/* Diff Result */}
        <div className="flex-1 min-h-[400px] border border-zinc-800 rounded-3xl bg-[#0F0F10] overflow-hidden flex flex-col">
          <div className="flex items-center px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Visual Change Detection</p>
          </div>
          
          <div className="flex-1 overflow-auto p-8 font-mono text-[11px] leading-6">
            {diffs.length > 0 ? (
              <pre>
                {diffs.map((part, index) => {
                  const color = part.added ? "text-green-500 bg-green-500/10" : 
                               part.removed ? "text-red-500 bg-red-500/10 line-through" : 
                               "text-zinc-400";
                  return (
                    <span key={index} className={cn("px-1 rounded", color)}>
                      {part.value}
                    </span>
                  );
                })}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-700 italic space-y-4">
                <FileJson className="w-12 h-12 opacity-20" />
                <p>Paste valid JSON in both editors to see differences.</p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
