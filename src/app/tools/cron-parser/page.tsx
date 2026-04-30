"use client";

import React, { useState, useEffect } from "react";
import cronstrue from "cronstrue";
import { Clock, Info, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { M3Input } from "@/components/ui/m3-ui";
import { cn } from "@/utility/helpers/utils";

export default function CronParser() {
  const [expression, setExpression] = useState("*/5 * * * *");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!expression.trim()) {
        setDescription("");
        setError(null);
        return;
      }
      const desc = cronstrue.toString(expression);
      setDescription(desc);
      setError(null);
    } catch (e: any) {
      setError(e.toString());
      setDescription("");
    }
  }, [expression]);

  const examples = [
    { label: "Every 5 minutes", value: "*/5 * * * *" },
    { label: "Every hour at minute 0", value: "0 * * * *" },
    { label: "Every day at midnight", value: "0 0 * * *" },
    { label: "Every Monday at 9 AM", value: "0 9 * * 1" },
    { label: "At 12:00 PM every month", value: "0 12 1 * *" },
  ];

  return (
      <div className="max-w-4xl mx-auto space-y-12 h-full flex flex-col justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Cron Expression <span className="text-primary italic">Parser</span></h2>
          <p className="text-zinc-500 max-w-md mx-auto">Convert complex crontab schedule strings into human-readable English descriptions.</p>
        </div>

        <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 space-y-10 shadow-2xl">
          <div className="space-y-4">
            <M3Input
                label="Cron Schedule String"
                className={cn(
                  "h-20 text-2xl font-mono text-center tracking-widest text-primary focus:ring-0 focus:border-primary/50 transition-all rounded-3xl",
                  error && "border-red-500/50 text-red-500"
                )}
                placeholder="* * * * *"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
              />
          </div>

          <div className="min-h-[120px] flex items-center justify-center p-8 bg-zinc-900/30 border border-zinc-800 rounded-3xl relative overflow-hidden group">
            {description ? (
              <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-xl md:text-2xl font-bold text-zinc-200 leading-tight">“ {description} ”</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-500/80 italic text-sm">
                 <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                 Invalid Cron expression format
              </div>
            ) : (
                <p className="text-zinc-600 italic">Enter an expression above...</p>
            )}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 ml-2">
                <Info className="w-3 h-3" />
                Quick Presets
             </div>
             <div className="flex flex-wrap gap-3">
               {examples.map((ex) => (
                 <button
                  key={ex.value}
                  onClick={() => setExpression(ex.value)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all"
                 >
                   {ex.label}
                 </button>
               ))}
             </div>
          </div>
        </div>
      </div>
  );
}
