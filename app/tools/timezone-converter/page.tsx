"use client";

import React, { useState, useEffect } from "react";
import { Search, Clock, Globe, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, addHours } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

const COMMON_ZONES = [
  { name: "UTC", zone: "UTC" },
  { name: "London", zone: "Europe/London" },
  { name: "New York", zone: "America/New_York" },
  { name: "San Francisco", zone: "America/Los_Angeles" },
  { name: "Tokyo", zone: "Asia/Tokyo" },
  { name: "Dubai", zone: "Asia/Dubai" },
  { name: "Mumbai", zone: "Asia/Kolkata" },
  { name: "Sydney", zone: "Australia/Sydney" },
  { name: "Singapore", zone: "Asia/Singapore" },
  { name: "Berlin", zone: "Europe/Berlin" },
];

export default function TimezoneTool() {
  const [baseTime, setBaseTime] = useState(new Date());
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setBaseTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const filtered = COMMON_ZONES.filter(z => 
    z.name.toLowerCase().includes(search.toLowerCase()) || 
    z.zone.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-[#161618] border border-zinc-800 rounded-3xl p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Your Current Time</h2>
              <p className="text-4xl font-black text-white font-mono">{format(baseTime, "HH:mm")}</p>
              <p className="text-xs text-zinc-600 font-mono">{format(baseTime, "PPPP")}</p>
            </div>
            <div className="w-full md:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <Input 
                  placeholder="Search city/zone..." 
                  className="bg-zinc-950 border-zinc-800 pl-10 h-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
             <div key={item.zone} className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl hover:border-primary/20 transition-all group">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-primary transition-colors">
                     <Globe className="w-4 h-4" />
                   </div>
                   <span className="font-bold text-zinc-200">{item.name}</span>
                 </div>
                 <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors">{item.zone}</span>
               </div>
               <div className="flex items-end justify-between">
                 <div className="text-3xl font-black text-zinc-300 font-mono group-hover:text-white transition-colors">
                   {formatInTimeZone(baseTime, item.zone, "HH:mm")}
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                       {formatInTimeZone(baseTime, item.zone, "EEE, MMM d")}
                    </p>
                 </div>
               </div>
             </div>
          ))}
        </div>
      </div>
  );
}
