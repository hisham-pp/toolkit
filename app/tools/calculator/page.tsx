"use client";

import { useState } from "react";
import { TOOLS } from "@/lib/tools-config";
import { 
  Delete, 
  RotateCcw, 
  Equal,
  Minus,
  Plus,
  X,
  Divide,
  Percent,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CalculatorPage() {
  const tool = TOOLS.find(t => t.id === "calculator")!;
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [history, setHistory] = useState<{ eq: string, res: string }[]>([]);
  const [isNewInput, setIsNewInput] = useState(true);

  const handleNumber = (n: string) => {
    if (isNewInput) {
      setDisplay(n);
      setIsNewInput(false);
    } else {
      setDisplay(display === "0" ? n : display + n);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + " " + op + " ");
    setIsNewInput(true);
  };

  const calculate = () => {
    try {
      const fullEq = equation + display;
      // Using Function constructor as a safer alternative to eval for simple math
      // In production, a math parser library like mathjs is better
      const sanitized = fullEq.replace(/[^-()\d/*+.]/g, '');
      const result = new Function(`return ${sanitized}`)();
      
      const resStr = Number.isInteger(result) ? result.toString() : result.toFixed(4).replace(/\.?0+$/, "");
      
      setHistory([{ eq: fullEq, res: resStr }, ...history].slice(0, 10));
      setDisplay(resStr);
      setEquation("");
      setIsNewInput(true);
    } catch (e) {
      setDisplay("Error");
      setIsNewInput(true);
    }
  };

  const clear = () => {
    setDisplay("0");
    setEquation("");
    setIsNewInput(true);
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
      setIsNewInput(true);
    }
  };

  const buttons = [
    { label: "AC", action: clear, type: "functional" },
    { label: "C", action: backspace, type: "functional" },
    { label: "%", action: () => handleOperator("/ 100"), type: "operator" },
    { label: "÷", action: () => handleOperator("/"), type: "operator", icon: Divide },
    
    { label: "7", action: () => handleNumber("7"), type: "number" },
    { label: "8", action: () => handleNumber("8"), type: "number" },
    { label: "9", action: () => handleNumber("9"), type: "number" },
    { label: "×", action: () => handleOperator("*"), type: "operator", icon: X },
    
    { label: "4", action: () => handleNumber("4"), type: "number" },
    { label: "5", action: () => handleNumber("5"), type: "number" },
    { label: "6", action: () => handleNumber("6"), type: "number" },
    { label: "−", action: () => handleOperator("-"), type: "operator", icon: Minus },
    
    { label: "1", action: () => handleNumber("1"), type: "number" },
    { label: "2", action: () => handleNumber("2"), type: "number" },
    { label: "3", action: () => handleNumber("3"), type: "number" },
    { label: "+", action: () => handleOperator("+"), type: "operator", icon: Plus },
    
    { label: "0", action: () => handleNumber("0"), type: "number", className: "col-span-2" },
    { label: ".", action: () => handleNumber("."), type: "number" },
    { label: "=", action: calculate, type: "equal", icon: Equal },
  ];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">{tool.name}</h1>
        <p className="text-zinc-500 font-medium uppercase tracking-widest text-[10px]">{tool.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Calculator Body */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl flex flex-col gap-6">
            {/* Display */}
            <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-3xl p-8 flex flex-col items-end justify-end min-h-[140px] gap-2 shadow-inner group overflow-hidden">
               <div className="text-zinc-600 font-mono text-sm tracking-widest truncate w-full text-right h-6">
                 {equation}
               </div>
               <div className="text-white font-black text-5xl tracking-tighter truncate w-full text-right">
                 {display}
               </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-4">
               {buttons.map((btn, i) => (
                 <button
                   key={i}
                   onClick={btn.action}
                   className={cn(
                     "h-16 md:h-20 rounded-[1.5rem] flex items-center justify-center text-xl font-black transition-all duration-300",
                     btn.type === "number" && "bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:scale-105 border border-zinc-800/50",
                     btn.type === "operator" && "bg-primary/10 text-primary hover:bg-primary hover:text-white hover:shadow-xl hover:shadow-primary/20",
                     btn.type === "functional" && "bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800",
                     btn.type === "equal" && "bg-primary text-white hover:scale-105 shadow-xl shadow-primary/20",
                     btn.className
                   )}
                 >
                   {btn.icon ? <btn.icon className="w-6 h-6" /> : btn.label}
                 </button>
               ))}
            </div>
          </div>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 flex items-center gap-3">
                 <History className="w-3 h-3" /> Recent Calculations
              </h3>
              {history.length > 0 && (
                <button 
                  onClick={() => setHistory([])}
                  className="text-[9px] font-black uppercase tracking-widest text-zinc-700 hover:text-red-500 transition-colors"
                >
                  Clear History
                </button>
              )}
           </div>

           <div className="flex-1 bg-[#111113] border border-zinc-900 rounded-[2.5rem] p-6 overflow-auto custom-scrollbar flex flex-col gap-4">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20 py-20 grayscale">
                   <RotateCcw className="w-12 h-12 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">No history yet</p>
                </div>
              ) : (
                history.map((item, i) => (
                  <div 
                    key={i} 
                    className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl group hover:border-primary/30 transition-all cursor-pointer"
                    onClick={() => { setDisplay(item.res); setEquation(""); setIsNewInput(true); }}
                  >
                    <div className="text-[10px] font-mono text-zinc-600 mb-1 group-hover:text-primary transition-colors">{item.eq}</div>
                    <div className="text-xl font-black text-zinc-300 group-hover:text-white transition-colors">= {item.res}</div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
