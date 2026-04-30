"use client";

import { useState, useMemo } from "react";
import { TOOLS } from "@/lib/tools-config";
import { 
  Ruler, 
  ArrowRightLeft,
  Copy,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Input, M3Select } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DISTANCE_UNITS: Record<string, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
  nmi: 1852
};

const UNIT_LABELS: Record<string, string> = {
  mm: "Millimeters (mm)",
  cm: "Centimeters (cm)",
  m: "Meters (m)",
  km: "Kilometers (km)",
  in: "Inches (in)",
  ft: "Feet (ft)",
  yd: "Yards (yd)",
  mi: "Miles (mi)",
  nmi: "Nautical Miles (nmi)"
};

export default function DistanceConverterPage() {
  const tool = TOOLS.find(t => t.id === "distance-converter")!;
  const [value, setValue] = useState<string>("1");
  const [fromUnit, setFromUnit] = useState<string>("km");
  const [toUnit, setToUnit] = useState<string>("mi");

  const result = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0";
    
    // Convert to base unit (meters)
    const baseValue = num * (DISTANCE_UNITS[fromUnit] || 1);
    // Convert from base to target
    const finalValue = baseValue / (DISTANCE_UNITS[toUnit] || 1);
    
    return finalValue.toLocaleString(undefined, { maximumFractionDigits: 6 });
  }, [value, fromUnit, toUnit]);

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    toast.success("Result copied to clipboard");
  };

  const unitOptions = Object.keys(DISTANCE_UNITS).map(u => ({
    label: UNIT_LABELS[u],
    value: u
  }));

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">{tool.name}</h1>
        <p className="text-zinc-500 font-medium uppercase tracking-widest text-[10px]">{tool.description}</p>
      </div>

      <div className="bg-[#161618] border border-zinc-800 rounded-[3rem] p-8 md:p-12 space-y-10 shadow-2xl relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
          <div className="md:col-span-5 space-y-6">
            <M3Select 
              label="From Unit"
              value={fromUnit}
              onChange={setFromUnit}
              options={unitOptions}
            />
            <M3Input 
              label="Amount"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="text-2xl font-black h-20"
            />
          </div>

          <div className="md:col-span-1 flex justify-center">
             <button 
               onClick={swap}
               className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-primary hover:border-primary/50 text-zinc-500 hover:text-white transition-all transform hover:rotate-180 duration-500 shadow-xl"
             >
                <ArrowRightLeft className="w-5 h-5" />
             </button>
          </div>

          <div className="md:col-span-5 space-y-6">
             <M3Select 
              label="To Unit"
              value={toUnit}
              onChange={setToUnit}
              options={unitOptions}
            />
            <div className="relative group">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 mb-2">Result</div>
                <div className="h-20 w-full rounded-2xl bg-zinc-950/50 border border-zinc-800 flex items-center px-6 text-2xl font-black text-primary group-hover:border-primary/30 transition-all">
                   {result}
                </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
           <Button 
             onClick={copy}
             className="h-14 px-10 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-primary/50 text-zinc-400 hover:text-white font-black uppercase tracking-widest text-[10px] gap-3"
           >
              <Copy className="w-4 h-4" /> Copy Result
           </Button>
           <Button 
             onClick={() => { setValue("1"); setFromUnit("km"); setToUnit("mi"); }}
             variant="ghost"
             className="h-14 px-10 rounded-2xl text-zinc-600 hover:text-white font-black uppercase tracking-widest text-[10px] gap-3"
           >
              <RotateCcw className="w-4 h-4" /> Reset
           </Button>
        </div>
      </div>

      {/* Common Conversions Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "1 km to Miles", res: "0.621371 mi" },
           { label: "1 Mile to Kilometers", res: "1.60934 km" },
           { label: "1 Meter to Feet", res: "3.28084 ft" }
         ].map((item, i) => (
           <div key={i} className="bg-zinc-950/50 border border-zinc-900 p-6 rounded-3xl flex flex-col items-center text-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{item.label}</span>
              <span className="text-lg font-black text-zinc-300">{item.res}</span>
           </div>
         ))}
      </div>
    </div>
  );
}
