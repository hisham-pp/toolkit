"use client";

import { useState, useMemo } from "react";
import { TOOLS } from "@/lib/tools-config";
import { 
  Scale, 
  ArrowRightLeft,
  Copy,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Input, M3Select } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const WEIGHT_UNITS: Record<string, number> = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
  mt: 1000000, // Metric Ton
  st: 6350.29   // Stone
};

const UNIT_LABELS: Record<string, string> = {
  mg: "Milligrams (mg)",
  g: "Grams (g)",
  kg: "Kilograms (kg)",
  oz: "Ounces (oz)",
  lb: "Pounds (lb)",
  mt: "Metric Ton (t)",
  st: "Stone (st)"
};

export default function WeightConverterPage() {
  const tool = TOOLS.find(t => t.id === "weight-converter")!;
  const [value, setValue] = useState<string>("1");
  const [fromUnit, setFromUnit] = useState<string>("kg");
  const [toUnit, setToUnit] = useState<string>("lb");

  const result = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0";
    
    // Convert to base unit (grams)
    const baseValue = num * (WEIGHT_UNITS[fromUnit] || 1);
    // Convert from base to target
    const finalValue = baseValue / (WEIGHT_UNITS[toUnit] || 1);
    
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

  const unitOptions = Object.keys(WEIGHT_UNITS).map(u => ({
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
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        
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
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 mb-2">Weight Result</div>
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
              <Copy className="w-4 h-4" /> Copy Weight
           </Button>
           <Button 
             onClick={() => { setValue("1"); setFromUnit("kg"); setToUnit("lb"); }}
             variant="ghost"
             className="h-14 px-10 rounded-2xl text-zinc-600 hover:text-white font-black uppercase tracking-widest text-[10px] gap-3"
           >
              <RotateCcw className="w-4 h-4" /> Reset
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "1 kg to Pounds", res: "2.20462 lb" },
           { label: "1 lb to Ounces", res: "16 oz" },
           { label: "100g to Ounces", res: "3.5274 oz" }
         ].map((item, i) => (
           <div key={i} className="bg-zinc-950/50 border border-zinc-900 p-6 rounded-3xl flex flex-col items-center text-center gap-2 hover:bg-zinc-900/50 transition-colors">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{item.label}</span>
              <span className="text-lg font-black text-zinc-300">{item.res}</span>
           </div>
         ))}
      </div>
    </div>
  );
}
