"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { 
  Copy, 
  RotateCcw, 
  Plus, 
  Trash2, 
  ArrowRight,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type GradientStop = {
  id: string;
  color: string;
  position: number;
};

export default function GradientGenerator() {
  const tool = TOOLS.find((t) => t.id === "gradient-gen")!;
  const [stops, setStops] = useState<GradientStop[]>([
    { id: "1", color: "#3b82f6", position: 0 },
    { id: "2", color: "#8b5cf6", position: 100 },
  ]);
  const [angle, setAngle] = useState(45);
  const [type, setType] = useState<"linear" | "radial">("linear");

  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  const gradientString = type === "linear" 
    ? `linear-gradient(${angle}deg, ${sortedStops.map(s => `${s.color} ${s.position}%`).join(", ")})`
    : `radial-gradient(circle, ${sortedStops.map(s => `${s.color} ${s.position}%`).join(", ")})`;

  const addStop = () => {
    if (stops.length >= 5) {
      toast.error("Max 5 stops allowed");
      return;
    }
    const id = Math.random().toString(36).substr(2, 9);
    setStops([...stops, { id, color: "#ffffff", position: 50 }]);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops(stops.filter(s => s.id !== id));
  };

  const updateStop = (id: string, updates: Partial<GradientStop>) => {
    setStops(stops.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(`background: ${gradientString};`);
    toast.success("CSS copied");
  };

  const copyTailwind = () => {
    // Basic mapping for simple gradients, otherwise custom
    const tw = `bg-[${gradientString}]`;
    navigator.clipboard.writeText(tw);
    toast.success("Tailwind class copied");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Preview Section */}
        <div className="flex flex-col gap-6">
          <div className="flex-1 bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 flex flex-col gap-8 shadow-2xl overflow-hidden min-h-[400px]">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Live Preview</h3>
                <div className="flex gap-2">
                   <Button 
                    variant={type === "linear" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setType("linear")}
                    className="text-[10px] uppercase font-bold h-7"
                   >
                     Linear
                   </Button>
                   <Button 
                    variant={type === "radial" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setType("radial")}
                    className="text-[10px] uppercase font-bold h-7"
                   >
                     Radial
                   </Button>
                </div>
             </div>

             <div 
              className="flex-1 rounded-[2rem] shadow-inner border border-white/5"
              style={{ background: gradientString }}
             />

             <div className="space-y-4">
                <div className="flex flex-col gap-2 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Generated Code</span>
                     <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={copyCSS} className="h-6 text-[10px] uppercase font-bold text-zinc-500">
                           CSS
                        </Button>
                        <Button variant="ghost" size="sm" onClick={copyTailwind} className="h-6 text-[10px] uppercase font-bold text-zinc-500">
                           TW
                        </Button>
                     </div>
                   </div>
                   <code className="text-[10px] font-mono text-primary break-all leading-relaxed">
                     {gradientString}
                   </code>
                </div>
             </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col gap-8">
           {/* Stops */}
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Color Stops</h4>
                 <Button variant="outline" size="sm" onClick={addStop} className="h-8 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 rounded-full text-xs">
                    <Plus className="w-3 h-3 mr-2" /> Add Stop
                 </Button>
              </div>

              <div className="space-y-3">
                {stops.map((stop) => (
                  <div key={stop.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-6">
                     <input 
                       type="color" 
                       value={stop.color} 
                       onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                       className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer p-0 overflow-hidden"
                     />
                     <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-[10px] font-mono">
                           <span className="text-zinc-500 uppercase">{stop.color}</span>
                           <span className="text-zinc-300">{stop.position}%</span>
                        </div>
                        <Slider 
                          value={[stop.position]} 
                          max={100} 
                          step={1} 
                          onValueChange={(val) => {
                            const v = Array.isArray(val) ? val[0] : val;
                            if (typeof v === 'number') updateStop(stop.id, { position: v });
                          }}
                        />
                     </div>
                     <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeStop(stop.id)}
                      className="text-zinc-700 hover:text-red-500 hover:bg-transparent"
                      disabled={stops.length <= 2}
                     >
                        <Trash2 className="w-4 h-4" />
                     </Button>
                  </div>
                ))}
              </div>
           </div>

           {/* Settings */}
           <div className="bg-[#161618] border border-zinc-800 rounded-3xl p-6 space-y-6">
              <div className="flex flex-col gap-4">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Angle</label>
                    <span className="text-xs font-mono text-zinc-300 bg-zinc-900 px-2 py-1 rounded-md">{angle}°</span>
                 </div>
                 <Slider 
                  value={[angle]} 
                  max={360} 
                  step={1} 
                  onValueChange={(val) => {
                    const v = Array.isArray(val) ? val[0] : val;
                    if (typeof v === 'number') setAngle(v);
                  }}
                  disabled={type === "radial"}
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <Button variant="outline" className="h-12 border-zinc-800 bg-zinc-900/30 text-zinc-400 gap-2 rounded-xl">
                    <RotateCcw className="w-4 h-4" />
                    Reset
                 </Button>
                 <Button onClick={copyCSS} className="h-12 bg-primary hover:bg-primary/90 text-white font-bold gap-2 rounded-xl shadow-lg shadow-primary/20">
                    <Copy className="w-4 h-4" />
                    Copy Code
                 </Button>
              </div>
           </div>
        </div>
      </div>
    </ToolLayout>
  );
}
