"use client";

import React, { useState } from "react";
import { Copy, Check, RotateCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UUIDGeneratorTool() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);

  const generate = () => {
    const newUuids = Array.from({ length: count }, () => crypto.randomUUID());
    setUuids(newUuids);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(uuids.join("\n"));
    toast.success("All UUIDs copied");
  };

  return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-[#161618] border border-zinc-800 rounded-2xl p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Number of UUIDs</label>
            <div className="flex gap-4">
              {[1, 5, 10, 20].map((n) => (
                <Button
                  key={n}
                  variant={count === n ? "default" : "outline"}
                  onClick={() => setCount(n)}
                  className={count === n ? "bg-primary" : "bg-zinc-900 border-zinc-800"}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
          <Button onClick={generate} className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg gap-2">
            <Plus className="w-5 h-5" />
            Generate UUIDs
          </Button>
        </div>

        {uuids.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Generated UUIDs</h2>
              <Button variant="ghost" size="sm" onClick={handleCopyAll} className="h-8 gap-2">
                <Copy className="w-3.5 h-3.5" />
                Copy All
              </Button>
            </div>
            <div className="space-y-2">
              {uuids.map((uuid, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl group transition-colors hover:border-primary/30">
                  <span className="font-mono text-sm text-zinc-300">{uuid}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleCopy(uuid)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
  );
}
