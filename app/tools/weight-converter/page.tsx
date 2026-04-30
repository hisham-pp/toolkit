"use client";

import { useState, useMemo } from "react";
import { TOOLS } from "@/lib/tools-config";
import ToolLayout from "@/components/ToolLayout";
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
    <ToolLayout tool={tool}>
      <div className="flex flex-col h-full max-w-6xl mx-auto gap-10 pt-6">
        <div className="bg-[#161618] border border-zinc-800 rounded-[3.5rem] p-10 md:p-14 space-y-12 shadow-2xl relative overflow-hidden text-white">
          {/* Background Decor */}
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-11 gap-10 items-center relative z-10">
            <div className="md:col-span-5 space-y-8">
              <M3Select 
                label="Baseline Unit"
                value={fromUnit}
                onChange={setFromUnit}
                options={unitOptions}
              />
              <M3Input 
                label="Mass Magnitude"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="text-4xl font-black h-24 tracking-tighter"
              />
            </div>

            <div className="md:col-span-1 flex justify-center">
               <button 
                 onClick={swap}
                 className="w-16 h-16 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center hover:bg-primary hover:border-primary/50 text-zinc-500 hover:text-white transition-all transform hover:rotate-180 duration-700 shadow-2xl group"
               >
                  <ArrowRightLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
               </button>
            </div>

            <div className="md:col-span-5 space-y-8">
               <M3Select 
                label="Output Scale"
                value={toUnit}
                onChange={setToUnit}
                options={unitOptions}
              />
              <div className="relative group">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-1 mb-3">Converted Mass</div>
                  <div className="h-24 w-full rounded-[2rem] bg-zinc-950 border border-zinc-900 flex items-center px-8 text-4xl font-black text-primary group-hover:border-primary/40 transition-all shadow-inner tracking-tighter overflow-hidden overflow-ellipsis">
                     {result}
                  </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-6 relative z-10">
             <Button 
               onClick={copy}
               className="h-16 px-12 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-primary/40 text-zinc-400 hover:text-white font-black uppercase tracking-widest text-[11px] gap-4 shadow-xl transition-all"
             >
                <Copy className="w-5 h-5" /> Copy Weight Metrics
             </Button>
             <Button 
               onClick={() => { setValue("1"); setFromUnit("kg"); setToUnit("lb"); }}
               variant="ghost"
               className="h-16 px-12 rounded-2xl text-zinc-700 hover:text-white font-black uppercase tracking-widest text-[11px] gap-4 transition-colors"
             >
                <RotateCcw className="w-5 h-5" /> Reset Calculations
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
           {[
             { label: "1 kg to Pounds", res: "2.20462 lb" },
             { label: "1 lb to Ounces", res: "16 oz" },
             { label: "100g to Ounces", res: "3.5274 oz" }
           ].map((item, i) => (
             <div key={i} className="bg-zinc-950/40 border border-zinc-900 p-8 rounded-[2rem] flex flex-col items-center text-center gap-3 hover:bg-zinc-900/40 transition-all duration-300 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">{item.label}</span>
                <span className="text-xl font-black text-zinc-300 italic">{item.res}</span>
             </div>
           ))}
        </div>
      </div>
    </ToolLayout>
  );
}
  );
}
