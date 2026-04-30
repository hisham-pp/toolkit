"use client";

import React, { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { 
  Film, 
  Trash2, 
  Copy, 
  Play, 
  RefreshCw,
  LayoutGrid,
  Zap,
  Code2,
  ChevronRight,
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AnimType = "fade" | "slide" | "scale" | "rotate" | "bounce" | "shake";

export default function AnimationGenerator() {
  const tool = TOOLS.find((t) => t.id === "animation-generator")!;
  const [type, setType] = useState<AnimType>("fade");
  const [duration, setDuration] = useState(0.5);
  const [delay, setDelay] = useState(0);
  const [iteration, setIteration] = useState<string>("infinite");
  const [easing, setEasing] = useState("ease-in-out");
  const [trigger, setTrigger] = useState(0);

  const cssCode = useMemo(() => {
    let keyframes = "";
    switch(type) {
      case "fade":
        keyframes = `@keyframes custom-anim {
  from { opacity: 0; }
  to { opacity: 1; }
}`;
        break;
      case "slide":
        keyframes = `@keyframes custom-anim {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}`;
        break;
      case "scale":
        keyframes = `@keyframes custom-anim {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}`;
        break;
      case "rotate":
        keyframes = `@keyframes custom-anim {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`;
        break;
      case "bounce":
        keyframes = `@keyframes custom-anim {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-30px); }
  60% { transform: translateY(-15px); }
}`;
        break;
      case "shake":
        keyframes = `@keyframes custom-anim {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}`;
        break;
    }

    const animationStyle = `animation: custom-anim ${duration}s ${easing} ${delay}s ${iteration} both;`;
    
    return `${keyframes}\n\n.animated-element {\n  ${animationStyle}\n}`;
  }, [type, duration, delay, iteration, easing]);

  const replay = () => setTrigger(prev => prev + 1);

  const copyCode = () => {
    navigator.clipboard.writeText(cssCode);
    toast.success("Animation CSS copied!");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col h-full gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-8 shadow-xl">
                <div className="flex items-center gap-3">
                   <Settings2 className="w-4 h-4 text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Parameters</span>
                </div>

                <div className="space-y-6">
                   <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 block ml-1">Motion Profile</label>
                      <div className="grid grid-cols-3 gap-2">
                         {(["fade", "slide", "scale", "rotate", "bounce", "shake"] as AnimType[]).map((t) => (
                           <button 
                             key={t}
                             onClick={() => setType(t)}
                             className={cn(
                               "px-3 py-4 rounded-xl border text-[9px] font-black uppercase tracking-tighter transition-all",
                               type === t ? "bg-primary/10 border-primary/50 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700"
                             )}
                           >
                              {t}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 block ml-1">Duration (s)</label>
                         <Input 
                            type="number" step="0.1" value={duration} 
                            onChange={(e) => setDuration(parseFloat(e.target.value))}
                            className="bg-zinc-950 border-zinc-800 rounded-xl font-mono text-center"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 block ml-1">Delay (s)</label>
                         <Input 
                            type="number" step="0.1" value={delay} 
                            onChange={(e) => setDelay(parseFloat(e.target.value))}
                            className="bg-zinc-950 border-zinc-800 rounded-xl font-mono text-center"
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 block ml-1">Iteration</label>
                      <select 
                         value={iteration} onChange={(e) => setIteration(e.target.value)}
                         className="w-full bg-zinc-950 border border-zinc-800 h-12 rounded-xl px-4 text-xs font-bold uppercase outline-none focus:border-primary/50"
                      >
                         <option value="1">1 Time</option>
                         <option value="infinite">Infinite</option>
                         <option value="alternate infinite">Alternate Loop</option>
                      </select>
                   </div>
                </div>

                <Button onClick={replay} className="w-full bg-zinc-900 border border-zinc-800 h-14 rounded-2xl gap-3 font-black italic tracking-widest uppercase text-xs hover:border-primary/50 transition-all group">
                   <Play className="w-4 h-4 text-primary group-hover:scale-125 transition-transform" /> Replay Preview
                </Button>
             </div>
          </div>

          {/* Preview & Code */}
          <div className="lg:col-span-8 flex flex-col gap-6">
             {/* Staging Area */}
             <div className="h-64 bg-[#0F0F10] border border-zinc-800 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden shadow-inner group">
                <div className="absolute top-6 left-6 flex items-center gap-2">
                   <LayoutGrid className="w-3.5 h-3.5 text-zinc-700" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Preview Canvas</span>
                </div>
                
                {/* The Animated Element */}
                <div 
                  key={trigger}
                  className="w-32 h-32 bg-primary rounded-[2rem] shadow-2xl flex items-center justify-center"
                  style={{ 
                    animation: `custom-anim ${duration}s ${easing} ${delay}s ${iteration} both` 
                  }}
                >
                   <Zap className="w-10 h-10 text-white animate-pulse" />
                </div>

                <style>{cssCode}</style>
             </div>

             {/* Code Output */}
             <div className="flex-1 bg-[#161618] border border-zinc-800 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Code2 className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Generated Stylesheet</span>
                   </div>
                   <Button variant="ghost" size="sm" onClick={copyCode} className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary gap-2">
                      <Copy className="w-3.5 h-3.5" /> Copy Code
                   </Button>
                </div>
                <div className="p-8 flex-1 overflow-auto custom-scrollbar">
                   <pre className="font-mono text-xs text-zinc-400 group leading-relaxed">
                      {cssCode.split('\n').map((line, i) => (
                        <div key={i} className="flex gap-4 group">
                           <span className="w-4 text-right opacity-20 select-none">{i + 1}</span>
                           <span className={cn(line.includes('@') ? "text-primary/80" : line.includes('.') ? "text-white" : "text-zinc-500")}>
                              {line}
                           </span>
                        </div>
                      ))}
                   </pre>
                </div>
             </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
      `}</style>
    </ToolLayout>
  );
}
