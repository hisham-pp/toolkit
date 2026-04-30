"use client";

import React, { useState, useMemo } from "react";
import { colord, extend } from "colord";
import mixPlugin from "colord/plugins/mix";
import namesPlugin from "colord/plugins/names";
import { 
  Palette, 
  Trash2, 
  Copy, 
  RefreshCw,
  Plus,
  Minus,
  Check,
  Zap,
  Layers,
  ChevronDown,
  Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/utility/helpers/utils";

extend([mixPlugin, namesPlugin]);

type PaletteType = "analogous" | "monochromatic" | "triadic" | "complementary" | "tetradic";

export default function ThemeGenerator() {
  const [baseColor, setBaseColor] = useState("#6366f1");
  const [colorCount, setColorCount] = useState(5);
  const [paletteType, setPaletteType] = useState<PaletteType>("analogous");

  const palette = useMemo(() => {
    const c = colord(baseColor);
    let colors: string[] = [];

    switch (paletteType) {
      case "monochromatic":
        for (let i = 0; i < colorCount; i++) {
          colors.push(c.lighten(i * (0.5 / colorCount)).darken(i === 0 ? 0 : 0.1).toHex());
        }
        break;
      case "analogous":
        for (let i = 0; i < colorCount; i++) {
          colors.push(c.rotate(i * (60 / colorCount) - 30).toHex());
        }
        break;
      case "triadic":
        const triad = [c.toHex(), c.rotate(120).toHex(), c.rotate(240).toHex()];
        for (let i = 0; i < colorCount; i++) {
          colors.push(colord(triad[i % 3]).lighten(Math.floor(i / 3) * 0.1).toHex());
        }
        break;
      case "complementary":
        const comp = [c.toHex(), c.rotate(180).toHex()];
        for (let i = 0; i < colorCount; i++) {
          colors.push(colord(comp[i % 2]).lighten(Math.floor(i / 2) * 0.1).toHex());
        }
        break;
      case "tetradic":
        const tetra = [c.toHex(), c.rotate(90).toHex(), c.rotate(180).toHex(), c.rotate(270).toHex()];
        for (let i = 0; i < colorCount; i++) {
          colors.push(colord(tetra[i % 4]).lighten(Math.floor(i / 4) * 0.1).toHex());
        }
        break;
    }

    return colors.slice(0, colorCount);
  }, [baseColor, colorCount, paletteType]);

  const copyPalette = () => {
    const text = palette.join(", ");
    navigator.clipboard.writeText(text);
    toast.success("Palette copied to clipboard");
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`Copied ${hex.toUpperCase()}`);
  };

  const randomColor = () => {
    setBaseColor("#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'));
  };

  return (
      <div className="flex flex-col h-full gap-8">
        {/* Controls */}
        <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 shadow-xl flex flex-col md:flex-row gap-8 items-end">
           <div className="flex-1 space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Base Seed Color</label>
              <div className="flex gap-2">
                 <div className="relative flex-1">
                    <Input 
                       value={baseColor}
                       onChange={(e) => setBaseColor(e.target.value)}
                       className="bg-zinc-950 border-zinc-800 font-mono pl-12 h-14 rounded-2xl focus:border-primary/50 transition-all uppercase"
                    />
                    <div 
                       className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg pointer-events-none border border-white/10"
                       style={{ backgroundColor: baseColor }}
                    />
                 </div>
                 <Button onClick={randomColor} variant="outline" className="h-14 bg-zinc-950 border-zinc-800 rounded-2xl flex-shrink-0 px-4 hover:border-primary/50 transition-all">
                    <RefreshCw className="w-4 h-4" />
                 </Button>
              </div>
           </div>

           <div className="flex-1 space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Harmony Logic</label>
              <div className="relative group">
                 <select 
                    value={paletteType}
                    onChange={(e) => setPaletteType(e.target.value as PaletteType)}
                    className="w-full h-14 bg-zinc-950 border border-zinc-800 rounded-2xl px-6 text-xs font-bold uppercase tracking-widest outline-none appearance-none focus:border-primary/50 transition-all cursor-pointer"
                 >
                    <option value="analogous">Analogous</option>
                    <option value="monochromatic">Monochromatic</option>
                    <option value="triadic">Triadic</option>
                    <option value="complementary">Complementary</option>
                    <option value="tetradic">Tetradic</option>
                 </select>
                 <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors pointer-events-none" />
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Swatch Count</label>
              <div className="flex bg-zinc-950 border border-zinc-800 rounded-2xl h-14 items-center px-4 gap-6">
                 <button onClick={() => setColorCount(prev => Math.max(2, prev - 1))} className="text-zinc-600 hover:text-primary transition-colors">
                    <Minus className="w-4 h-4" />
                 </button>
                 <span className="font-mono text-lg font-black text-white w-6 text-center">{colorCount}</span>
                 <button onClick={() => setColorCount(prev => Math.min(12, prev + 1))} className="text-zinc-600 hover:text-primary transition-colors">
                    <Plus className="w-4 h-4" />
                 </button>
              </div>
           </div>

           <Button onClick={copyPalette} className="h-14 bg-primary hover:bg-primary/90 text-white font-black italic uppercase tracking-widest px-8 rounded-2xl shadow-xl shadow-primary/20">
              Export Theme
           </Button>
        </div>

        {/* Palette Display */}
        <div className="flex-1 min-h-[400px] flex gap-2">
           {palette.map((color, i) => {
             const c = colord(color);
             const isDark = c.isDark();
             return (
               <div 
                 key={`${color}-${i}`}
                 className="flex-1 group relative transition-all duration-700 hover:flex-[1.5] animate-in slide-in-from-bottom"
                 style={{ 
                   backgroundColor: color, 
                   animationDelay: `${i * 50}ms`
                 }}
               >
                  <div className={cn(
                    "absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:-translate-y-4",
                    isDark ? "text-white" : "text-black"
                  )}>
                     <div className="text-xs font-black uppercase tracking-widest rotate--90 mb-8 w-24 text-center">
                        {c.toName({ closest: true })}
                     </div>
                     <button 
                       onClick={() => copyHex(color)}
                       className={cn(
                         "p-4 rounded-full border shadow-2xl hover:scale-110 transition-transform",
                         isDark ? "bg-white/10 border-white/20" : "bg-black/10 border-black/20"
                       )}
                     >
                        <Copy className="w-5 h-5" />
                     </button>
                     <div className="font-mono text-sm font-black tracking-tighter bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                        {color.toUpperCase()}
                     </div>
                  </div>
                  
                  {/* Vertical Label */}
                  <div className={cn(
                    "absolute inset-x-0 bottom-8 text-center text-[10px] font-black uppercase tracking-[0.4em] opacity-30 group-hover:opacity-0 transition-opacity whitespace-nowrap overflow-hidden px-4",
                    isDark ? "text-white" : "text-black"
                  )}>
                     {color.toUpperCase()}
                  </div>
               </div>
             );
           })}
        </div>

        {/* Harmony Previews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-6">
              <div className="flex items-center gap-3">
                 <Layout className="w-4 h-4 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">UI Mockup Preview</span>
              </div>
              <div className="space-y-4">
                 <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-900 space-y-4">
                    <div className="h-4 w-24 rounded-full" style={{ backgroundColor: palette[0] }} />
                    <div className="h-12 w-full rounded-2xl" style={{ backgroundColor: palette[1] }} />
                    <div className="grid grid-cols-2 gap-4">
                       <div className="h-20 rounded-2xl" style={{ backgroundColor: palette[2] }} />
                       <div className="h-20 rounded-2xl" style={{ backgroundColor: palette[Math.min(3, colorCount - 1)] }} />
                    </div>
                 </div>
                 <p className="text-[10px] text-zinc-600 font-medium italic text-center">Visualizing palette rhythm in a structural layout</p>
              </div>
           </div>

           <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 flex flex-col justify-center gap-8">
              <div className="flex items-center gap-3">
                 <Layers className="w-4 h-4 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Harmony Breakdown</span>
              </div>
              <div className="space-y-4">
                 <p className="text-xs text-zinc-500 leading-relaxed">
                    Theme generation uses circular color space mathematics to ensure consistent optical weight across swatches. <span className="text-white font-bold">{paletteType.toUpperCase()}</span> logic distributes values along specific vectors of the HSL cylinder.
                 </p>
                 <div className="flex items-center gap-2 text-[10px] font-mono text-primary font-bold">
                    <Zap className="w-3 h-3" />
                    ENGINE ACTIVE: 60FPS OPTICAL RECALCULATION
                 </div>
              </div>
           </div>
        </div>
      </div>
  );
}
