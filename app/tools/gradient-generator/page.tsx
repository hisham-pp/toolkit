"use client";

import React, { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { 
  Paintbrush, 
  Trash2, 
  Copy, 
  Plus,
  Minus,
  MoveRight,
  RefreshCw,
  Code2,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ColorStop {
  color: string;
  position: number;
}

export default function GradientGenerator() {
  const tool = TOOLS.find((t) => t.id === "gradient-generator")!;
  const [stops, setStops] = useState<ColorStop[]>([
    { color: "#6366f1", position: 0 },
    { color: "#a855f7", position: 100 }
  ]);
  const [angle, setAngle] = useState(135);
  const [type, setType] = useState<"linear" | "radial">("linear");

  const gradientString = useMemo(() => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(", ");
    return type === "linear" 
      ? `linear-gradient(${angle}deg, ${stopsStr})`
      : `radial-gradient(circle, ${stopsStr})`;
  }, [stops, angle, type]);

  const cssCode = `background: ${gradientString};`;

  const addStop = () => {
    if (stops.length >= 6) {
      toast.error("Max 6 stops for optimal results");
      return;
    }
    const lastColor = stops[stops.length - 1].color;
    setStops([...stops, { color: lastColor, position: 50 }]);
  };

  const removeStop = (index: number) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((_, i) => i !== index));
  };

  const updateStop = (index: number, updates: Partial<ColorStop>) => {
    setStops(stops.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  const randomGradient = () => {
    const randomHex = () => "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setStops([
      { color: randomHex(), position: 0 },
      { color: randomHex(), position: 100 }
    ]);
    setAngle(Math.floor(Math.random() * 360));
  };

  const copyCode = () => {
    navigator.clipboard.writeText(cssCode);
    toast.success("Gradient CSS copied!");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col h-full gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Settings Side */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-8 shadow-xl">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Paintbrush className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Designer Controls</span>
                   </div>
                   <Button variant="ghost" size="sm" onClick={randomGradient} className="h-8 w-8 p-0 hover:bg-zinc-800 rounded-full">
                      <RefreshCw className="w-3.5 h-3.5 text-zinc-600" />
                   </Button>
                </div>

                <div className="space-y-6">
                   <div className="flex bg-zinc-950 p-1 border border-zinc-900 rounded-2xl">
                      <button 
                        onClick={() => setType("linear")}
                        className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", type === "linear" ? "bg-zinc-800 text-white" : "text-zinc-600")}
                      >
                         Linear
                      </button>
                      <button 
                        onClick={() => setType("radial")}
                        className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", type === "radial" ? "bg-zinc-800 text-white" : "text-zinc-600")}
                      >
                         Radial
                      </button>
                   </div>

                   {type === "linear" && (
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Rotation Angle</label>
                           <span className="text-xs font-mono text-primary">{angle}°</span>
                        </div>
                        <input 
                           type="range" min="0" max="360" value={angle}
                           onChange={(e) => setAngle(parseInt(e.target.value))}
                           className="w-full accent-primary h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer"
                        />
                     </div>
                   )}

                   <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                         <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Color Stops</span>
                         <button onClick={addStop} className="text-primary hover:text-primary/80 transition-colors p-1 hover:bg-primary/10 rounded">
                            <Plus className="w-4 h-4" />
                         </button>
                      </div>
                      <div className="space-y-3">
                         {stops.map((stop, i) => (
                           <div key={i} className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-2xl border border-zinc-900 group">
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/5 shrink-0 shadow-lg">
                                 <input 
                                   type="color" 
                                   value={stop.color} 
                                   onChange={(e) => updateStop(i, { color: e.target.value })}
                                   className="absolute inset-0 w-12 h-12 border-none p-0 cursor-pointer -translate-x-2 -translate-y-2"
                                 />
                              </div>
                              <Input 
                                 className="h-8 bg-zinc-950 border-zinc-800 text-[10px] font-mono rounded-lg w-24 shrink-0 uppercase"
                                 value={stop.color}
                                 onChange={(e) => updateStop(i, { color: e.target.value })}
                              />
                              <div className="flex-1 flex items-center gap-2">
                                 <input 
                                   type="range" min="0" max="100" value={stop.position}
                                   onChange={(e) => updateStop(i, { position: parseInt(e.target.value) })}
                                   className="flex-1 h-1 bg-zinc-900 rounded-full accent-zinc-700"
                                 />
                                 <span className="text-[9px] font-mono text-zinc-600 w-6 text-right">{stop.position}%</span>
                              </div>
                              {stops.length > 2 && (
                                <button onClick={() => removeStop(i)} className="text-zinc-800 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                   <Minus className="w-3 h-3" />
                                </button>
                              )}
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-8 flex flex-col gap-6">
             <div className="h-80 rounded-[3rem] border border-zinc-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105" style={{ background: gradientString }} />
                <div className="absolute top-8 left-8 flex items-center gap-3 mix-blend-difference">
                   <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/50">High Fidelity Texture Preview</span>
                </div>
                <div className="absolute bottom-8 right-8">
                   <Button variant="ghost" className="h-10 w-10 p-0 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20">
                      <Maximize2 className="w-4 h-4 text-white" />
                   </Button>
                </div>
             </div>

             <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 flex-1 flex flex-col gap-6 shadow-xl">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Code2 className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">CSS Snippet</span>
                   </div>
                   <Button onClick={copyCode} className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest text-[10px] rounded-xl shadow-lg shadow-primary/20">
                      Copy Result
                   </Button>
                </div>
                <div className="flex-1 bg-zinc-950 p-6 rounded-2xl border border-zinc-900 group">
                   <code className="text-xs font-mono text-zinc-500 break-all leading-relaxed group-hover:text-zinc-300 transition-colors">
                      {cssCode}
                   </code>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-700 italic">
                   <MoveRight className="w-4 h-4" /> Ready for production stylesheets and inline styles
                </div>
             </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
