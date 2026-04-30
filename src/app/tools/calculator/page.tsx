"use client";

import { useState, useEffect } from "react";
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
import { cn } from "@/utility/helpers/utils";
import { motion } from "motion/react";

export default function CalculatorPage() {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [history, setHistory] = useState<{ eq: string, res: string }[]>([]);
  const [isNewInput, setIsNewInput] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  
  const handleNumber = (n: string) => {
    setActiveKey(n);
    setTimeout(() => setActiveKey(null), 100);
    setDisplay(prev => {
      if (isNewInput) {
        setIsNewInput(false);
        return n === "." ? "0." : n;
      }
      if (n === "." && prev.includes(".")) return prev;
      return prev === "0" && n !== "." ? n : prev + n;
    });
  };

  const handleOperator = (op: string) => {
    setActiveKey(op);
    setTimeout(() => setActiveKey(null), 100);
    setEquation(display + " " + op + " ");
    setIsNewInput(true);
  };

  const calculate = () => {
    setActiveKey("=");
    setTimeout(() => setActiveKey(null), 100);
    try {
      const fullEq = equation + display;
      if (!fullEq.trim() || equation === "") return;
      
      const sanitized = fullEq.replace(/[^-()\d/*+.]/g, '');
      const result = new Function(`return ${sanitized}`)();
      
      const resStr = Number.isInteger(result) ? result.toString() : result.toFixed(4).replace(/\.?0+$/, "");
      
      setHistory(prev => [{ eq: fullEq, res: resStr }, ...prev].slice(0, 10));
      setDisplay(resStr);
      setEquation("");
      setIsNewInput(true);
    } catch (e) {
      setDisplay("Error");
      setIsNewInput(true);
    }
  };

  const clear = () => {
    setActiveKey("Escape");
    setTimeout(() => setActiveKey(null), 100);
    setDisplay("0");
    setEquation("");
    setIsNewInput(true);
  };

  const backspace = () => {
    setActiveKey("Backspace");
    setTimeout(() => setActiveKey(null), 100);
    setDisplay(prev => {
      if (prev.length > 1) return prev.slice(0, -1);
      return "0";
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleNumber(e.key);
      if (e.key === ".") handleNumber(".");
      if (e.key === "+") handleOperator("+");
      if (e.key === "-") handleOperator("-");
      if (e.key === "*") handleOperator("*");
      if (e.key === "/") {
        e.preventDefault();
        handleOperator("/");
      }
      if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        calculate();
      }
      if (e.key === "Backspace") backspace();
      if (e.key === "Escape") clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [display, equation]);

  const buttons = [
    { label: "AC", action: clear, type: "functional", key: "Escape" },
    { label: "C", action: backspace, type: "functional", key: "Backspace" },
    { label: "%", action: () => handleOperator("/ 100"), type: "operator", key: "%" },
    { label: "÷", action: () => handleOperator("/"), type: "operator", icon: Divide, key: "/" },
    
    { label: "7", action: () => handleNumber("7"), type: "number", key: "7" },
    { label: "8", action: () => handleNumber("8"), type: "number", key: "8" },
    { label: "9", action: () => handleNumber("9"), type: "number", key: "9" },
    { label: "×", action: () => handleOperator("*"), type: "operator", icon: X, key: "*" },
    
    { label: "4", action: () => handleNumber("4"), type: "number", key: "4" },
    { label: "5", action: () => handleNumber("5"), type: "number", key: "5" },
    { label: "6", action: () => handleNumber("6"), type: "number", key: "6" },
    { label: "−", action: () => handleOperator("-"), type: "operator", icon: Minus, key: "-" },
    
    { label: "1", action: () => handleNumber("1"), type: "number", key: "1" },
    { label: "2", action: () => handleNumber("2"), type: "number", key: "2" },
    { label: "3", action: () => handleNumber("3"), type: "number", key: "3" },
    { label: "+", action: () => handleOperator("+"), type: "operator", icon: Plus, key: "+" },
    
    { label: "0", action: () => handleNumber("0"), type: "number", className: "col-span-2", key: "0" },
    { label: ".", action: () => handleNumber("."), type: "number", key: "." },
    { label: "=", action: calculate, type: "equal", icon: Equal, key: "=" },
  ];

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto gap-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
          {/* Calculator Body */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-[#161618] border border-zinc-800 rounded-[3rem] p-10 shadow-2xl flex flex-col gap-8">
              {/* Display */}
              <div className="bg-zinc-950 border border-zinc-800/50 rounded-3xl p-10 flex flex-col items-end justify-end min-h-[160px] gap-2 shadow-inner group overflow-hidden">
                 <div className="text-zinc-600 font-mono text-base tracking-widest truncate w-full text-right h-8">
                   {equation}
                 </div>
                 <div className="text-white font-black text-6xl tracking-tighter truncate w-full text-right">
                   {display}
                 </div>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-4 gap-6">
                 {buttons.map((btn, i) => (
                   <button
                     key={i}
                     onClick={btn.action}
                     className={cn(
                       "h-20 md:h-24 rounded-[1.8rem] flex items-center justify-center text-2xl font-black transition-all duration-300",
                        activeKey === btn.key && "scale-95 brightness-125 ring-4 ring-primary/40",
                       btn.type === "number" && "bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:scale-105 border border-zinc-800/50 hover:border-zinc-700 shadow-lg",
                       btn.type === "operator" && "bg-primary/10 text-primary hover:bg-primary hover:text-white hover:shadow-2xl hover:shadow-primary/20",
                       btn.type === "functional" && "bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800",
                       btn.type === "equal" && "bg-primary text-white hover:scale-105 shadow-2xl shadow-primary/30",
                       btn.className
                     )}
                   >
                     {btn.icon ? <btn.icon className="w-8 h-8" /> : btn.label}
                   </button>
                 ))}
              </div>
            </div>
          </div>

          {/* History Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
             <div className="flex items-center justify-between px-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 flex items-center gap-3">
                   <History className="w-3 h-3" /> Recent Calculations
                </h3>
                {history.length > 0 && (
                  <button 
                    onClick={() => setHistory([])}
                    className="text-[9px] font-black uppercase tracking-widest text-zinc-700 hover:text-red-500 transition-colors"
                  >
                    Wipe History
                  </button>
                )}
             </div>

             <div className="flex-1 bg-[#0c0c0e] border border-zinc-900 rounded-[3rem] p-8 overflow-auto custom-scrollbar flex flex-col gap-6">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-10 py-20 grayscale">
                     <RotateCcw className="w-16 h-16 mb-6" />
                     <p className="text-xs font-black uppercase tracking-[0.3em]">Quiet engine...</p>
                  </div>
                ) : (
                  history.map((item, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i} 
                      className="p-6 bg-zinc-950 border border-zinc-800/50 rounded-3xl group hover:border-primary/50 transition-all cursor-pointer shadow-lg"
                      onClick={() => { setDisplay(item.res); setEquation(""); setIsNewInput(true); }}
                    >
                      <div className="text-xs font-mono text-zinc-600 mb-2 group-hover:text-primary transition-colors tracking-tight">{item.eq}</div>
                      <div className="text-2xl font-black text-zinc-300 group-hover:text-white transition-colors tracking-tighter">= {item.res}</div>
                    </motion.div>
                  ))
                )}
             </div>
          </div>
        </div>
      </div>
    );
  }
