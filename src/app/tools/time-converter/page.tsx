"use client";

import React, { useState, useEffect } from "react";
import { 
  Clock, 
  Copy, 
  RefreshCcw, 
  CheckCircle2,
  Dice5,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { 
  format, 
  isValid, 
  parseISO, 
  fromUnixTime, 
  getUnixTime, 
  getTime,
  formatDistanceToNow
} from "date-fns";
import ToolLayout from "@/components/ToolLayout";
import { M3Input } from "@/components/ui/m3-ui";
import { Button } from "@/components/ui/button";
import { ToolRegistry } from "@/utility/constants/tools";
import { TIME_FORMAT_CONFIGS, DATE_FORMAT_STRINGS } from "@/utility/constants/time-formats";

export default function TimeConverterPage() {
  const tool = ToolRegistry.getById("time-converter")!;
  const [input, setInput] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [isTimestamp, setIsTimestamp] = useState<boolean>(false);

  // Update date object when input changes
  useEffect(() => {
    if (!input) {
      setDate(new Date());
      setIsTimestamp(false);
      return;
    }

    // Try parsing as unix timestamp (ms)
    if (/^\d{13}$/.test(input)) {
      const d = new Date(parseInt(input));
      if (isValid(d)) {
        setDate(d);
        setIsTimestamp(true);
      }
      return;
    }

    // Try parsing as unix timestamp (s)
    if (/^\d{10}$/.test(input)) {
      const d = fromUnixTime(parseInt(input));
      if (isValid(d)) {
        setDate(d);
        setIsTimestamp(true);
      }
      return;
    }

    // Try parsing as ISO
    const d = parseISO(input);
    if (isValid(d)) {
      setDate(d);
      setIsTimestamp(false);
    }
  }, [input]);

  const setNow = () => {
    const now = new Date();
    setDate(now);
    setInput("");
  };

  const generateRandomEpoch = () => {
    const start = new Date(1970, 0, 1).getTime();
    const end = new Date(2050, 0, 1).getTime();
    const randomDate = new Date(start + Math.random() * (end - start));
    setDate(randomDate);
    setInput(getUnixTime(randomDate).toString());
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", {
      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    });
  };

  // Helper object for custom getValue functions
  const fns = { getUnixTime, getTime, formatDistanceToNow };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-8">
        {/* Input & Generator Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900/30 p-8 rounded-[2rem] border border-zinc-800/50">
          <div className="space-y-4">
            <M3Input
              label="Date or Epoch Number Input"
              placeholder="Enter date string or unix timestamp..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              icon={<Clock className="w-5 h-5" />}
              error={input && !isValid(date) ? "Invalid date format or epoch number" : undefined}
            />
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={setNow}
                className="rounded-xl border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Current Time
              </Button>
              <Button 
                variant="outline" 
                onClick={generateRandomEpoch}
                className="rounded-xl border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900"
              >
                <Dice5 className="w-4 h-4 mr-2" />
                Random Epoch
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col justify-center space-y-3 p-6 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Analysis Results</p>
              {isTimestamp && (
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[9px] font-bold text-green-500 uppercase tracking-tighter">
                  Valid Epoch Detected
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-xl font-bold text-zinc-100 tracking-tight leading-none">
                {isValid(date) ? format(date, "MMMM d, yyyy") : "Invalid Date"}
              </p>
              <p className="text-sm font-medium text-zinc-500">
                {isValid(date) ? format(date, "HH:mm:ss.SSS (xxx)") : "Please enter a valid input"}
              </p>
            </div>

            {isValid(date) && (
              <div className="pt-2 border-t border-zinc-800/50 mt-2 flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest">
                  Resolution: {input.length === 13 ? "Milliseconds" : "Seconds"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Formats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TIME_FORMAT_CONFIGS.map((config, i) => {
            const displayValue = config.getValue 
              ? config.getValue(date, fns)
              : config.formatKey 
                ? format(date, DATE_FORMAT_STRINGS[config.formatKey])
                : "N/A";

            return (
              <div 
                key={i}
                className="group relative bg-zinc-950 border border-zinc-800/50 rounded-2xl p-5 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400 group-hover:text-primary transition-colors">
                      <config.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400">
                      {config.label}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(displayValue)}
                    className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="font-mono text-sm text-zinc-300 break-all bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/30">
                  {displayValue}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToolLayout>
  );
}
