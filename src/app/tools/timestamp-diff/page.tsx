"use client";

import React, { useState, useEffect } from "react";
import { 
  Clock, 
  ArrowRightLeft, 
  Calendar, 
  Hash, 
  Timer,
  ChevronRight,
  History,
  Info
} from "lucide-react";
import { 
  format, 
  isValid, 
  parseISO, 
  fromUnixTime, 
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  intervalToDuration,
  formatDuration
} from "date-fns";
import { M3Input } from "@/components/ui/m3-ui";
import { ToolRegistry } from "@/utility/constants/tools";

export default function TimestampDiffPage() {
  const tool = ToolRegistry.getById("timestamp-diff")!;
  const [input1, setInput1] = useState<string>("");
  const [input2, setInput2] = useState<string>("");
  
  const [date1, setDate1] = useState<Date>(new Date());
  const [date2, setDate2] = useState<Date>(new Date());

  const parseInput = (val: string): Date => {
    if (!val) return new Date();
    
    // Unix ms
    if (/^\d{13}$/.test(val)) return new Date(parseInt(val));
    // Unix s
    if (/^\d{10}$/.test(val)) return fromUnixTime(parseInt(val));
    
    const d = parseISO(val);
    return isValid(d) ? d : new Date();
  };

  useEffect(() => {
    setDate1(parseInput(input1));
  }, [input1]);

  useEffect(() => {
    setDate2(parseInput(input2));
  }, [input2]);

  const diffSeconds = Math.abs(differenceInSeconds(date1, date2));
  const diffMinutes = Math.abs(differenceInMinutes(date1, date2));
  const diffHours = Math.abs(differenceInHours(date1, date2));
  const diffDays = Math.abs(differenceInDays(date1, date2));
  
  const duration = intervalToDuration({
    start: date1 < date2 ? date1 : date2,
    end: date1 < date2 ? date2 : date1
  });

  const durationString = formatDuration(duration) || "0 seconds";

  const diffCards = [
    { label: "Total Seconds", value: diffSeconds.toLocaleString(), icon: <Timer className="w-4 h-4" /> },
    { label: "Total Minutes", value: diffMinutes.toLocaleString(), icon: <Clock className="w-4 h-4" /> },
    { label: "Total Hours", value: diffHours.toLocaleString(), icon: <History className="w-4 h-4" /> },
    { label: "Total Days", value: diffDays.toLocaleString(), icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Dual Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-zinc-900/30 p-8 rounded-[2rem] border border-zinc-800/50 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">1</div>
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Start Point</h3>
          </div>
          <M3Input
            label="Date or Timestamp A"
            placeholder="Enter date or unix timestamp..."
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
            icon={<Calendar className="w-5 h-5" />}
          />
          <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Parsed Date</p>
            <p className="text-sm font-bold text-zinc-200">{format(date1, "PPP pp")}</p>
          </div>
        </div>

        <div className="bg-zinc-900/30 p-8 rounded-[2rem] border border-zinc-800/50 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">2</div>
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">End Point</h3>
          </div>
          <M3Input
            label="Date or Timestamp B"
            placeholder="Enter date or unix timestamp..."
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
            icon={<Clock className="w-5 h-5" />}
          />
          <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Parsed Date</p>
            <p className="text-sm font-bold text-zinc-200">{format(date2, "PPP pp")}</p>
          </div>
        </div>
      </div>

      {/* Comparison Result Summary */}
      <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-10 flex flex-col items-center text-center gap-4">
        <div className="p-4 rounded-3xl bg-primary/10 text-primary">
          <ArrowRightLeft className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <p className="text-[12px] font-black uppercase tracking-[0.3em] text-primary/60">Time Difference</p>
          <h2 className="text-4xl font-black text-zinc-100 tracking-tight leading-tight">
            {durationString}
          </h2>
          <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm font-medium">
            <Info className="w-4 h-4" />
            <span>Precise interval calculation based on calendar units</span>
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {diffCards.map((card, i) => (
          <div 
            key={i}
            className="bg-zinc-950 border border-zinc-800/50 rounded-3xl p-6 hover:border-zinc-700 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-500 group-hover:text-primary transition-colors">
                {card.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {card.label}
              </span>
            </div>
            <div className="text-2xl font-black text-zinc-200 tracking-tight">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Unit Breakdown Table */}
      <div className="bg-zinc-950 border border-zinc-800/50 rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-zinc-800/50 bg-zinc-900/20">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            Calendar Breakdown
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y divide-zinc-800/50">
          {Object.entries(duration).map(([unit, value], i) => (
            <div key={i} className="p-6 flex flex-col gap-1 hover:bg-zinc-900/30 transition-colors">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{unit}</span>
              <span className="text-xl font-black text-zinc-200">{value || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
