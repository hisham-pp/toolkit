"use client";

import React, { useState } from "react";
import { 
  Copy, 
  RotateCcw, 
  Trash2,
  Settings2,
  Box,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { cn } from "@/utility/helpers/utils";

export default function BoxShadow() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(10);
  const [blur, setBlur] = useState(25);
  const [spread, setSpread] = useState(-5);
  const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(0.2);
  const [inset, setInset] = useState(false);

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const shadowString = `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px ${hexToRgba(color, opacity)}`;

  const reset = () => {
    setX(0);
    setY(10);
    setBlur(25);
    setSpread(-5);
    setColor("#000000");
    setOpacity(0.2);
    setInset(false);
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(`box-shadow: ${shadowString};`);
    toast.success("CSS copied");
  };

  const copyTailwind = () => {
    const tw = `shadow-[${shadowString}]`;
    navigator.clipboard.writeText(tw);
    toast.success("Tailwind class copied");
  };

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Preview Section */}
        <div className="flex flex-col gap-6">
          <div className="flex-1 bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-12 shadow-2xl relative overflow-hidden min-h-[500px]">
             {/* Dynamic Box */}
             <div 
              className="w-48 h-48 bg-white rounded-3xl transition-all duration-300 border border-zinc-100/10 flex items-center justify-center p-8 group"
              style={{ boxShadow: shadowString }}
             >
                <Box className="w-12 h-12 text-zinc-100 group-hover:scale-110 transition-transform duration-500" />
             </div>

             <div className="w-full space-y-4">
                <div className="flex flex-col gap-2 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">CSS Output</span>
                     <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={copyCSS} className="h-6 text-[10px] uppercase font-bold text-zinc-500">Copy CSS</Button>
                        <Button variant="ghost" size="sm" onClick={copyTailwind} className="h-6 text-[10px] uppercase font-bold text-zinc-500">Copy TW</Button>
                     </div>
                   </div>
                   <code className="text-[11px] font-mono text-primary break-all leading-relaxed bg-zinc-950/50 p-2 rounded-lg">
                      box-shadow: {shadowString};
                   </code>
                </div>
             </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col gap-6">
           <div className="bg-[#161618] border border-zinc-800 rounded-[2rem] p-8 space-y-8 flex-1">
              <div className="flex items-center justify-between">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    Shadow Parameters
                 </h3>
                 <Button 
                    variant={inset ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setInset(!inset)}
                    className="h-8 text-[10px] uppercase font-bold px-4"
                 >
                    Inset Mode
                 </Button>
              </div>

              <div className="space-y-6 pt-4">
                {/* Sliders */}
                {[
                  { label: "Horizontal Offset (X)", value: x, min: -100, max: 100, setter: setX },
                  { label: "Vertical Offset (Y)", value: y, min: -100, max: 100, setter: setY },
                  { label: "Blur Radius", value: blur, min: 0, max: 100, setter: setBlur },
                  { label: "Spread Radius", value: spread, min: -100, max: 100, setter: setSpread },
                ].map((s) => (
                  <div key={s.label} className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                       <span>{s.label}</span>
                       <span className="font-mono text-zinc-400">{s.value}px</span>
                    </div>
                    <Slider 
                      value={[s.value]} 
                      min={s.min} 
                      max={s.max} 
                      step={1} 
                      onValueChange={(val) => {
                        if (Array.isArray(val)) s.setter(val[0]);
                        else if (typeof val === 'number') s.setter(val);
                      }}
                    />
                  </div>
                ))}

                {/* Color & Opacity */}
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Color</label>
                      <div className="flex items-center gap-3 bg-zinc-950 p-2 rounded-xl border border-zinc-900 group">
                         <input 
                           type="color" 
                           value={color} 
                           onChange={(e) => setColor(e.target.value)}
                           className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer p-0"
                         />
                         <span className="text-[10px] font-mono text-zinc-500 group-hover:text-primary transition-colors">{color.toUpperCase()}</span>
                      </div>
                   </div>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                         <span>Opacity</span>
                         <span className="font-mono text-zinc-400">{~~(opacity * 100)}%</span>
                      </div>
                      <Slider 
                        value={[opacity]} 
                        min={0} 
                        max={1} 
                        step={0.01} 
                        onValueChange={(val) => {
                          if (Array.isArray(val)) setOpacity(val[0]);
                          else if (typeof val === 'number') setOpacity(val);
                        }}
                        className="mt-3"
                      />
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-8">
                 <Button variant="outline" onClick={reset} className="h-14 bg-zinc-900/30 border-zinc-800 text-zinc-500 font-bold gap-2 rounded-2xl">
                    <RotateCcw className="w-4 h-4" />
                    Reset
                 </Button>
                 <Button onClick={copyCSS} className="h-14 bg-primary hover:bg-primary/90 text-white font-bold gap-2 rounded-2xl shadow-xl shadow-primary/20">
                    <Copy className="w-4 h-4" />
                    Copy Code
                 </Button>
              </div>
           </div>
        </div>
      </div>
  );
}
