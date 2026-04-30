"use client";

import React, { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { colord, extend } from "colord";
import namesPlugin from "colord/plugins/names";
import a11yPlugin from "colord/plugins/a11y";
import { 
  Copy, 
  RefreshCw, 
  Hash, 
  Palette,
  Check,
  Zap,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

extend([namesPlugin, a11yPlugin]);

export default function ColorPickerTool() {
  const [color, setColor] = useState("#6366f1");
  const [copied, setCopied] = useState<string | null>(null);

  const c = colord(color);
  const rgb = c.toRgbString();
  const hsl = c.toHslString();
  const name = c.toName({ closest: true });
  const isDark = c.isDark();

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success(`Copied ${id}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const randomColor = () => {
    const randomHex = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setColor(randomHex);
  };

  return (
    <>
      <div className="flex flex-col h-full gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Picker */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-xl">
               <div className="custom-picker">
                  <HexColorPicker color={color} onChange={setColor} style={{ width: '100%', height: '240px' }} />
               </div>
               <div className="space-y-4">
                  <div className="flex items-center gap-2">
                     <Hash className="w-4 h-4 text-zinc-500" />
                     <Input 
                       value={color}
                       onChange={(e) => setColor(e.target.value)}
                       className="bg-zinc-950 border-zinc-800 font-mono text-lg uppercase h-12 rounded-xl focus:border-primary/50 transition-all"
                     />
                  </div>
                  <Button onClick={randomColor} variant="outline" className="w-full bg-zinc-900 border-zinc-800 h-12 rounded-xl gap-2 font-bold uppercase tracking-widest text-[10px]">
                     <RefreshCw className="w-4 h-4" /> Random Color
                  </Button>
               </div>
            </div>
          </div>

          {/* Details & Info */}
          <div className="lg:col-span-8 space-y-6">
             {/* Large Preview */}
             <div 
               className="h-48 rounded-[2.5rem] border border-zinc-800 flex items-end p-8 transition-colors duration-300 shadow-2xl relative overflow-hidden"
               style={{ backgroundColor: color }}
             >
                <div className="absolute top-6 right-6">
                   <div className={cn(
                     "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                     isDark ? "bg-white/10 border-white/20 text-white" : "bg-black/10 border-black/20 text-black"
                   )}>
                      {isDark ? "Dark Shade" : "Light Shade"}
                   </div>
                </div>
                <h2 className={cn(
                  "text-6xl font-black italic tracking-tighter transition-colors duration-300",
                  isDark ? "text-white" : "text-black"
                )}>
                   {name}
                </h2>
             </div>

             {/* Conversions */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "HEX", val: color.toUpperCase() },
                  { id: "RGB", val: rgb },
                  { id: "HSL", val: hsl },
                ].map((item) => (
                  <div key={item.id} className="bg-[#161618] border border-zinc-800 p-5 rounded-3xl flex flex-col justify-between group hover:border-primary/30 transition-all">
                     <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">{item.id}</span>
                     <div className="flex items-center justify-between gap-4">
                        <code className="text-sm font-mono text-zinc-300 truncate">{item.val}</code>
                        <button 
                          onClick={() => handleCopy(item.val, item.id)}
                          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-primary transition-all"
                        >
                           {copied === item.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                     </div>
                  </div>
                ))}
             </div>

             {/* Accessibility & Harmonies */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#161618] border border-zinc-800 rounded-[2rem] p-6 space-y-4">
                   <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Accessibility (on White)</span>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-950 p-4 rounded-2xl flex flex-col items-center gap-1">
                         <span className={cn("text-lg font-black", colord(color).contrast("#ffffff") >= 4.5 ? "text-green-500" : "text-red-500")}>
                            {colord(color).contrast("#ffffff").toFixed(2)}
                         </span>
                         <span className="text-[9px] font-bold text-zinc-600 uppercase">Ratio</span>
                      </div>
                      <div className="bg-zinc-950 p-4 rounded-2xl flex flex-col items-center gap-1">
                         <span className={cn("text-lg font-black", colord(color).contrast("#ffffff") >= 4.5 ? "text-green-500" : "text-red-500")}>
                            {colord(color).contrast("#ffffff") >= 4.5 ? "PASS" : "FAIL"}
                         </span>
                         <span className="text-[9px] font-bold text-zinc-600 uppercase">AA Limit</span>
                      </div>
                   </div>
                </div>

                <div className="bg-[#161618] border border-zinc-800 rounded-[2rem] p-6 space-y-4">
                   <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Harmonies</span>
                   </div>
                   <div className="flex gap-2">
                      {[
                        c.rotate(180).toHex(),
                        c.rotate(30).toHex(),
                        c.rotate(-30).toHex(),
                        c.lighten(0.2).toHex(),
                        c.darken(0.2).toHex(),
                      ].map((h, i) => (
                        <button 
                          key={i}
                          onClick={() => setColor(h)}
                          className="flex-1 aspect-square rounded-xl border border-zinc-800/50 hover:scale-110 transition-transform cursor-pointer"
                          style={{ backgroundColor: h }}
                          title={h}
                        />
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="bg-zinc-900/30 border border-zinc-800/50 p-4 px-6 rounded-2xl flex items-center gap-4">
           <Info className="w-4 h-4 text-zinc-600" />
           <p className="text-[10px] text-zinc-600 font-medium leading-relaxed">
             This color picker uses advanced color theory algorithms to output precise values. Supported formats: Hex, RGB, HSL. Includes accessibility contrast checking against Web Content Accessibility Guidelines (WCAG).
           </p>
        </div>
      </div>

      <style jsx global>{`
        .custom-picker .react-colorful {
          border-radius: 1.5rem;
          border: none;
        }
        .custom-picker .react-colorful__saturation {
          border-radius: 1.5rem 1.5rem 0 0;
          border-bottom: none;
        }
        .custom-picker .react-colorful__hue {
          height: 24px;
          border-radius: 0 0 1.5rem 1.5rem;
          margin-top: 16px;
        }
        .custom-picker .react-colorful__pointer {
          width: 20px;
          height: 20px;
        }
      `}</style>
    </>
  );
}
