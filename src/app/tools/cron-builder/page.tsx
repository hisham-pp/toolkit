"use client";

import React, { useState, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { ToolRegistry } from "@/utility/constants/tools";
import { M3Select, M3Input } from "@/components/ui/m3-ui";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Check, Clock, Calendar, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";
import cronstrue from "cronstrue";

export default function CronBuilder() {
  const tool = ToolRegistry.getById("cron-builder")!;
  const [cron, setCron] = useState("* * * * *");
  const [description, setDescription] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // States for each cron part
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [day, setDay] = useState("*");
  const [month, setMonth] = useState("*");
  const [weekday, setWeekday] = useState("*");

  const generateCron = useCallback(() => {
    const expression = `${minute} ${hour} ${day} ${month} ${weekday}`;
    setCron(expression);
    try {
      setDescription(cronstrue.toString(expression));
    } catch (e) {
      setDescription("Invalid expression generated");
    }
  }, [minute, hour, day, month, weekday]);

  useEffect(() => {
    generateCron();
  }, [generateCron]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cron);
    setIsCopied(true);
    toast.success("Copied cron expression");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    setMinute("*");
    setHour("*");
    setDay("*");
    setMonth("*");
    setWeekday("*");
    toast.info("Reset to default (Every minute)");
  };

  const minuteOptions = [
    { label: "Every minute (*)", value: "*" },
    ...Array.from({ length: 60 }, (_, i) => ({ label: `Minute ${i}`, value: i.toString() })),
    { label: "Every 5 minutes (*/5)", value: "*/5" },
    { label: "Every 15 minutes (*/15)", value: "*/15" },
    { label: "Every 30 minutes (*/30)", value: "*/30" },
  ];

  const hourOptions = [
    { label: "Every hour (*)", value: "*" },
    ...Array.from({ length: 24 }, (_, i) => ({ label: `${i}:00`, value: i.toString() })),
    { label: "Every 2 hours (*/2)", value: "*/2" },
    { label: "Every 4 hours (*/4)", value: "*/4" },
    { label: "Every 6 hours (*/6)", value: "*/6" },
    { label: "Every 12 hours (*/12)", value: "*/12" },
  ];

  const dayOptions = [
    { label: "Every day (*)", value: "*" },
    ...Array.from({ length: 31 }, (_, i) => ({ label: `Day ${i + 1}`, value: (i + 1).toString() })),
  ];

  const monthOptions = [
    { label: "Every month (*)", value: "*" },
    { label: "January", value: "1" },
    { label: "February", value: "2" },
    { label: "March", value: "3" },
    { label: "April", value: "4" },
    { label: "May", value: "5" },
    { label: "June", value: "6" },
    { label: "July", value: "7" },
    { label: "August", value: "8" },
    { label: "September", value: "9" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ];

  const weekdayOptions = [
    { label: "Every day (*)", value: "*" },
    { label: "Sunday (0)", value: "0" },
    { label: "Monday (1)", value: "1" },
    { label: "Tuesday (2)", value: "2" },
    { label: "Wednesday (3)", value: "3" },
    { label: "Thursday (4)", value: "4" },
    { label: "Friday (5)", value: "5" },
    { label: "Saturday (6)", value: "6" },
    { label: "Weekdays (1-5)", value: "1-5" },
    { label: "Weekends (0,6)", value: "0,6" },
  ];

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col h-full gap-8 animate-in fade-in duration-700">
        {/* Visual Builder Controls */}
        <div className="bg-zinc-950/30 border border-zinc-900 rounded-[2.5rem] p-8 md:p-12 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <M3Select 
              label="Minute"
              value={minute}
              onChange={setMinute}
              options={minuteOptions}
            />
            <M3Select 
              label="Hour"
              value={hour}
              onChange={setHour}
              options={hourOptions}
            />
            <M3Select 
              label="Day of Month"
              value={day}
              onChange={setDay}
              options={dayOptions}
            />
            <M3Select 
              label="Month"
              value={month}
              onChange={setMonth}
              options={monthOptions}
            />
            <M3Select 
              label="Day of Week"
              value={weekday}
              onChange={setWeekday}
              options={weekdayOptions}
            />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6 border-t border-zinc-900/50">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-primary shadow-xl">
                   <Clock className="w-8 h-8" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1 italic">Human-Readable Schedule</p>
                   <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{description}</h2>
                </div>
             </div>
             <div className="flex items-center gap-3 w-full md:w-auto">
                <Button 
                  variant="outline" 
                  className="h-14 px-8 rounded-2xl border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-400 hover:text-white"
                  onClick={handleReset}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  className="h-14 px-10 flex-1 md:flex-none rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-2xl shadow-primary/20"
                  onClick={handleCopy}
                >
                  {isCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {isCopied ? "Copied" : "Copy Expression"}
                </Button>
             </div>
          </div>
        </div>

        {/* Output Area */}
        <div className="grid grid-cols-1 gap-6">
           <div className="relative group">
              <div className="absolute top-6 right-8 z-10">
                 <div className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2 shadow-2xl">
                   <Zap className="w-3 h-3 animate-pulse" />
                   Resulting Expression
                 </div>
              </div>
              <M3Input 
                label="Cron Expression"
                readOnly
                value={cron}
                className="h-24 text-3xl md:text-5xl font-black text-center tracking-tighter bg-zinc-950/50 border-zinc-800 rounded-[2rem] text-zinc-200"
              />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Standard", hint: "* * * * *", desc: "Minute, Hour, Day, Month, Weekday" },
                { title: "Next Runs", hint: "Calculated locally", desc: "View upcoming execution times in the log below." },
                { title: "Compatibility", hint: "POSIX / Linux", desc: "Supports standard crontab environments." }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-zinc-950/20 border border-zinc-900/50 rounded-3xl space-y-3">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{item.title}</h4>
                   </div>
                   <p className="text-white font-bold text-sm tracking-tight">{item.hint}</p>
                   <p className="text-[10px] text-zinc-600 font-medium leading-relaxed uppercase tracking-widest">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </ToolLayout>
  );
}
